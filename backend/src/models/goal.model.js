import mongoose, { Schema } from "mongoose";

const GoalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: [1, "Target amount must be at least 1"]
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, "Current amount can't be negative"]
  },
  targetDate: {
    type: Date,
    required: true
  },
  autoAllocationPercentage: {
    type: Number,
    default: 5,
    min: [0, "Percentage can't be negative"],
    max: [100, "Percentage can't exceed 100"]
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  }
}, { timestamps: true });

export default mongoose.model("Goal", GoalSchema);