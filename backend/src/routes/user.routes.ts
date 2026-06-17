import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserRoleSchema, setUserActiveSchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", userController.list);
router.patch("/:id/role", validate(updateUserRoleSchema), userController.updateRole);
router.patch("/:id/active", validate(setUserActiveSchema), userController.setActive);

export default router;
