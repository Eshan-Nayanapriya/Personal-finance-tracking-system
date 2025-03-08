import NotificationModel from "../models/notification.model.js";

// Get all notifications
export async function getAllNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await NotificationModel.find(
      { userId: userId },
      "-isRead -__v -userId"
    ); // Find all notifications for the user
    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
