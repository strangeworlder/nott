import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { createError } from "./errorHandler";

/**
 * Generic validation middleware factory
 * Creates middleware that validates request data using Zod schemas
 */
export const validate = (
	schema: z.ZodSchema,
	location: "body" | "query" | "params" = "body",
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const data = req[location];
			const validatedData = schema.parse(data);

			// Replace the original data with validated data
			req[location] = validatedData;

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessage = error.errors
					.map((err) => `${err.path.join(".")}: ${err.message}`)
					.join(", ");
				return next(createError(`Validation error: ${errorMessage}`, 400));
			}
			return next(createError("Validation failed", 400));
		}
	};
};

/**
 * Common validation schemas for NotT application
 */
export const schemas = {
	// Authentication schemas
	auth: {
		register: z.object({
			username: z
				.string()
				.min(3, "Username must be at least 3 characters")
				.max(50, "Username must be at most 50 characters")
				.regex(
					/^[a-zA-Z0-9_-]+$/,
					"Username can only contain letters, numbers, underscores, and hyphens",
				),
			email: z
				.string()
				.email("Invalid email format")
				.max(255, "Email must be at most 255 characters"),
			password: z
				.string()
				.min(8, "Password must be at least 8 characters")
				.max(100, "Password must be at most 100 characters")
				.regex(
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
					"Password must contain at least one lowercase letter, one uppercase letter, and one number",
				),
		}),

		login: z.object({
			email: z.string().email("Invalid email format"),
			password: z.string().min(1, "Password is required"),
		}),
	},

	// User profile schemas
	user: {
		updateProfile: z.object({
			username: z
				.string()
				.min(3, "Username must be at least 3 characters")
				.max(50, "Username must be at most 50 characters")
				.regex(
					/^[a-zA-Z0-9_-]+$/,
					"Username can only contain letters, numbers, underscores, and hyphens",
				)
				.optional(),
			email: z
				.string()
				.email("Invalid email format")
				.max(255, "Email must be at most 255 characters")
				.optional(),
			bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
			avatar_url: z
				.string()
				.url("Invalid URL format")
				.max(500, "Avatar URL must be at most 500 characters")
				.optional(),
		}),

		search: z.object({
			query: z
				.string()
				.min(1, "Search query is required")
				.max(100, "Search query must be at most 100 characters"),
			limit: z.coerce
				.number()
				.int("Limit must be an integer")
				.min(1, "Limit must be at least 1")
				.max(50, "Limit must be at most 50")
				.default(10),
		}),

		getById: z.object({
			id: z.string().uuid("Invalid user ID format"),
		}),
	},

	// Game schemas (for future implementation)
	game: {
		create: z.object({
			name: z
				.string()
				.min(1, "Game name is required")
				.max(100, "Game name must be at most 100 characters"),
			max_players: z
				.number()
				.int("Max players must be an integer")
				.min(2, "Max players must be at least 2")
				.max(5, "Max players must be at most 5")
				.default(5),
			settings: z.record(z.unknown()).optional(),
		}),

		update: z.object({
			name: z
				.string()
				.min(1, "Game name is required")
				.max(100, "Game name must be at most 100 characters")
				.optional(),
			max_players: z
				.number()
				.int("Max players must be an integer")
				.min(2, "Max players must be at least 2")
				.max(5, "Max players must be at most 5")
				.optional(),
			settings: z.record(z.unknown()).optional(),
		}),

		getById: z.object({
			id: z.string().uuid("Invalid game ID format"),
		}),

		join: z.object({
			role: z.enum(["director", "player"], {
				errorMap: () => ({
					message: 'Role must be either "director" or "player"',
				}),
			}),
			player_number: z
				.number()
				.int("Player number must be an integer")
				.min(1, "Player number must be at least 1")
				.max(4, "Player number must be at most 4")
				.optional(),
			character_name: z
				.string()
				.min(1, "Character name is required")
				.max(100, "Character name must be at most 100 characters")
				.optional(),
		}),
	},

	// Pagination schema
	pagination: z.object({
		page: z.coerce
			.number()
			.int("Page must be an integer")
			.min(1, "Page must be at least 1")
			.default(1),
		limit: z.coerce
			.number()
			.int("Limit must be an integer")
			.min(1, "Limit must be at least 1")
			.max(100, "Limit must be at most 100")
			.default(10),
	}),

	// UUID schema for common ID validation
	uuid: z.string().uuid("Invalid UUID format"),
};

/**
 * Custom error formatter for Zod validation errors
 */
export const formatZodError = (error: ZodError): string => {
	return error.errors
		.map((err) => {
			const path = err.path.join(".");
			return `${path}: ${err.message}`;
		})
		.join(", ");
};

/**
 * Type-safe validation helper
 * Returns the validated data with proper typing
 */
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
	return schema.parse(data);
};

/**
 * Safe validation helper that doesn't throw
 * Returns the validated data or null if validation fails
 */
export const safeValidate = <T>(
	schema: z.ZodSchema<T>,
	data: unknown,
): T | null => {
	try {
		return schema.parse(data);
	} catch {
		return null;
	}
};
