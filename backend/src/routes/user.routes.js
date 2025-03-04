import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  deleteUser,
  assignAdminRole,
} from "../controllers/user.controller.js";

const userRouter = Router();

// Middleware to check if user is an admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

//only admin can access this route
userRouter.get("/admin", verifyToken, authorizeAdmin, (req, res) => {
  return res.json({ message: "Admin dashboard", user: req.user });
});

// Admin-only routes
userRouter.get("/admin/users", verifyToken, authorizeAdmin, getAllUsers);
userRouter.delete("/admin/users/:userId", verifyToken, authorizeAdmin, deleteUser);
userRouter.put("/admin/users/assign-admin/:userId", verifyToken, authorizeAdmin, assignAdminRole);

//only admin, user can access this route
userRouter.get("/user", (req, res) => {
  return res.json({ message: "User dashboard", user: req.user });
});

export default userRouter;
