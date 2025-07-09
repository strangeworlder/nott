import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

export interface AppError extends Error {
	statusCode?: number;
	code?: string;
	details?: unknown;
	isOperational?: boolean;
}

// Custom error classes for different types of errors
export class ValidationError extends Error implements AppError {
	statusCode = 400;
	code = "VALIDATION_ERROR";
	isOperational = true;

	constructor(
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = "ValidationError";
	}
}

export class AuthenticationError extends Error implements AppError {
	statusCode = 401;
	code = "AUTHENTICATION_ERROR";
	isOperational = true;

	constructor(message = "Authentication failed") {
		super(message);
		this.name = "AuthenticationError";
	}
}

export class AuthorizationError extends Error implements AppError {
	statusCode = 403;
	code = "AUTHORIZATION_ERROR";
	isOperational = true;

	constructor(message = "Access denied") {
		super(message);
		this.name = "AuthorizationError";
	}
}

export class NotFoundError extends Error implements AppError {
	statusCode = 404;
	code = "NOT_FOUND";
	isOperational = true;

	constructor(message = "Resource not found") {
		super(message);
		this.name = "NotFoundError";
	}
}

export class ConflictError extends Error implements AppError {
	statusCode = 409;
	code = "CONFLICT";
	isOperational = true;

	constructor(message = "Resource conflict") {
		super(message);
		this.name = "ConflictError";
	}
}

export class DatabaseError extends Error implements AppError {
	statusCode = 500;
	code = "DATABASE_ERROR";
	isOperational = false;

	constructor(
		message: string,
		public originalError?: Error,
	) {
		super(message);
		this.name = "DatabaseError";
	}
}

/**
 * Centralized error handling middleware
 * Handles all errors and provides consistent error responses
 */
export const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";
	const code = err.code || "INTERNAL_ERROR";
	const details = err.details || null;
	const isOperational = err.isOperational ?? true;

	// Log error with context
	const errorLog = {
		statusCode,
		message,
		code,
		details,
		stack: err.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
		timestamp: new Date().toISOString(),
		isOperational,
	};

	// Log based on error type and environment
	if (statusCode >= 500 || !isOperational) {
		console.error("🚨 Critical Error:", errorLog);
	} else if (statusCode >= 400) {
		console.warn("⚠️  Client Error:", errorLog);
	} else {
		console.log("ℹ️  Info Error:", errorLog);
	}

	// Don't expose internal errors in production
	const responseMessage =
		config.nodeEnv === "production" && statusCode >= 500
			? "Internal Server Error"
			: message;

	const responseDetails =
		config.nodeEnv === "production" && statusCode >= 500 ? null : details;

	res.status(statusCode).json({
		success: false,
		error: {
			code,
			message: responseMessage,
			details: responseDetails,
			timestamp: new Date().toISOString(),
		},
	});
};

/**
 * Create custom errors with consistent interface
 */
export const createError = (
	message: string,
	statusCode = 500,
	code?: string,
	details?: unknown,
): AppError => {
	const error = new Error(message) as AppError;
	error.statusCode = statusCode;
	error.isOperational = statusCode < 500;

	if (code) {
		error.code = code;
	}
	if (details) {
		error.details = details;
	}
	return error;
};

/**
 * Async error wrapper for Express routes
 * Automatically catches async errors and passes them to error handler
 */
export const asyncHandler = (
	fn: (...args: unknown[]) => Promise<unknown> | unknown,
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const error = new NotFoundError(
		`Route ${req.method} ${req.originalUrl} not found`,
	);
	next(error);
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (error: Error) => {
	console.error("🚨 Uncaught Exception:", error);
	process.exit(1);
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (
	reason: unknown,
	promise: Promise<unknown>,
) => {
	console.error("🚨 Unhandled Promise Rejection:", reason);
	console.error("Promise:", promise);
	process.exit(1);
};
