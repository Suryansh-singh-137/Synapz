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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAllContent = exports.extractContent = void 0;
const Schema_1 = require("../models/Schema");
const extractText_1 = require("../utils/extractText");
/**
 * Endpoint: POST /api/v1/brain/extract
 *
 * Body: { contentId: "507f1f77bcf86cd799439011" }
 *
 * This fetches the URL from the content, extracts text,
 * and stores it in MongoDB for later use in chat/embeddings
 */
const extractContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { contentId } = req.body;
        const userId = req.userId;
        // Validate input
        if (!contentId) {
            return res.status(400).json({
                message: "contentId is required",
            });
        }
        // Step 1: Find the content (verify user owns it)
        const content = yield Schema_1.Content.findOne({
            _id: contentId,
            userId: userId,
        });
        if (!content) {
            return res.status(404).json({
                message: "Content not found or you don't have access",
            });
        }
        // Step 2: Don't re-extract if already done
        if (content.status === "extracted") {
            return res.status(200).json({
                message: "Content already extracted",
                extractedText: ((_a = content.extractedText) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + "...",
            });
        }
        // Step 3: Extract text from URL
        console.log(`Extracting text from: ${content.link}`);
        const extractedText = yield (0, extractText_1.extractTextFromUrl)(content.link);
        // Step 4: Update in database
        yield Schema_1.Content.findByIdAndUpdate(contentId, {
            extractedText: extractedText,
            status: "extracted",
            extractedAt: new Date(),
            extractionError: null,
        });
        res.status(200).json({
            message: "Content extracted successfully",
            extractedLength: extractedText.length,
            preview: extractedText.substring(0, 200) + "...",
        });
    }
    catch (error) {
        console.error("Extraction error:", error);
        // Try to update status as "failed" in database
        const { contentId } = req.body;
        if (contentId) {
            try {
                yield Schema_1.Content.findByIdAndUpdate(contentId, {
                    status: "failed",
                    extractionError: error instanceof Error ? error.message : "Unknown error",
                });
            }
            catch (updateError) {
                console.error("Failed to update error status:", updateError);
            }
        }
        return res.status(500).json({
            message: "Failed to extract content",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.extractContent = extractContent;
/**
 * Endpoint: POST /api/v1/brain/extract-all
 *
 * Extracts text from ALL user's content that hasn't been extracted yet
 * Useful for bulk processing
 */
const extractAllContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        // Find all pending content
        const pendingContent = yield Schema_1.Content.find({
            userId: userId,
            status: "pending",
        });
        if (pendingContent.length === 0) {
            return res.status(200).json({
                message: "No pending content to extract",
                extracted: 0,
                failed: 0,
            });
        }
        let extracted = 0;
        let failed = 0;
        // Extract each one
        for (const content of pendingContent) {
            try {
                const extractedText = yield (0, extractText_1.extractTextFromUrl)(content.link);
                yield Schema_1.Content.findByIdAndUpdate(content._id, {
                    extractedText: extractedText,
                    status: "extracted",
                    extractedAt: new Date(),
                    extractionError: null,
                });
                extracted++;
            }
            catch (error) {
                console.error(`Failed to extract ${content.link}:`, error);
                yield Schema_1.Content.findByIdAndUpdate(content._id, {
                    status: "failed",
                    extractionError: error instanceof Error ? error.message : "Unknown error",
                });
                failed++;
            }
            // Add small delay to avoid overwhelming servers
            yield new Promise((resolve) => setTimeout(resolve, 500));
        }
        res.status(200).json({
            message: "Extraction complete",
            extracted,
            failed,
            total: pendingContent.length,
        });
    }
    catch (error) {
        console.error("Bulk extraction error:", error);
        return res.status(500).json({
            message: "Failed to extract content",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.extractAllContent = extractAllContent;
