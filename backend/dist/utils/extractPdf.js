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
exports.extractTextFromLocalPdf = extractTextFromLocalPdf;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Extract text from a PDF file on local disk.
 *
 * This is called BEFORE the file is uploaded to Cloudinary,
 * while multer's temp file still exists at req.file.path.
 *
 * We never download PDFs from Cloudinary — their access controls
 * cause 401 errors regardless of upload settings.
 */
function extractTextFromLocalPdf(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log(`[PDF EXTRACT] Reading: ${filePath}`);
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`File not found on disk: ${filePath}`);
        }
        const buffer = fs_1.default.readFileSync(filePath);
        console.log(`[PDF EXTRACT] Read ${(buffer.byteLength / 1024).toFixed(1)} KB`);
        let parsed;
        try {
            parsed = yield (0, pdf_parse_1.default)(buffer);
        }
        catch (err) {
            throw new Error(`pdf-parse failed: ${err.message}`);
        }
        const text = (_b = (_a = parsed.text) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        if (text.length < 50) {
            throw new Error(`Text too short (${text.length} chars, ${parsed.numpages} pages). ` +
                `PDF may be scanned (image-only) with no text layer.`);
        }
        console.log(`[PDF EXTRACT] ✓ ${text.length} chars from ${parsed.numpages} pages`);
        return text;
    });
}
