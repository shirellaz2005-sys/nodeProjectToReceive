import { Router } from "express";
import { login, register } from "../controllers/user.controller.js";
import { validateSchema } from "../middleware/validateJoi.middleware.js";
import { loginSchema, registerSchema } from "../validation/user.validation.js";

const router = Router();

router.post("/register", validateSchema(registerSchema), register);
router.post("/login", validateSchema(loginSchema), login);

export default router;
