import mongoose, { Schema } from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
