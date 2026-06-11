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
exports.deleteLink = exports.genrateLink = void 0;
const Schema_1 = require("../models/Schema");
const hashGenrator_1 = require("../utils/hashGenrator");
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
const genrateLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: no user found" });
        }
        // Check if this user already has a share link
        const existingLink = yield Schema_1.Link.findOne({ userId });
        if (existingLink) {
            // Already has one — just return it
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
