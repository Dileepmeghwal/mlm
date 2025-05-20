import { Request, Response } from "express";
import { CreatePlan, UpdatePlan } from "./plan.dto";
import PlanService from "./plan.service";

export default class PlanController {
  async createPlan(req: Request, res: Response): Promise<any> {
    const body: CreatePlan = req.body;
    if (!body.name || !body.enrollAmount)
      return res
        .status(400)
        .json({ message: "name and enrollAmount is required" });

    try {
      const plan = await PlanService.createPlan(body);
      return res
        .status(201)
        .json({ message: "plan created successfully", data: plan });
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
  async getPlan(req: Request, res: Response): Promise<any> {
    const plans = await PlanService.getPlans();
    return res.json(plans);
  }
  async updatePlan(req: Request, res: Response): Promise<any> {
    const body: UpdatePlan = req.body;
    if (!body.id) return res.status(400).json({ message: "id is required" });
    try {
      const plan = await PlanService.updatePlan(body);
      return res.json({ message: "plan update successfully", data: plan });
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
  async deletePlan(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });
    try {
        const plan = await PlanService.deletePlan(id);
        return res.json({ message: "plan deleted successfully", data: plan });
    }
    catch (e: any) {
        console.log(e);
        return res.status(500).json({ message: "something went wrong" });
    }
}
}

