import { Router } from "express";
import { LevelPlanController } from "./level.controller";
import { authMiddleware, checkAdmin } from "../middleware/jwt";

const Controller = new LevelPlanController();
const PlanLevelRouter = Router();

PlanLevelRouter.post("/create", authMiddleware, checkAdmin, Controller.create);
PlanLevelRouter.get("/get/:id", authMiddleware, Controller.get);
PlanLevelRouter.put("/update", authMiddleware, checkAdmin, Controller.update);

export default PlanLevelRouter;
