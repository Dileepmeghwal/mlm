import { Router } from "express";
import { VerifyUserController } from "./verifyUser.controller";

const VerifyUserRouter = Router();
const Controller = new VerifyUserController();
VerifyUserRouter.post("/verify", Controller.verify);
VerifyUserRouter.post("/createOTP", Controller.createOTP);

export default VerifyUserRouter;
