// import { GoogleGenerativeAI } from '@google/generative-ai';
// import * as pdfjsLib from 'pdfjs-dist';
// import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
// import mammoth from 'mammoth';
// import JSZip from 'jszip';

// // configure pdf worker for Vite
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// // Initialize the  Gemini
// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// export async function processFile(file) {
//   const text = await extractText(file);

//   if (!text || text.length < 10) {
//     throw new Error(
//       'Could not extract enough text from the file. Please ensure it is not an image-only document or a scanned file without OCR.'
//     );
//   }

//   // Define the Google Gemini model
//   const modelName = 'gemini-3-flash-preview';
//   const model = genAI.getGenerativeModel({ model: modelName });

//   const prompt = `
// You are an assistant that generates structured mind map data.
// From the following text, create a JSON object with fields: "summary" and "mindmap".

// The "mindmap" must follow this schema:

// {
//   "name": "Central Topic",
//   "summary": "Provide a detailed explanation (5-10 sentences) describing this section.",
//   "children": [
//     {
//       "name": "Subtopic 1",
//       "summary": "Provide a detailed explanation (5-10 sentences) for this subtopic.",
//       "children": [
//         { "name": "Detail A", "summary": "Provide a detailed explanation (4 - 5 sentences) for Detail A." }
//       ]
//     }
//   ]
// }

// Return ONLY valid JSON. Do not include \`\`\`json fences.

// Text:
// ${text}
// `;

//   try {
//     const result = await model.generateContent({
//       contents: [
//         {
//           role: 'user',
//           parts: [{ text: prompt }],
//         },
//       ],
//     });

//     const output = result.response.text().trim();

//     // Clean accidental code fences
//     const cleanOutput = output.replace(/```json|```/g, '').trim();

//     let parsed;
//     try {
//       parsed = JSON.parse(cleanOutput);
//     } catch (err) {
//       console.error('Failed JSON:', cleanOutput);
//       throw new Error('Gemini returned invalid JSON: ' + err.message);
//     }

//     return parsed;
//   } catch (err) {
//     if (err.message.includes('model') || err.message.includes('not found')) {
//       throw new Error(
//         `Gemini API Error: The selected model (${modelName}) might not be available. Please check your API key and region.`
//       );
//     }
//     throw err;
//   }
// }

// // file extraction
// async function extractText(file) {
//   const ext = file.name.split('.').pop().toLowerCase();
//   const reader = new FileReader();

//   return new Promise((resolve, reject) => {
//     reader.onload = async () => {
//       try {
//         if (ext === 'pdf') {
//           const pdf = await pdfjsLib.getDocument({ data: reader.result })
//             .promise;
//           let text = '';
//           for (let i = 1; i <= pdf.numPages; i++) {
//             const page = await pdf.getPage(i);
//             const content = await page.getTextContent();
//             text += content.items.map((s) => s.str).join(' ');
//           }
//           resolve(text);
//         } else if (ext === 'txt') {
//           resolve(reader.result);
//         } else if (ext === 'docx') {
//           const { value } = await mammoth.extractRawText({
//             arrayBuffer: reader.result,
//           });
//           resolve(value);
//         } else if (ext === 'doc') {
//           // mammoth doesn't support old binary .doc format reliably
//           reject(
//             new Error(
//               'Old .doc format not supported. Please convert to .docx for better results.'
//             )
//           );
//         } else if (ext === 'pptx') {
//           const text = await extractPptxText(reader.result);
//           resolve(text);
//         } else if (ext === 'ppt') {
//           reject(
//             new Error(
//               'Old .ppt format not supported. Please use .pptx for PowerPoint files.'
//             )
//           );
//         } else {
//           reject(
//             new Error(
//               `Unsupported file type: .${ext}. Use PDF, TXT, DOCX, or PPTX`
//             )
//           );
//         }
//       } catch (err) {
//         reject(err);
//       }
//     };

//     reader.onerror = reject;

//     // Correctly decide which read method to use
//     if (['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(ext)) {
//       reader.readAsArrayBuffer(file);
//     } else {
//       reader.readAsText(file);
//     }
//   });
// }

// /**
//  * Robustly extracts text content from a PPTX file.
//  * @param {ArrayBuffer} arrayBuffer The PPTX file content.
//  * @returns {Promise<string>} The combined text content of all slides.
//  */
// async function extractPptxText(arrayBuffer) {
//   try {
//     const zip = await JSZip.loadAsync(arrayBuffer);
//     let fullText = '';

//     // Find all slide XML files (case-insensitive)
//     const slideFiles = Object.keys(zip.files).filter((name) =>
//       /ppt\/slides\/slide\d+\.xml/i.test(name)
//     );

//     if (slideFiles.length === 0) {
//       // Fallback: search for any slide-like XML files more aggressively
//       const possibleSlides = Object.keys(zip.files).filter((name) =>
//         /slides\/slide.*\.xml/i.test(name)
//       );
//       slideFiles.push(...possibleSlides);
//     }

