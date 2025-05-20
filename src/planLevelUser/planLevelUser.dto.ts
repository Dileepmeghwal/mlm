import mongoose from "mongoose";

export interface CreatePlanLevelUser {
  user: string | mongoose.Types.ObjectId;
  planLevel: string | mongoose.Types.ObjectId;
}
export interface CreatePlanLevelUserByPlan {
  plan: string | mongoose.Types.ObjectId;
  user: string | mongoose.Types.ObjectId;
}

export interface UpdatePlanLevelUser extends CreatePlanLevelUser {
  id: string;
  creditAmount: number;
  bonusAmount: number;
  count: number;
  createdAt: Date;
}

export interface AddCreditDto {
  user: string | mongoose.Types.ObjectId;
  planLevel: string | mongoose.Types.ObjectId;
  creditAmount: number;
}
