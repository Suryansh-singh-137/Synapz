import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import path from "path";
import multer from "multer";
import { Request, Response } from "express";

/**
 * CLOUDINARY SETUP
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = path.join(process.cwd(), "uploads");

/**
 * Ensure the upload folder exists before multer writes files there.
 */
const ensureUploadDirectory = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

/**
 * MULTER SETUP - For handling file uploads
 * Stores files temporarily before uploading to Cloudinary
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirectory();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Only allow PDFs
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

const cleanUpTempFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error: any) {
    console.warn(
      "[UPLOAD] Warning: failed to remove temp file:",
      error.message,
    );
  }
};

/**
 * Upload a PDF file path to Cloudinary and return the secure URL.
 */
export const uploadPdfToCloudinary = async (
  filePath: string,
): Promise<string> => {
  const fileName = path.basename(filePath);

  try {
    console.log("[UPLOAD] Uploading to Cloudinary:", fileName);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "second-brain/pdfs",
      public_id: fileName.replace(/\.pdf$/i, ""),
      overwrite: true,
    });

    console.log("[UPLOAD] ✓ Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error("[UPLOAD] ❌ Error:", error?.message ?? error);
    throw new Error(`Failed to upload file: ${error?.message ?? error}`);
  } finally {
    cleanUpTempFile(filePath);
  }
};

/**
 * Express route handler for direct PDF uploads.
 */
export const uploadPdfFile = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  try {
    const url = await uploadPdfToCloudinary(req.file.path);
    return res.status(200).json({ url });
  } catch (error: any) {
    return res.status(500).json({ message: error?.message ?? "Upload failed" });
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFileFromCloudinary = async (
  publicId: string,
): Promise<void> => {
  try {
    console.log("[DELETE] Deleting from Cloudinary:", publicId);

    await cloudinary.uploader.destroy(`second-brain/pdfs/${publicId}`);

    console.log("[DELETE] ✓ Deletion successful");
  } catch (error: any) {
    console.error("[DELETE] ❌ Error:", error.message);
    throw error;
  }
};
