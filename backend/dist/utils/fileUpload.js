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
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadDir = path_1.default.join(process.cwd(), "uploads");
const ensureUploadDirectory = () => {
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
};
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
    limits: { fileSize: 50 * 1024 * 1024 },
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
 * Upload a PDF to Cloudinary.
 * Returns a plain string URL — this is what content.ts stores as `link`.
 */
const uploadPdfToCloudinary = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // ← string, not an object
    const fileName = path_1.default.basename(filePath);
    try {
        console.log("[UPLOAD] Uploading to Cloudinary:", fileName);
        const result = yield cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: "raw",
            access_mode: "public",
            folder: "second-brain/pdfs",
            public_id: fileName.replace(/\.pdf$/i, ""),
            overwrite: true,
        });
        console.log("[UPLOAD] ✓ Upload successful:", result.secure_url);
        return result.secure_url; // ← just the string
    }
    catch (error) {
        console.error("[UPLOAD] ❌ Error:", (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error);
        throw new Error(`Failed to upload file: ${(_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error}`);
    }
    finally {
        cleanUpTempFile(filePath); // always clean up temp file
    }
});
exports.uploadPdfToCloudinary = uploadPdfToCloudinary;
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
