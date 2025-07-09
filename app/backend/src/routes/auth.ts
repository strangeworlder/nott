import { Router } from "express";
import { login, logout, register } from "../controllers/authController";
import { schemas, validate } from "../middleware/validation";

const router = Router();

// Auth routes with Zod validation
router.post("/register", validate(schemas.auth.register), register);
router.post("/login", validate(schemas.auth.login), login);
router.post("/logout", logout);

export default router;
