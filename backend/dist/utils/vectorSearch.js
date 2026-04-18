"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRelevantChunks = searchRelevantChunks;
const Schema_1 = require("../models/Schema");
const embeddings_1 = require("./embeddings");
const mongoose_1 = __importDefault(require("mongoose"));
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
function searchRelevantChunks(query_1, userId_1) {
    return __awaiter(this, arguments, void 0, function* (query, userId, topK = 5) {
        try {
            // Step 1: Convert user's question to embedding vector
            const queryEmbedding = yield (0, embeddings_1.getEmbedding)(query);
            // Step 2: Fetch all embedded content for this user
            // Use lean() to get plain JavaScript objects (faster, no Mongoose overhead)
            const allContent = yield Schema_1.Content.find({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                embeddingStatus: "embedded",
                chunks: { $exists: true, $ne: [] },
            }).lean();
            if (allContent.length === 0) {
                return [];
            }
            // Step 3: Calculate similarity for each chunk
            const allChunksWithScore = [];
            for (const content of allContent) {
                // Type assertion: content is a plain object from .lean()
                const chunks = content.chunks;
                if (!chunks || chunks.length === 0)
                    continue;
                for (const chunk of chunks) {
                    // Calculate how similar this chunk is to the question
                    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
                    allChunksWithScore.push({
                        contentId: content._id,
                        title: content.title,
                        link: content.link,
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
        }
        catch (error) {
            console.error("Vector search error:", error);
            throw error;
        }
    });
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
function cosineSimilarity(vecA, vecB) {
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
