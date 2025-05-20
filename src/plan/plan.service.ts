import mongoose, { mongo } from "mongoose";
import { CreatePlan, UpdatePlan } from "./plan.dto";
import Plan from "./plan.model";

export default class PlanService {
  static async createPlan(data: CreatePlan) {
    if (!data.name || !data.enrollAmount)
      throw new Error("Please provide all required fields");

    const plan = new Plan(data);
    return await plan.save();
  }
  static async getPlans() {
    return await Plan.find();
  }
  static getPlanById(id: string | mongoose.Types.ObjectId) {
    return Plan.findById(id);
  }
  static async updatePlan(data: UpdatePlan) {
    const plan = await Plan.findById(data.id);
    if (!plan) throw new Error("Plan not found");
    Object.assign(plan, data);
    return await plan.save();
  }
  static async deletePlan(id: string) {
    const plan = await Plan.findById(id);
    if (!plan) throw new Error("Plan not found");
    return await plan.deleteOne();
  }
}
