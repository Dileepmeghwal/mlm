import mongoose from "mongoose";

const ReferFlowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  planLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true,
  },
  amountCredit: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReferFlow = mongoose.model("ReferFlow", ReferFlowSchema);

export default ReferFlow;
