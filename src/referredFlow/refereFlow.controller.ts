import { Request, Response } from "express";
import { referFlowService } from "./referrefFlow.service";

export class ReferFlowController{
    async get(req: Request, res: Response): Promise<any> {
        try {
          const user = req.user._id;
          const data = await referFlowService.getUserLogs(user);
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