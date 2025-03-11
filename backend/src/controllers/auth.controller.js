import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

//Register
export async function register(request, response) {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        message: "Name, Email and Password are required!",
        error: true,
        success: false,
      });
    }

    //Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return response.status(409).json({
        message: "Email already registered!",
        error: true,
        success: false,
      });
    }

    //Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new UserModel(payload);
    const savedUser = await newUser.save();

    return response.status(201).json({
      message: "User registered successfully!",
      data: savedUser,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//Login
export async function login(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and Password are required!",
        error: true,
        success: false,
      });
    }

    //Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(404).json({
        message: "User not found. Please register first!",
        error: true,
        success: false,
      });
    }

    //Check if password is correct
    const checkpassword = await bcryptjs.compare(password, user.password);
    if (!checkpassword) {
      return response.status(400).json({
        message: "Incorrect Password!",
        error: true,
        success: false,
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return response.status(200).json({
      message: "User logged in successfully!",
      data: {
        user: { id: user._id, name: user.name, role:user.role, email: user.email },
        accessToken,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
