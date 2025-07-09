import { Router } from "express";
import {
	getProfile,
	getUserById,
	searchUsers,
	updateProfile,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import { schemas, validate } from "../middleware/validation";

const router = Router();

// Protected user routes with JWT authentication and Zod validation
router.get("/profile", authenticateToken, getProfile);
router.put(
	"/profile",
	authenticateToken,
	validate(schemas.user.updateProfile),
	updateProfile,
);

// Public user routes with validation
router.get("/search", validate(schemas.user.search, "query"), searchUsers);
router.get("/:id", validate(schemas.user.getById, "params"), getUserById);

export default router;
