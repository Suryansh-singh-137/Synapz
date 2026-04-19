import OpenAI from "openai";

/**
 * FIXED embeddings - Debug the 405 error
 * 405 usually means: wrong API key or malformed request
 */

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const cleanText = text.trim().replace(/\s+/g, " ");

    if (!cleanText) {
      throw new Error("Text is empty");
    }

    // Check API key FIRST
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
      console.error("[EMBED] ❌ OPEN_ROUTER_API_KEY not set!");
      throw new Error("OPEN_ROUTER_API_KEY not in .env");
    }

    if (!apiKey.startsWith("sk-or-v1-")) {
      console.error(
        "[EMBED] ❌ Wrong API key format! Should start with 'sk-or-v1-'",
      );
      console.error(`[EMBED] Got: ${apiKey.substring(0, 20)}...`);
      throw new Error("Invalid Open Router API key format");
    }

    console.log(
      `[EMBED] Using model: ${process.env.OPEN_ROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small"}`,
    );

    // Create client with explicit settings
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.io/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://brain.local",
        "X-Title": "SecondBrain",
      },
    });

    console.log(`[EMBED] Sending request to Open Router...`);

    // Make the request
    const response = await client.embeddings.create({
      model:
        process.env.OPEN_ROUTER_EMBEDDING_MODEL ||
        "openai/text-embedding-3-small",
      input: cleanText,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No embedding in response");
    }

    const embedding = response.data[0].embedding;

    console.log(`[EMBED] ✓ Got embedding: ${embedding.length} dimensions`);
    return embedding;
  } catch (error: any) {
    console.error("[EMBED] ❌ Error:", error.message);
    if (error.response?.status === 405) {
      console.error("[EMBED] 405 = Method Not Allowed. Check your API key!");
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

    // Check API key FIRST
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
      console.error("[EMBED] ❌ OPEN_ROUTER_API_KEY not set!");
      throw new Error("OPEN_ROUTER_API_KEY not in .env");
    }

    console.log(`[EMBED] Getting embeddings for ${cleanTexts.length} texts...`);

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.io/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://brain.local",
        "X-Title": "SecondBrain",
      },
    });

    const response = await client.embeddings.create({
      model:
        process.env.OPEN_ROUTER_EMBEDDING_MODEL ||
        "openai/text-embedding-3-small",
      input: cleanTexts,
    });

    if (!response.data) {
      throw new Error("No data in response");
    }

    const embeddings = response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

    console.log(`[EMBED] ✓ Got ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error: any) {
    console.error("[EMBED] ❌ Error:", error.message);
    throw error;
  }
}
