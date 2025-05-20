import { Request, Response } from "express";
import { CreatePlanPin } from "./planPin.dto";
import { validateId } from "../config/validation";
import { PlanPinService } from "./planPin.service";

export class PlanPinController {
  async create(req: Request, res: Response): Promise<any> {
    const body: CreatePlanPin = req.body;
    if (!body.plan || !body.createdFrom || !body.count)
      return res.status(400).json({ message: "plan and pin is required" });

    try {
      const checkUser = await validateId("User", body.createdFrom);
      if (!checkUser) return res.status(400).json({ message: "Invalid User" });
      const checkPlan = await validateId("Plan", body.plan);
      if (!checkPlan) return res.status(400).json({ message: "Invalid Plan" });
      const planPin = await PlanPinService.create(body);
      return res
        .status(201)
        .json({ message: "Plan Pin created successfully", data: planPin });
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }

  async getPlanPin(req: Request, res: Response): Promise<any> {
    const { id: planId } = req.params;
    if (!planId) return res.status(400).json({ message: "planId is required" });
    try {
      const planPin = await PlanPinService.getPlanPin(planId);
      return res.json(planPin);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
  async getUserPins(req: Request, res: Response): Promise<any> {
    try {
      const planPin = await PlanPinService.getUserPins(req.user._id);
      return res.json(planPin);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }

  async transferPlanPin(req: Request, res: Response): Promise<any> {
    const { pin, userId } = req.body;
    if (!pin || !userId)
      return res.status(400).json({ message: "pin and userId is required" });
    try {
      if (userId == req.user._id.toString())
        return res
          .status(400)
          .json({ message: "You can't transfer to yourself" });
      const checkUser = await validateId("User", userId);
      if (!checkUser) return res.status(400).json({ message: "Invalid User" });
      const checkPlanPin = await PlanPinService.getPlanById(pin);
      if (!checkPlanPin)
        return res.status(400).json({ message: "Invalid Plan Pin" });
      if (checkPlanPin.used)
        return res.status(400).json({ message: "Plan Pin already used" });
      if (checkPlanPin.createdFrom.toString() != req.user._id.toString())
        return res
          .status(400)
          .json({ message: "You are not authorized to transfer this pin" });

      const planPin = await PlanPinService.transferPlanPin(pin, userId);
      return res.json(planPin);
    } catch (e: any) {
      console.log(e);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
}
