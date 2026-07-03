import { Router } from "express";
import { PlanPinController } from "./planPin.controller";
import { authMiddleware, checkAdmin } from "../middleware/jwt";

const PlanPinRouter = Router();
const Controller = new PlanPinController();

PlanPinRouter.post("/create", authMiddleware, checkAdmin, Controller.create);
PlanPinRouter.get("/get/:id", authMiddleware, checkAdmin, Controller.getPlanPin);
PlanPinRouter.post("/transfer", authMiddleware, Controller.transferPlanPin);
PlanPinRouter.get("/user", authMiddleware, Controller.getUserPins);

export default PlanPinRouter;
