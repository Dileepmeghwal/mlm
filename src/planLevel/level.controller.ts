import { Request, Response } from "express";
import { LevelPlanService } from "./levelPlan.service";

export class LevelPlanController {
  async create(req: Request, res: Response): Promise<any> {
    const body = req.body;
    if (
      !body.plan ||
      !body.levelName ||
      !body.levelCreditAmount ||
      !body.levelBonusAmount ||
      !body.levelBonusDuration
    ) {
      return res.status(400).json({
        message:
          "plan, levelName, levelCreditAmount, levelBonusAmount, levelBonusDuration is required",
      });
    }
    try {
      const level = await LevelPlanService.createLevelPlan(body);
      return res
        .status(201)
        .json({ message: "Level Plan created successfully", data: level });
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }

  async get(req: Request, res: Response): Promise<any> {
    const { id: planId } = req.params;
    if (!planId) return res.status(400).json({ message: "planId is required" });
    try {
      const levels = await LevelPlanService.getLevelPlans(planId);
      return res.json(levels);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }

  async update(req: Request, res: Response): Promise<any> {
    const body = req.body;
    if (!body.id) return res.status(400).json({ message: "id is required" });
    try {
      const level = await LevelPlanService.updateLevelPlan(body);
      return res.json({
        message: "Level Plan updated successfully",
        data: level,
      });
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
}
