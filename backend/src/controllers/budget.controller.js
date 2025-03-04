import BudgetModel from "../models/budget.model.js";
import { convertCurrency } from "../services/currency.service.js";
import UserModel from "../models/user.model.js";
import { budgetCategories } from "../models/budget.model.js";
import { currencyCategories } from "../models/user.model.js";
import moment from "moment";

export async function createBudget(req, res) {
  try {
    const userId = req.user.id;
    let { category, amount, month, currency } = req.body;

    const currentMonth = moment().format("YYYY-MM");

    // Validate required fields
    if (!category && !month) {
      return res.status(400).json({
        success: false,
        message:
          "Budget should be monthly or category-specific, So month or category is required",
      });
    } else if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "Amount and Currency are required",
      });
    }

    // Get user's base currency
    const user = await UserModel.findById(userId);
    if (!user?.currency) {
      return res.status(400).json({
        success: false,
        message: "User currency not found",
      });
    }

    // Validate category
    if (!currencyCategories.includes(currency)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid currency category, Please use following currency categories: USD, LKR, JPY, EUR, GBP, AUD, CAD, CHF",
      });
    }

    // Convert amount to user's currency
    const convertedAmount = await convertCurrency(
      amount,
      currency,
      user.currency
    );

    if (!category) {
      category = "monthly budget";
    }

    // If no month is provided, use the current month
    if (!month) {
      month = currentMonth;
    } else {
      // Validate provided month format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month format. Please use 'YYYY-MM' format.",
        });
      }

      // Check if the provided month is in the past
      if (moment(month, "YYYY-MM").isBefore(moment(currentMonth, "YYYY-MM"))) {
        return res.status(400).json({
          success: false,
          message: "Cannot create a budget for a past month.",
        });
      }
    }

    // Validate category
    if (!budgetCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid budget category. Please use the following categories - food, housing, transport, insurance, healthcare, education, entertainment, savings, debt, other",
      });
    }

    const newBudget = new BudgetModel({
      userId,
      category,
      amount: convertedAmount,
      month,
    });

    const savedBudget = await newBudget.save();

    return res.status(201).json({
      success: true,
      data: {
        ...savedBudget.toObject(),
        originalAmount: amount,
        originalCurrency: currency,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message.includes("validation")
        ? "Invalid budget data"
        : error.message,
    });
  }
}

// Get all budgets for the user (with filters)
export async function getAllBudgets(req, res) {
  try {
    const userId = req.user.id;
    const { month, category } = req.query;

    const filter = { userId };
    if (month) filter.month = month;
    if (category) filter.category = category;

    const budgets = await BudgetModel.find(filter).lean();
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Update a budget
export async function updateBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const updates = req.body;

    const budget = await BudgetModel.findOne({ _id: budgetId, userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    // Handle currency conversion if amount/currency is updated
    if (updates.amount || updates.currency) {
      const user = await UserModel.findById(userId);
      const convertedAmount = await convertCurrency(
        updates.amount || budget.amount,
        updates.currency || user.currency,
        user.currency
      );
      updates.amount = convertedAmount;
    }

    const updatedBudget = await BudgetModel.findByIdAndUpdate(budgetId, updates, { new: true });
    res.status(200).json({ success: true, data: updatedBudget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Delete a budget
export async function deleteBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await BudgetModel.findOneAndDelete({ _id: budgetId, userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }
    res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
