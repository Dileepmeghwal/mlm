import { Router } from "express";
import { ReferFlowController } from "./refereFlow.controller";
import { authMiddleware } from "../middleware/jwt";

const ReferFlowRouter = Router();
const Controller = new ReferFlowController();

ReferFlowRouter.get("/get", authMiddleware, Controller.get);

export default ReferFlowRouter;
