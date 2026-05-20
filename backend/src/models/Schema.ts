import mongoose, { Schema, Model, Types } from "mongoose";
const userSchema = new Schema({
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

const tagSchema = new Schema({
  title: {
    type: String,
    required: [true, "title is required"],
    unique: true,
  },
});

const ContentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["tweet", "youtube", "article", "pdf", "text"],
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
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId(),
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
const linkSchema = new Schema({
  hash: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});
const User = mongoose.model("User", userSchema);
const Content = mongoose.model("Content", ContentSchema);
const Tag = mongoose.model("Tag", tagSchema);
const Link = mongoose.model("Link", linkSchema);
export { User, Content, Tag, Link };
