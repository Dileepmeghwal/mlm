import { Router } from "express";
import { WithdrawController } from "./withdraw.controller";
import { authMiddleware, checkAdmin } from "../middleware/jwt";

const Controller = new WithdrawController();
const WithdrawRouter = Router();
WithdrawRouter.get(
  "/pending",
  authMiddleware,
  checkAdmin,
  Controller.getPendingWithdraws
);
WithdrawRouter.get(
  "/complete",
  authMiddleware,
  checkAdmin,
  Controller.getCompleteWithdraws
);
WithdrawRouter.post(
  "/update",
  authMiddleware,
  checkAdmin,
  Controller.updateWithdrawStatus
);

export default WithdrawRouter;
