import { Router } from "express";
import PlanController from "./plan.controller";
const Controller= new PlanController() 

const PlanRouter=Router();

PlanRouter.post("/create",Controller.createPlan);
PlanRouter.get("/get",Controller.getPlan);
PlanRouter.put("/update",Controller.updatePlan);
PlanRouter.delete("/delete",Controller.deletePlan);

export default PlanRouter;