import axios from "axios";

/**
 * COHERE EMBEDDINGS - LATEST MODEL
 * Using embed-english-v3.0 (latest, best quality)
 */

const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  console.warn(
    "[EMBED] ⚠️ COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/",
  );
}

export type EmbeddingInputType =
  | "search_document"
  | "search_query"
  | "classification"
  | "clustering";

/**
 * Get embeddings for multiple texts from Cohere API.
 * Single source of truth for embedding calls.
 */
export async function getEmbeddings(
  texts: string[],
  inputType: EmbeddingInputType = "search_document",
): Promise<number[][]> {
  try {
    const cleanTexts = texts
      .map((t) => t.trim().replace(/\s+/g, " "))
      .filter((t) => t.length > 0);

    if (cleanTexts.length === 0) {
      throw new Error("No valid texts to embed");
    }

    if (!COHERE_API_KEY) {
      throw new Error(
        "COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/",
      );
    }

    console.log(
      `[EMBED] Getting embeddings for ${cleanTexts.length} texts via Cohere (${inputType})...`,
    );

    const response = await axios.post(
      "https://api.cohere.com/v1/embed",
      {
        texts: cleanTexts,
        model: "embed-english-v3.0",
        input_type: inputType,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    if (!response.data.embeddings || response.data.embeddings.length === 0) {
      throw new Error("No embeddings returned from Cohere");
    }

    const embeddings = response.data.embeddings;
    console.log(
      `[EMBED] ✓ Got ${embeddings.length} embeddings (${embeddings[0].length} dimensions)`,
    );
    return embeddings;
  } catch (error: any) {
    console.error("[EMBED] ❌ Error:", error.message);

    if (error.response?.status === 401) {
      console.error(
        "[EMBED] 401 - Invalid API key. Check COHERE_API_KEY in .env",
      );
    }

    if (error.response?.status === 404) {
      console.error("[EMBED] 404 - Check API endpoint");
    }

    throw error;
  }
}

/**
 * Get embedding for a single text.
 * Defaults to "search_query" (used for query similarity search).
 */
export async function getEmbedding(
  text: string,
  inputType: EmbeddingInputType = "search_query",
): Promise<number[]> {
  const embeddings = await getEmbeddings([text], inputType);
  return embeddings[0];
}
