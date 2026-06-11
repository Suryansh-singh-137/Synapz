import fs from "fs";
import pdfParse from "pdf-parse";

/**
 * Extract text from a PDF file on local disk.
 *
 * This is called BEFORE the file is uploaded to Cloudinary,
 * while multer's temp file still exists at req.file.path.
 *
 * We never download PDFs from Cloudinary — their access controls
 * cause 401 errors regardless of upload settings.
 */
export async function extractTextFromLocalPdf(
  filePath: string,
): Promise<string> {
  console.log(`[PDF EXTRACT] Reading: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found on disk: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);
  console.log(`[PDF EXTRACT] Read ${(buffer.byteLength / 1024).toFixed(1)} KB`);

  let parsed: { text: string; numpages: number };
  try {
    parsed = await pdfParse(buffer);
  } catch (err: any) {
    throw new Error(`pdf-parse failed: ${err.message}`);
  }

  const text = parsed.text?.trim() ?? "";

  if (text.length < 50) {
    throw new Error(
      `Text too short (${text.length} chars, ${parsed.numpages} pages). ` +
        `PDF may be scanned (image-only) with no text layer.`,
    );
  }

  console.log(
    `[PDF EXTRACT] ✓ ${text.length} chars from ${parsed.numpages} pages`,
  );
  return text;
}
