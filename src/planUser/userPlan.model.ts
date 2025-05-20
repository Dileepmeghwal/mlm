import mongoose from "mongoose";

const userPlanSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creditAmount: {
    type: Number,
    default: 0,
  },
  bonusAmount: {
    type: Number,
    default: 0,
  },
  pin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlanPin",
    required: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userPlanSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const UserPlan = mongoose.model("UserPlan", userPlanSchema);

export default UserPlan;
