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
const axios_1 = __importDefault(require("axios"));
/**
 * COHERE EMBEDDINGS - LATEST MODEL
 * Using embed-english-v3.0 (latest, best quality)
 */
const COHERE_API_KEY = process.env.COHERE_API_KEY;
if (!COHERE_API_KEY) {
    console.warn("[EMBED] ⚠️ COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/");
}
function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const cleanText = text.trim().replace(/\s+/g, " ");
            if (!cleanText) {
                throw new Error("Text is empty");
            }
            if (!COHERE_API_KEY) {
                throw new Error("COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/");
            }
            console.log("[EMBED] Using Cohere embed-english-v3.0 (latest model)");
            // Using latest Cohere model: embed-english-v3.0
            const response = yield axios_1.default.post("https://api.cohere.com/v1/embed", {
                texts: [cleanText],
                model: "embed-english-v3.0", // Latest model
                input_type: "search_document",
            }, {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            if (!response.data.embeddings || response.data.embeddings.length === 0) {
                throw new Error("No embedding returned from Cohere");
            }
            const embedding = response.data.embeddings[0];
            console.log(`[EMBED] ✓ Got embedding: ${embedding.length} dimensions`);
            return embedding;
        }
        catch (error) {
            console.error("[EMBED] ❌ Error:", error.message);
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                console.error("[EMBED] 401 - Invalid API key. Check COHERE_API_KEY in .env");
            }
            if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
                console.error("[EMBED] 404 - Check API endpoint");
            }
            throw error;
        }
    });
}
/**
 * Get embeddings for multiple texts
 */
function getEmbeddings(texts) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const cleanTexts = texts
                .map((t) => t.trim().replace(/\s+/g, " "))
                .filter((t) => t.length > 0);
            if (cleanTexts.length === 0) {
                throw new Error("No valid texts to embed");
            }
            if (!COHERE_API_KEY) {
                throw new Error("COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/");
            }
            console.log(`[EMBED] Getting embeddings for ${cleanTexts.length} texts via Cohere...`);
            // Using latest Cohere model: embed-english-v3.0
            const response = yield axios_1.default.post("https://api.cohere.com/v1/embed", {
                texts: cleanTexts,
                model: "embed-english-v3.0", // Latest model
                input_type: "search_document",
            }, {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            if (!response.data.embeddings) {
                throw new Error("No embeddings returned from Cohere");
            }
            const embeddings = response.data.embeddings;
            console.log(`[EMBED] ✓ Got ${embeddings.length} embeddings (1024 dimensions)`);
            return embeddings;
        }
        catch (error) {
            console.error("[EMBED] ❌ Error:", error.message);
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                console.error("[EMBED] 401 - Invalid API key");
            }
            if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
                console.error("[EMBED] 404 - Endpoint not found");
            }
            throw error;
        }
    });
}