//     if (slideFiles.length === 0) {
//       throw new Error('No slides found in the PowerPoint file.');
//     }

//     // Sort slides
//     slideFiles.sort((a, b) => {
//       const numA = parseInt(a.match(/slide(\d+)/i)?.[1] || 0);
//       const numB = parseInt(b.match(/slide(\d+)/i)?.[1] || 0);
//       return numA - numB;
//     });

//     for (const filename of slideFiles) {
//       try {
//         const xml = await zip.files[filename].async('string');

//         /**
//          * Robust Regex-based extraction.
//          * We look for content between <a:t>...</a:t> tags.
//          * This is much more reliable than manual XML traversal as it catches
//          * text in all possible elements (paragraphs, tables, charts, etc.)
//          */
//         const textMatches = xml.match(/<a:t.*?>(.*?)<\/a:t>/g);
//         if (textMatches) {
//           textMatches.forEach((match) => {
//             const content = match.replace(/<a:t.*?>|<\/a:t>/g, '');
//             // Decode basic XML entities
//             const decoded = content
//               .replace(/&amp;/g, '&')
//               .replace(/&lt;/g, '<')
//               .replace(/&gt;/g, '>')
//               .replace(/&quot;/g, '"')
//               .replace(/&apos;/g, "'");
//             fullText += decoded + ' ';
//           });
//         }
//       } catch (err) {
//         console.warn(`Failed to extract text from slide ${filename}:`, err);
//       }
//     }

//     return fullText.trim();
//   } catch (err) {
//     if (err.message.includes('No slides found')) throw err;
//     console.error('JSZip error:', err);
//     throw new Error(
//       'Failed to open presentation file. Ensure it is a valid .pptx file.'
//     );
//   }
// }

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import mammoth from 'mammoth';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function processFile(file) {
  const text = await extractText(file);

  if (!text || text.length < 10) {
    throw new Error(
      'Could not extract enough text from the file. Ensure it is not an image-only or scanned document.'
    );
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const prompt = `
You are an assistant that generates structured mind map data.
From the following text, create a JSON object with fields: "summary" and "mindmap".

The "mindmap" must follow this schema:

{
  "name": "Central Topic",
  "summary": "Provide a detailed explanation (5-10 sentences) describing this section.",
  "children": [
    {
      "name": "Subtopic 1",
      "summary": "Provide a detailed explanation (5-10 sentences) for this subtopic.",
      "children": [
        { "name": "Detail A", "summary": "Provide a detailed explanation (4 - 5 sentences) for Detail A." }
      ]
    }
  ]
}

Return ONLY valid JSON. Do not include \`\`\`json fences.

Text:
${text}
`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const output = result.response.text().trim();
    const cleanOutput = output.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanOutput);
    } catch (err) {
      console.error('Failed JSON:', cleanOutput);
      throw new Error('Gemini returned invalid JSON: ' + err.message);
    }

    return parsed;
  } catch (err) {
    if (err.message.includes('model') || err.message.includes('not found')) {
      throw new Error(
        'Gemini API Error: Model not available. Check API key or region.'
      );
    }
    throw err;
  }
}

async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }

  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      disableJavaScript: true,
      isEvalSupported: false,
      useWorkerFetch: false,
      isOffscreenCanvasSupported: false,
    });

    const pdf = await loadingTask.promise;

    let text = '';
    const maxPages = Math.min(pdf.numPages, 20);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((s) => s.str).join(' ') + ' ';
    }

    return text;
  }

  if (ext === 'txt') {
    return await file.text();
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  if (ext === 'doc') {
    throw new Error('Old .doc not supported. Convert to .docx');
  }

  if (ext === 'pptx') {
    const arrayBuffer = await file.arrayBuffer();
    return await extractPptxText(arrayBuffer);
  }

  if (ext === 'ppt') {
    throw new Error('Old .ppt not supported. Use .pptx');
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

async function extractPptxText(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  let fullText = '';

  const slideFiles = Object.keys(zip.files).filter((name) =>
    /ppt\/slides\/slide\d+\.xml/i.test(name)
  );

  if (slideFiles.length === 0) {
    throw new Error('No slides found in the PowerPoint file.');
  }

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)/i)?.[1] || 0);
    const numB = parseInt(b.match(/slide(\d+)/i)?.[1] || 0);
    return numA - numB;
  });

  for (const filename of slideFiles) {
    try {
      const xml = await zip.files[filename].async('string');

      const textMatches = xml.match(/<a:t.*?>(.*?)<\/a:t>/g);
      if (textMatches) {
        textMatches.forEach((match) => {
          const content = match.replace(/<a:t.*?>|<\/a:t>/g, '');
          const decoded = content
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
          fullText += decoded + ' ';
        });
      }
    } catch {}
  }

  return fullText.trim();
}
