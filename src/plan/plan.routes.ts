import { Router } from "express";
import PlanController from "./plan.controller";
import { authMiddleware, checkAdmin } from "../middleware/jwt";
const Controller= new PlanController()

const PlanRouter=Router();

PlanRouter.post("/create", authMiddleware, checkAdmin, Controller.createPlan);
PlanRouter.get("/get", authMiddleware, Controller.getPlan);
PlanRouter.put("/update", authMiddleware, checkAdmin, Controller.updatePlan);
PlanRouter.delete("/delete", authMiddleware, checkAdmin, Controller.deletePlan);

export default PlanRouter;