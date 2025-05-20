import { Request, Response } from "express";
import { NotificationService } from "./notification.service";

export class NotificationController {
  async get(req: Request, res: Response):Promise<any> {
    const user = req.user;
    const notifications = await NotificationService.getByUser(user._id);
    return res.json(notifications);
  }
  async read(req: Request, res: Response):Promise<any> {
    const user = req.user;
    await NotificationService.readUser(user._id);
    return res.json({ message: "Notifications read" });
  }
}
