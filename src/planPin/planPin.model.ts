import mongoose from "mongoose";

const PlanPinSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Plan",
  },
  pin: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

PlanPinSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const PlanPin = mongoose.model("PlanPin", PlanPinSchema);
export default PlanPin;
