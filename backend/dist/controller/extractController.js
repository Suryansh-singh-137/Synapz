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
const content_1 = require("./content");
/**
 * Endpoint: POST /api/v1/brain/extract
 *
 * Reprocesses or extracts text and embeddings for a single content item.
 * Uses the unified ingestion pipeline (extract + chunk + embed).
 */
const extractContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const userId = req.userId;
        if (!contentId) {
            return res.status(400).json({ message: "contentId is required" });
        }
        const content = yield Schema_1.Content.findOne({ _id: contentId, userId });
        if (!content) {
            return res
                .status(404)
                .json({ message: "Content not found or you don't have access" });
        }
        // Trigger full unified pipeline (extract + chunk + embed) in background
        (0, content_1.processContentPipeline)(contentId, content.link, content.type).catch((err) => console.error("[EXTRACT] Pipeline error:", err));
        return res.status(200).json({
            message: "Extraction and embedding pipeline started",
            contentId,
            status: "processing",
        });
    }
    catch (error) {
        console.error("Extraction error:", error);
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
 * Runs the extraction & embedding pipeline for all pending content owned by the user.
 */
const extractAllContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const pendingContent = yield Schema_1.Content.find({
            userId,
            $or: [{ status: "pending" }, { embeddingStatus: "pending" }],
        });
        if (pendingContent.length === 0) {
            return res.status(200).json({
                message: "No pending content to process",
                total: 0,
            });
        }
        for (const item of pendingContent) {
            (0, content_1.processContentPipeline)(item._id.toString(), item.link, item.type).catch((err) => console.error(`[EXTRACT-ALL] Error on ${item._id}:`, err));
        }
        return res.status(200).json({
            message: "Pipeline triggered for all pending content",
            total: pendingContent.length,
        });
    }
    catch (error) {
        console.error("Bulk extraction error:", error);
        return res.status(500).json({
            message: "Failed to process content",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.extractAllContent = extractAllContent;
