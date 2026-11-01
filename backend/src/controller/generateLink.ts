import { Request, Response } from "express";
import { Content, Link, User } from "../models/Schema";
import { random } from "../utils/hashGenrator";

/**
 * POST /api/v1/brain/share
 *
 * Generates a shareable link for the user's brain.
 * - If a link already exists for this user → return the existing hash
 * - If no link exists → create one and return the new hash
 */
export const genrateLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user found" });
    }

    // Check if this user already has a share link
    const existingLink = await Link.findOne({ userId });

    if (existingLink) {
      return res.status(200).json({ hash: existingLink.hash });
    }

    // No existing link — create a new one
    const hash = random(10);
    await Link.create({ userId, hash });

    return res.status(200).json({ hash });
  } catch (err: any) {
    console.error("[SHARE] ❌ Error generating share link:", err.message);
    return res.status(500).json({
      message: "Server error while generating share link",
      error: err.message,
    });
  }
};

/**
 * DELETE /api/v1/brain/share
 *
 * Deactivates (deletes) the user's share link.
 */
export const deleteLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await Link.deleteOne({ userId });

    return res.status(200).json({ message: "Share link removed successfully" });
  } catch (err: any) {
    console.error("[SHARE] ❌ Error deleting share link:", err.message);
    return res
      .status(500)
      .json({ message: "Server error while removing link" });
  }
};

/**
 * GET /api/v1/brain/:shareLink
 *
 * Fetches publicly shared brain content by share hash.
 * Strips raw vector embeddings to avoid payload bloat and data leaks.
 */
export const getSharedBrain = async (req: Request, res: Response) => {
  try {
    const hash = req.params.shareLink;

    const link = await Link.findOne({ hash });
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    const user = await User.findById(link.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const content = await Content.find({ userId: link.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      username: user.username,
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
        createdAt: (c as any).createdAt,
        chunkCount: (c as any).chunks?.length || 0,
      })),
    });
  } catch (err: any) {
    console.error("[SHARE] ❌ Error fetching shared brain:", err.message);
    return res.status(500).json({
      message: "Server error while retrieving brain",
      error: err.message,
    });
  }
};
