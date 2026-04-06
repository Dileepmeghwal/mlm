import mongoose from "mongoose";
import { AutoIncrementID } from "@typegoose/auto-increment";

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    default: 0,
  },
  first_name: {
    required: true,
    type: String,
  },
  last_name: {
    require: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
    unique: true,
    isEmail: true,
  },
  password: {
    required: true,
    type: String,
  },
  mobile_number: {
    required: false,
    type: String,
    default: null,
  },
  dob: {
    required: false,
    type: Date,
    default: null,
  },
  type: {
    type: String,
    default: "USER",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  pin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlanPin",
    default: null,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  isBlock: {
    type: Boolean,
    default: false,
  },
  pan: {
    type: String,
    default: null,
  },
  adress1: {
    type: String,
    default: null,
  },
  adress2: {
    type: String,
    default: null,
  },
  adhaar: {
    type: String,
    default: null,
  },
  upi: {
    type: String,
    default: null,
  },
  bankAC: {
    type: String,
    default: null,
  },
  ifsc: {
    type: String,
    default: null,
  },
  bankName: {
    type: String,
    default: null,
  },
  // Password reset fields
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
  passwordResetAttempts: {
    type: Number,
    default: 0,
  },
  passwordResetLockUntil: {
    type: Date,
    default: null,
    required: false,
  },
});
UserSchema.plugin(AutoIncrementID, { field: "userId" });

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const User = mongoose.model("User", UserSchema);
export default User;
