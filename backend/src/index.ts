import express from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ============ IMPORTS ============
import { signin, signup } from "./controller/autht";
import { addContent, deleteContent, getContent } from "./controller/content";
import { userMiddleware } from "./middleware/authmid";
import { genrateLink } from "./controller/generateLink";
import { chatWithBrain } from "./controller/chatController"; // ✅ ADD THIS
import {
  extractContent,
  extractAllContent,
} from "./controller/extractController";
import { Content, Link, User } from "./models/Schema";

// ✅ IMPORT VALIDATION SCHEMAS AND MIDDLEWARE
import {
  SignupSchema,
  SigninSchema,
  AddContentSchema,
  ChatSchema,
  DeleteContentSchema,
  validateRequest,
} from "./utils/validation";

// ============ DATABASE ============
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

// ============ MIDDLEWARE ============
app.use(express.json());

// ============ HEALTH CHECK ============
console.log("Registering /api/v1/test route");
app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Hello World" });
});

// ============ AUTHENTICATION ROUTES ============
// ✅ WITH VALIDATION
app.post("/api/v1/signin", validateRequest(SigninSchema), signin);

app.post("/api/v1/signup", validateRequest(SignupSchema), signup);

// ============ CONTENT ROUTES ============
// ✅ WITH VALIDATION
app.post(
  "/api/v1/content",
  userMiddleware,
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

// ============ BRAIN ROUTES ============
// Extract text from a single piece of content
app.post("/api/v1/brain/extract", userMiddleware, extractContent);

// Extract text from ALL user's pending content
app.post("/api/v1/brain/extract-all", userMiddleware, extractAllContent);

// ✅ CHAT ENDPOINT WITH VALIDATION
app.post(
  "/api/v1/brain/chat",
  userMiddleware,
  validateRequest(ChatSchema),
  chatWithBrain,
);

// Share brain
app.post("/api/v1/brain/share", userMiddleware, genrateLink);

// ============ PUBLIC ROUTES ============
// View shared brain (no auth needed)
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await Link.findOne({
    hash: hash,
  });

  if (!link) {
    return res.status(404).json({ message: "Link not found" });
  }

  const content = await Content.find({
    userId: link.userId,
  });

  const user = await User.findOne({
    _id: link.userId,
  });

  if (!user) {
    return res.status(411).json({ message: "User not found" });
  }

  res.json({
    username: user.username,
    content: content,
  });
});

// ============ SERVER ============
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export default app;
