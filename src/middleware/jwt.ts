import Express from "express";
import jwt from "jsonwebtoken";

export function generateToken(payload: any) {
  return jwt.sign(payload, "test@123");
}
function verifyToken(token: string) {
  return jwt.verify(token, "test@123");
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