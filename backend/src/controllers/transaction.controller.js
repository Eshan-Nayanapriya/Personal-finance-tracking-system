import TransactionModel from "../models/transaction.model.js";
import { convertCurrency } from "../services/currency.service.js";
import { currencyCategories } from "../models/user.model.js";
import { budgetCategories } from "../models/budget.model.js";
import UserModel from "../models/user.model.js";
import { recurrencePatterns } from "../models/transaction.model.js";
import mongoose from "mongoose";

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

    if (isRecurring && typeof isRecurring !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isRecurring should be a boolean value",
      });
    }

    if (isRecurring === true && !recurrencePattern) {
      return res.status(400).json({
        success: false,
        message: "Recurrence pattern is required for recurring transactions",
      });
    }

    if (recurrencePattern && !recurrencePatterns.includes(recurrencePattern)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid recurrence pattern. Please use daily, weekly or monthly",
      });
    }

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
