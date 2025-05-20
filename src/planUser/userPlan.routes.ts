import { Router } from "express";
import { UserPlanController } from "./userPlan.controller";
import { authMiddleware } from "../middleware/jwt";

const UserPlanRouter = Router();
const Controller = new UserPlanController();

UserPlanRouter.get("/get/",authMiddleware ,Controller.getUserPlan);

export default UserPlanRouter;
