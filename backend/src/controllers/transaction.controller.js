import TransactionModel from "../models/transaction.model.js";
import { convertCurrency } from "../services/currency.service.js";
import { currencyCategories } from "../models/user.model.js";
import { budgetCategories } from "../models/budget.model.js";
import UserModel from "../models/user.model.js";
import { recurrencePatterns } from "../models/transaction.model.js";
import mongoose from "mongoose";
import NotificationModel from "../models/notification.model.js";

// Create a transaction
export async function createTransaction(req, res) {
  try {
    const {
      amount,
      currency,
      transactionType,
      category,
      tags,
      isRecurring,
      recurrencePattern,
    } = req.body;
    const userId = req.user.id;

    if (!amount || !currency || !transactionType || !category) {
      return res.status(400).json({
        success: false,
        message: "Amount, Currency, Type, category are required",
      });
    }

    // Validate recurrence
    if (isRecurring && typeof isRecurring !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isRecurring should be a boolean value",
      });
    }

    // Validate recurrence pattern
    if (isRecurring === true && !recurrencePattern) {
      return res.status(400).json({
        success: false,
        message: "Recurrence pattern is required for recurring transactions",
      });
    }

    // Validate recurrence pattern
    if (recurrencePattern && !recurrencePatterns.includes(recurrencePattern)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid recurrence pattern. Please use daily, weekly or monthly",
      });
    }

    // Validate transaction type
    if (transactionType !== "income" && transactionType !== "expense") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction type, Please use either income or expense",
      });
    }

    // Validate category
    if (!budgetCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid budget category. Please use the following categories - food, housing, transport, insurance, healthcare, education, entertainment, savings, debt, other",
      });
    }

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

    const transactionCount = await TransactionModel.countDocuments({ userId });

    if (transactionCount >= user.transactionLimit) {
      return res.status(400).json({
        success: false,
        message: "Transaction limit reached",
      });
    }

    const transaction = new TransactionModel({
      userId,
      amount: convertedAmount,
      currency,
      transactionType,
      category,
      tags,
      isRecurring,
      recurrencePattern,
    });
    await transaction.save();

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all transactions
export async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const filter = { userId };

    const transactions = await TransactionModel.find(filter).lean();

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//update transaction
export async function updateTransaction(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const updates = req.body;

    // Validate transaction ID format
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID format",
      });
    }

    // Find the transaction
    const transaction = await TransactionModel.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized access",
      });
    }

    // Validate recurrence pattern if provided
    if (
      updates.recurrencePattern &&
      !recurrencePatterns.includes(updates.recurrencePattern)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid recurrence pattern. Use daily, weekly, or monthly",
      });
    }

    // Handle currency conversion if amount/currency is updated
    if (updates.amount || updates.currency) {
      const user = await UserModel.findById(userId);

      if (updates.currency && !currencyCategories.includes(updates.currency)) {
        return res.status(400).json({
          success: false,
          message: "Invalid currency specified",
        });
      }

      const convertedAmount = await convertCurrency(
        updates.amount || transaction.amount,
        updates.currency || transaction.currency,
        user.currency
      );

      updates.amount = convertedAmount;
      updates.currency = user.currency;
    }

    // Update transaction
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      transactionId,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message.includes("validation")
        ? "Invalid transaction data"
        : error.message,
    });
  }
}

// Delete a transaction
export async function deleteTransaction(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // Validate transaction ID format
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID format",
      });
    }

    const transaction = await TransactionModel.findOneAndDelete({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all expenses
export async function getExpenses(req, res) {
  try {
    const userId = req.user.id;

    const expenses = await TransactionModel.find({
      userId,
      transactionType: "expense",
    }).lean();

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all incomes
export async function getIncomes(req, res) {
  try {
    const userId = req.user.id;

    const expenses = await TransactionModel.find({
      userId,
      transactionType: "income",
    }).lean();

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//create transaction report
export async function createTransactionReport(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Enter start date and end date to set date range",
      });
    }

    // Convert strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be greater than end date",
      });
    }

    const transactions = await TransactionModel.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalIncome = transactions
      .filter((t) => t.transactionType === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.transactionType === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalTransactions = transactions.length;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        totalTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//filter transactions by tags
export async function filterTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { category } = req.body;

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category tag is required" });
    }

    if (!budgetCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "That category tag is not available",
      });
    }

    const filter = { userId, category };

    const transactions = await TransactionModel.find(filter).lean();
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function notifyRecurringTransactions(req, res) {
  try {
    const userId = req.user.id;
    const transactions = await TransactionModel.find({
      userId,
      isRecurring: true,
    }).lean();

    if (!transactions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No recurring transactions found" });
    }

    const now = new Date();
    const notifications = [];

    transactions.forEach((transaction) => {
      const { recurrencePattern, createdAt, category } = transaction;
      const createdDate = new Date(createdAt);

      let shouldNotify = false;

      if (
        recurrencePattern === "daily" &&
        (now - createdDate) / (1000 * 60 * 60 * 24) >= 1
      ) {
        shouldNotify = true;
      } else if (
        recurrencePattern === "weekly" &&
        (now - createdDate) / (1000 * 60 * 60 * 24 * 7) >= 1
      ) {
        shouldNotify = true;
      } else if (
        recurrencePattern === "monthly" &&
        (now - createdDate) / (1000 * 60 * 60 * 24 * 30) >= 1
      ) {
        shouldNotify = true;
      }

      if (shouldNotify) {
        const newNotification = new NotificationModel({
          userId,
          section: "Transaction",
          title: "Recurring Transaction",
          message: `${recurrencePattern} recurring transaction missed for ${category}`,
        });

        notifications.push(newNotification.save());
      }
    });

    await Promise.all(notifications);

    res.status(200).json({
      success: true,
      message: "Notifications created for missed recurring transactions",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
