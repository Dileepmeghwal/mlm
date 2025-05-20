import mongoose from "mongoose";

export interface CreatePlanPin {
  plan: string;
  pin: string;
  createdFrom: string;
  count:number;
}

export interface UpdatePlanPin extends CreatePlanPin {
  id: string;
  used: boolean;
  usedBy: string | mongoose.Schema.Types.ObjectId;
}
