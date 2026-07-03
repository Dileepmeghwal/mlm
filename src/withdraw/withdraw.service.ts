import mongoose from "mongoose";
import { CreateWithDrawDTO } from "./withdraw.dto";
import Withdraw from "./withdraw.model";

export class WithdrawService {
  constructor() {}

  static async createWithdraw(withdrawData: CreateWithDrawDTO) {
    try {
      const withdraw = await Withdraw.create(withdrawData);
      return withdraw;
    } catch (error: any) {
      throw new Error("Error creating withdraw: " + error.message);
    }
  }

  static async getWithdrawById(id: string) {
    try {
      const withdraw = await Withdraw.findById(id).populate("user");
      if (!withdraw) {
        throw new Error("Withdraw not found");
      }
      return withdraw;
    } catch (error: any) {
      throw new Error("Error fetching withdraw: " + error.message);
    }
  }
  static async getUserWithdraws(userId: string | mongoose.Types.ObjectId) {
    return Withdraw.find({ user: userId });
  }

  static async getAllWithdraws() {
    try {
      const withdraws = await Withdraw.find().populate("user");
      return withdraws;
    } catch (error: any) {
      throw new Error("Error fetching withdraws: " + error.message);
    }
  }

  static async getWithdrawsByStatus(status: string) {
    try {
      const withdraws = await Withdraw.find({ status })
        .populate("user", "-password")
        .sort({ createdAt: -1 });
      return withdraws;
    } catch (error: any) {
      throw new Error("Error fetching withdraws: " + error.message);
    }
  }
  static async getCompleteWithdrawals() {
    try {
      const withdraws = await Withdraw.find({
        status: "COMPLETED",
        createdAt: { $gt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
      })
        .populate("user", "-password")
        .sort({ createdAt: -1 });
      return withdraws;
    } catch (error: any) {
      throw new Error("Error fetching withdraws: " + error.message);
    }
  }
  static async getById(id: string | mongoose.Types.ObjectId) {
    try {
      const withdraw = await Withdraw.findById(id).populate(
        "user",
        "-password"
      );
      if (!withdraw) {
        throw new Error("Withdraw not found");
      }
      return withdraw;
    } catch (error: any) {
      throw new Error("Error fetching withdraw: " + error.message);
    }
  }
  static async updateWithdrawStatus(
    id: string | mongoose.Types.ObjectId,
    status: string
  ) {
    try {
      const withdraw = await Withdraw.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!withdraw) {
        throw new Error("Withdraw not found");
      }
      return withdraw;
    } catch (error: any) {
      throw new Error("Error updating withdraw status: " + error.message);
    }
  }

  static async calculateWithDraws(
    userId: string | mongoose.Types.ObjectId,
    amountString: string
  ) {
    const amount = parseInt(amountString);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }
    if (amount < 1000) {
      const withdraws = await this.getUserWithdraws(userId);
      if (!withdraws.length) {
        return {
          firstDeduction: true,
          total: amount,
          percentage: "10",
          deduction: 0,
          withdrawAmount: amount,
        };
      }
    }

    const taxPercentage = 10;
    const taxDeduction = parseFloat(
      (amount * (taxPercentage / 100)).toFixed(2)
    );
    const withdrawAmount = parseFloat((amount - taxDeduction).toFixed(2));

    return {
      firstDeduction: false,
      total: amount,
      percentage: `${taxPercentage}`,
      deduction: taxDeduction,
      withdrawAmount,
    };
  }
}
