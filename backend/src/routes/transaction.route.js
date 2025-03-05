import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createTransaction,
  getTransactions,
  deleteTransaction,
  getExpenses,
  getIncomes,
  updateTransaction,
} from "../controllers/transaction.controller.js";

const transactionRouter = Router();
transactionRouter.use(verifyToken);

transactionRouter.post("/create", createTransaction);
transactionRouter.get("/", getTransactions);
transactionRouter.get("/expenses", getExpenses);
transactionRouter.get("/incomes", getIncomes);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);

export default transactionRouter;
