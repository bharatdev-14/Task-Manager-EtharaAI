import { Router } from "express";
import { getMe, login, signup } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authRateLimit } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, signupSchema } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/signup", authRateLimit, validate(signupSchema), signup);
authRouter.post("/register", authRateLimit, validate(signupSchema), signup);
authRouter.post("/login", authRateLimit, validate(loginSchema), login);
authRouter.get("/me", authenticate, getMe);
