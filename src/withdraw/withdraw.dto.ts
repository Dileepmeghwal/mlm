import mongoose from "mongoose";

export interface CreateWithDrawDTO {
  user: string | mongoose.Types.ObjectId;
  totalAmount: number;
  taxDeduction: number;
  withdrawAmount: number;
  percentage: string;
}
