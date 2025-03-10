import BudgetModel from "../models/budget.model.js";
import { convertCurrency } from "../services/currency.service.js";
import UserModel from "../models/user.model.js";
import { budgetCategories } from "../models/budget.model.js";
import { currencyCategories } from "../models/user.model.js";
import NotificationModel from "../models/notification.model.js";
import GoalModel from "../models/goal.model.js";
import moment from "moment";

//create a budget
export async function createBudget(req, res) {
  try {
    const userId = req.user.id;
    let { category, amount, month, currency } = req.body;

    const currentMonth = moment().format("YYYY-MM"); //used moment to change date format

    // Validate required fields
    if (!category && !month) {
      return res.status(400).json({
        success: false,
        message:
          "Budget should be monthly or category-specific, So month or category is required",
      });
    } else if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "Amount and Currency are required",
      });
    }

    // Get user's base currency
    const user = await UserModel.findById(userId);
    if (!user?.currency) {
      return res.status(400).json({
        success: false,
        message: "User currency not found",
      });
    }

    const name = user.name;

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

    if (!category) {
      category = "monthly budget";
    } else {
      // Validate category
      if (!budgetCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid budget category. Please use the following categories - food, housing, transport, insurance, healthcare, education, entertainment, savings, debt, other",
        });
      }
    }

    // If no month is provided, use the current month
    if (!month) {
      month = currentMonth;
    } else {
      // Validate provided month format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month format. Please use 'YYYY-MM' format.",
        });
      }

      // Check if the provided month is in the past
      if (moment(month, "YYYY-MM").isBefore(moment(currentMonth, "YYYY-MM"))) {
        return res.status(400).json({
          success: false,
          message: "Cannot create a budget for a past month.",
        });
      }
    }

    // Check if a budget for the same category and month already exists
    const existingBudget = await BudgetModel.findOne({
      userId,
      category,
      month,
    });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `A budget for category '${category}' already exists for the month '${month}', Try updating the existing budget instead or choose a different category or month.`,
      });
    }

    if (category !== "monthly budget") {
      const existingMonthlyBudget = await BudgetModel.findOne({
        userId,
        category: "monthly budget",
        month,
      });
      if (!existingMonthlyBudget) {
        return res.status(400).json({
          success: false,
          message: `Monthly budget not found for the month '${month}', Please create a monthly budget first.`,
        });
      }

      // Deduct the category budget amount from the monthly budget
      if (existingMonthlyBudget.remaining_amount - convertedAmount < 0) {
        return res.status(400).json({
          success: false,
          message: `Monthly budget is not enough to create a budget for category '${category}'`,
        });
      } else {
        existingMonthlyBudget.remaining_amount -= convertedAmount;
        await existingMonthlyBudget.save();
      }
      if (existingMonthlyBudget.remaining_amount === 0) {
        const newNotification = new NotificationModel({
          userId,
          section: "Budget",
          title: "Monthly Budget Exhausted",
          message: `Monthly budget exhausted for the month ${month}`,
        });
        await newNotification.save();
      } else if (existingMonthlyBudget.remaining_amount < 5000) {
        const newNotification = new NotificationModel({
          userId,
          section: "Budget",
          title: "Monthly Budget is very low",
          message: `Monthly budget is very low for the month ${month}`,
        });
        await newNotification.save();
      }
    }

    const newBudget = new BudgetModel({
      userId,
      name,
      category,
      remaining_amount: convertedAmount,
      amount: convertedAmount,
      month,
    });

    const savedBudget = await newBudget.save();

    const newNotification = new NotificationModel({
      userId,
      section: "Budget",
      title: "Budget Created",
      message: `New budget created for ${category}`,
    });

    await newNotification.save();

    return res.status(201).json({
      success: true,
      data: {
        ...savedBudget.toObject(), //toObject() to convert to JSON object
        originalAmount: amount,
        originalCurrency: currency,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message.includes("validation") //check if error message contains "validation"
        ? "Invalid budget data"
        : error.message,
    });
  }
}

