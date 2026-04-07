// HYBRID REFACTOR: Local (non-AI) mindmap generation pipeline.
// Keeps the same API shape used by Gemini responses.

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
]);

export function generateMindmapLocally(text) {
  const normalizedText = normalizeText(text);
  const sections = extractSections(normalizedText);

  const rootName = inferDocumentTitle(sections, normalizedText);
  const documentSummary = buildRichSummary(
    normalizedText,
    normalizedText,
    5,
    6
  );

  const children = sections.slice(0, 8).map((section) => {
    const sectionSummary = buildRichSummary(
      section.content,
      normalizedText,
      5,
      6
    );
    const detailSentences = pickDetailSentences(section.content, 3);

    const detailChildren = detailSentences.map((sentence) => ({
      name: buildSentenceLabel(sentence),
      summary: buildRichSummary(sentence, section.content, 5, 6),
      children: [],
    }));

    return {
      name: section.title,
      summary: sectionSummary,
      children: detailChildren,
    };
  });

  return {
    summary: documentSummary,
    mindmap: {
      name: rootName,
      summary: documentSummary,
      children,
    },
  };
}

function normalizeText(text) {
  const cleaned = String(text || '')
    .replace(/\r/g, '\n')
    .replace(/[•·●▪◦]/g, '- ')
    .replace(/\u00A0/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .replace(/([.!?;:])\s*([A-Z\p{Lu}])/gu, '$1\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  // Drop noisy repeated headers/footers and isolated page-number-like lines.
  const deduped = [];
  let prev = '';
  for (const line of lines) {
    const isPageMarker = /^\(?\d{1,4}\)?$/.test(line);
    const sameAsPrev = line === prev && line.length < 120;
    const mostlySymbols =
      line.replace(/[\p{L}\p{N}\s]/gu, '').length > line.length * 0.5;

    if (isPageMarker || sameAsPrev || mostlySymbols) {
      continue;
    }

    deduped.push(line);
    prev = line;
  }

  return deduped.join('\n');
}

function extractSections(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const headingSections = extractHeadingSections(lines);
  if (headingSections.length >= 2) {
    return headingSections;
  }

  const paragraphSections = extractParagraphSections(text);
  if (paragraphSections.length >= 2) {
    return paragraphSections;
  }

  const topicShiftSections = extractTopicShiftSections(text);
  if (topicShiftSections.length >= 2) {
    return topicShiftSections;
  }

  return extractChunkSections(text);
}

function extractTopicShiftSections(text) {
  const sentences = splitSentences(text);
  if (sentences.length < 6) return [];

  const sections = [];
  let current = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const cueBoundary = isSectionCueSentence(sentence);
    const hasMinCurrent = current.length >= 3;

    if (cueBoundary && hasMinCurrent) {
      const content = current.join(' ');
      sections.push({
        title: inferTitleFromText(content) || `Section ${sections.length + 1}`,
        content,
      });
      current = [sentence];
      continue;
    }

    current.push(sentence);

    if (current.length >= 7) {
      const content = current.join(' ');
      sections.push({
        title: inferTitleFromText(content) || `Section ${sections.length + 1}`,
        content,
      });
      current = [];
    }
  }

  if (current.length >= 2) {
    const content = current.join(' ');
    sections.push({
      title: inferTitleFromText(content) || `Section ${sections.length + 1}`,
      content,
    });
  }

  return sections.slice(0, 8);
}

function extractParagraphSections(text) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length < 2) {
    return [];
  }

  const sections = [];
  let current = { title: '', content: '' };

  paragraphs.forEach((paragraph) => {
    const firstLine = paragraph.split('\n')[0]?.trim() || '';
    const headingLike = isLikelyHeading(firstLine) && paragraph.length < 260;

    if (headingLike && current.content.trim()) {
      sections.push(finalizeSection(current));
      current = { title: cleanHeading(firstLine), content: '' };
      return;
    }

    if (!current.title) {
      current.title =
        inferTitleFromText(paragraph) || `Section ${sections.length + 1}`;
    }

    current.content += `${paragraph} `;
  });

  if (current.content.trim()) {
    sections.push(finalizeSection(current));
  }

  return sections;
}

function extractHeadingSections(lines) {
  const sections = [];
  let current = null;

  lines.forEach((line) => {
    if (isLikelyHeading(line)) {
      if (current && current.content.trim()) {
        sections.push(finalizeSection(current));
      }
      current = { title: cleanHeading(line), content: '' };
      return;
    }

    if (!current) {
      current = { title: 'Overview', content: '' };
    }

    current.content += `${line} `;
  });

  if (current && current.content.trim()) {
    sections.push(finalizeSection(current));
  }

  return sections;
}

function extractChunkSections(text) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return [
      {
        title: 'Overview',
        content: text,
      },
    ];
  }

  const targetSections = Math.min(
    6,
    Math.max(3, Math.ceil(sentences.length / 8))
  );
  const chunkSize = Math.max(3, Math.ceil(sentences.length / targetSections));

  const sections = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    const chunk = sentences.slice(i, i + chunkSize);
    if (!chunk.length) continue;

    const content = chunk.join(' ');
    sections.push({
      title: inferTitleFromText(content) || `Section ${sections.length + 1}`,
      content,
    });
  }

  return sections;
}

