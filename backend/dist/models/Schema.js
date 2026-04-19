"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = exports.Tag = exports.Content = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
});
const tagSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        unique: true,
    },
});
const ContentSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["twitter", "youtube", "article", "pdf", "text"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    // NEW FIELDS FOR CHAT FEATURE
    extractedText: {
        type: String,
        default: null,
        // This will store the full text extracted from the URL
    },
    status: {
        type: String,
        enum: ["pending", "extracted", "failed"],
        default: "pending",
        // pending = just added, waiting to extract
        // extracted = text extracted successfully
        // failed = extraction failed (URL dead, etc)
    },
    extractedAt: {
        type: Date,
        default: null,
    },
    extractionError: {
        type: String,
        default: null,
        // Stores error message if extraction failed
    },
    chunks: [
        {
            _id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                default: new mongoose_1.default.Types.ObjectId(),
            },
            text: {
                type: String,
                required: true,
            },
            chunkIndex: {
                type: Number,
                required: true,
            },
            embedding: {
                type: [Number],
                required: true,
            },
        },
    ],
    embeddingStatus: {
        type: String,
        enum: ["pending", "embedded", "failed"],
        default: "pending",
    },
    embeddedAt: {
        type: Date,
        default: null,
    },
    embeddingError: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const linkSchema = new mongoose_1.Schema({
    hash: { type: String, required: true },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
});
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
const Content = mongoose_1.default.model("Content", ContentSchema);
exports.Content = Content;
const Tag = mongoose_1.default.model("Tag", tagSchema);
exports.Tag = Tag;
const Link = mongoose_1.default.model("Link", linkSchema);
exports.Link = Link;
