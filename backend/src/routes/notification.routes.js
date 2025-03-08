import { Router } from "express";
import { getAllNotifications } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const notificationRouter = Router();
notificationRouter.use(verifyToken);

notificationRouter.get("/", getAllNotifications);

export default notificationRouter;