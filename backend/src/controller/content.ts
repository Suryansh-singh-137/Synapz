import { Request, Response } from "express";
import { Content } from "../models/Schema";
import { extractTextFromUrl, chunkText } from "../utils/extractText";
import { getEmbeddings } from "../utils/embeddings";
import { uploadPdfToCloudinary } from "../utils/fileUpload";
import mongoose from "mongoose";

/**
 * POST /api/v1/content
 * Add new content (article, tweet, YouTube, PDF, or text)
 */
export const addContent = async (req: Request, res: Response) => {
  try {
    let { link, type, title, tags } = req.body;
    const userId = (req as any).userId;

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
      finalLink = await uploadPdfToCloudinary(req.file.path);
      console.log(`[CONTENT] PDF URL: ${finalLink}`);
    }

    // If type is PDF or link-based, must have link
    if (
      (type === "pdf" ||
        type === "article" ||
        type === "youtube" ||
        type === "tweet") &&
      !finalLink
    ) {
      return res.status(400).json({
        message: `${type} requires a link`,
      });
    }

    // Create content document
    const content = await Content.create({
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
    processContentInBackground(content._id.toString(), finalLink, type).catch(
      (error) => {
        console.error("[CONTENT] Background processing failed:", error);
      },
    );
  } catch (error: any) {
    console.error("[CONTENT] ❌ Error adding content:", error.message);
    res.status(500).json({
      message: "Failed to add content",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/content
 * Get all user's content
 */
export const getContent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const content = await Content.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Content retrieved successfully",
      total: content.length,
      content: content.map((c) => ({
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
        chunkCount: (c as any).chunks?.length || 0,
      })),
    });
  } catch (error: any) {
    console.error("[CONTENT] ❌ Error fetching content:", error.message);
    res.status(500).json({
      message: "Failed to fetch content",
    });
  }
};

/**
 * DELETE /api/v1/content
 * Delete content by ID
 */
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = (req as any).userId;

    if (!contentId) {
      return res.status(400).json({
        message: "contentId is required",
      });
    }

    const deletedContent = await Content.findOneAndDelete({
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
  } catch (error: any) {
    console.error("[CONTENT] ❌ Error deleting content:", error.message);
    res.status(500).json({
      message: "Failed to delete content",
    });
  }
};

/**
 * Background processing: Extract text and create embeddings
 */
async function processContentInBackground(
  contentId: string,
  link: string,
  type: string,
): Promise<void> {
  try {
    console.log(`[PROCESS] Starting for ${type}: ${contentId}`);

    let extractedText = "";

    // ============ EXTRACTION PHASE ============
    try {
      console.log(`[EXTRACT] Processing ${type}...`);

      // Handle text type (user provides text directly)
      if (type === "text") {
        // For text type, extractedText is already in the field
        const content = await Content.findById(contentId);
        extractedText = (content as any).extractedText || "";
      } else {
        // For all other types (articles, tweets, YouTube, PDFs), extract from URL
        extractedText = await extractTextFromUrl(link);
      }

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error("Extracted text too short");
      }

      await Content.findByIdAndUpdate(contentId, {
        extractedText,
        status: "extracted",
        extractedAt: new Date(),
      });

      console.log(`[EXTRACT] ✓ Got ${extractedText.length} characters`);
    } catch (extractError: any) {
      console.error("[EXTRACT] ❌ Failed:", extractError.message);
      await Content.findByIdAndUpdate(contentId, {
        status: "failed",
        extractionError: extractError.message,
      });
      return;
    }

    // ============ EMBEDDING PHASE ============
    try {
      console.log("[EMBED] Creating embeddings...");

      const textChunks = chunkText(extractedText, 500, 50);

      if (textChunks.length === 0) {
        throw new Error("Could not create chunks");
      }

      const embeddings = await getEmbeddings(textChunks);

      const chunksWithEmbeddings = textChunks.map((text, index) => ({
        _id: new mongoose.Types.ObjectId(),
        text: text,
        chunkIndex: index,
        embedding: embeddings[index],
      }));

      await Content.findByIdAndUpdate(contentId, {
        chunks: chunksWithEmbeddings,
        embeddingStatus: "embedded",
        embeddedAt: new Date(),
        embeddingError: null,
      });

      console.log(`[EMBED] ✓ Created ${chunksWithEmbeddings.length} chunks`);
    } catch (embeddingError: any) {
      console.error("[EMBED] ❌ Failed:", embeddingError.message);
      await Content.findByIdAndUpdate(contentId, {
        embeddingStatus: "failed",
        embeddingError: embeddingError.message,
      });
      return;
    }

    console.log(`[PROCESS] ✓✓ Fully processed ${contentId} successfully!`);
  } catch (error: any) {
    console.error("[PROCESS] ❌ Unexpected error:", error.message);
  }
}
