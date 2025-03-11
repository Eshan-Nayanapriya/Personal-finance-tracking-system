import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Check if MongoDB URI is set in .env file
if (!process.env.MONGODB_URI) {
  console.error("MongoDB URI is missing");
  process.exit(1);
}

// Connect to MongoDB
async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("🛢️  Database connected");
    return true;
  } catch (error) {
    console.log("❌🛢️ Database connection failed: ", error);
    return false;
  }
}

export default dbConnect;
