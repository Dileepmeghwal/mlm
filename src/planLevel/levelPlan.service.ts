import mongoose from "mongoose";
import LevelPlan from "./levelPlan.model";
import { CreatePlanLevelDto, UpdatePlanLevelDto } from "./planLevel.dto";

export class LevelPlanService {
  static async createLevelPlan(body: CreatePlanLevelDto) {
    if (
      !body.plan ||
      !body.levelName ||
      !body.levelCreditAmount ||
      !body.levelBonusAmount ||
      !body.levelBonusDuration
    ) {
      throw new Error(
        "plan, levelName, levelCreditAmount, levelBonusAmount, levelBonusDuration is required"
      );
    }
    // Create Level Plan
    const level = await LevelPlan.create(body);
    await level.save();

    return level;
  }

  static async getLevelPlans(planId: string | mongoose.Types.ObjectId) {
    // Get Level Plans
    const levels = await LevelPlan.find({ plan: planId }).populate("plan").sort({createdAt:1});
    return levels;
  }
  static async updateLevelPlan(body: UpdatePlanLevelDto) {
    if (!body.id) throw new Error("id is required");
    // Update Level Plan
    const level = await LevelPlan.findById(body.id);
    if (!level) throw new Error("Level not found");
    Object.assign(level, body);
    await level.save();
    return level;
  }
}
