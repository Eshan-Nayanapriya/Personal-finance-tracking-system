import TransactionModel from "../models/transaction.model.js";
import { convertCurrency } from "../services/currency.service.js";
import UserModel from "../models/user.model.js";


// export async function generateSpendingReport(req, res) {
//   try {
//     const userId = req.user.id;
//     const user = await UserModel.findById(userId);
//     const transactions = await TransactionModel.find({ userId, type: "expense" });

//     // Convert all expenses to base currency
//     let total = 0;
//     for (const t of transactions) {
//       total += await convertCurrency(t.amount, t.currency, user.currency);
//     }

//     res.status(200).json({
//       success: true,
//       data: { totalSpending: total, currency: user.currency },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

export async function generateFinancialReport(req, res) {
  try {
    const userId = req.user.id;
    const { 
      startDate, 
      endDate, 
      categories, 
      tags 
    } = req.query;

    const match = { userId };
    
    // Date filtering
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    // Category filtering
    if (categories) {
      match.category = { $in: categories.split(",") };
    }

    // Tag filtering
    if (tags) {
      match.tags = { $in: tags.split(",") };
    }

    const report = await TransactionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$transactionType"
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          categories: { $addToSet: "$category" }
        }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          type: "$_id.type",
          totalAmount: 1,
          count: 1,
          categories: 1
        }
      },
      { $sort: { period: 1 } }
    ]);

    res.status(200).json({ 
      success: true, 
      data: report 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}