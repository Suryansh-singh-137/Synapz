import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (decoded) {
      // @ts-ignore
      req.userId = (decoded as any).userId;

      next();
    } else {
      return res.status(403).send({ error: "Access denied. Invalid token." });
    }
  } catch (e) {
    console.error("JWT error:", e);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export { userMiddleware };
