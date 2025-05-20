import { CreateUserPlanDto } from "./userPlan.dto";
import UserPlan from "./userPlan.model";

export class UserPlanService {
  static async create(body: CreateUserPlanDto) {
    if (!body.plan || !body.user || !body.pin) {
      throw new Error("plan, user, pin is required");
    }
    // Create User Plan
    const userPlan = await UserPlan.create(body);
    userPlan.save();
    return userPlan;
  }
  static getUserPlan(userId: string) {
    return UserPlan.find({ user: userId })
      .populate("plan", "name")
      .populate("referredBy", "first_name last_name")
      .populate("user", "first_name last_name email");
  }
}
