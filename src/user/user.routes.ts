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

const UserRouter = Router();

UserRouter.post("/signup", signupController);
UserRouter.post("/login", loginController);
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
UserRouter.post("/admin/edit-profile/", authMiddleware, updateUserByAdmin);
UserRouter.get("/token", authMiddleware, verifyToken);
UserRouter.get("/referrals", authMiddleware, getUserLevelLogs);
UserRouter.get("/get-list", getUserList);
UserRouter.post("/block-unblock", authMiddleware, blockUnblock);
UserRouter.post("/update", authMiddleware, updateUser);
UserRouter.get("/calculate-amount", authMiddleware, calculateUserWithdraws);

// UserRouter.post("/withdraw", authMiddleware, checkAdmin, withdrawAmount);
UserRouter.post("/withdraw", authMiddleware, withdrawAmountCostumer);
UserRouter.get("/transaction-history/:id", getUserTransactions);
UserRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World" });
});

export default UserRouter;