// Get all budgets for the user (with filters)
export async function getAllBudgets(req, res) {
  try {
    const userId = req.user.id;
    const { month, category } = req.query;

    const filter = { userId };
    if (month) filter.month = month; // Filter by month
    if (category) filter.category = category; // Filter by category

    const budgets = await BudgetModel.find(filter).lean(); // Lean to convert to JSON object
    res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Update a budget
export async function updateBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const updates = req.body;

    const budget = await BudgetModel.findOne({ _id: budgetId, userId });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    let category = budget.category;
    let month = budget.month;

    if (updates.currency && !currencyCategories.includes(updates.currency)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid currency category, Please use following currency categories: USD, LKR, JPY, EUR, GBP, AUD, CAD, CHF",
      });
    }

    // Handle currency conversion if amount/currency is updated
    if (updates.amount || updates.currency) {
      const user = await UserModel.findById(userId);
      const convertedAmount = await convertCurrency(
        updates.amount || budget.amount,
        updates.currency || user.currency,
        user.currency
      );
      updates.amount = convertedAmount;
    }

    if (updates.amount) {
      const amountDifference = updates.amount - budget.amount;
      updates.remaining_amount = budget.remaining_amount + amountDifference;
    }

    if (updates.month) {
      // Validate provided month format
      if (!/^\d{4}-\d{2}$/.test(updates.month)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month format. Please use 'YYYY-MM' format.",
        });
      }

      // Check if the provided month is in the past
      const currentMonth = moment().format("YYYY-MM");
      if (
        moment(updates.month, "YYYY-MM").isBefore(
          moment(currentMonth, "YYYY-MM")
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot update a budget to a past month.",
        });
      }

      month = updates.month;
    }

    // Check if a budget for the same category and month already exists
    const existingBudget = await BudgetModel.findOne({
      userId,
      category,
      month,
      _id: { $ne: budgetId },
    });

    if (
      budget.category === "monthly budget" &&
      updates.category !== "monthly budget"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot change the category of a monthly budget",
      });
    }

    if (updates.category && budgetCategories.includes(updates.category)) {
      category = updates.category;
    } else if (updates.category) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid budget category. Please use the following categories - food, housing, transport, insurance, healthcare, education, entertainment, savings, debt, other",
      });
    }

    if (updates.category && existingBudget) {
      return res.status(400).json({
        success: false,
        message: `A budget for category '${category}' already exists for the month '${month}', Try choosing a different category or month.`,
      });
    }

    if (updates.category !== "monthly budget") {
      const existingMonthlyBudget = await BudgetModel.findOne({
        userId,
        category: "monthly budget",
        month,
      });
      if (!existingMonthlyBudget) {
        return res.status(400).json({
          success: false,
          message: `Monthly budget not found for the month '${month}', Please create a monthly budget first.`,
        });
      }

      if (updates.amount) {
        const amountDifference = updates.amount - budget.amount;
        if (existingMonthlyBudget.remaining_amount - amountDifference < 0) {
          return res.status(400).json({
            success: false,
            message: `Monthly budget is not enough to update the budget for category '${category}'`,
          });
        } else {
          existingMonthlyBudget.remaining_amount -= amountDifference;
        }
      }
      await existingMonthlyBudget.save();
      if (existingMonthlyBudget.remaining_amount === 0) {
        const newNotification = new NotificationModel({
          userId,
          section: "Budget",
          title: "Monthly Budget Exhausted",
          message: `Monthly budget exhausted for the month ${month}`,
        });
        await newNotification.save();
      } else if (existingMonthlyBudget.remaining_amount < 5000) {
        const newNotification = new NotificationModel({
          userId,
          section: "Budget",
          title: "Monthly Budget is very low",
          message: `Monthly budget is very low for the month ${month}`,
        });
        await newNotification.save();
      }
    }

    const updatedBudget = await BudgetModel.findByIdAndUpdate(
      budgetId,
      updates,
      { new: true }
    );

    const newNotification = new NotificationModel({
      userId,
      section: "Budget",
      title: "Budget Updated",
      message: `Budget updated for ${category}`,
    });

    await newNotification.save();

    res.status(200).json({ success: true, data: updatedBudget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Delete a budget
export async function deleteBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await BudgetModel.findOneAndDelete({
      _id: budgetId,
      userId,
    });
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    const newNotification = new NotificationModel({
      userId,
      section: "Budget",
      title: "Budget Deleted",
      message: `budget deleted for ${budget.category}`,
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//monthly budget report
export async function createBudgetReport(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.body;

    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month is required" });
    }

    const filter = { userId, month };

    const budgets = await BudgetModel.find(filter).lean();
    if (!budgets.length) {
      return res
        .status(404)
        .json({ success: false, message: "Budgets not found" });
    }

    const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
    const report = {
      totalBudget,
      totalCategories: budgets.length,
      data: budgets,
    };

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Auto-allocate remaining monthly budget to goals for the current logged-in user
export async function allocateRemainingBudgetToGoals(req, res) {
  try {
    const userId = req.user.id;
    const currentMonth = moment().format("YYYY-MM");

    // Find the user's monthly budget for the current month
    const monthlyBudget = await BudgetModel.findOne({
      userId,
      category: "monthly budget",
      month: currentMonth,
    });

    if (!monthlyBudget) {
      return res.status(404).json({
        success: false,
        message: `Monthly budget not found for the month '${currentMonth}'`,
      });
    }

    if (monthlyBudget.remaining_amount <= 0) {
      console.log("No remaining amount to allocate");
      return res.status(400).json({
        success: false,
        message: "No remaining amount to allocate",
      });
    }

    // Find active goals for the user
    const activeGoals = await GoalModel.find({ userId, status: "active" });
    console.log("Active goals", activeGoals);

    if (activeGoals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active goals found for allocation",
      });
    }

    // Calculate total allocation percentage sum
    const totalPercentage = activeGoals.reduce(
      (acc, goal) => acc + (goal.autoAllocationPercentage || 0), // changed: ensure autoAllocationPercentage is defined
      0
    );

    // If allocation percentage exceeds 100%, adjust proportionally
    const normalizedFactor = totalPercentage > 100 ? 100 / totalPercentage : 1;

    for (const goal of activeGoals) {
      // Ensure goal has the necessary properties
      if (
        goal.autoAllocationPercentage === undefined ||
        goal.currentAmount === undefined ||
        goal.targetAmount === undefined
      ) {
        continue; // Skip this goal if it doesn't have the necessary properties
      }

      // Calculate the amount to allocate based on percentage
      const allocatedAmount =
        ((monthlyBudget.remaining_amount * goal.autoAllocationPercentage) /
          100) *
        normalizedFactor;

      // Update goal's current amount
      goal.currentAmount += allocatedAmount;

      // Deduct the allocated amount from the monthly budget
      monthlyBudget.remaining_amount -= allocatedAmount;

      // If goal is fully funded, mark as completed
      if (goal.currentAmount >= goal.targetAmount) {
        goal.currentAmount = goal.targetAmount;
        goal.status = "completed";

        // Notify user about goal completion
        const notification = new NotificationModel({
          userId,
          section: "Goals",
          title: "Goal Completed",
          message: `Goal '${goal.name}' has been completed`,
        });

        await notification.save();
      }

      await goal.save();
    }

    await monthlyBudget.save();

    // Notify user about allocation
    const notification = new NotificationModel({
      userId,
      section: "Budget",
      title: "Auto Allocation Complete",
      message: `Remaining budget for ${currentMonth} has been allocated to your goals.`,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Remaining budget allocated to goals successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
