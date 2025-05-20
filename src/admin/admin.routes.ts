import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authMiddleware, checkAdmin } from "../middleware/jwt";

const AdminRouter = Router();
const Controller = new AdminController();

AdminRouter.get("/get", authMiddleware, checkAdmin, Controller.getAdminData);
AdminRouter.get("/get-user", authMiddleware, checkAdmin, Controller.getRegistrationData);
export default AdminRouter;