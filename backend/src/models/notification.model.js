import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "UserID is required"],
  },
  section:{
    type: String,
    required: [true, "Section is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const NotificationModel = mongoose.model("Notification", notificationSchema); // Create a model from the schema
export default NotificationModel; // Export the model
