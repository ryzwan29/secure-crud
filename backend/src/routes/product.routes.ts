import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  listQuerySchema,
} from "../validators/product.validator";

const router = Router();

// All product routes require a logged-in user (read included, since this
// is an internal admin/CRUD tool rather than a public catalog).
router.use(authenticate);

router.get("/", validate(listQuerySchema), productController.list);
router.get("/:id", validate(idParamSchema), productController.getById);
router.post("/", validate(createProductSchema), productController.create);
router.put("/:id", validate(updateProductSchema), productController.update);
router.delete("/:id", validate(idParamSchema), productController.remove);

export default router;
