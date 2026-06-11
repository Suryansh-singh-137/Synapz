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
exports.deleteContent = exports.getContent = exports.addContent = void 0;
const Schema_1 = require("../models/Schema");
const extractText_1 = require("../utils/extractText");
const extractPdf_1 = require("../utils/extractPdf");
const embeddings_1 = require("../utils/embeddings");
const fileUpload_1 = require("../utils/fileUpload");
const mongoose_1 = __importDefault(require("mongoose"));
const addContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { link, type, title, tags } = req.body;
        const userId = req.userId;
        console.log(`[CONTENT] Adding ${type}: ${title}`);
        if (!type || !title) {
            return res.status(400).json({ message: "type and title are required" });
        }
        let finalLink = link;
        let preExtractedText = null;
        if (type === "pdf" && req.file) {
            const localPath = req.file.path;
            // ── STEP 1: Extract text from local disk FIRST ──────────────────────
            // The file is sitting on disk right now at localPath.
            // We read it here before uploadPdfToCloudinary() deletes it.
            console.log(`[CONTENT] Extracting text from local file: ${localPath}`);
            try {
                preExtractedText = yield (0, extractPdf_1.extractTextFromLocalPdf)(localPath);
                console.log(`[CONTENT] ✓ Extracted ${preExtractedText.length} chars from local PDF`);
            }
            catch (err) {
                console.warn(`[CONTENT] ⚠ Local extraction failed: ${err.message}`);
                // Continue anyway — we'll store status "failed" for this content
            }
            // ── STEP 2: Upload to Cloudinary (this deletes the local file) ───────
            console.log("[CONTENT] Uploading PDF to Cloudinary...");
            finalLink = yield (0, fileUpload_1.uploadPdfToCloudinary)(localPath);
            console.log(`[CONTENT] PDF stored at: ${finalLink}`);
        }
        if ((type === "pdf" ||
            type === "article" ||
            type === "youtube" ||
            type === "tweet") &&
            !finalLink) {
            return res
                .status(400)
                .json({ message: `${type} requires a link or uploaded file` });
        }
        // ── STEP 3: Save to MongoDB ───────────────────────────────────────────
        // For PDFs: save extracted text immediately, mark "extracted"
        // For others: save with status "pending", background job handles it
        const content = yield Schema_1.Content.create({
            link: finalLink,
            type,
            title,
            tags: tags || [],
            userId,
            extractedText: preExtractedText !== null && preExtractedText !== void 0 ? preExtractedText : null,
            status: preExtractedText ? "extracted" : "pending",
            extractedAt: preExtractedText ? new Date() : null,
            extractionError: !preExtractedText && type === "pdf"
                ? "Local extraction failed — PDF may be scanned/image-only"
                : null,
            embeddingStatus: "pending",
        });
        res.status(200).json({
            message: "Content added. Processing in background...",
            contentId: content._id,
            status: "processing",
        });
        // ── STEP 4: Background job — embed only (no extraction needed for PDFs) ─
        processContentInBackground(content._id.toString(), finalLink, type, preExtractedText).catch((err) => console.error("[CONTENT] Background error:", err));
    }
    catch (error) {
        console.error("[CONTENT] ❌", error.message);
        res
            .status(500)
            .json({ message: "Failed to add content", error: error.message });
    }
});
exports.addContent = addContent;
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const content = yield Schema_1.Content.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Content retrieved successfully",
            total: content.length,
            content: content.map((c) => {
                var _a;
                return ({
                    _id: c._id,
                    title: c.title,
                    link: c.link,
                    type: c.type,
                    tags: c.tags,
                    status: c.status,
                    embeddingStatus: c.embeddingStatus,
                    extractedAt: c.extractedAt,
                    embeddedAt: c.embeddedAt,
                    extractionError: c.extractionError,
                    embeddingError: c.embeddingError,
                    createdAt: c.createdAt,
                    chunkCount: ((_a = c.chunks) === null || _a === void 0 ? void 0 : _a.length) || 0,
                });
            }),
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch content" });
    }
});
exports.getContent = getContent;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const userId = req.userId;
        if (!contentId) {
            return res.status(400).json({ message: "contentId is required" });
        }
        const deleted = yield Schema_1.Content.findOneAndDelete({ _id: contentId, userId });
        if (!deleted) {
            return res.status(404).json({ message: "Content not found" });
        }
        res
            .status(200)
            .json({ message: "Deleted successfully", deletedId: contentId });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete content" });
    }
});
exports.deleteContent = deleteContent;
// ─────────────────────────────────────────────────────────────────────────────
function processContentInBackground(contentId_1, link_1, type_1) {
    return __awaiter(this, arguments, void 0, function* (contentId, link, type, preExtractedText = null) {
        try {
            console.log(`[PROCESS] Starting for ${type}: ${contentId}`);
            let extractedText = preExtractedText !== null && preExtractedText !== void 0 ? preExtractedText : "";
            // ── EXTRACTION ────────────────────────────────────────────────────────
            if (preExtractedText) {
                // PDF already extracted before upload — skip this phase entirely
                console.log(`[PROCESS] Skipping extraction — already have ${preExtractedText.length} chars`);
            }
            else {
                try {
                    if (type === "text") {
                        const doc = yield Schema_1.Content.findById(contentId);
                        extractedText = doc.extractedText || "";
                    }
                    else {
                        // articles, tweets, youtube → Jina AI
                        extractedText = yield (0, extractText_1.extractTextFromUrl)(link);
                    }
                    if (!extractedText || extractedText.trim().length < 50) {
                        throw new Error(`Text too short: ${extractedText.length} chars`);
                    }
                    yield Schema_1.Content.findByIdAndUpdate(contentId, {
                        extractedText,
                        status: "extracted",
                        extractedAt: new Date(),
                        extractionError: null,
                    });
                    console.log(`[EXTRACT] ✓ ${extractedText.length} chars`);
                }
                catch (err) {
                    console.error("[EXTRACT] ❌", err.message);
                    yield Schema_1.Content.findByIdAndUpdate(contentId, {
                        status: "failed",
                        extractionError: err.message,
                    });
                    return;
                }
            }
            if (!extractedText || extractedText.trim().length < 50) {
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    status: "failed",
                    extractionError: "No text to embed",
                });
                return;
            }
            // ── EMBEDDING ─────────────────────────────────────────────────────────
            try {
                const chunks = (0, extractText_1.chunkText)(extractedText, 500, 50);
                const embeddings = yield (0, embeddings_1.getEmbeddings)(chunks);
                const chunksWithEmbeddings = chunks.map((text, i) => ({
                    _id: new mongoose_1.default.Types.ObjectId(),
                    text,
                    chunkIndex: i,
                    embedding: embeddings[i],
                }));
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    chunks: chunksWithEmbeddings,
                    embeddingStatus: "embedded",
                    embeddedAt: new Date(),
                    embeddingError: null,
                });
                console.log(`[EMBED] ✓ ${chunksWithEmbeddings.length} chunks embedded`);
                console.log(`[PROCESS] ✓✓ Done: ${contentId}`);
            }
            catch (err) {
                console.error("[EMBED] ❌", err.message);
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    embeddingStatus: "failed",
                    embeddingError: err.message,
                });
            }
        }
        catch (error) {
            console.error("[PROCESS] ❌ Unexpected:", error.message);
        }
    });
}
