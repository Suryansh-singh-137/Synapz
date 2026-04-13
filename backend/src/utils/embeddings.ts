import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert text to embedding vector using OpenAI
 * Returns a vector of 1536 dimensions
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Clean the text (remove extra whitespace)
    const cleanText = text.trim().replace(/\s+/g, " ");

    // Call OpenAI embedding API
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Fast & cheap
      input: cleanText,
      encoding_format: "float",
    });

    // Extract the embedding vector
    const embedding = response.data[0].embedding;

    if (!embedding || embedding.length === 0) {
      throw new Error("No embedding returned from OpenAI");
    }

    return embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

/**
 * Get embeddings for multiple texts at once (more efficient)
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Clean all texts
    const cleanTexts = texts.map((text) => text.trim().replace(/\s+/g, " "));

    // Call OpenAI API with multiple texts
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanTexts,
      encoding_format: "float",
    });

    // Sort by index to maintain order
    const embeddings = response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

    return embeddings;
  } catch (error) {
    console.error("Error getting embeddings:", error);
    throw error;
  }
}
