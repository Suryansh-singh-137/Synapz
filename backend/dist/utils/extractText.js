"use strict";
/**
 * JINA AI READER - Production Ready URL to Text
 *
 * Works with:
 * ✅ Dynamic JS-rendered content
 * ✅ PDFs
 * ✅ Tweets
 * ✅ Any website (no scraping needed)
 *
 * Free tier: 1000 requests/month
 * Perfect for prototyping & small apps
 *
 * Docs: https://jina.ai/reader/
 */
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
exports.extractTextFromUrl = extractTextFromUrl;
exports.chunkText = chunkText;
const axios_1 = __importDefault(require("axios"));
/**
 * Extract text from ANY URL using Jina Reader API
 * No scraping, no selectors, no bot detection
 * Returns clean markdown
 */
function extractTextFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[EXTRACT] Using Jina Reader for: ${url}`);
            // Simple: just prepend Jina reader endpoint
            const jinaUrl = `https://r.jina.ai/${url}`;
            const response = yield axios_1.default.get(jinaUrl, {
                headers: {
                    Accept: "text/plain",
                },
                timeout: 15000,
            });
            const text = response.data;
            if (!text || text.trim().length < 100) {
                throw new Error(`Extracted text too short (${text.length} chars)`);
            }
            console.log(`[EXTRACT] ✓ Got ${text.length} characters`);
            return text;
        }
        catch (error) {
            const msg = error.message || "Unknown error";
            console.error(`[EXTRACT] ✗ Failed: ${msg}`);
            throw new Error(`Failed to extract from URL: ${msg}`);
        }
    });
}
/**
 * Chunk text into overlapping pieces
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
    if (!text || text.trim().length === 0) {
        console.log("[CHUNK] Text is empty!");
        return [];
    }
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.length > 50) {
            chunks.push(chunk);
        }
    }
    console.log(`[CHUNK] Created ${chunks.length} chunks from ${words.length} words`);
    return chunks.length > 0 ? chunks : [text];
}
