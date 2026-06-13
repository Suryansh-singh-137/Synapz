import express from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import { signin, signup } from "./controller/autht";
import { addContent, deleteContent, getContent } from "./controller/content";
import { userMiddleware } from "./middleware/authmid";
import { genrateLink, deleteLink } from "./controller/generateLink";
import {
  chatWithBrain,
  chatWithSharedBrain,
} from "./controller/chatController";

import {
  extractContent,
  extractAllContent,
} from "./controller/extractController";
import { Content, Link, User } from "./models/Schema";

import {
  SignupSchema,
  SigninSchema,
  AddContentSchema,
  ChatSchema,
  DeleteContentSchema,
  validateRequest,
} from "./utils/validation";
import { upload, uploadPdfFile } from "./utils/fileUpload";

const MONGO_URL = process.env.MONGO_URL!;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error("Error connecting to MongoDB:", e);
  }
};

connectToDatabase();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

console.log("Registering /api/v1/test route");
app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Hello World" });
});

// ============ AUTHENTICATION ROUTES ============
app.post("/api/v1/signin", validateRequest(SigninSchema), signin);
app.post("/api/v1/signup", validateRequest(SignupSchema), signup);

// ============ CONTENT ROUTES ============

app.post(
  "/api/v1/content",
  userMiddleware,
  upload.single("file"), // Handle single file upload
  validateRequest(AddContentSchema),
  addContent,
);

app.get("/api/v1/content", userMiddleware, getContent);

app.delete(
  "/api/v1/content",
  userMiddleware,
  validateRequest(DeleteContentSchema),
  deleteContent,
);

// ✅ FILE UPLOAD ENDPOINT (optional alternative)
app.post(
  "/api/v1/upload-pdf",
  userMiddleware,
  upload.single("file"),
  uploadPdfFile,
);

// ============ BRAIN ROUTES ============
app.post("/api/v1/brain/extract", userMiddleware, extractContent);
app.post("/api/v1/brain/extract-all", userMiddleware, extractAllContent);

app.post(
  "/api/v1/brain/chat",
  userMiddleware,
  validateRequest(ChatSchema),
  chatWithBrain,
);

app.post("/api/v1/brain/share", userMiddleware, genrateLink);
app.delete("/api/v1/brain/share", userMiddleware, deleteLink);
// ============ PUBLIC ROUTES ============
app.post("/api/v1/brain/:hash/chat", chatWithSharedBrain);

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await Link.findOne({ hash: hash });

  if (!link) {
    return res.status(404).json({ message: "Link not found" });
  }

  const content = await Content.find({ userId: link.userId });
  const user = await User.findOne({ _id: link.userId });

  if (!user) {
    return res.status(411).json({ message: "User not found" });
  }

  res.json({
    username: user.username,
    content: content,
  });
});

// ============ ERROR HANDLING ============
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});

// ============ SERVER ============

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
