import crypto from "crypto";
import VerifyUser from "./verifyUser.mode";
import { sendmail } from "./sendMail";

export class VerifyUserService {
  static async verifyUser(email: string, otp: string) {
    const verifyUser = await VerifyUser.findOne({ email, otp });
    if (!verifyUser) {
      throw "Invalid OTP";
    }
    if (verifyUser.isVerified) {
      throw "OTP already verified";
    }
    if (verifyUser.createdAt.getTime() + 600000 < Date.now()) {
      throw "OTP expired";
    }
    await VerifyUser.findOneAndUpdate({ email, otp }, { isVerified: true });
    return true;
  }

  static async createOTP(email: string) {
    const otp = crypto.randomInt(100000, 1000000).toString();
    await VerifyUser.create({ email, otp });
    await sendmail(email, otp);
    return otp;
  }
}
