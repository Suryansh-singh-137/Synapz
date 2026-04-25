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

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const cleanText = text.trim().replace(/\s+/g, " ");

    if (!cleanText) {
      throw new Error("Text is empty");
    }

    if (!COHERE_API_KEY) {
      throw new Error(
        "COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/",
      );
    }

    console.log("[EMBED] Using Cohere embed-english-v3.0 (latest model)");

    // Using latest Cohere model: embed-english-v3.0
    const response = await axios.post(
      "https://api.cohere.com/v1/embed",
      {
        texts: [cleanText],
        model: "embed-english-v3.0", // Latest model
        input_type: "search_document",
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
      throw new Error("No embedding returned from Cohere");
    }

    const embedding = response.data.embeddings[0];

    console.log(`[EMBED] ✓ Got embedding: ${embedding.length} dimensions`);
    return embedding;
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
 * Get embeddings for multiple texts
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
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
      `[EMBED] Getting embeddings for ${cleanTexts.length} texts via Cohere...`,
    );

    // Using latest Cohere model: embed-english-v3.0
    const response = await axios.post(
      "https://api.cohere.com/v1/embed",
      {
        texts: cleanTexts,
        model: "embed-english-v3.0", // Latest model
        input_type: "search_document",
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    if (!response.data.embeddings) {
      throw new Error("No embeddings returned from Cohere");
    }

    const embeddings = response.data.embeddings;

    console.log(
      `[EMBED] ✓ Got ${embeddings.length} embeddings (1024 dimensions)`,
    );
    return embeddings;
  } catch (error: any) {
    console.error("[EMBED] ❌ Error:", error.message);

    if (error.response?.status === 401) {
      console.error("[EMBED] 401 - Invalid API key");
    }

    if (error.response?.status === 404) {
      console.error("[EMBED] 404 - Endpoint not found");
    }

    throw error;
  }
}
