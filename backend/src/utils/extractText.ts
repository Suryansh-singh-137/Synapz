/**
 * JINA AI READER - Production Ready URL to Text
 *
 * Works with:
 * ✅ Dynamic JS-rendered content
 * ✅ PDFs
 * ✅ Tweets
 * ✅ Any website (no scraping needed)
 *
 * Free tier: 1000 requests/month
 * Perfect for prototyping & small apps
 *
 * Docs: https://jina.ai/reader/
 */

import axios from "axios";

/**
 * Extract text from ANY URL using Jina Reader API
 * No scraping, no selectors, no bot detection
 * Returns clean markdown
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    console.log(`[EXTRACT] Using Jina Reader for: ${url}`);

    // Simple: encode the URL so special characters don't break the Jina endpoint
    // Use encodeURI so already-encoded segments like %5B are preserved.
    const jinaUrl = `https://r.jina.ai/${encodeURI(url)}`;
    console.log(`[EXTRACT] Jina URL: ${jinaUrl}`);

    const response = await axios.get(jinaUrl, {
      headers: {
        Accept: "text/plain",
      },
      timeout: 15000,
    });

    const text = response.data;

    if (!text || text.trim().length < 100) {
      throw new Error(`Extracted text too short (${text.length} chars)`);
    }

    console.log(`[EXTRACT] ✓ Got ${text.length} characters`);
    return text;
  } catch (error: any) {
    const msg = error.message || "Unknown error";
    console.error(`[EXTRACT] ✗ Failed: ${msg}`);
    throw new Error(`Failed to extract from URL: ${msg}`);
  }
}

/**
 * Chunk text into overlapping pieces
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): string[] {
  if (!text || text.trim().length === 0) {
    console.log("[CHUNK] Text is empty!");
    return [];
  }

  const words = text.split(/\s+/).filter((w) => w.length > 0);

  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
  }

  console.log(
    `[CHUNK] Created ${chunks.length} chunks from ${words.length} words`,
  );

  return chunks.length > 0 ? chunks : [text];
}
