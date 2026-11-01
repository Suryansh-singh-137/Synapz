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
exports.executeBrainChat = executeBrainChat;
const vectorSearch_1 = require("../utils/vectorSearch");
const Schema_1 = require("../models/Schema");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
/**
 * Initialize Groq client — shared by both chat functions in this file.
 * We create ONE instance at module level and reuse it.
 * Think of it like a database connection pool — expensive to create,
 * cheap to reuse.
 */
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
// Shared prompt and model config — single source of truth
const MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on a personal knowledge base (called a "Brain").
Use ONLY the provided context to answer. If the context doesn't contain relevant information, say so honestly.
Be concise, direct, and accurate. When referencing specific content, mention the source title.
Write in plain language — no markdown headers, just clear paragraphs.`;
/**
 * Build a context string + sources array from vector search results.
 * Extracted into a helper so both chat functions share the same logic.
 *
 * @param chunks - Results from searchRelevantChunks()
 * @returns { context, sources }
 */
function buildContextAndSources(chunks) {
    const context = chunks
        .map((chunk, i) => `Source ${i + 1} — "${chunk.title}" (relevance: ${(chunk.similarity * 100).toFixed(1)}%):\n${chunk.chunkText}`)
        .join("\n\n---\n\n");
    const sources = chunks.map((chunk) => ({
        title: chunk.title,
        link: chunk.link,
        type: chunk.type,
        relevance: (chunk.similarity * 100).toFixed(1) + "%",
        excerpt: chunk.chunkText.substring(0, 150) + "...",
    }));
    return { context, sources };
}
/**
 * Call Groq with context + query and return the answer string.
 * Extracted into a helper so both chat functions share the same LLM call.
 */
function generateAnswer(context, query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userPrompt = `Here is the relevant content from this brain:

${context}

---

Question: ${query}

Answer based ONLY on the content above:`;
        const response = yield groq.chat.completions.create({
            model: MODEL,
            temperature: 0.7,
            max_completion_tokens: 1000,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
            ],
        });
        return (_a = response.choices[0].message.content) !== null && _a !== void 0 ? _a : "Could not generate an answer.";
    });
}
/**
 * Core RAG pipeline: vector search -> context building -> LLM generation.
 */
function executeBrainChat(userId_1, query_1) {
    return __awaiter(this, arguments, void 0, function* (userId, query, emptyMessage = "I couldn't find any relevant content in your brain about this topic. Try adding more content first!") {
        const trimmedQuery = query.trim();
        console.log(`[CHAT] Processing query: "${trimmedQuery}" for user: ${userId}`);
        // Step 1: Vector search — find the most relevant chunks from user's brain
        const relevantChunks = yield (0, vectorSearch_1.searchRelevantChunks)(trimmedQuery, userId, 5);
        if (relevantChunks.length === 0) {
            return {
                answer: emptyMessage,
                sources: [],
                model: MODEL,
            };
        }
        console.log(`[CHAT] Found ${relevantChunks.length} relevant chunks`);
        // Step 2: Build context and sources from retrieved chunks
        const { context, sources } = buildContextAndSources(relevantChunks);
        // Step 3: Generate answer with Groq
        console.log("[CHAT] Calling Groq...");
        const answer = yield generateAnswer(context, trimmedQuery);
        console.log("[CHAT] ✓ Answer generated");
        return {
            answer,
            sources,
            model: MODEL,
        };
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE CHAT (authenticated — your own brain)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/brain/chat
 * Requires: userMiddleware (JWT auth)
 *
 * Chat with YOUR OWN brain.
 * userId comes from the JWT token — users can only search their own content.
 */
const chatWithBrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        const userId = req.userId;
        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "query is required" });
        }
        if (query.trim().length > 500) {
            return res.status(400).json({ message: "Query too long (max 500 chars)" });
        }
        const result = yield executeBrainChat(userId, query);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("[CHAT] ❌ Error:", error);
        return res.status(500).json({
            message: "Failed to generate answer",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.chatWithBrain = chatWithBrain;
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CHAT (no auth — someone else's shared brain)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/brain/:hash/chat
 * No auth middleware — this is a public endpoint.
 *
 * Chat with SOMEONE ELSE'S brain via their share link.
 */
const chatWithSharedBrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hash } = req.params;
        const { query } = req.body;
        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "query is required" });
        }
        if (query.trim().length > 500) {
            return res.status(400).json({ message: "Query too long (max 500 chars)" });
        }
        console.log(`[SHARED CHAT] Looking up brain for hash: ${hash}`);
        const link = yield Schema_1.Link.findOne({ hash });
        if (!link) {
            return res.status(404).json({
                message: "This brain doesn't exist or the share link has been deactivated.",
            });
        }
        console.log(`[SHARED CHAT] Found brain owner: ${link.userId}`);
        const result = yield executeBrainChat(link.userId.toString(), query, "I couldn't find any relevant content in this brain to answer your question. Try asking something related to the topics saved here.");
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("[SHARED CHAT] ❌ Error:", error);
        return res.status(500).json({
            message: "Failed to generate answer. Please try again.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.chatWithSharedBrain = chatWithSharedBrain;
