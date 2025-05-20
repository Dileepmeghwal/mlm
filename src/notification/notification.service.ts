import mongoose from "mongoose";
import { createNotificationDto } from "./notification.dto";
import Notification from "./notification.model";

export class NotificationService {
  static async getByUser(user: any) {
    return await Notification.find({
      user,
      createdAt: { $gt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    }).sort({ createdAt: -1 });
  }
  static async create(body: createNotificationDto) {
    const notification = new Notification(body);
    return await notification.save();
  }

  static async readUser(user: string | mongoose.Types.ObjectId) {
    return await Notification.updateMany(
      { user },
      { read: true, updatedAt: Date.now() }
    );
  }
}
