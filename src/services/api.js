import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { generateMindmapLocally } from './mindmapLocal';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// HYBRID REFACTOR: deterministic cache key/version for process results.
const RESULT_CACHE_PREFIX = 'intellimap_mindmap_cache_v2_';
const AI_RETRY_LIMIT = 2;

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

export async function processFile(file, processConfig = {}) {
  const text = await extractText(file);

  if (!text || text.length < 10) {
    throw new Error(
      'Could not extract enough text from the file. Ensure it is not an image-only or scanned document.'
    );
  }

  // HYBRID REFACTOR STEP 2: Build local structure first (non-AI fallback baseline).
  const localResult = normalizeApiShape(generateMindmapLocally(text));
  const config = resolveProcessConfig(processConfig);

  // HYBRID REFACTOR STEP 3/4: deterministic cache lookup to avoid duplicate Gemini calls.
  const cacheKey = getResultCacheKey(text);
  if (!config.forceRefresh) {
    const cached = readCachedResult(cacheKey);
    if (cached) {
      console.info('[mindmap-cache] hit');
      return cached;
    }
    console.info('[mindmap-cache] miss');
  } else {
    console.info('[mindmap-cache] bypassed (forceRefresh=true)');
  }

  // HYBRID REFACTOR STEP 5/6: AI enhancement in smart mode, fallback to local on any AI failure.
  let finalResult = localResult;
  if (shouldRunAiEnhancement(config)) {
    try {
      finalResult = await enhanceWithGemini(localResult, text);
    } catch (err) {
      console.error(
        '[mindmap-ai] enhancement failed, using local fallback:',
        err
      );
      finalResult = localResult;
    }
  }

  // HYBRID REFACTOR STEP 7: cache final result for deterministic text hash.
  if (config.useCache) {
    writeCachedResult(cacheKey, finalResult);
  }
  return finalResult;
}

function resolveProcessConfig(config) {
  const raw = config || {};
  const mode = raw.mode === 'fast' ? 'fast' : 'smart';
  const enableAI = raw.enableAI !== false;
  const forceRefresh = raw.forceRefresh === true;
  const useCache = raw.useCache !== false;

  return {
    enableAI,
    mode,
    forceRefresh,
    useCache,
  };
}

function shouldRunAiEnhancement(config) {
  if (!config.enableAI) return false;
  return config.mode === 'smart';
}

function getResultCacheKey(text) {
  return `${RESULT_CACHE_PREFIX}${hashText(text)}`;
}

function readCachedResult(cacheKey) {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeApiShape(parsed);
  } catch (err) {
    console.error('[mindmap-cache] invalid cached payload, ignoring:', err);
    return null;
  }
}

function writeCachedResult(cacheKey, result) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(normalizeApiShape(result)));
  } catch (err) {
    console.error('[mindmap-cache] failed to write cache:', err);
  }
}

function hashText(text) {
  // 32-bit FNV-1a hash for deterministic, low-cost text keying.
  let hash = 0x811c9dc5;
  const input = String(text || '');
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

async function enhanceWithGemini(localResult, sourceText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
  });

  const languageLock = detectDominantScript(sourceText);
  let lastError = null;

  // HYBRID REFACTOR BONUS: retry only the AI enhancement step.
  for (let attempt = 1; attempt <= AI_RETRY_LIMIT; attempt++) {
    try {
      const prompt = buildEnhancementPrompt({
        localResult,
        languageLock,
        strictMode: attempt > 1,
      });

      const aiResult = await generateAndParse(model, prompt);
      const normalized = normalizeApiShape(aiResult, localResult);

      if (
        languageLock.shouldEnforce &&
        !outputMatchesScript(normalized, languageLock)
      ) {
        throw new Error(
          'Output script mismatch with detected source language.'
        );
      }

      return normalized;
    } catch (err) {
      lastError = err;
      console.warn(`[mindmap-ai] attempt ${attempt} failed:`, err);
    }
  }

  if (
    lastError &&
    (lastError.message.includes('model') ||
      lastError.message.includes('not found'))
  ) {
    throw new Error(
      'Gemini API Error: Model not available. Check API key or region.'
    );
  }

  throw lastError || new Error('Gemini enhancement failed.');
}

async function generateAndParse(model, promptText) {
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

function buildEnhancementPrompt({
  localResult,
  languageLock,
  strictMode = false,
}) {
  // HYBRID REFACTOR: send reduced structured input instead of full raw document text.
  const compact = makeCompactPayload(localResult);

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
You are an assistant that improves an existing structured mind map.
Input is already a local baseline map, so refine wording and clarity only.

${languageRules}
${strictRules}

Return ONLY valid JSON with this exact shape:

{
  "summary": string,
  "mindmap": {
    "name": string,
    "summary": string,
    "children": [
      {
        "name": string,
        "summary": string,
        "children": [...]
      }
    ]
  }
}

Rules:
- Keep hierarchy and meaning from input.
- Improve node names and summaries for clarity and coherence.
- Ensure each summary (root and nodes) is at least 5-6 sentences.
- Do not invent unrelated sections.
- Keep children arrays present at every node.
- Do not include markdown fences.

Input baseline JSON:
${JSON.stringify(compact)}
`;
}

function makeCompactPayload(result) {
  return {
    summary: trimWords(result?.summary || '', 100),
    mindmap: compactNode(result?.mindmap, 0, 2),
  };
}

function compactNode(node, depth, maxDepth) {
  if (!node) {
    return { name: 'Topic', summary: '', children: [] };
  }

  if (depth >= maxDepth) {
    return {
      name: trimWords(node.name || 'Topic', 14),
      summary: trimWords(node.summary || '', 40),
      children: [],
    };
  }

  const children = Array.isArray(node.children)
    ? node.children
        .slice(0, 8)
        .map((child) => compactNode(child, depth + 1, maxDepth))
    : [];

  return {
    name: trimWords(node.name || 'Topic', 14),
    summary: trimWords(node.summary || '', 50),
    children,
  };
}

function trimWords(text, maxWords) {
  const words = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  return words.slice(0, maxWords).join(' ');
}

function normalizeApiShape(result, fallback) {
  const base = result && typeof result === 'object' ? result : fallback;
  if (!base || typeof base !== 'object') {
    throw new Error('Invalid output shape for mindmap result.');
  }

  const summary = String(base.summary || fallback?.summary || '').trim();
  const mindmap = normalizeNode(base.mindmap || fallback?.mindmap, {
    name: 'Central Topic',
    summary,
    children: [],
  });

  return {
    summary,
    mindmap,
  };
}

function normalizeNode(node, defaults) {
  const safe = node && typeof node === 'object' ? node : defaults;
  const children = Array.isArray(safe.children)
    ? safe.children.map((child) =>
        normalizeNode(child, {
          name: 'Subtopic',
          summary: '',
          children: [],
        })
      )
    : [];

  return {
    name: String(safe.name || defaults?.name || 'Topic').trim(),
    summary: String(safe.summary || defaults?.summary || '').trim(),
    children,
  };
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
