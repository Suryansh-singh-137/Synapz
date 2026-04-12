import { Request, Response } from "express";
import { Content } from "../models/Schema";
const addContent = async (req: Request, res: Response) => {
  try {
    const { link, type, title, tags } = req.body;
    // @ts-ignore
    const userId = req.userId;
    const content = await Content.create({
      link,
      type,
      title,
      tags,
      userId,
    });
    res.status(200).json({
      message: "Content added successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Failed to add content",
    });
  }
};
export { addContent };
const getContent = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const content = await Content.find({
      userId: userId,
    });
    res.status(200).json({
      content,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      msg: "server error",
    });
  }
};
const deleteContent = async (req: Request, res: Response) => {
  const contentId = req.body.contentId;
  // @ts-ignore
  const userId = req.userId;
  try {
    await Content.deleteMany({
      _id: contentId,
      userId: userId,
    });
    res.status(201).json({
      msg: "content deleted",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      msg: "server error",
    });
  }
};
export { getContent };
export { deleteContent };
