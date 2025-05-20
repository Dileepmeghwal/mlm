import mongoose from "mongoose";

const planLevelUserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true,
  },
  creditAmount: { type: Number, required: true, default: 0 },
  bonusAmount: { type: Number, required: true, default: 0 },
  count: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

});

planLevelUserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const PlanLevelUser = mongoose.model("PlanLevelUser", planLevelUserSchema);
export default PlanLevelUser;
