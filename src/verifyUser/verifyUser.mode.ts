import mongoose from "mongoose";

const VerifyUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VerifyUser = mongoose.model("VerifyUser", VerifyUserSchema);
export default VerifyUser;
