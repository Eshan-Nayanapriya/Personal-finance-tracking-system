import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createBudget,
  getAllBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budget.controller.js";

const budgetRouter = Router();

budgetRouter.use(verifyToken);

budgetRouter.get("/", getAllBudgets);
budgetRouter.post("/create", createBudget);
budgetRouter.put("/:id", updateBudget);
budgetRouter.delete("/:id", deleteBudget);

export default budgetRouter;
