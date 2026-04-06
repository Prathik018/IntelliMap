import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import mammoth from 'mammoth';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SCRIPT_DEFINITIONS = [
  { name: 'Kannada', regex: /[\u0C80-\u0CFF]/g },
  { name: 'Telugu', regex: /[\u0C00-\u0C7F]/g },
  { name: 'Devanagari', regex: /[\u0900-\u097F]/g },
  { name: 'Tamil', regex: /[\u0B80-\u0BFF]/g },
  { name: 'Malayalam', regex: /[\u0D00-\u0D7F]/g },
  { name: 'Gujarati', regex: /[\u0A80-\u0AFF]/g },
  { name: 'Bengali', regex: /[\u0980-\u09FF]/g },
  { name: 'Gurmukhi', regex: /[\u0A00-\u0A7F]/g },
  { name: 'Latin', regex: /[A-Za-z]/g },
];

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

  const languageLock = detectDominantScript(text);
  const prompt = buildPrompt({ text, languageLock });

  async function generateAndParse(promptText) {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
    });

    const output = result.response.text().trim();
    const cleanOutput = output.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleanOutput);
    } catch (err) {
      console.error('Failed JSON:', cleanOutput);
      throw new Error('Gemini returned invalid JSON: ' + err.message);
    }
  }

  try {
    let parsed = await generateAndParse(prompt);

    if (
      languageLock.shouldEnforce &&
      !outputMatchesScript(parsed, languageLock)
    ) {
      const retryPrompt = buildPrompt({
        text,
        languageLock,
        strictMode: true,
      });
      parsed = await generateAndParse(retryPrompt);
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

function buildPrompt({ text, languageLock, strictMode = false }) {
  const languageRules = languageLock.shouldEnforce
    ? `
Language requirement (MANDATORY):
- Source script appears to be: ${languageLock.name}.
- Keep ALL output text in the same language/script as the source.
- Do NOT translate to English.
- Preserve proper names and acronyms as-is.
- If any section is uncertain, still write it in the source language/script.`
    : `
Language requirement:
- Prefer the same language as the source text.
- Avoid unnecessary translation.`;

  const strictRules = strictMode
    ? `
Strict correction mode:
- A previous attempt translated content unexpectedly.
- Rewrite all fields so they stay in the source language/script.
- Absolutely no English translation except unavoidable acronyms.`
    : '';

  return `
You are an assistant that generates structured mind map data.
From the following text, create a JSON object with fields: "summary" and "mindmap".

${languageRules}
${strictRules}

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
}

function detectDominantScript(text) {
  const counts = SCRIPT_DEFINITIONS.map(({ name, regex }) => {
    const matches = text.match(regex);
    return { name, regex, count: matches ? matches.length : 0 };
  });

  counts.sort((a, b) => b.count - a.count);
  const dominant = counts[0];
  const totalCount = counts.reduce((sum, item) => sum + item.count, 0);

  if (!dominant || dominant.count === 0 || totalCount === 0) {
    return {
      name: 'Unknown',
      regex: null,
      shouldEnforce: false,
    };
  }

  const ratio = dominant.count / totalCount;
  const shouldEnforce =
    dominant.name !== 'Latin' && dominant.count >= 20 && ratio >= 0.2;

  return {
    name: dominant.name,
    regex: dominant.regex,
    shouldEnforce,
  };
}

function collectMindmapText(node) {
  if (!node) return '';

  const chunks = [node.name || '', node.summary || ''];
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      chunks.push(collectMindmapText(child));
    });
  }

  return chunks.join(' ');
}

function outputMatchesScript(parsed, languageLock) {
  if (!languageLock.regex) return true;

  const text = `${parsed?.summary || ''} ${collectMindmapText(parsed?.mindmap)}`;
  const scriptChars = text.match(languageLock.regex)?.length || 0;
  const latinChars = text.match(/[A-Za-z]/g)?.length || 0;

  return scriptChars >= 20 && scriptChars >= latinChars;
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
