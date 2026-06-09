/**
 * PDF TEXT EXTRACTION PIPELINE
 *
 * Why this exists:
 * Jina AI Reader (r.jina.ai) is great for web articles, tweets, YouTube.
 * But it CANNOT extract text from PDF files (binary content).
 *
 * This module handles PDFs specifically:
 * 1. Download PDF bytes from Cloudinary URL (or any URL)
 * 2. Parse the binary with pdf-parse → get clean text
 * 3. Return the same string format as extractTextFromUrl()
 *    so the rest of the pipeline (chunking, embedding) is unchanged.
 *
 * Library: pdf-parse
 * - Pure Node.js, no system dependencies
 * - Works on any PDF with a text layer (not scanned images)
 * - Install: npm install pdf-parse @types/pdf-parse
 */

import axios from "axios";
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

/**
 * Download a PDF from a URL and extract its text content.
 *
 * @param pdfUrl  - The full HTTPS URL to the PDF
 *                  (e.g. a Cloudinary secure_url)
 * @returns       - Extracted plain text from all pages
 * @throws        - If download fails or text layer is empty/missing
 */
export async function extractTextFromPdf(pdfUrl: string): Promise<string> {
  console.log(`[PDF EXTRACT] Downloading PDF from: ${pdfUrl}`);

  // ── Step 1: Download the PDF as a binary buffer ──────────────────────────
  // responseType: "arraybuffer" tells Axios not to try to decode the bytes
  // as UTF-8 text. We need the raw binary to hand to pdf-parse.
  let pdfBuffer: Buffer;

  try {
    const response = await axios.get<ArrayBuffer>(pdfUrl, {
      responseType: "arraybuffer",
      timeout: 30_000, // 30 seconds — PDFs can be large
      headers: {
        // Some CDNs respect this; helps avoid cached error pages
        Accept: "application/pdf,*/*",
      },
    });

    // Convert ArrayBuffer → Node Buffer
    pdfBuffer = Buffer.from(response.data);
    console.log(
      `[PDF EXTRACT] Downloaded ${(pdfBuffer.byteLength / 1024).toFixed(1)} KB`,
    );
  } catch (err: any) {
    const status = err?.response?.status ?? "network error";
    throw new Error(
      `[PDF EXTRACT] Failed to download PDF (${status}): ${err.message}`,
    );
  }

  // ── Step 2: Parse the PDF buffer ─────────────────────────────────────────
  // pdf-parse reads the binary and extracts text from each page.
  // It returns an object with:
  //   .text      → all page text joined with newlines
  //   .numpages  → page count
  //   .info      → PDF metadata (title, author, etc.)
  let parsed: { text: string; numpages: number; info: Record<string, unknown> };

  try {
    parsed = await pdfParse(pdfBuffer);
  } catch (err: any) {
    throw new Error(
      `[PDF EXTRACT] pdf-parse failed to parse document: ${err.message}`,
    );
  }

  // ── Step 3: Validate extracted text ──────────────────────────────────────
  const extractedText = parsed.text?.trim() ?? "";

  if (extractedText.length < 50) {
    // This happens with:
    //   • Scanned PDFs (images, no text layer)
    //   • Password-protected PDFs
    //   • PDFs containing only images/charts
    throw new Error(
      `[PDF EXTRACT] Extracted text too short (${extractedText.length} chars). ` +
        `This PDF may be scanned (image-only) or have no text layer. ` +
        `Pages found: ${parsed.numpages}.`,
    );
  }

  console.log(
    `[PDF EXTRACT] ✓ Extracted ${extractedText.length} chars from ${parsed.numpages} pages`,
  );

  // Log a small preview to help with debugging
  console.log(
    `[PDF EXTRACT] Preview: "${extractedText.substring(0, 120).replace(/\n/g, " ")}..."`,
  );

  return extractedText;
}
