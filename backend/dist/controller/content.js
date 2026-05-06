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
const embeddings_1 = require("../utils/embeddings");
const fileUpload_1 = require("../utils/fileUpload");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * POST /api/v1/content
 * Add new content (article, tweet, YouTube, PDF, or text)
 */
const addContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { link, type, title, tags } = req.body;
        const userId = req.userId;
        console.log(`[CONTENT] Adding ${type}: ${title}`);
        // Validate required fields
        if (!type || !title) {
            return res.status(400).json({
                message: "type and title are required",
            });
        }
        let finalLink = link;
        // Handle PDF file upload
        if (type === "pdf" && req.file) {
            console.log("[CONTENT] Uploading PDF to Cloudinary...");
            finalLink = yield (0, fileUpload_1.uploadPdfToCloudinary)(req.file.path);
            console.log(`[CONTENT] PDF URL: ${finalLink}`);
        }
        // If type is PDF or link-based, must have link
        if ((type === "pdf" ||
            type === "article" ||
            type === "youtube" ||
            type === "tweet") &&
            !finalLink) {
            return res.status(400).json({
                message: `${type} requires a link`,
            });
        }
        // Create content document
        const content = yield Schema_1.Content.create({
            link: finalLink,
            type,
            title,
            tags: tags || [],
            userId,
            status: "pending",
            embeddingStatus: "pending",
        });
        // Return immediately
        res.status(200).json({
            message: "Content added successfully. Processing in background...",
            contentId: content._id,
            status: "processing",
        });
        // Start background processing
        processContentInBackground(content._id.toString(), finalLink, type).catch((error) => {
            console.error("[CONTENT] Background processing failed:", error);
        });
    }
    catch (error) {
        console.error("[CONTENT] ❌ Error adding content:", error.message);
        res.status(500).json({
            message: "Failed to add content",
            error: error.message,
        });
    }
});
exports.addContent = addContent;
/**
 * GET /api/v1/content
 * Get all user's content
 */
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
        console.error("[CONTENT] ❌ Error fetching content:", error.message);
        res.status(500).json({
            message: "Failed to fetch content",
        });
    }
});
exports.getContent = getContent;
/**
 * DELETE /api/v1/content
 * Delete content by ID
 */
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const userId = req.userId;
        if (!contentId) {
            return res.status(400).json({
                message: "contentId is required",
            });
        }
        const deletedContent = yield Schema_1.Content.findOneAndDelete({
            _id: contentId,
            userId: userId,
        });
        if (!deletedContent) {
            return res.status(404).json({
                message: "Content not found",
            });
        }
        res.status(200).json({
            message: "Content deleted successfully",
            deletedId: contentId,
        });
    }
    catch (error) {
        console.error("[CONTENT] ❌ Error deleting content:", error.message);
        res.status(500).json({
            message: "Failed to delete content",
        });
    }
});
exports.deleteContent = deleteContent;
/**
 * Background processing: Extract text and create embeddings
 */
function processContentInBackground(contentId, link, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[PROCESS] Starting for ${type}: ${contentId}`);
            let extractedText = "";
            // ============ EXTRACTION PHASE ============
            try {
                console.log(`[EXTRACT] Processing ${type}...`);
                // Handle text type (user provides text directly)
                if (type === "text") {
                    // For text type, extractedText is already in the field
                    const content = yield Schema_1.Content.findById(contentId);
                    extractedText = content.extractedText || "";
                }
                else {
                    // For all other types (articles, tweets, YouTube, PDFs), extract from URL
                    extractedText = yield (0, extractText_1.extractTextFromUrl)(link);
                }
                if (!extractedText || extractedText.trim().length < 50) {
                    throw new Error("Extracted text too short");
                }
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    extractedText,
                    status: "extracted",
                    extractedAt: new Date(),
                });
                console.log(`[EXTRACT] ✓ Got ${extractedText.length} characters`);
            }
            catch (extractError) {
                console.error("[EXTRACT] ❌ Failed:", extractError.message);
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    status: "failed",
                    extractionError: extractError.message,
                });
                return;
            }
            // ============ EMBEDDING PHASE ============
            try {
                console.log("[EMBED] Creating embeddings...");
                const textChunks = (0, extractText_1.chunkText)(extractedText, 500, 50);
                if (textChunks.length === 0) {
                    throw new Error("Could not create chunks");
                }
                const embeddings = yield (0, embeddings_1.getEmbeddings)(textChunks);
                const chunksWithEmbeddings = textChunks.map((text, index) => ({
                    _id: new mongoose_1.default.Types.ObjectId(),
                    text: text,
                    chunkIndex: index,
                    embedding: embeddings[index],
                }));
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    chunks: chunksWithEmbeddings,
                    embeddingStatus: "embedded",
                    embeddedAt: new Date(),
                    embeddingError: null,
                });
                console.log(`[EMBED] ✓ Created ${chunksWithEmbeddings.length} chunks`);
            }
            catch (embeddingError) {
                console.error("[EMBED] ❌ Failed:", embeddingError.message);
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    embeddingStatus: "failed",
                    embeddingError: embeddingError.message,
                });
                return;
            }
            console.log(`[PROCESS] ✓✓ Fully processed ${contentId} successfully!`);
        }
        catch (error) {
            console.error("[PROCESS] ❌ Unexpected error:", error.message);
        }
    });
}
