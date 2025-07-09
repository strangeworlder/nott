import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { createError } from "./errorHandler";

// JWT payload interface
interface JWTPayload {
	id: string;
	username: string;
	email: string;
	iat?: number;
	exp?: number;
}

// Extend Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				username: string;
				email: string;
			};
		}
	}
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1]; // Bearer TOKEN

	if (!token) {
		return next(createError("Access token required", 401));
	}

	try {
		const secret = config.jwt.secret;
		if (!secret) {
			throw new Error("JWT secret not configured");
		}

		const decoded = jwt.verify(token, secret) as JWTPayload;

		// Inject user context into request
		req.user = {
			id: String(decoded.id),
			username: decoded.username,
			email: decoded.email,
		};

		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(createError("Token expired", 401));
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return next(createError("Invalid token", 401));
		}
		return next(createError("Token verification failed", 401));
	}
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];

	if (!token) {
		return next(); // Continue without user context
	}

	try {
		const secret = config.jwt.secret;
		if (!secret) {
			return next(); // Continue without user context
		}

		const decoded = jwt.verify(token, secret) as JWTPayload;

		req.user = {
			id: String(decoded.id),
			username: decoded.username,
			email: decoded.email,
		};

		next();
	} catch (error) {
		// Continue without user context on token errors
		next();
	}
};

/**
 * Role-based authorization middleware
 * Ensures user has required role (director or player)
 */
export const requireRole = (requiredRole: "director" | "player") => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		if (!req.user) {
			return next(createError("Authentication required", 401));
		}

		// This would typically check against game_players table
		// For now, we'll implement a basic version
		// TODO: Implement proper role checking based on game context

		next();
	};
};

/**
 * Game-specific authorization middleware
 * Ensures user is a participant in the specified game
 */
export const requireGameAccess = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	if (!req.user) {
		return next(createError("Authentication required", 401));
	}

	const gameId = req.params.gameId || req.body.gameId;
	if (!gameId) {
		return next(createError("Game ID required", 400));
	}

	// TODO: Implement game access validation
	// Check if user is director or player in the specified game
	// This will be implemented when we have game management endpoints

	next();
};
