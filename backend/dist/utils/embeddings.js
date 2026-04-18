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
exports.getEmbedding = getEmbedding;
exports.getEmbeddings = getEmbeddings;
exports.getEmbeddingModelInfo = getEmbeddingModelInfo;
const openai_1 = __importDefault(require("openai"));
/**
 * Initialize Open Router client for embeddings
 * This allows automatic fallback between multiple embedding providers
 * If one provider hits limits, Open Router routes to another
 */
const openRouter = new openai_1.default({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    baseURL: "https://openrouter.io/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://yourdomain.com",
        "X-Title": "Second Brain",
    },
});
/**
 * Convert text to embedding vector using Open Router
 *
 * Open Router's smart routing means:
 * - If OpenAI embedding hits rate limit
 * - Automatically tries other providers
 * - You never get blocked!
 *
 * Available models on Open Router:
 * - openai/text-embedding-ada-002 (Legacy, cheap)
 * - openai/text-embedding-3-small (Better, still cheap)
 * - openai/text-embedding-3-large (Best, more expensive)
 * - cohere/embed-english-v3.0 (Alternative)
 * - mistral/mistral-embed (Cheaper alternative)
 */
function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clean the text
            const cleanText = text.trim().replace(/\s+/g, " ");
            // Call Open Router embedding API
            // Open Router will automatically use the model you specify
            // If that provider is down/limited, it falls back to others
            const response = yield openRouter.embeddings.create({
                model: process.env.OPEN_ROUTER_EMBEDDING_MODEL ||
                    "openai/text-embedding-3-small",
                input: cleanText,
                encoding_format: "float",
            });
            const embedding = response.data[0].embedding;
            if (!embedding || embedding.length === 0) {
                throw new Error("No embedding returned from Open Router");
            }
            return embedding;
        }
        catch (error) {
            console.error("Error getting embedding:", error);
            throw error;
        }
    });
}
/**
 * Get embeddings for multiple texts at once (more efficient)
 * Batch processing is cheaper than individual calls
 */
function getEmbeddings(texts) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clean all texts
            const cleanTexts = texts.map((text) => text.trim().replace(/\s+/g, " "));
            // Call Open Router API with multiple texts
            // Open Router batches them for better efficiency
            const response = yield openRouter.embeddings.create({
                model: process.env.OPEN_ROUTER_EMBEDDING_MODEL ||
                    "openai/text-embedding-3-small",
                input: cleanTexts,
                encoding_format: "float",
            });
            // Sort by index to maintain order
            const embeddings = response.data
                .sort((a, b) => a.index - b.index)
                .map((item) => item.embedding);
            return embeddings;
        }
        catch (error) {
            console.error("Error getting embeddings:", error);
            throw error;
        }
    });
}
/**
 * Helper: Check which embedding model to use
 * You can configure this via environment variable
 */
function getEmbeddingModelInfo() {
    const model = process.env.OPEN_ROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small";
    const models = {
        "openai/text-embedding-ada-002": {
            size: 1536,
            cost: "$0.10 per 1M tokens (legacy, cheapest)",
            speed: "Fast",
        },
        "openai/text-embedding-3-small": {
            size: 1536,
            cost: "$0.02 per 1M tokens (recommended)",
            speed: "Very fast",
        },
        "openai/text-embedding-3-large": {
            size: 3072,
            cost: "$0.13 per 1M tokens (best quality)",
            speed: "Fast",
        },
        "mistral/mistral-embed": {
            size: 1024,
            cost: "$0.00002 per 1K tokens (cheapest!)",
            speed: "Very fast",
        },
        "cohere/embed-english-v3.0": {
            size: 1024,
            cost: "$0.001 per 1M tokens",
            speed: "Fast",
        },
    };
    return {
        model,
        info: models[model] || { size: 1536, cost: "Unknown", speed: "Unknown" },
    };
}
