import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createBudget,
  getAllBudgets,
  updateBudget,
  deleteBudget,
  createBudgetReport,
  allocateRemainingBudgetToGoals,
} from "../controllers/budget.controller.js";

const budgetRouter = Router();

budgetRouter.use(verifyToken);

budgetRouter.get("/", getAllBudgets);
budgetRouter.post("/create", createBudget);
budgetRouter.put("/:id", updateBudget);
budgetRouter.delete("/:id", deleteBudget);
budgetRouter.get("/report", createBudgetReport);

// Endpoint to manually trigger allocation
budgetRouter.post("/allocate-budget", allocateRemainingBudgetToGoals);

export default budgetRouter;
