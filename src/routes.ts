import { Application, Request, Response } from "express";
import { Router } from "express";
import UserRouter from "./user/user.routes";
import PlanRouter from "./plan/plan.routes";
import PlanLevelRouter from "./planLevel/levelPlan.router";
import PlanPinRouter from "./planPin/planPin.routes";
import UserPlanRouter from "./planUser/userPlan.routes";
import PlanLevelUserRouter from "./planLevelUser/planLevelUser.routes";
import NotificationRouter from "./notification/notification.routes";
import AdminRouter from "./admin/admin.routes";
import VerifyUserRouter from "./verifyUser/verifyUser.routes";
import WithdrawRouter from "./withdraw/withdraw.routes";

export default function useApi(app: Application) {
  const router = Router();
  app.use("/", router);
  router.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
  });
  app.use("/user", UserRouter);
  app.use("/plan", PlanRouter);
  app.use("/plan-level", PlanLevelRouter);
  app.use("/plan-pin", PlanPinRouter);
  app.use("/user-plan", UserPlanRouter);
  app.use("/user-level", PlanLevelUserRouter);
  app.use("/notification", NotificationRouter);
  app.use("/admin", AdminRouter);
  app.use("/validate", VerifyUserRouter);
  app.use("/admin-withdraw", WithdrawRouter);
}
