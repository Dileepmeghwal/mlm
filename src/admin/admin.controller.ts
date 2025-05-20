import { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminController {
  async getAdminData(req: Request, res: Response): Promise<any> {
    const totalAmount = await AdminService.getTotalAmount();
    const referralCode = await AdminService.ReferralCode();

    res.status(200).json({ totalAmount, referralCode });
  }

  async getRegistrationData(req: Request, res: Response): Promise<any> {
    const query: any = {
      startDate: req?.query?.startDate,
      endDate: req?.query?.endDate,
    };
    if (!query.startDate || !query.endDate) {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);
      query.startDate = sevenDaysAgo;
      query.endDate = now;
    }

    const userRegistration = await AdminService.getUserRegistration(
      query.startDate,
      query.endDate
    );
    res.status(200).json(userRegistration);
  }
}
