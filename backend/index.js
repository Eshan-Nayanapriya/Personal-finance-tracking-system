import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./src/configs/dbConfig.js";
import userRouter from "./src/routes/user.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import budgetRouter from "./src/routes/budget.routes.js";
import transactionRouter from "./src/routes/transaction.route.js";
import notificationRouter from "./src/routes/notification.routes.js";
import reportRouter from "./src/routes/report.route.js";
import goalRouter from "./src/routes/goal.route.js";
import cron from "node-cron";
import { allocateRemainingBudgetToGoals } from "./src/controllers/budget.controller.js";
import helmet from "helmet";

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/reports", reportRouter);
app.use("/api/goals", goalRouter);

// // Schedule the task to run at 23:59 on the last day of every month
// cron.schedule("59 23 L * *", async () => {
//   console.log("🔄 Running auto allocation for goals...");
//   await allocateRemainingBudgetToGoals();
// });

const PORT = process.env.SERVER_PORT || 5001;

app.get("/", (req, res) => {
  res.send({ message: "Hello, I'm ok!, Server is running at port " + PORT });
});

export const startServer = async () => {
  try {
    const dbConnection = await dbConnect();
    if (dbConnection === true) {
      try {
        const serverInstance = app.listen(PORT, () => {
          if (process.env.NODE_ENV !== "test") {
            console.info(`🚀 Server is running on port ${PORT}`);
          }
        });
        return serverInstance;
      } catch (error) {
        console.error("❌ Cannot start the server: ", error);
      }
    }
  } catch (error) {
    console.error("❌ Cannot start the server: ", error);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
