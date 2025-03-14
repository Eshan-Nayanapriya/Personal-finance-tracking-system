import mongoose, { Schema } from "mongoose";

export const budgetCategories = [
  "food",
  "housing",
  "transport",
  "insurance",
  "healthcare",
  "education",
  "entertainment",
  "savings",
  "debt",
  "monthly budget",
  "other",
  "bussiness",
  "salary",
];

const BudgetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    category: {
      type: String,
      enum: budgetCategories,
    },
    remaining_amount: {
      type: Number,
      required: true,
      default: 20000,
      min: [0, "Amount should be equal or greater than 0"],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount should be equal or greater than 0"],
    },
    month: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BudgetModel = mongoose.model("Budget", BudgetSchema);

export default BudgetModel;
