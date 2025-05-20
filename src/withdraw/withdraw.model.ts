import mongoose from "mongoose";

const WithdrawSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  taxDeduction: {
    type: Number,
    require: true,
  },
  withdrawAmount: {
    type: Number,
    require: true,
  },
  percentage: {
    type: String,
    require: true,
  },
  tds: {
    type: Number,
    default: 0,
  },
  platformCharge: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "COMPLETED", "REJECTED"],
  },
});

WithdrawSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdAt = new Date();
    if (this.taxDeduction && this.taxDeduction > 0) {
      this.tds = this.taxDeduction / 2;
      this.platformCharge = this.taxDeduction / 2;
    }
  }
  next();
});

const Withdraw = mongoose.model("Withdraw", WithdrawSchema);

export default Withdraw;
