import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createBudget,
} from "../controllers/budget.controller.js";

const budgetRouter = Router();

budgetRouter.use(verifyToken);

budgetRouter.post("/", createBudget);

export default budgetRouter;
