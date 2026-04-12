import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Extracts clean text from a URL
 * Handles: Articles, blogs, Twitter threads, HTML pages
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    // Step 1: Fetch the HTML from the URL
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;

    // Step 2: Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Step 3: Remove script and style tags (they contain code, not content)
    $("script").remove();
    $("style").remove();
    $("nav").remove(); // Navigation often has repetitive text
    $("footer").remove(); // Footer is usually boilerplate

    // Step 4: Extract text from common content containers
    // Try different selectors in order of specificity
    let text = "";

    // For articles/blogs
    const article = $("article").text();
    const main = $("main").text();
    const post = $('[class*="post"]').text();
    const content = $('[class*="content"]').text();

    // Pick the longest one (usually the most content)
    text = [article, main, post, content].sort(
      (a, b) => b.length - a.length,
    )[0];

    // Fallback: if none found, use body text
    if (!text || text.trim().length < 100) {
      text = $("body").text();
    }

    // Step 5: Clean up the text
    // Remove extra whitespace, newlines, multiple spaces
    text = text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();

    // Step 6: Validate we got something meaningful
    if (!text || text.length < 50) {
      throw new Error("Could not extract meaningful text from URL");
    }

    return text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Chunks text into smaller pieces for embedding
 * Each chunk is ~500 words, with 50 word overlap
 * This helps with context in RAG (Retrieval Augmented Generation)
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlapSize: number = 50,
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlapSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
}
