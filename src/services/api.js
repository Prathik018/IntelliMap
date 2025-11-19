import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import mammoth from "mammoth";
import JSZip from "jszip";
import { parseStringPromise } from "xml2js";

// configure pdf worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// init Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function processFile(file) {
  const text = await extractText(file);

  if (!text || text.length < 10) {
    throw new Error("Could not extract meaningful text from file");
  }

  // Use stable Gemini model
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  });

  const output = result.response.text().trim();

  // Clean accidental code fences
  const cleanOutput = output.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanOutput);
  } catch (err) {
    console.error("Failed JSON:", cleanOutput);
    throw new Error("Gemini returned invalid JSON: " + err.message);
  }

  return parsed;
}


// file extraction
async function extractText(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        if (ext === "pdf") {
          const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((s) => s.str).join(" ");
          }
          resolve(text);

        } else if (ext === "txt") {
          resolve(reader.result);

        } else if (ext === "docx") {
          const { value } = await mammoth.extractRawText({
            arrayBuffer: reader.result,
          });
          resolve(value);

        } else if (ext === "doc") {
          const { value } = await mammoth.extractRawText({
            arrayBuffer: reader.result,
          });
          resolve(value);

        } else if (ext === "pptx") {
          const zip = await JSZip.loadAsync(reader.result);
          let text = "";
          const slideFiles = Object.keys(zip.files).filter((name) =>
            name.match(/ppt\/slides\/slide\d+\.xml/)
          );

          for (const filename of slideFiles) {
            const xml = await zip.files[filename].async("string");
            const parsed = await parseStringPromise(xml);
            const shapes =
              parsed["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:sp"] || [];

            shapes.forEach((shape) => {
              const paras = shape["p:txBody"]?.[0]["a:p"] || [];
              paras.forEach((p) => {
                const runs = p["a:r"] || [];
                runs.forEach((r) => {
                  if (r["a:t"]) text += r["a:t"][0] + " ";
                });
              });
            });
          }
          resolve(text);

        } else if (ext === "ppt") {
          reject(
            new Error(
              "Old .ppt format not supported. Please use .pptx for PowerPoint files."
            )
          );

        } else {
          reject(
            new Error("Unsupported file type. Use PDF, TXT, DOC, DOCX, or PPTX")
          );
        }
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;

    if (["pdf", "docx", "doc", "pptx"].includes(ext)) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}