function finalizeSection(section) {
  const title =
    section.title || inferTitleFromText(section.content) || 'Section';
  return {
    title,
    content: section.content.trim(),
  };
}

function isLikelyHeading(line) {
  if (!line) return false;
  if (line.length > 80) return false;
  if (/[.!?]$/.test(line)) return false;

  const words = line.split(/\s+/).filter(Boolean);
  if (words.length > 12) return false;

  const alphaOnly = line.replace(/[^\p{L}]/gu, '');
  const upperRatio =
    alphaOnly.length > 0
      ? (alphaOnly.match(/\p{Lu}/gu)?.length || 0) / alphaOnly.length
      : 0;

  return (
    upperRatio > 0.6 ||
    isTitleCaseHeading(line) ||
    /^\d+(\.|\))\s+/.test(line) ||
    /^[IVXLCDM]+(\.|\))\s+/i.test(line) ||
    /^(chapter|section|module|topic|overview|summary|conclusion|introduction)\b/i.test(
      line
    ) ||
    /^[-*•]\s+/.test(line) ||
    /:$/.test(line)
  );
}

function isTitleCaseHeading(line) {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 10) return false;

  const titleCaseWords = words.filter((w) =>
    /^[A-Z\p{Lu}][\p{L}\p{N}-]{1,}$/u.test(w)
  );
  return titleCaseWords.length / words.length >= 0.7;
}

function isSectionCueSentence(sentence) {
  const s = String(sentence || '')
    .trim()
    .toLowerCase();
  return (
    /^(introduction|overview|background|objective|approach|method|analysis|results|discussion|conclusion|summary)\b/.test(
      s
    ) ||
    /^(first|second|third|next|finally|in conclusion|to summarize)\b/.test(s)
  );
}

function cleanHeading(heading) {
  return heading.replace(/[:\-\s]+$/g, '').trim();
}

function inferDocumentTitle(sections, text) {
  if (sections[0]?.title) return sections[0].title;
  return inferTitleFromText(text) || 'Document Mindmap';
}

function inferTitleFromText(text) {
  const firstSentence = splitSentences(text)[0] || '';
  const phrase = buildSentenceLabel(firstSentence);
  if (phrase && phrase !== 'Key Point') {
    return phrase;
  }

  const tokens = tokenize(text);
  const freq = buildFrequency(tokens);
  const top = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => capitalize(word));

  if (!top.length) return '';
  return top.join(' ');
}

function summarizeText(text, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (!sentences.length) return text.trim().slice(0, 300);

  const ranked = rankSentences(sentences, text)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((item) => cleanSentence(item.sentence));

  return ranked.join(' ').trim();
}

function buildRichSummary(
  sourceText,
  contextText,
  minSentences = 5,
  maxSentences = 6
) {
  const source = String(sourceText || '').trim();
  if (!source) return '';

  const baseSentences = splitSentences(source);
  if (baseSentences.length === 0) return source.slice(0, 450);

  const picked = rankSentences(baseSentences, contextText || source)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((item) => normalizeSentenceEnding(item.sentence));

  const expanded = [...picked];
  const keywords = getTopKeywords(contextText || source, 5);

  while (expanded.length < minSentences) {
    const keyword =
      keywords[expanded.length % Math.max(1, keywords.length)] || 'this topic';
    expanded.push(
      `This section emphasizes ${keyword} and its practical relevance.`
    );
  }

  return expanded.slice(0, maxSentences).join(' ').trim();
}

function pickDetailSentences(text, count) {
  const sentences = splitSentences(text);
  const ranked = rankSentences(sentences, text)
    .slice(0, count)
    .map((item) => cleanSentence(item.sentence))
    .filter(Boolean);

  return ranked;
}

function rankSentences(sentences, contextText) {
  const contextFreq = buildFrequency(tokenize(contextText));

  return sentences
    .map((sentence, index) => {
      const tokens = tokenize(sentence);
      const score = tokens.reduce(
        (sum, token) => sum + (contextFreq[token] || 0),
        0
      );
      return { sentence, index, score };
    })
    .sort((a, b) => b.score - a.score);
}

function splitSentences(text) {
  const parts = String(text || '')
    .replace(/\s+/g, ' ')
    .match(/[^.!?\n।！？]+[.!?।！？]?/g);

  if (!parts) return [];

  return parts
    .map((s) => s.trim())
    .filter((s) => s.length > 15)
    .slice(0, 120);
}

function tokenize(text) {
  return (
    String(text || '')
      .toLowerCase()
      .match(/[\p{L}0-9]{3,}/gu)
      ?.filter((token) => !STOPWORDS.has(token)) || []
  );
}

function getTopKeywords(text, count) {
  const freq = buildFrequency(tokenize(text));
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

function buildFrequency(tokens) {
  return tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
}

function buildSentenceLabel(sentence) {
  const words = cleanSentence(sentence)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(' ');

  return words || 'Key Point';
}

function cleanSentence(sentence) {
  return String(sentence || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSentenceEnding(sentence) {
  const cleaned = cleanSentence(sentence);
  if (!cleaned) return '';
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function capitalize(word) {
  return word ? word[0].toUpperCase() + word.slice(1) : '';
}
