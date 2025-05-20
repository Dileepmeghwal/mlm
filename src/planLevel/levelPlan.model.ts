import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  levelName: {
    type: String,
    required: true,
  },
  levelCreditAmount: {
    type: Number,
    required: true,
  },
  levelBonusAmount: {
    type: Number,
    required: true,
  },
  levelBonusDuration: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["day", "days", "month", "months"],
    },
  },
  bonusTeam: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

levelSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const LevelPlan = mongoose.model("Level", levelSchema);
export default LevelPlan;
