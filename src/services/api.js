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

  // Call Gemini to summarize + build mindmap JSON
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
You are an assistant that generates structured mind map data.
From the following text, create a JSON object with two fields: "summary" and "mindmap".

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let output = response.text();

  // Remove accidental ```json ... ``` wrappers if Gemini adds them
  output = output.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (err) {
    console.error("Failed to parse Gemini response:", output);
    throw new Error(
      "Failed to parse Gemini response as JSON: " + err.message
    );
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
          const { value } = await mammoth.extractRawText({ arrayBuffer: reader.result });
          resolve(value);

        } else if (ext === "doc") {
          // Old DOC files: use mammoth as fallback
          const { value } = await mammoth.extractRawText({ arrayBuffer: reader.result });
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
            const texts = parsed["p:sld"]["p:cSld"][0]["p:spTree"][0]["p:sp"] || [];

            texts.forEach((t) => {
              const paras = t["p:txBody"]?.[0]["a:p"] || [];
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
          // Old PPT files: simple fallback
          reject(
            new Error(
              "Old .ppt format not supported. Please use .pptx for PowerPoint files."
            )
          );

        } else {
          reject(
            new Error(
              "Unsupported file type. Use PDF, TXT, DOC, DOCX, or PPTX"
            )
          );
        }
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;

    if (ext === "pdf" || ext === "docx" || ext === "doc" || ext === "pptx") {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}
