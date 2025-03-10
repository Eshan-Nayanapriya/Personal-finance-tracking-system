import { Router } from "express";
import { getAllNotifications, NotificationGenerator} from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const notificationRouter = Router();
notificationRouter.use(verifyToken);

notificationRouter.get("/", getAllNotifications);
notificationRouter.get("/notify-recurring", NotificationGenerator);


export default notificationRouter;