"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const cheerio = __importStar(require("cheerio"));
/**
 * Extracts clean text from a URL
 * Handles: Articles, blogs, Twitter threads, HTML pages
 */
function extractTextFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Fetch the HTML from the URL
            const response = yield axios_1.default.get(url, {
                timeout: 10000, // 10 second timeout
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            });
            const html = response.data;
            // Step 2: Parse HTML with cheerio
            const $ = cheerio.load(html);
            // Step 3: Remove script and style tags (they contain code, not content)
            $("script").remove();
            $("style").remove();
            $("nav").remove(); // Navigation often has repetitive text
            $("footer").remove(); // Footer is usually boilerplate
            // Step 4: Extract text from common content containers
            // Try different selectors in order of specificity
            let text = "";
            // For articles/blogs
            const article = $("article").text();
            const main = $("main").text();
            const post = $('[class*="post"]').text();
            const content = $('[class*="content"]').text();
            // Pick the longest one (usually the most content)
            text = [article, main, post, content].sort((a, b) => b.length - a.length)[0];
            // Fallback: if none found, use body text
            if (!text || text.trim().length < 100) {
                text = $("body").text();
            }
            // Step 5: Clean up the text
            // Remove extra whitespace, newlines, multiple spaces
            text = text
                .replace(/\s+/g, " ") // Replace multiple spaces with single space
                .replace(/\n\n+/g, "\n") // Replace multiple newlines with single newline
                .trim();
            // Step 6: Validate we got something meaningful
            if (!text || text.length < 50) {
                throw new Error("Could not extract meaningful text from URL");
            }
            return text;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to fetch URL: ${error.message}`);
            }
            throw error;
        }
    });
}
/**
 * Chunks text into smaller pieces for embedding
 * Each chunk is ~500 words, with 50 word overlap
 * This helps with context in RAG (Retrieval Augmented Generation)
 */
function chunkText(text, chunkSize = 500, overlapSize = 50) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize - overlapSize) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.trim().length > 0) {
            chunks.push(chunk);
        }
    }
    return chunks;
}
