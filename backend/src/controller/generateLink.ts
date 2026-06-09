import { Request, Response } from "express";
import { Link } from "../models/Schema";
import { random } from "../utils/hashGenrator";

/**
 * POST /api/v1/brain/share
 *
 * Generates a shareable link for the user's brain.
 * - If a link already exists for this user → return the existing hash
 * - If no link exists → create one and return the new hash
 *
 * The frontend only needs to call this once to get/create a link.
 * No request body is needed.
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
      // Already has one — just return it
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
