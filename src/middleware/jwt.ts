import Express from "express";
import jwt, { SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too weak (min 32 chars). Set a strong value in your .env file."
    );
  }
  return secret;
}

export function generateToken(payload: any) {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: (process.env.JWT_EXPIRY || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getJwtSecret(), options);
}
function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
}

export function authMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): any {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const payload: any = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    } else req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}


export function checkAdmin(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): any {
  if (req.user.type !== "ADMIN") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}