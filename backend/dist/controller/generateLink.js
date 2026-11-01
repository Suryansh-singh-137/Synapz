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
exports.getSharedBrain = exports.deleteLink = exports.genrateLink = void 0;
const Schema_1 = require("../models/Schema");
const hashGenrator_1 = require("../utils/hashGenrator");
/**
 * POST /api/v1/brain/share
 *
 * Generates a shareable link for the user's brain.
 * - If a link already exists for this user → return the existing hash
 * - If no link exists → create one and return the new hash
 */
const genrateLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: no user found" });
        }
        // Check if this user already has a share link
        const existingLink = yield Schema_1.Link.findOne({ userId });
        if (existingLink) {
            return res.status(200).json({ hash: existingLink.hash });
        }
        // No existing link — create a new one
        const hash = (0, hashGenrator_1.random)(10);
        yield Schema_1.Link.create({ userId, hash });
        return res.status(200).json({ hash });
    }
    catch (err) {
        console.error("[SHARE] ❌ Error generating share link:", err.message);
        return res.status(500).json({
            message: "Server error while generating share link",
            error: err.message,
        });
    }
});
exports.genrateLink = genrateLink;
/**
 * DELETE /api/v1/brain/share
 *
 * Deactivates (deletes) the user's share link.
 */
const deleteLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        yield Schema_1.Link.deleteOne({ userId });
        return res.status(200).json({ message: "Share link removed successfully" });
    }
    catch (err) {
        console.error("[SHARE] ❌ Error deleting share link:", err.message);
        return res
            .status(500)
            .json({ message: "Server error while removing link" });
    }
});
exports.deleteLink = deleteLink;
/**
 * GET /api/v1/brain/:shareLink
 *
 * Fetches publicly shared brain content by share hash.
 * Strips raw vector embeddings to avoid payload bloat and data leaks.
 */
const getSharedBrain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield Schema_1.Link.findOne({ hash });
        if (!link) {
            return res.status(404).json({ message: "Link not found" });
        }
        const user = yield Schema_1.User.findById(link.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const content = yield Schema_1.Content.find({ userId: link.userId }).sort({
            createdAt: -1,
        });
        return res.status(200).json({
            username: user.username,
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
                    createdAt: c.createdAt,
                    chunkCount: ((_a = c.chunks) === null || _a === void 0 ? void 0 : _a.length) || 0,
                });
            }),
        });
    }
    catch (err) {
        console.error("[SHARE] ❌ Error fetching shared brain:", err.message);
        return res.status(500).json({
            message: "Server error while retrieving brain",
            error: err.message,
        });
    }
});
exports.getSharedBrain = getSharedBrain;
