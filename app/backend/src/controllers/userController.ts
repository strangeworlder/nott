import type { NextFunction, Request, Response } from "express";
import { createError } from "../middleware/errorHandler";
import { userService } from "../services/userService";

/**
 * Get current user profile
 */
export async function getProfile(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		if (!req.user) {
			return next(createError("User not found", 404));
		}

		const user = await userService.findById(req.user.id);
		if (!user) {
			return next(createError("User not found", 404));
		}

		// Don't return password_hash
		const { password_hash, ...userProfile } = user;
		res.json(userProfile);
	} catch (err) {
		next(err);
	}
}

/**
 * Update current user profile
 */
export async function updateProfile(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		if (!req.user) {
			return next(createError("User not found", 404));
		}

		const updateData = req.body;
		const updatedUser = await userService.updateUser(req.user.id, updateData);

		if (!updatedUser) {
			return next(createError("User not found", 404));
		}

		// Don't return password_hash
		const { password_hash, ...userProfile } = updatedUser;
		res.json(userProfile);
	} catch (err) {
		next(err);
	}
}

/**
 * Get user by ID (public profile)
 */
export async function getUserById(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { id } = req.params;
		const user = await userService.findById(id);

		if (!user) {
			return next(createError("User not found", 404));
		}

		// Return public profile only
		const { password_hash, email, ...publicProfile } = user;
		res.json(publicProfile);
	} catch (err) {
		next(err);
	}
}

/**
 * Search users
 */
export async function searchUsers(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const { query, limit } = req.query;
		const users = await userService.searchUsers(query as string, Number(limit));

		// Return public profiles only
		const publicUsers = users.map((user) => {
			const { password_hash, email, ...publicProfile } = user;
			return publicProfile;
		});

		res.json(publicUsers);
	} catch (err) {
		next(err);
	}
}
