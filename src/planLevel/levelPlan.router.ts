import { Router } from "express";
import { LevelPlanController } from "./level.controller";

const Controller = new LevelPlanController();
const PlanLevelRouter = Router();

PlanLevelRouter.post("/create", Controller.create);
PlanLevelRouter.get("/get/:id", Controller.get);
PlanLevelRouter.put("/update", Controller.update);

export default PlanLevelRouter;
