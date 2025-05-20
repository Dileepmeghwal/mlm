import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { authMiddleware } from "../middleware/jwt";

const NotificationRouter=Router();
const Controller = new NotificationController();

NotificationRouter.get("/get",authMiddleware ,Controller.get);
NotificationRouter.put("/read",authMiddleware ,Controller.read);

export default NotificationRouter;