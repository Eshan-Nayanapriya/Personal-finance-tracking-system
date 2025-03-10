import express from "express";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  getAllGoals,
} from "../controllers/goal.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const goalRouter = express.Router();
goalRouter.use(verifyToken);

goalRouter.post("/create", createGoal);
goalRouter.put("/:id", updateGoal);
goalRouter.delete("/:id", deleteGoal);
goalRouter.get("/", getAllGoals);

export default goalRouter;
