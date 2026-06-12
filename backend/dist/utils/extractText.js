"use strict";
/**
 * CONTENT EXTRACTION PIPELINE
 *
 * Strategy (waterfall — tries each in order until one works):
 *
 *  1. Jina AI Reader  — best quality, handles JS pages
 *     Fails when: rate limited, domain blocked (451/429)
 *
 *  2. Direct scrape   — fetch HTML, parse with cheerio
 *     Works for: most articles, GeeksForGeeks, blogs, docs
 *     Fails for: heavy JS SPAs, Twitter (requires auth)
 *
 *  3. Meta tag fallback — extract title + description from <meta>
 *     Works for: almost any page, minimal but usable context
 *
 * Twitter/X: handled specially since it requires OAuth
 */
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
// ─── 1. JINA AI ──────────────────────────────────────────────────────────────
function extractViaJina(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[EXTRACT] Trying Jina AI for: ${url}`);
        let normalizedUrl = url;
        try {
            normalizedUrl = decodeURI(url);
        }
        catch (_a) {
            /* use original */
        }
        const jinaUrl = `https://r.jina.ai/${encodeURI(normalizedUrl)}`;
        const response = yield axios_1.default.get(jinaUrl, {
            headers: { Accept: "text/plain" },
            timeout: 15000,
        });
        const text = response.data.trim();
        if (text.length < 100)
            throw new Error(`Jina returned too little text (${text.length} chars)`);
        console.log(`[EXTRACT] ✓ Jina: ${text.length} chars`);
        return text;
    });
}
// ─── 2. DIRECT SCRAPE ────────────────────────────────────────────────────────
function extractViaScrape(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[EXTRACT] Trying direct scrape for: ${url}`);
        const response = yield axios_1.default.get(url, {
            timeout: 12000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
            maxRedirects: 5,
        });
        const $ = cheerio.load(response.data);
        $("script, style, nav, header, footer, aside, [class*='cookie'], [class*='popup'], [class*='modal'], [class*='sidebar'], [class*='ad-'], [id*='ad-']").remove();
        const contentSelectors = [
            "article",
            "main",
            '[role="main"]',
            ".article-content",
            ".post-content",
            ".entry-content",
            ".content",
            "#content",
            ".article-body",
            ".story-body",
            ".article--viewer",
            ".text", // GeeksForGeeks
        ];
        let text = "";
        for (const selector of contentSelectors) {
            const el = $(selector);
            if (el.length > 0) {
                text = el.text().replace(/\s+/g, " ").trim();
                if (text.length > 200) {
                    console.log(`[EXTRACT] Found content via "${selector}": ${text.length} chars`);
                    break;
                }
            }
        }
        if (text.length < 200) {
            text = $("body").text().replace(/\s+/g, " ").trim();
        }
        if (text.length < 100)
            throw new Error(`Direct scrape returned too little text (${text.length} chars)`);
        console.log(`[EXTRACT] ✓ Direct scrape: ${text.length} chars`);
        return text;
    });
}
// ─── 3. META TAG FALLBACK ────────────────────────────────────────────────────
function extractViaMetaTags(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[EXTRACT] Trying meta tags for: ${url}`);
        const response = yield axios_1.default.get(url, {
            timeout: 10000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
        });
        const $ = cheerio.load(response.data);
        const title = $("title").text().trim() ||
            $('meta[property="og:title"]').attr("content") ||
            "";
        const description = $('meta[name="description"]').attr("content") ||
            $('meta[property="og:description"]').attr("content") ||
            "";
        const keywords = $('meta[name="keywords"]').attr("content") || "";
        const combined = [
            title && `Title: ${title}`,
            description && `Description: ${description}`,
            keywords && `Keywords: ${keywords}`,
            `Source: ${url}`,
        ]
            .filter(Boolean)
            .join("\n\n");
        if (combined.length < 50)
            throw new Error("No metadata found on page");
        console.log(`[EXTRACT] ✓ Meta tags: ${combined.length} chars`);
        return combined;
    });
}
// ─── TWITTER SPECIAL CASE ────────────────────────────────────────────────────
function isTwitterUrl(url) {
    return /^https?:\/\/(www\.)?(twitter|x)\.com/i.test(url);
}
function buildTwitterContext(url) {
    const match = url.match(/(?:twitter|x)\.com\/([^/]+)\/status\/(\d+)/i);
    if (match) {
        const [, username, tweetId] = match;
        return (`Twitter post by @${username}\nTweet ID: ${tweetId}\nURL: ${url}\n\n` +
            `Note: Full tweet text requires Twitter API. Use the title you provided as the primary content.`);
    }
    return `Twitter/X URL: ${url}\nNote: Tweet content requires authentication.`;
}
// ─── PUBLIC API ───────────────────────────────────────────────────────────────
/**
 * Extract text from any URL.
 * Tries Jina → Direct scrape → Meta tags in order.
 * Twitter gets special handling.
 */
function extractTextFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (isTwitterUrl(url)) {
            console.log(`[EXTRACT] Twitter URL — trying Jina first, fallback to context`);
            try {
                return yield extractViaJina(url);
            }
            catch (_b) {
                console.log(`[EXTRACT] Jina blocked for Twitter, using URL context`);
                return buildTwitterContext(url);
            }
        }
        const strategies = [
            { name: "Jina AI", fn: () => extractViaJina(url) },
            { name: "Direct scrape", fn: () => extractViaScrape(url) },
            { name: "Meta tags", fn: () => extractViaMetaTags(url) },
        ];
        const errors = [];
        for (const { name, fn } of strategies) {
            try {
                const text = yield fn();
                if (text && text.length >= 100)
                    return text;
            }
            catch (err) {
                const msg = ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message || "Unknown error";
                console.warn(`[EXTRACT] ${name} failed: ${String(msg).substring(0, 120)}`);
                errors.push(`${name}: ${String(msg).substring(0, 120)}`);
            }
        }
        throw new Error(`All extraction strategies failed:\n${errors.join("\n")}`);
    });
}
// ─── CHUNKING ─────────────────────────────────────────────────────────────────
function chunkText(text, chunkSize = 500, overlap = 50) {
    if (!text || text.trim().length === 0)
        return [];
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.length > 50)
            chunks.push(chunk);
    }
    console.log(`[CHUNK] ${chunks.length} chunks from ${words.length} words`);
    return chunks.length > 0 ? chunks : [text];
}
