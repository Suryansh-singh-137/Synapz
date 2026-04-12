import { Request, Response } from "express";
import { User } from "../models/Schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const signup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(403).json({
        message: "Username already exists",
      });
    }
    const user = await User.create({
      username: username,
      password: hashed,
    });
    res.status(200).json({
      message: "User created successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "server error",
    });
  }
};
const signin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(403).json({ message: "Invalid username" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(403).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string
    );
    res.status(200).json({
      message: "User logged in successfully",
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "server error",
    });
  }
};
export { signup, signin };
