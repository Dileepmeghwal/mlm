import mongoose from "mongoose";

export interface createNotificationDto {
  user: string|mongoose.Types.ObjectId;
  message: string;
  type?: string;
  read?: boolean;
}

export interface updateNotificationDto extends createNotificationDto {
  id: string;
}
