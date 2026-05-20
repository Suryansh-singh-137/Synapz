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

    // Normalize the URL: decode any existing percent-encoding then encode once.
    // This prevents double-encoding like `%` -> `%25` which broke Jina requests.
    let normalizedUrl = url;
    try {
      normalizedUrl = decodeURI(url);
    } catch (e) {
      // If decodeURI throws (malformed), fall back to the original URL
      normalizedUrl = url;
    }

    const jinaUrl = `https://r.jina.ai/${encodeURI(normalizedUrl)}`;
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
    let msg = error.message || "Unknown error";

    // If Axios provided a response, log useful debugging info from Jina
    if (error?.response) {
      try {
        console.error("[EXTRACT] Jina response status:", error.response.status);
        console.error(
          "[EXTRACT] Jina response headers:",
          error.response.headers,
        );
        console.error("[EXTRACT] Jina response body:", error.response.data);
        msg = `Jina ${error.response.status}: ${
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data)
        }`;
      } catch (logErr) {
        console.error("[EXTRACT] Failed to log Jina response:", logErr);
      }
    } else if (error?.request) {
      // request was made but no response
      console.error(
        "[EXTRACT] No response from Jina. Request info:",
        error.request,
      );
      msg = "No response from Jina";
    }

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
