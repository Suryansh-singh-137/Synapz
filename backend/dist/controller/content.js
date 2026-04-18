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
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * POST /api/v1/content
 *
 * Add new content to user's brain
 * Automatically triggers extraction and embedding in background
 */
const addContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, type, title, tags } = req.body;
        const userId = req.userId;
        // Validate input
        if (!link || !type || !title) {
            return res.status(400).json({
                message: "link, type, and title are required",
            });
        }
        // Step 1: Create content document
        const content = yield Schema_1.Content.create({
            link,
            type,
            title,
            tags: tags || [],
            userId,
            status: "pending", // Will be updated by background process
            embeddingStatus: "pending", // Will be updated by background process
        });
        // Step 2: Return immediately to user
        res.status(200).json({
            message: "Content added successfully. Processing in background...",
            contentId: content._id,
            status: "processing",
        });
        // Step 3: Start background processing (don't await!)
        // User gets response immediately while this runs
        processContentInBackground(content._id.toString(), link).catch((error) => {
            console.error(`Background processing failed for ${content._id}:`, error);
        });
    }
    catch (e) {
        console.error("Error adding content:", e);
        res.status(500).json({
            message: "Failed to add content",
        });
    }
});
exports.addContent = addContent;
/**
 * GET /api/v1/content
 *
 * Fetch all content for the logged-in user
 * Returns content with status (pending, extracted, embedded, failed)
 */
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        // Fetch all content for this user
        const content = yield Schema_1.Content.find({
            userId: userId,
        }).sort({ createdAt: -1 }); // Most recent first
        // Return with status information
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
    catch (e) {
        console.error("Error fetching content:", e);
        res.status(500).json({
            message: "Failed to fetch content",
        });
    }
});
exports.getContent = getContent;
/**
 * DELETE /api/v1/content
 *
 * Delete content by ID (verify user owns it)
 * Body: { contentId: "507f..." }
 */
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const userId = req.userId;
        // Validate input
        if (!contentId) {
            return res.status(400).json({
                message: "contentId is required",
            });
        }
        // Find and delete (verify user owns it)
        const deletedContent = yield Schema_1.Content.findOneAndDelete({
            _id: contentId,
            userId: userId,
        });
        if (!deletedContent) {
            return res.status(404).json({
                message: "Content not found or you don't have permission to delete it",
            });
        }
        res.status(200).json({
            message: "Content deleted successfully",
            deletedId: contentId,
        });
    }
    catch (e) {
        console.error("Error deleting content:", e);
        res.status(500).json({
            message: "Failed to delete content",
        });
    }
});
exports.deleteContent = deleteContent;
/**
 * Background processing: Extract + Embed
 * Runs AFTER user gets response
 * Doesn't block the request
 */
function processContentInBackground(contentId, link) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Starting background processing for ${contentId}...`);
            // ============= EXTRACTION PHASE =============
            try {
                console.log(`Extracting text from: ${link}`);
                const extractedText = yield (0, extractText_1.extractTextFromUrl)(link);
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    extractedText: extractedText,
                    status: "extracted",
                    extractedAt: new Date(),
                });
                console.log(`✓ Extraction complete for ${contentId}`);
            }
            catch (extractError) {
                console.error(`✗ Extraction failed for ${contentId}:`, extractError);
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    status: "failed",
                    extractionError: extractError instanceof Error
                        ? extractError.message
                        : "Unknown error",
                });
                return; // Stop here if extraction fails
            }
            // ============= EMBEDDING PHASE =============
            try {
                // Get the updated content with extracted text
                const content = yield Schema_1.Content.findById(contentId);
                if (!content || !content.extractedText) {
                    throw new Error("No extracted text found");
                }
                console.log(`Creating embeddings for ${contentId}...`);
                // Split into chunks
                const textChunks = (0, extractText_1.chunkText)(content.extractedText, 500, 50);
                if (textChunks.length === 0) {
                    throw new Error("Could not create chunks from text");
                }
                // Get embeddings from Open Router
                const embeddings = yield (0, embeddings_1.getEmbeddings)(textChunks);
                // Create chunk objects with embeddings
                const chunksWithEmbeddings = textChunks.map((text, index) => ({
                    _id: new mongoose_1.default.Types.ObjectId(),
                    text: text,
                    chunkIndex: index,
                    embedding: embeddings[index],
                }));
                // Store embeddings
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    chunks: chunksWithEmbeddings,
                    embeddingStatus: "embedded",
                    embeddedAt: new Date(),
                    embeddingError: null,
                });
                console.log(`✓ Embedding complete for ${contentId} (${chunksWithEmbeddings.length} chunks)`);
            }
            catch (embeddingError) {
                console.error(`✗ Embedding failed for ${contentId}:`, embeddingError);
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    embeddingStatus: "failed",
                    embeddingError: embeddingError instanceof Error
                        ? embeddingError.message
                        : "Unknown error",
                });
                return;
            }
            console.log(`✓✓ Fully processed ${contentId} successfully!`);
        }
        catch (error) {
            console.error(`Unexpected error in background processing:`, error);
        }
    });
}
