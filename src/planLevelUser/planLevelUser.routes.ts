import { Router } from "express";
import { PlanLevelUserController } from "./planLevelUser.controller";
import { authMiddleware } from "../middleware/jwt";

const PlanLevelUserRouter = Router();
const Controller = new PlanLevelUserController();

PlanLevelUserRouter.get("/get", authMiddleware, Controller.get);

export default PlanLevelUserRouter;
