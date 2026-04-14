import { Request, Response } from "express";
import { Content } from "../models/Schema";
import { extractTextFromUrl, chunkText } from "../utils/extractText";
import { getEmbeddings } from "../utils/embeddings";
import mongoose from "mongoose";

/**
 * Updated: POST /api/v1/content
 *
 * Now automatically extracts and embeds in background!
 * User just adds link, everything else happens automatically
 */
const addContent = async (req: Request, res: Response) => {
  try {
    const { link, type, title, tags } = req.body;
    const userId = (req as any).userId;

    // Validate input
    if (!link || !type || !title) {
      return res.status(400).json({
        message: "link, type, and title are required",
      });
    }

    // Step 1: Create content document
    const content = await Content.create({
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
    // Convert ObjectId to string for the function parameter
    processContentInBackground(content._id.toString(), link).catch((error) => {
      console.error(`Background processing failed for ${content._id}:`, error);
    });
  } catch (e) {
    console.error("Error adding content:", e);
    res.status(500).json({
      message: "Failed to add content",
    });
  }
};

/**
 * Background processing: Extract + Embed
 * Runs AFTER user gets response
 * Doesn't block the request
 */
async function processContentInBackground(
  contentId: string,
  link: string,
): Promise<void> {
  try {
    console.log(`Starting background processing for ${contentId}...`);

    // ============= EXTRACTION PHASE =============
    try {
      console.log(`Extracting text from: ${link}`);
      const extractedText = await extractTextFromUrl(link);

      await Content.findByIdAndUpdate(contentId, {
        extractedText: extractedText,
        status: "extracted",
        extractedAt: new Date(),
      });

      console.log(`✓ Extraction complete for ${contentId}`);
    } catch (extractError) {
      console.error(`✗ Extraction failed for ${contentId}:`, extractError);
      await Content.findByIdAndUpdate(contentId, {
        status: "failed",
        extractionError:
          extractError instanceof Error
            ? extractError.message
            : "Unknown error",
      });
      return; // Stop here if extraction fails
    }

    // ============= EMBEDDING PHASE =============
    try {
      // Get the updated content with extracted text
      const content = await Content.findById(contentId);

      if (!content || !content.extractedText) {
        throw new Error("No extracted text found");
      }

      console.log(`Creating embeddings for ${contentId}...`);

      // Split into chunks
      const textChunks = chunkText(content.extractedText, 500, 50);

      if (textChunks.length === 0) {
        throw new Error("Could not create chunks from text");
      }

      // Get embeddings from OpenAI
      const embeddings = await getEmbeddings(textChunks);

      // Create chunk objects with embeddings
      const chunksWithEmbeddings = textChunks.map((text, index) => ({
        _id: new mongoose.Types.ObjectId(),
        text: text,
        chunkIndex: index,
        embedding: embeddings[index],
      }));

      // Store embeddings
      await Content.findByIdAndUpdate(contentId, {
        chunks: chunksWithEmbeddings,
        embeddingStatus: "embedded",
        embeddedAt: new Date(),
        embeddingError: null,
      });

      console.log(
        `✓ Embedding complete for ${contentId} (${chunksWithEmbeddings.length} chunks)`,
      );
    } catch (embeddingError) {
      console.error(`✗ Embedding failed for ${contentId}:`, embeddingError);
      await Content.findByIdAndUpdate(contentId, {
        embeddingStatus: "failed",
        embeddingError:
          embeddingError instanceof Error
            ? embeddingError.message
            : "Unknown error",
      });
      return;
    }

    console.log(`✓✓ Fully processed ${contentId} successfully!`);
  } catch (error) {
    console.error(`Unexpected error in background processing:`, error);
  }
}

export { addContent };
