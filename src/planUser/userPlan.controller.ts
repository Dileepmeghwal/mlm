import { Request, Response } from "express";
import { UserPlanService } from "./userPlan.service";

export class UserPlanController {
  async getUserPlan(req: Request, res: Response): Promise<any> {
    const userId = req.user._id;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    try {
      const userPlan = await UserPlanService.getUserPlan(userId);
      return res.json(userPlan);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
}
