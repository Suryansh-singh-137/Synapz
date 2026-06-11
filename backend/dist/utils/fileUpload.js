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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromCloudinary = exports.uploadPdfFile = exports.uploadPdfToCloudinary = exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
/**
 * CLOUDINARY SETUP
 */
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadDir = path_1.default.join(process.cwd(), "uploads");
/**
 * Ensure the upload folder exists before multer writes files there.
 */
const ensureUploadDirectory = () => {
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
};
/**
 * MULTER SETUP - For handling file uploads
 * Stores files temporarily before uploading to Cloudinary
 */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadDirectory();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    // Only allow PDFs
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});
const cleanUpTempFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.warn("[UPLOAD] Warning: failed to remove temp file:", error.message);
    }
};
/**
 * Upload a PDF file path to Cloudinary and return the public download URL.
 * Since access_mode is "public", we can use the secure_url directly.
 */
const uploadPdfToCloudinary = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const fileName = path_1.default.basename(filePath);
    try {
        console.log("[UPLOAD] Uploading to Cloudinary:", fileName);
        const result = yield cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: "raw", // ← PDFs must be "raw"
            access_mode: "public", // ← explicitly allow public/unauthenticated access
            folder: "second-brain/pdfs",
            public_id: fileName.replace(/\.pdf$/i, ""),
            overwrite: true,
            format: "pdf", // ← preserve the .pdf extension in the URL
            quality: "auto", // Optimize the PDF
        });
        const publicId = result.public_id;
        // Use the secure_url directly - it's already publicly accessible
        const downloadUrl = result.secure_url;
        console.log("[UPLOAD] ✓ Upload successful:", result.secure_url);
        console.log("[UPLOAD] ✓ Public download URL:", downloadUrl);
        return {
            secureUrl: result.secure_url,
            downloadUrl,
            publicId,
        };
    }
    catch (error) {
        console.error("[UPLOAD] ❌ Error:", (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error);
        throw new Error(`Failed to upload file: ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error}`);
    }
    finally {
        cleanUpTempFile(filePath);
    }
});
exports.uploadPdfToCloudinary = uploadPdfToCloudinary;
/**
 * Express route handler for direct PDF uploads.
 */
const uploadPdfFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
    }
    try {
        const url = yield (0, exports.uploadPdfToCloudinary)(req.file.path);
        return res.status(200).json({ url });
    }
    catch (error) {
        return res.status(500).json({ message: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Upload failed" });
    }
});
exports.uploadPdfFile = uploadPdfFile;
/**
 * Delete file from Cloudinary
 */
const deleteFileFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("[DELETE] Deleting from Cloudinary:", publicId);
        yield cloudinary_1.v2.uploader.destroy(`second-brain/pdfs/${publicId}`);
        console.log("[DELETE] ✓ Deletion successful");
    }
    catch (error) {
        console.error("[DELETE] ❌ Error:", error.message);
        throw error;
    }
});
exports.deleteFileFromCloudinary = deleteFileFromCloudinary;
