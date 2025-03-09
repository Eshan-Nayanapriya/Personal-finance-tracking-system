import GoalModel from "../models/goal.model.js";

export async function createGoal(req, res) {
  try {
    const userId = req.user.id;
    const { name, targetAmount, targetDate, autoAllocationPercentage } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: "Name, target amount, and target date are required"
      });

    }

    // Validate future date
    if (new Date(targetDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Target date must be in the future"
      });
    }

    
    if (autoAllocationPercentage < 0 || autoAllocationPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Auto allocation percentage must be between 0 and 100"
      });
    }

    const goal = await GoalModel.create({
      userId,
      name,
      targetAmount,
      targetDate,
      autoAllocationPercentage
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateGoal(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, targetAmount, targetDate, autoAllocationPercentage } = req.body;

    const goal = await GoalModel.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    if (name) goal.name = name;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (targetDate) {
      if (new Date(targetDate) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Target date must be in the future"
        });
      }
      goal.targetDate = targetDate;
    }
    if (autoAllocationPercentage !== undefined) {
      if (autoAllocationPercentage < 0 || autoAllocationPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: "Auto allocation percentage must be between 0 and 100"
        });
      }
      goal.autoAllocationPercentage = autoAllocationPercentage;
    }

    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteGoal(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const goal = await GoalModel.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllGoals(req, res) {
  try {
    const userId = req.user.id;

    const goals = await GoalModel.find({ userId });

    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}