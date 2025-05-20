import { Request, Response } from "express";
import { WithdrawService } from "./withdraw.service";
import { validateId } from "../config/validation";
import { NotificationService } from "../notification/notification.service";

export class WithdrawController {
  async getPendingWithdraws(req: Request, res: Response): Promise<any> {
    try {
      const withdraws = await WithdrawService.getWithdrawsByStatus("PENDING");
      return res.status(200).json(withdraws);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getCompleteWithdraws(req: Request, res: Response): Promise<any> {
    try {
      const withdraws = await WithdrawService.getCompleteWithdrawals();
      return res.status(200).json(withdraws);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateWithdrawStatus(req: Request, res: Response): Promise<any> {
    const { id } = req.body;
    try {
      const check = await WithdrawService.getById(id);
      if (!check) {
        return res.status(404).json({ message: "Withdraw not found" });
      }
      const withdraw = await WithdrawService.updateWithdrawStatus(
        id,
        "COMPLETED"
      );
      NotificationService.create({
        user: withdraw.user?._id,
        message: `Your withdraw request has been completed,for the amount of ₹${withdraw.totalAmount}`,
        type: "DEBIT",
      });
      return res.status(200).json(withdraw);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
