import NotificationModel from "../models/notification.model.js";
import TransactionModel from "../models/transaction.model.js";
import BudgetModel from "../models/budget.model.js";

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

export async function NotificationGenerator(req, res) {
  try {
    const userId = req.user.id;
    const transactions = await TransactionModel.find({
      userId,
      isRecurring: true,
    }).lean();

    if (!transactions.length) {
      return res
        .status(404)
        .json({ success: false, message: "No recurring transactions found" });
    }

    const now = new Date();
    const notifications = [];

    transactions.forEach((transaction) => {
      const { recurrencePattern, createdAt, category } = transaction;
      const createdDate = new Date(createdAt);

      let shouldNotify = false;

      if (
        recurrencePattern === "daily" &&
        (now - createdDate) / (1000 * 60 * 60 * 24) >= 1
      ) {
        shouldNotify = true;
      } else if (
        recurrencePattern === "weekly" &&
        (now - createdDate) / (1000 * 60 * 60 * 24 * 7) >= 1
      ) {
        shouldNotify = true;
      } else if (
        recurrencePattern === "monthly" &&
        (now - createdDate) / (1000 * 60 * 60 * 24 * 30) >= 1
      ) {
        shouldNotify = true;
      }

      if (shouldNotify) {
        const newNotification = new NotificationModel({
          userId,
          section: "Transaction",
          title: "Recurring Transaction",
          message: `${recurrencePattern} recurring transaction missed for ${category}`,
        });

        notifications.push(newNotification.save());
      }
    });

    await Promise.all(notifications);

    res.status(200).json({
      success: true,
      message: "Notifications created for missed recurring transactions",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
