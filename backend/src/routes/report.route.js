import { Router } from "express";
import { 
  generateMonthlySummaryReport,
  generateOverallFinancialReport,
  generateSpendingReport,
  generateIncomeReport
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const reportRouter = Router();

reportRouter.use(verifyToken);

reportRouter.get("/monthly-summary", generateMonthlySummaryReport);
reportRouter.get("/overall-financial", generateOverallFinancialReport);
reportRouter.get("/spending", generateSpendingReport);
reportRouter.get("/income", generateIncomeReport);

export default reportRouter;