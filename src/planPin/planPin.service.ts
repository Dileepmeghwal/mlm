import mongoose from "mongoose";
import PlanService from "../plan/plan.service";
import { CreatePlanPin, UpdatePlanPin } from "./planPin.dto";
import PlanPin from "./planPin.model";

export class PlanPinService {
  static async create(body: CreatePlanPin) {
    if (!body.plan) {
      throw new Error("plan is required");
    }
    const checkPlan = await PlanService.getPlanById(body.plan);
    if (!checkPlan) {
      throw new Error("Plan not found");
    }

    let count = Number(body.count);
    while (count > 0) {
      body.pin = Math.floor(100000 + Math.random() * 900000).toString();
      const p = new PlanPin(body);
      p.pin = Math.floor(100000 + Math.random() * 900000).toString();
      await p.save();
      count--;
    }
  }

  static getPlanPin(planId: string | mongoose.Types.ObjectId) {
    return PlanPin.find({ plan: planId });
  }
  static getPlanById(id: string | mongoose.Types.ObjectId) {
    return PlanPin.findById(id);
  }
  static async getUserPins(id: string | mongoose.Types.ObjectId) {
    return PlanPin.find({ createdFrom: id })
      .populate("plan", "name")
      .sort({ used: 1, createdAt: -1 });
  }

  static async transferPlanPin(
    pin: string,
    userId: string | mongoose.Types.ObjectId
  ) {
    const pinData = await PlanPin.findById(pin);
    if (!pinData) throw new Error("Pin not found");
    pinData.createdFrom = userId as any;
    await pinData.save();
    return pinData;
  }
  static getPlanPinByPin(pin: string) {
    return PlanPin.findOne({ pin });
  }
  static async updatePlanPin(body: UpdatePlanPin) {
    if (!body.pin) throw new Error("id is required");
    // Update Plan Pin
    const planPin = await PlanPin.findOne({ pin: body.pin });
    if (!planPin) throw new Error("Plan Pin not found");
    planPin.used = true;
    await planPin.save();
  }
}
