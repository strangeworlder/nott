import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import jwt, { type Secret } from "jsonwebtoken";
import { config } from "../config";
import {
	AuthenticationError,
	ConflictError,
	createError,
} from "../middleware/errorHandler";
import { schemas } from "../middleware/validation";
import { userService } from "../services/userService";

/**
 * Register a new user
 */
export async function register(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { username, email, password } = req.body;

		const existing =
			(await userService.findByUsername(username)) ||
			(await userService.findByEmail(email));
		if (existing)
			return next(createError("Username or email already exists", 409));

		const password_hash = await bcrypt.hash(password, 10);
		const user = await userService.createUser({
			username,
			email,
			password_hash,
		});
		res
			.status(201)
			.json({ id: user.id, username: user.username, email: user.email });
	} catch (err) {
		next(err);
	}
}

/**
 * Log in a user and return JWT
 */
export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, password } = req.body;

		const user = await userService.findByEmail(email);
		if (!user) return next(createError("Invalid credentials", 401));

		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) return next(createError("Invalid credentials", 401));

		const token = jwt.sign(
			{ id: user.id, username: user.username },
			config.jwt.secret as Secret,
			{ expiresIn: String(config.jwt.expiresIn) } as jwt.SignOptions,
		);
		res.json({
			token,
			user: { id: user.id, username: user.username, email: user.email },
		});
	} catch (err) {
		next(err);
	}
}

/**
 * (Optional) Logout endpoint placeholder
 */
export function logout(_req: Request, res: Response) {
	// For stateless JWT, logout is handled client-side (token deletion)
	res.json({ message: "Logged out" });
}
