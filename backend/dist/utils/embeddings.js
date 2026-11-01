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
exports.getEmbeddings = getEmbeddings;
exports.getEmbedding = getEmbedding;
const axios_1 = __importDefault(require("axios"));
/**
 * COHERE EMBEDDINGS - LATEST MODEL
 * Using embed-english-v3.0 (latest, best quality)
 */
const COHERE_API_KEY = process.env.COHERE_API_KEY;
if (!COHERE_API_KEY) {
    console.warn("[EMBED] ⚠️ COHERE_API_KEY not set. Get free key at: https://dashboard.cohere.com/");
}
/**
 * Get embeddings for multiple texts from Cohere API.
 * Single source of truth for embedding calls.
 */
function getEmbeddings(texts_1) {
    return __awaiter(this, arguments, void 0, function* (texts, inputType = "search_document") {
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
            console.log(`[EMBED] Getting embeddings for ${cleanTexts.length} texts via Cohere (${inputType})...`);
            const response = yield axios_1.default.post("https://api.cohere.com/v1/embed", {
                texts: cleanTexts,
                model: "embed-english-v3.0",
                input_type: inputType,
            }, {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            if (!response.data.embeddings || response.data.embeddings.length === 0) {
                throw new Error("No embeddings returned from Cohere");
            }
            const embeddings = response.data.embeddings;
            console.log(`[EMBED] ✓ Got ${embeddings.length} embeddings (${embeddings[0].length} dimensions)`);
            return embeddings;
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
 * Get embedding for a single text.
 * Defaults to "search_query" (used for query similarity search).
 */
function getEmbedding(text_1) {
    return __awaiter(this, arguments, void 0, function* (text, inputType = "search_query") {
        const embeddings = yield getEmbeddings([text], inputType);
        return embeddings[0];
    });
}
