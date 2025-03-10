import TransactionModel from "../models/transaction.model.js";
import BudgetModel from "../models/budget.model.js";
import GoalModel from "../models/goal.model.js";
import UserModel from "../models/user.model.js";
import moment from "moment";
import { convertCurrency } from "../services/currency.service.js";

// Generate monthly financial summary report
export async function generateMonthlySummaryReport(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.body; // changed: get month from body

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    const startDate = moment(month, "YYYY-MM").startOf("month").toDate();
    const endDate = moment(month, "YYYY-MM").endOf("month").toDate();

    const transactions = await TransactionModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalIncome = transactions
      .filter((t) => t.transactionType === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.transactionType === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalTransactions = transactions.length;

    const budgets = await BudgetModel.find({
      userId,
      month,
    });

    const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
    const remainingBudget = budgets.reduce(
      (acc, budget) => acc + budget.remaining_amount,
      0
    );

    const goals = await GoalModel.find({ userId });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        totalTransactions,
        totalBudget,
        remainingBudget,
        totalGoals,
        completedGoals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Generate overall financial report
export async function generateOverallFinancialReport(req, res) {
  try {
    const userId = req.user.id;

    const transactions = await TransactionModel.find({ userId });

    const totalIncome = transactions
      .filter((t) => t.transactionType === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.transactionType === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalTransactions = transactions.length;

    const budgets = await BudgetModel.find({ userId });

    const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
    const remainingBudget = budgets.reduce(
      (acc, budget) => acc + budget.remaining_amount,
      0
    );

    const goals = await GoalModel.find({ userId });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        totalTransactions,
        totalBudget,
        remainingBudget,
        totalGoals,
        completedGoals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Generate spending report
export async function generateSpendingReport(req, res) {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const transactions = await TransactionModel.find({
      userId,
      transactionType: "expense",
    });

    // Convert all expenses to base currency
    let total = 0;
    for (const t of transactions) {
      total += await convertCurrency(t.amount, t.currency, user.currency);
    }

    res.status(200).json({
      success: true,
      data: { totalSpending: total, currency: user.currency },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Generate income report
export async function generateIncomeReport(req, res) {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const transactions = await TransactionModel.find({
      userId,
      transactionType: "income",
    });

    // Convert all incomes to base currency
    let total = 0;
    for (const t of transactions) {
      total += await convertCurrency(t.amount, t.currency, user.currency);
    }

    res.status(200).json({
      success: true,
      data: { totalIncome: total, currency: user.currency },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
