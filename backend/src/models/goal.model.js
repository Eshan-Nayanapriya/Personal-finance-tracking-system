import mongoose, { Schema } from "mongoose";

const GoalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: [1, "Target amount must be at least 1"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount can't be negative"],
    },
    targetDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date(); // Ensures future date
        },
        message: "Target date must be in the future",
      },
    },
    autoAllocationPercentage: {
      type: Number,
      default: 5,
      min: [0, "Percentage can't be negative"],
      max: [100, "Percentage can't exceed 100"],
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Auto-update status when currentAmount >= targetAmount
GoalSchema.pre("save", function (next) {
  if (this.currentAmount >= this.targetAmount) {
    this.status = "completed";
  }
  next();
});

// Prevent over-allocation of funds
GoalSchema.pre("save", function (next) {
  if (this.currentAmount > this.targetAmount) {
    this.currentAmount = this.targetAmount;
  }
  next();
});

export default mongoose.model("Goal", GoalSchema);
