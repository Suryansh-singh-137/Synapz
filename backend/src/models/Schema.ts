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

const contentTypes = ["image", "video", "article", "audio"];
const contentSchema = new Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: "Tag" }],
  userId: { type: Types.ObjectId, ref: "User", required: true },
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
const Content = mongoose.model("Content", contentSchema);
const Tag = mongoose.model("Tag", tagSchema);
const Link = mongoose.model("Link", linkSchema);
export { User, Content, Tag, Link };
