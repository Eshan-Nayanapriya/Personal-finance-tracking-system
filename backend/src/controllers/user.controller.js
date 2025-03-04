import UserModel from "../models/user.model.js";

// Get all users (admin only)
export async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find({}, '-password'); // Exclude passwords
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated to admin",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}