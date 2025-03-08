import mongoose, { Schema } from "mongoose";
import { budgetCategories } from "./budget.model.js";

export const recurrencePatterns = ["daily", "weekly", "monthly"];

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount should be greater than 0"],
    },
    transactionType: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      enum: budgetCategories,
      required: true,
    },
    tags: [String],
    date: {
      type: Date,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: recurrencePatterns,
    },
    endDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
