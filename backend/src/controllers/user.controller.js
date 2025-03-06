import UserModel from "../models/user.model.js";
import TransactionModel from "../models/transaction.model.js";

// Get all users (admin only)
export async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find({}, "-password"); // Exclude passwords
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete user (admin only)
export async function deleteUser(req, res) {
  try {
    const userId = req.params.userId;

    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Assign admin role (admin only)
export async function assignAdminRole(req, res) {
  try {
    const userId = req.params.userId;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated to admin",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all transactions (admin only)
export async function getAllTransactions(req, res) {
  try {
    const transactions = await TransactionModel.find({});
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//adjust system settings, change transaction limits (admin only)
export async function updateTransactionLimit(req, res) {
  try {
    const { newLimit } = req.body;

    if (!newLimit || typeof newLimit !== "number" || newLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction limit. It must be a positive number.",
      });
    }

    const result = await UserModel.updateMany(
      {},
      { transactionLimit: newLimit }
    );

    console.log(`Updated ${result.modifiedCount} users.`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users updated.`,
    });
  } catch (error) {
    console.error("Error updating transaction limit:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
