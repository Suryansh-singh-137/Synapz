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
 * SIMPLE & WORKING extraction method
 * Uses better headers and smarter parsing
 */
function extractTextFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log(`[EXTRACT] Fetching: ${url}`);
            // Step 1: Fetch with proper headers
            const { data } = yield axios_1.default.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    Connection: "keep-alive",
                },
                timeout: 10000,
            });
            // Step 2: Parse HTML with Cheerio
            const $ = cheerio.load(data);
            // Remove unwanted elements
            $("script, style, nav, footer, iframe, noscript").remove();
            $("[class*='cookie'], [class*='popup'], [class*='ad']").remove();
            // Step 3: Extract text from main content
            let text = "";
            // Try these selectors in order
            const selectors = [
                "article",
                "main",
                "[role='main']",
                ".post-content",
                ".article-body",
                ".content",
                "body",
            ];
            for (const selector of selectors) {
                const element = $(selector);
                if (element.length > 0) {
                    text = element.text();
                    if (text.length > 200)
                        break;
                }
            }
            // Step 4: Clean the text
            text = text
                .replace(/\s+/g, " ") // Multiple spaces to single
                .replace(/\n+/g, " ") // Newlines to space
                .trim();
            console.log(`[EXTRACT] ✓ Got ${text.length} characters`);
            return text;
        }
        catch (error) {
            const msg = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status)
                ? `HTTP ${error.response.status}`
                : error.message;
            console.error(`[EXTRACT] ✗ Failed: ${msg}`);
            throw new Error(`Failed to fetch URL: ${msg}`);
        }
    });
}
/**
 * SIMPLE chunking - split into word-based chunks
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.length > 50) {
            chunks.push(chunk);
        }
    }
    console.log(`[CHUNK] Created ${chunks.length} chunks`);
    return chunks.length > 0 ? chunks : [text];
}
