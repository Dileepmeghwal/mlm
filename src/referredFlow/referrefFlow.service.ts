import mongoose from "mongoose";
import User from "../user/user.model";
import { LevelPlanService } from "../planLevel/levelPlan.service";
import { PlanLevelUserService } from "../planLevelUser/planLevelUser.service";
import ReferFlow from "./referFlow.model";
import { NotificationService } from "../notification/notification.service";
import moment from "moment";

export class referFlowService {
  async handleReferFlow(
    user: string | mongoose.Types.ObjectId,
    plan: string | mongoose.Types.ObjectId
  ) {
    const userData = await User.findById(user);
    if (!userData) {
      throw new Error("User not found");
    }

    const planData = await LevelPlanService.getLevelPlans(plan);
    if (!planData) {
      throw new Error("Plan not found");
    }
    let current = userData?._id;
    let referred_by = userData?.referred_by;
    for (const level of planData) {
      if (!referred_by) break;
      const referredData = await User.findById(referred_by);
      if (!referredData) break;
      const planLevelUser = await PlanLevelUserService.getByUserAndLevel(
        referred_by,
        level._id
      );
      if (!planLevelUser) {
        console.log("Plan level not found for user: ", referred_by);
        continue;
      }
      planLevelUser.creditAmount += level.levelCreditAmount;
      planLevelUser.count += 1;
      referredData.wallet = referredData?.wallet
        ? referredData.wallet + level.levelCreditAmount
        : level.levelCreditAmount;

      if (
        planLevelUser.count >= level.bonusTeam &&
        planLevelUser.bonusAmount === 0
      ) {
        const expireDate = moment(planLevelUser.createdAt).add(
          level?.levelBonusDuration?.value || 1,
          level?.levelBonusDuration?.unit || "days"
        );
        if (expireDate.isSameOrAfter(moment())) {
          planLevelUser.bonusAmount = level.levelBonusAmount;
          referredData.wallet += level.levelBonusAmount;
          NotificationService.create({
            user: referred_by,
            message: `You have been credited with ₹${level.levelBonusAmount} as a bonus for level ${level.levelName} for referring ${planLevelUser.count} users.`,
          })
        }
      }

      await planLevelUser.save();
      await referredData.save();
      const referredLog = new ReferFlow({
        user: referred_by,
        referredUser: userData?._id,
        planLevel: level._id,
        amountCredit: level.levelCreditAmount,
      });
      await referredLog.save();
      await NotificationService.create({
        user: referred_by,
        message: `You have been credited with ${level.levelCreditAmount} for level ${level.levelName} by ${userData.first_name} ${userData.last_name}`,
      });
      current = referred_by;
      referred_by = referredData.referred_by;
    }
    return true;
  }

  static async getUserLogs(user: string | mongoose.Types.ObjectId) {
    return ReferFlow.find({ user })
      .populate("user", "email _id first_name last_name")
      .populate("referredUser", "email _id first_name last_name")
      .populate("planLevel", "levelName _id plan levelBonusDuration");
  }

  async getUserLevelReferLogs(
    user: string | mongoose.Types.ObjectId,
    level: string | mongoose.Types.ObjectId
  ) {
    const logs = await ReferFlow.find({ user, planLevel: level })
      .populate("referredUser", "-password")
      .populate("planLevel", "levelName _id");

    // Mask email addresses
    const maskedLogs = logs.map((log: any) => {
      if (log.referredUser && log.referredUser.email) {
        const emailParts = log.referredUser.email.split("@");
        log.referredUser.email = `${emailParts[0].slice(0, 3)}***@${
          emailParts[1]
        }`;
      }
      return log;
    });

    return maskedLogs;
  }
}
