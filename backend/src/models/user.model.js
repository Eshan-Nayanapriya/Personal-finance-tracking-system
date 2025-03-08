import mongoose, { Schema } from "mongoose";

export const currencyCategories = [
  "USD",
  "LKR",
  "JPY",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
];

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user"],
      required: [true, "User Role is required"],
      unique: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      unique: false,
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      unique: false,
      enum: currencyCategories,
      default: "LKR",
    },
    transactionLimit: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
