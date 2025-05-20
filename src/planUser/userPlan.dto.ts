import mongoose from "mongoose";

export interface CreateUserPlanDto {
  plan: string | mongoose.Types.ObjectId;
  user: string | mongoose.Types.ObjectId;
  creditAmount?: number;
  bonusAmount?: number;
  pin: string | mongoose.Types.ObjectId;
  referredBy?: string | mongoose.Types.ObjectId;
}

export interface UpdateUserPlanDto extends CreateUserPlanDto {
  id: string;
}
