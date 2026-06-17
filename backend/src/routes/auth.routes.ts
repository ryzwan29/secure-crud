import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

router.get("/setup", authController.checkSetup);
router.post("/setup", authLimiter, validate(registerSchema), authController.setup);
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;