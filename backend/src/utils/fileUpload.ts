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

/**
 * MULTER SETUP - For handling file uploads
 * Stores files temporarily before uploading to Cloudinary
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * Upload file to Cloudinary
 * Returns secure URL
 */
export const uploadFileToCloudinary = async (
  filePath: string,
  fileName: string,
): Promise<string> => {
  try {
    console.log("[UPLOAD] Uploading to Cloudinary:", fileName);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Auto-detect file type
      folder: "second-brain/pdfs",
      public_id: fileName.replace(".pdf", ""),
      overwrite: true,
    });

    console.log("[UPLOAD] ✓ Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error("[UPLOAD] ❌ Error:", error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
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
