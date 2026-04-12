import { Request, Response } from "express";
import { Link } from "../models/Schema";
import { random } from "../utils/hashGenrator";

const genrateLink = async (req: Request, res: Response) => {
  try {
    const existingLink = await Link.findOne({
      //@ts-ignore
      userId: req.userId,
    });
    if (existingLink) {
      res.json({
        hash: existingLink.hash,
      });
      return;
    }
    const share = req.body.share;
    const hash = random(10);
    if (share) {
      await Link.create({
        //@ts-ignore
        userId: req.userId,
        hash: hash,
      });
      return res.json({
        message: "/share/" + hash,
      });
    } else {
      await Link.deleteOne({
        // @ts-ignore
        userId: req.userId,
      });
      return res.json({
        message: "Link deleted successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error while generating link",
    });
  }
};

export { genrateLink };
