import mongoose from "mongoose";
import crypto from "crypto";
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
      // Cryptographically-secure, unpredictable PIN (these represent paid
      // enrollments — must not be guessable). Retry on the rare unique-index
      // collision.
      let saved = false;
      for (let attempt = 0; attempt < 5 && !saved; attempt++) {
        try {
          const p = new PlanPin({
            ...body,
            pin: crypto.randomInt(100000, 1000000).toString(),
          });
          await p.save();
          saved = true;
        } catch (err: any) {
          if (err?.code !== 11000) throw err; // not a duplicate-key error
        }
      }
      if (!saved) throw new Error("Could not generate a unique PIN, please retry");
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
