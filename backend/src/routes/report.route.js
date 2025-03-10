import { Router } from "express";
import { 
  generateFinancialReport
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const reportRouter = Router();

reportRouter.use(verifyToken);

reportRouter.get("/financial", generateFinancialReport);

export default reportRouter;