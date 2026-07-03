import { Router } from "express";
import {
  blockUnblock,
  calculateUserWithdraws,
  getById,
  getProfile,
  getUserById,
  getUserLevelLogs,
  getUserList,
  getUserTransactions,
  loginController,
  signupController,
  updateFinantialDetails,
  updateUser,
  updateUserByAdmin,
  updateUserProfile,
  VerifyPin,
  verifyToken,
  withdrawAmount,
  withdrawAmountCostumer,
} from "./user.controller";
import { Request, Response } from "express";
import { authMiddleware, checkAdmin } from "../middleware/jwt";
import { rateLimitMiddleware } from "../middleware/rateLimiter";

const UserRouter = Router();

// Throttle auth endpoints to slow down brute-force / credential-stuffing.
// Configurable via env (local dev bumps this so tests aren't throttled).
const LOGIN_MAX = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10;
const SIGNUP_MAX = Number(process.env.SIGNUP_RATE_LIMIT_MAX) || 10;

UserRouter.post("/signup", rateLimitMiddleware("signup", SIGNUP_MAX, 15 * 60), signupController);
UserRouter.post("/login", rateLimitMiddleware("login", LOGIN_MAX, 15 * 60), loginController);
UserRouter.post("/verify", authMiddleware, VerifyPin);
UserRouter.get("/profile", authMiddleware, getProfile);
UserRouter.post("/edit-profile/general", authMiddleware, updateUserProfile);
UserRouter.post(
  "/edit-profile/financial",
  authMiddleware,
  updateFinantialDetails
);
UserRouter.get("/get-user/:id", authMiddleware, getUserById);
UserRouter.get("/get-by-id/:id", authMiddleware, getById);
UserRouter.post("/admin/edit-profile/", authMiddleware, checkAdmin, updateUserByAdmin);
UserRouter.get("/token", authMiddleware, verifyToken);
UserRouter.get("/referrals", authMiddleware, getUserLevelLogs);
UserRouter.get("/get-list", authMiddleware, checkAdmin, getUserList);
UserRouter.post("/block-unblock", authMiddleware, checkAdmin, blockUnblock);
UserRouter.post("/update", authMiddleware, updateUser);
UserRouter.get("/calculate-amount", authMiddleware, calculateUserWithdraws);

// UserRouter.post("/withdraw", authMiddleware, checkAdmin, withdrawAmount);
UserRouter.post("/withdraw", authMiddleware, withdrawAmountCostumer);
UserRouter.get("/transaction-history/:id", authMiddleware, getUserTransactions);
UserRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

export default UserRouter;
