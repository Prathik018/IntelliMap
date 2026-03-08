import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';

// configure pdf worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// init Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function processFile(file) {
  const text = await extractText(file);

  if (!text || text.length < 10) {
    throw new Error('Could not extract meaningful text from file');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

  // New correct format for v1beta API
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  const output = result.response.text().trim();

  // Clean accidental code fences
  const cleanOutput = output.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanOutput);
  } catch (err) {
    console.error('Failed JSON:', cleanOutput);
    throw new Error('Gemini returned invalid JSON: ' + err.message);
  }

  return parsed;
}

// file extraction
async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        if (ext === 'pdf') {
          const pdf = await pdfjsLib.getDocument({ data: reader.result })
            .promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((s) => s.str).join(' ');
          }
          resolve(text);
        } else if (ext === 'txt') {
          resolve(reader.result);
        } else if (ext === 'docx') {
          const { value } = await mammoth.extractRawText({
            arrayBuffer: reader.result,
          });
          resolve(value);
        } else if (ext === 'doc') {
          const { value } = await mammoth.extractRawText({
            arrayBuffer: reader.result,
          });
          resolve(value);
        } else if (ext === 'pptx') {
          const text = await extractPptxText(reader.result);
          resolve(text);
        } else if (ext === 'ppt') {
          reject(
            new Error(
              'Old .ppt format not supported. Please use .pptx for PowerPoint files.'
            )
          );
        } else {
          reject(
            new Error('Unsupported file type. Use PDF, TXT, DOC, DOCX, or PPTX')
          );
        }
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;

    if (['pdf', 'docx', 'doc', 'pptx'].includes(ext)) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

/**
 * Extracts text content from a PPTX file using pptx2json.
 * @param {ArrayBuffer} arrayBuffer The PPTX file content.
 * @returns {Promise<string>} The combined text content of all slides.
 */
async function extractPptxText(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  let fullText = '';

  const slideFiles = Object.keys(zip.files).filter((name) =>
    name.match(/ppt\/slides\/slide\d+\.xml/)
  );

  // Sort slides for consistent text flow (e.g., slide1.xml, slide2.xml, ...)
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)/)?.[1] || 0);
    const numB = parseInt(b.match(/slide(\d+)/)?.[1] || 0);
    return numA - numB;
  });

  for (const filename of slideFiles) {
    try {
      const xml = await zip.files[filename].async('string');
      const parsed = await parseStringPromise(xml);

      // Navigate to the slide content tree
      const sld = parsed?.['p:sld'];
      const cSld = sld?.['p:cSld']?.[0];
      const spTree = cSld?.['p:spTree']?.[0];

      // Regular shapes (p:sp)
      const shapes = spTree?.['p:sp'] || [];
      // Graphic frames like tables (p:graphicFrame)
      const graphicFrames = spTree?.['p:graphicFrame'] || [];

      // Extract from regular shapes
      shapes.forEach((shape) => {
        const paras = shape['p:txBody']?.[0]?.['a:p'] || [];
        paras.forEach((p) => {
          const runs = p['a:r'] || [];
          runs.forEach((r) => {
            if (r['a:t']) fullText += r['a:t'][0] + ' ';
          });
        });
      });

      // Extract from tables inside graphic frames
      graphicFrames.forEach((frame) => {
        const table =
          frame['a:graphic']?.[0]?.['a:graphicData']?.[0]?.['a:tbl']?.[0];
        if (table) {
          const rows = table['a:tr'] || [];
          rows.forEach((row) => {
            const cells = row['a:tc'] || [];
            cells.forEach((cell) => {
              const paras = cell['a:txBody']?.[0]?.['a:p'] || [];
              paras.forEach((p) => {
                const runs = p['a:r'] || [];
                runs.forEach((r) => {
                  if (r['a:t']) fullText += r['a:t'][0] + ' ';
                });
              });
            });
          });
        }
      });
    } catch (err) {
      console.warn(`Failed to parse slide ${filename}:`, err);
    }
  }

  return fullText.trim();
}
