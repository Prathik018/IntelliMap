// Basic parser: reads text for .txt and attempts for others.
// For PDF/DOCX/PPTX, you’d typically use libraries (pdfjs-dist, mammoth, pptx-parser)
// which add size and complexity; here we keep it lightweight.

export async function parseFile(file) {
  const name = file.name || "document";
  const ext = name.split(".").pop()?.toLowerCase();

  // try to read as text. Many .docx/.pptx/.pdf won’t parse directly this way.
  // Replace with real parsers in your next step.
  if (ext === "txt") {
    return await file.text();
  }

  // Naive fallback
  const text = await file.text().catch(() => "");
  if (text && text.length > 0) return text;

  // If binary, at least give a placeholder prompt to the model
  return `User uploaded a ${ext?.toUpperCase() || "file"} named "${name}". Extract the key sections and summarize typical content for this type if the raw text is unreadable.`;
}
