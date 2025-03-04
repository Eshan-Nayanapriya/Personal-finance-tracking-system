import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./src/configs/dbConfig.js";
import userRouter from "./src/routes/user.routes.js";
import authRouter from "./src/routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

const PORT = process.env.SERVER_PORT || 5001;

app.get("/", (req, res) => {
  res.send({ message: "Hello, I'm ok!, Server is running at port " + PORT });
});

const startServer = async () => {
  try {
    const dbConnection = await dbConnect();
    if (dbConnection === true) {
      try {
        app.listen(PORT, () => {
          console.info(`🚀 Server is running on port ${PORT}`);
        });
      } catch (error) {
        console.error("❌ Cannot start the server: ", error);
      }
    }
  } catch (error) {
    console.error("❌ Cannot start the server: ", error);
  }
};

startServer();
