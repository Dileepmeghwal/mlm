import mongoose from "mongoose";
import { validateId } from "../config/validation";
import { LevelPlanService } from "../planLevel/levelPlan.service";
import {
  CreatePlanLevelUser,
  CreatePlanLevelUserByPlan,
} from "./planLevelUser.dto";
import PlanLevelUser from "./planLevelUser.model";

export class PlanLevelUserService {
  static async createByPlan(body: CreatePlanLevelUserByPlan) {
    if (!body.plan || !body.user) {
      throw new Error("plan, user, level is required");
    }
    const checkPlan = await validateId("Plan", body.plan);
    if (!checkPlan) throw new Error("Plan not found");

    const checkUser = await validateId("User", body.user);
    if (!checkUser) throw new Error("User not found");

    const levels = await LevelPlanService.getLevelPlans(body.plan);
    if (!levels.length) throw new Error("No levels found");
    for (const level of levels) {
      const planLevel = new PlanLevelUser({
        user: body.user,
        planLevel: level._id,
      });
      await planLevel.save();
    }
  }

  static async getByUser(userId: string | mongoose.Types.ObjectId) {
    return PlanLevelUser.find({ user: userId })
      .populate({
        path: "planLevel",
        populate: {
          path: "plan",
          select: "name _id",
        },
        select: "levelName _id plan levelBonusDuration bonusTeam",
      })
      .populate("user", "email _id first_name last_name");
  }

  static async getByUserAndLevel(
    userId: string | mongoose.Types.ObjectId,
    levelId: string | mongoose.Types.ObjectId
  ) {
    return PlanLevelUser.findOne({ user: userId, planLevel: levelId });
  }
}
