import { Content } from "../models/Schema";
import { getEmbedding } from "./embeddings";
import mongoose from "mongoose";

interface ChunkResult {
  contentId: mongoose.Types.ObjectId;
  title: string;
  link: string;
  chunkText: string;
  chunkIndex: number;
  similarity: number;
}

/**
 * 
 * Search for relevant content chunks using vector similarity
 *
 * How it works:
 * 1. Convert user's question to embedding
 * 2. Compare with all stored chunk embeddings
 * 3. Find most similar chunks using cosine similarity
 * 4. Return top K results
 *
 * This is used ONLY in the chat endpoint:
 * User asks question → searchRelevantChunks → get context → pass to LLM
 */
export async function searchRelevantChunks(
  query: string,
  userId: string,
  topK: number = 5,
): Promise<ChunkResult[]> {
  try {
    // Step 1: Convert user's question to embedding vector
    const queryEmbedding = await getEmbedding(query);

    // Step 2: Fetch all embedded content for this user
    // Use lean() to get plain JavaScript objects (faster, no Mongoose overhead)
    const allContent = await Content.find({
      userId: new mongoose.Types.ObjectId(userId),
      embeddingStatus: "embedded",
      chunks: { $exists: true, $ne: [] },
    }).lean();

    if (allContent.length === 0) {
      return [];
    }

    // Step 3: Calculate similarity for each chunk
    const allChunksWithScore: ChunkResult[] = [];

    for (const content of allContent) {
      // Type assertion: content is a plain object from .lean()
      const chunks = (content as any).chunks;

      if (!chunks || chunks.length === 0) continue;

      for (const chunk of chunks) {
        // Calculate how similar this chunk is to the question
        const similarity = cosineSimilarity(
          queryEmbedding,
          chunk.embedding as number[],
        );

        allChunksWithScore.push({
          contentId: (content as any)._id,
          title: (content as any).title,
          link: (content as any).link,
          chunkText: chunk.text,
          chunkIndex: chunk.chunkIndex,
          similarity: similarity,
        });
      }
    }

    // Step 4: Sort by similarity and return top K
    return allChunksWithScore
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error("Vector search error:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Formula: (A · B) / (||A|| * ||B||)
 *
 * Returns value between -1 and 1:
 * 1.0 = identical (perfect match)
 * 0.5 = somewhat similar
 * 0.0 = completely different
 * -1.0 = opposite
 *
 * Example:
 * Question: "How do hooks work?"
 * Question vector: [0.12, -0.34, 0.55, ...]
 * Chunk vector: [0.11, -0.35, 0.56, ...]
 * Similarity: 0.98 (very similar!)
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have same length");
  }

  // Calculate dot product: A · B
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Calculate magnitude of A: ||A||
  let magnitudeA = 0;
  for (let i = 0; i < vecA.length; i++) {
    magnitudeA += vecA[i] * vecA[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);

  // Calculate magnitude of B: ||B||
  let magnitudeB = 0;
  for (let i = 0; i < vecB.length; i++) {
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeB = Math.sqrt(magnitudeB);

  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  // Return cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
}
