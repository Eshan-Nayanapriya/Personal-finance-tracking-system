import TransactionModel from "../models/transaction.model.js";
import { convertCurrency } from "../services/currency.service.js";

export async function generateSpendingReport(req, res) {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const transactions = await TransactionModel.find({ userId, type: "expense" });

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