import { Request, Response } from "express";
import { PlanLevelUserService } from "./planLevelUser.service";

export class PlanLevelUserController {
  async get(req: Request, res: Response): Promise<any> {
    try {
      const user = req.user._id;
      const data = await PlanLevelUserService.getByUser(user);
      return res.json(data);
    } catch (err: any) {
      return res
        .status(500)
        .json({
          message: err.message || "Some error occurred while getting the user",
        });
    }
  }
}
