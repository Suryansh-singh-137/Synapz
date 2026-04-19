import axios from "axios";
import * as cheerio from "cheerio";

/**
 * SIMPLE & WORKING extraction method
 * Uses better headers and smarter parsing
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    console.log(`[EXTRACT] Fetching: ${url}`);

    // Step 1: Fetch with proper headers
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
      },
      timeout: 10000,
    });

    // Step 2: Parse HTML with Cheerio
    const $ = cheerio.load(data);

    // Remove unwanted elements
    $("script, style, nav, footer, iframe, noscript").remove();
    $("[class*='cookie'], [class*='popup'], [class*='ad']").remove();

    // Step 3: Extract text from main content
    let text = "";

    // Try these selectors in order
    const selectors = [
      "article",
      "main",
      "[role='main']",
      ".post-content",
      ".article-body",
      ".content",
      "body",
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        text = element.text();
        if (text.length > 200) break;
      }
    }

    // Step 4: Clean the text
    text = text
      .replace(/\s+/g, " ") // Multiple spaces to single
      .replace(/\n+/g, " ") // Newlines to space
      .trim();

    console.log(`[EXTRACT] ✓ Got ${text.length} characters`);
    return text;
  } catch (error: any) {
    const msg = error.response?.status
      ? `HTTP ${error.response.status}`
      : error.message;
    console.error(`[EXTRACT] ✗ Failed: ${msg}`);
    throw new Error(`Failed to fetch URL: ${msg}`);
  }
}

/**
 * SIMPLE chunking - split into word-based chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
  }

  console.log(`[CHUNK] Created ${chunks.length} chunks`);
  return chunks.length > 0 ? chunks : [text];
}
