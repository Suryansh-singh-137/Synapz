import { Request, Response } from "express";
import { Content } from "../models/Schema";
import { extractTextFromUrl, chunkText } from "../utils/extractText";
import { extractTextFromLocalPdf } from "../utils/extractPdf";
import { getEmbeddings } from "../utils/embeddings";
import { uploadPdfToCloudinary } from "../utils/fileUpload";
import mongoose from "mongoose";

export const addContent = async (req: Request, res: Response) => {
  try {
    let { link, type, title, tags } = req.body;
    const userId = (req as any).userId;

    console.log(`[CONTENT] Adding ${type}: ${title}`);

    if (!type || !title) {
      return res.status(400).json({ message: "type and title are required" });
    }

    let finalLink = link;
    let preExtractedText: string | null = null;

    if (type === "pdf" && req.file) {
      const localPath = req.file.path;

      // ── STEP 1: Extract text from local disk FIRST ──────────────────────
      // The file is sitting on disk right now at localPath.
      // We read it here before uploadPdfToCloudinary() deletes it.
      console.log(`[CONTENT] Extracting text from local file: ${localPath}`);
      try {
        preExtractedText = await extractTextFromLocalPdf(localPath);
        console.log(
          `[CONTENT] ✓ Extracted ${preExtractedText.length} chars from local PDF`,
        );
      } catch (err: any) {
        console.warn(`[CONTENT] ⚠ Local extraction failed: ${err.message}`);
        // Continue anyway — we'll store status "failed" for this content
      }

      // ── STEP 2: Upload to Cloudinary (this deletes the local file) ───────
      console.log("[CONTENT] Uploading PDF to Cloudinary...");
      finalLink = await uploadPdfToCloudinary(localPath);
      console.log(`[CONTENT] PDF stored at: ${finalLink}`);
    }

    if (
      (type === "pdf" ||
        type === "article" ||
        type === "youtube" ||
        type === "tweet") &&
      !finalLink
    ) {
      return res
        .status(400)
        .json({ message: `${type} requires a link or uploaded file` });
    }

    // ── STEP 3: Save to MongoDB ───────────────────────────────────────────
    // For PDFs: save extracted text immediately, mark "extracted"
    // For others: save with status "pending", background job handles it
    const content = await Content.create({
      link: finalLink,
      type,
      title,
      tags: tags || [],
      userId,
      extractedText: preExtractedText ?? null,
      status: preExtractedText ? "extracted" : "pending",
      extractedAt: preExtractedText ? new Date() : null,
      extractionError:
        !preExtractedText && type === "pdf"
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
    processContentInBackground(
      content._id.toString(),
      finalLink,
      type,
      preExtractedText,
    ).catch((err) => console.error("[CONTENT] Background error:", err));
  } catch (error: any) {
    console.error("[CONTENT] ❌", error.message);
    res
      .status(500)
      .json({ message: "Failed to add content", error: error.message });
  }
};

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
    res.status(500).json({ message: "Failed to fetch content" });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = (req as any).userId;

    if (!contentId) {
      return res.status(400).json({ message: "contentId is required" });
    }

    const deleted = await Content.findOneAndDelete({ _id: contentId, userId });

    if (!deleted) {
      return res.status(404).json({ message: "Content not found" });
    }

    res
      .status(200)
      .json({ message: "Deleted successfully", deletedId: contentId });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete content" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

async function processContentInBackground(
  contentId: string,
  link: string,
  type: string,
  preExtractedText: string | null = null,
): Promise<void> {
  try {
    console.log(`[PROCESS] Starting for ${type}: ${contentId}`);

    let extractedText = preExtractedText ?? "";

    // ── EXTRACTION ────────────────────────────────────────────────────────
    if (preExtractedText) {
      // PDF already extracted before upload — skip this phase entirely
      console.log(
        `[PROCESS] Skipping extraction — already have ${preExtractedText.length} chars`,
      );
    } else {
      try {
        if (type === "text") {
          const doc = await Content.findById(contentId);
          extractedText = (doc as any).extractedText || "";
        } else {
          // articles, tweets, youtube → Jina AI
          extractedText = await extractTextFromUrl(link);
        }

        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error(`Text too short: ${extractedText.length} chars`);
        }

        await Content.findByIdAndUpdate(contentId, {
          extractedText,
          status: "extracted",
          extractedAt: new Date(),
          extractionError: null,
        });

        console.log(`[EXTRACT] ✓ ${extractedText.length} chars`);
      } catch (err: any) {
        console.error("[EXTRACT] ❌", err.message);
        await Content.findByIdAndUpdate(contentId, {
          status: "failed",
          extractionError: err.message,
        });
        return;
      }
    }

    if (!extractedText || extractedText.trim().length < 50) {
      await Content.findByIdAndUpdate(contentId, {
        status: "failed",
        extractionError: "No text to embed",
      });
      return;
    }

    // ── EMBEDDING ─────────────────────────────────────────────────────────
    try {
      const chunks = chunkText(extractedText, 500, 50);
      const embeddings = await getEmbeddings(chunks);

      const chunksWithEmbeddings = chunks.map((text, i) => ({
        _id: new mongoose.Types.ObjectId(),
        text,
        chunkIndex: i,
        embedding: embeddings[i],
      }));

      await Content.findByIdAndUpdate(contentId, {
        chunks: chunksWithEmbeddings,
        embeddingStatus: "embedded",
        embeddedAt: new Date(),
        embeddingError: null,
      });

      console.log(`[EMBED] ✓ ${chunksWithEmbeddings.length} chunks embedded`);
      console.log(`[PROCESS] ✓✓ Done: ${contentId}`);
    } catch (err: any) {
      console.error("[EMBED] ❌", err.message);
      await Content.findByIdAndUpdate(contentId, {
        embeddingStatus: "failed",
        embeddingError: err.message,
      });
    }
  } catch (error: any) {
    console.error("[PROCESS] ❌ Unexpected:", error.message);
  }
}
