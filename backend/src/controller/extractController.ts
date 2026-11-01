import { Request, Response } from "express";
import { Content } from "../models/Schema";
import { processContentPipeline } from "./content";

/**
 * Endpoint: POST /api/v1/brain/extract
 *
 * Reprocesses or extracts text and embeddings for a single content item.
 * Uses the unified ingestion pipeline (extract + chunk + embed).
 */
export const extractContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = (req as any).userId;

    if (!contentId) {
      return res.status(400).json({ message: "contentId is required" });
    }

    const content = await Content.findOne({ _id: contentId, userId });
    if (!content) {
      return res
        .status(404)
        .json({ message: "Content not found or you don't have access" });
    }

    // Trigger full unified pipeline (extract + chunk + embed) in background
    processContentPipeline(contentId, content.link, content.type).catch((err) =>
      console.error("[EXTRACT] Pipeline error:", err),
    );

    return res.status(200).json({
      message: "Extraction and embedding pipeline started",
      contentId,
      status: "processing",
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return res.status(500).json({
      message: "Failed to extract content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Endpoint: POST /api/v1/brain/extract-all
 *
 * Runs the extraction & embedding pipeline for all pending content owned by the user.
 */
export const extractAllContent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const pendingContent = await Content.find({
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
      processContentPipeline(item._id.toString(), item.link, item.type).catch(
        (err) => console.error(`[EXTRACT-ALL] Error on ${item._id}:`, err),
      );
    }

    return res.status(200).json({
      message: "Pipeline triggered for all pending content",
      total: pendingContent.length,
    });
  } catch (error) {
    console.error("Bulk extraction error:", error);
    return res.status(500).json({
      message: "Failed to process content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
