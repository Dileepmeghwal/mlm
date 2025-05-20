import { Request, Response } from "express";
import { VerifyUserService } from "./verifyUser.service";

export class VerifyUserController {
  async verify(req: Request, res: Response) {
    const email = req.body.email;
    const otp = req.body.otp;
    try {
      const verifyUser = await VerifyUserService.verifyUser(email, otp);
      res.status(200).json({ message: "User verified successfully" });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error?.message || "Something went wrong" });
    }
  }
  async createOTP(req: Request, res: Response) {
    const email = req.body.email;
    try {
      const otp = await VerifyUserService.createOTP(email);
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error?.message || "Something went wrong" });
    }
  }
}
