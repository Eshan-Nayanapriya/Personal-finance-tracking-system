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
