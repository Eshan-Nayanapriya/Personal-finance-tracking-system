import TransactionModel from "../models/transaction.model.js";
import { convertCurrency } from "../services/currency.service.js";

export async function createTransaction(req, res) {
  try {
    const { amount, currency, type, category, tags } = req.body;
    const userId = req.user.id;

    const transaction = new TransactionModel({
      userId,
      amount,
      currency,
      type,
      category,
      tags,
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
    const transactions = await TransactionModel.find({ userId });

    // Convert all transactions to the user's base currency
    const user = await UserModel.findById(userId);
    const baseCurrency = user.currency;

    const convertedTransactions = await Promise.all(
      transactions.map(async (t) => ({
        ...t.toObject(),
        convertedAmount: await convertCurrency(t.amount, t.currency, baseCurrency),
      }))
    );

    res.status(200).json({ success: true, data: convertedTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}