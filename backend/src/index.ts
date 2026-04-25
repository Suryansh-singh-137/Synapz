import express from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
import { signin, signup } from "./controller/autht";
import { addContent, deleteContent, getContent } from "./controller/content";
import { userMiddleware } from "./middleware/authmid";
import { genrateLink } from "./controller/generateLink";
import {
  extractContent,
  extractAllContent,
} from "./controller/extractController";
import { Content, Link, User } from "./models/Schema";

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
console.log("Registering /api/v1/test route");
app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Hello World" });
});
app.post("/api/v1/signin", signin);
app.post("/api/v1/signup", signup);

app.post("/api/v1/content", userMiddleware, addContent);
app.get("/api/v1/content", userMiddleware, getContent);
app.delete("/api/v1/content", userMiddleware, deleteContent);

// Extract text from a single piece of content
app.post("/api/v1/brain/extract", userMiddleware, extractContent);

// Extract text from ALL user's pending content
app.post("/api/v1/brain/extract-all", userMiddleware, extractAllContent);

app.post("/api/v1/brain/share", userMiddleware, genrateLink);

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
