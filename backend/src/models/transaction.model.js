import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "UserID is required"],
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["USD", "LKR", "JPY", "EUR", "GBP", "AUD", "CAD", "CHF"],
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  category: {
    type: String,
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
  recurrencePattern: String,
  description: String,
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
