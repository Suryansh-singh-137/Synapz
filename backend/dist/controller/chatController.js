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
exports.chatWithSharedBrain = exports.chatWithBrain = void 0;
const vectorSearch_1 = require("../utils/vectorSearch");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
/**
 * Initialize Groq client for chat
 * Groq is FREE, super fast, and perfect for chat responses
 */
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
/**
 * Endpoint: POST /api/v1/brain/chat
 *
 * Hybrid approach for maximum efficiency:
 * - Embeddings: Open Router (flexible, fallback support)
 * - Chat: Groq (FREE, ultra-fast)
 *
 * Cost breakdown:
 * - Embeddings: ~$0.00001 per question (cheap)
 * - Chat: $0.00 (FREE!)
 * Total: Almost free!
 *
 * Speed:
 * - Embeddings: ~100ms (Open Router)
 * - Chat: ~200ms (Groq - fastest!)
 * - Total response: ~300ms
 */
const chatWithBrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        const userId = req.userId;
        // Validate input
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                message: "query is required",
            });
        }
        // Step 1: Search for relevant chunks
        // Uses Open Router embeddings (with automatic fallback)
        console.log(`Searching brain for: "${query}"`);
        const relevantChunks = yield (0, vectorSearch_1.searchRelevantChunks)(query, userId, 5);
        if (relevantChunks.length === 0) {
            return res.status(200).json({
                answer: "I couldn't find any relevant content in your brain about this topic. Try adding more content first!",
                sources: [],
                message: "No matching content found",
            });
        }
        // Step 2: Build context from chunks
        const context = relevantChunks
            .map((chunk, index) => `Source ${index + 1} (from "${chunk.title}", relevance: ${(chunk.similarity * 100).toFixed(1)}%):\n${chunk.chunkText}`)
            .join("\n\n---\n\n");
        // Step 3: Build prompt for Groq LLM
        const systemPrompt = `You are a helpful assistant that answers questions based on the user's personal knowledge base (their "brain").
Use the provided context to answer questions accurately. If the context doesn't contain relevant information, say so.
Always be honest about what you know from their content.
Keep answers concise and to the point.`;
        const userPrompt = `Based on the following content from my brain, please answer my question:

CONTENT FROM MY BRAIN:
${context}

MY QUESTION: ${query}

Please provide a clear, concise answer based on the content provided.`;
        // Step 4: Call Groq (FREE!)
        console.log("Calling Groq for response (FREE!)...");
        const response = yield groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            model: process.env.GROQ_MODEL || "mixtral-8x7b-32768", // Free model on Groq
            temperature: 0.7,
            max_tokens: 1000,
        });
        const answer = response.choices[0].message.content || "Could not generate an answer.";
        // Step 5: Extract sources (which chunks were used)
        const sources = relevantChunks.map((chunk) => ({
            title: chunk.title,
            link: chunk.link,
            relevance: (chunk.similarity * 100).toFixed(1) + "%",
            excerpt: chunk.chunkText.substring(0, 150) + "...",
        }));
        // Step 6: Return response
        res.status(200).json({
            message: "Answer generated successfully",
            query: query,
            answer: answer,
            sources: sources,
            llm: {
                embeddings: "Open Router (with fallback)",
                chat: "Groq (FREE!)",
            },
        });
    }
    catch (error) {
        console.error("Chat error:", error);
        return res.status(500).json({
            message: "Failed to generate answer",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.chatWithBrain = chatWithBrain;
/**
 * Alternative: Chat with public shared brain
 * Anyone with the share link can chat (read-only)
 *
 * Endpoint: POST /api/v1/brain/:shareLink/chat
 */
const chatWithSharedBrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        const { shareLink } = req.params;
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                message: "query is required",
            });
        }
        // Would implement similar flow but with shared brain access
        res.status(501).json({
            message: "Shared brain chat not yet implemented",
        });
    }
    catch (error) {
        console.error("Shared chat error:", error);
        return res.status(500).json({
            message: "Failed to generate answer",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.chatWithSharedBrain = chatWithSharedBrain;
