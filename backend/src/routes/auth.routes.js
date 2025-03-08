import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);

export default userRouter;
