import { Router } from "express";
import { PlanPinController } from "./planPin.controller";
import { authMiddleware } from "../middleware/jwt";

const PlanPinRouter = Router();
const Controller = new PlanPinController();

PlanPinRouter.post("/create", Controller.create);
PlanPinRouter.get("/get/:id", Controller.getPlanPin);
PlanPinRouter.post("/transfer", authMiddleware, Controller.transferPlanPin);
PlanPinRouter.get("/user", authMiddleware, Controller.getUserPins);

export default PlanPinRouter;
