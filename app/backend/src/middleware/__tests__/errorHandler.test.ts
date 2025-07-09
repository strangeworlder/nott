import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type AppError,
	AuthenticationError,
	AuthorizationError,
	ConflictError,
	DatabaseError,
	NotFoundError,
	ValidationError,
	asyncHandler,
	createError,
	errorHandler,
	notFoundHandler,
} from "../errorHandler";

// Mock Express objects
const mockRequest = (url = "/test", method = "GET", ip = "127.0.0.1") =>
	({
		url,
		method,
		ip,
		originalUrl: url,
		get: vi.fn().mockReturnValue("test-user-agent"),
	}) as unknown as Request;

const mockResponse = () => {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res;
};

const mockNext = vi.fn() as unknown as NextFunction;

describe("Error Handling Middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console methods to avoid noise in tests
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	describe("errorHandler", () => {
		it("should handle AppError with status code", () => {
			const error = createError("Test error", 400, "TEST_ERROR");
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "TEST_ERROR",
					message: "Test error",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});

		it("should handle errors without status code", () => {
			const error = new Error("Generic error");
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error as AppError, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "Generic error",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});

		it("should include error details when provided", () => {
			const error = createError("Validation failed", 400, "VALIDATION_ERROR", {
				field: "email",
			});
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Validation failed",
					details: { field: "email" },
					timestamp: expect.any(String),
				},
			});
		});

		it("should log errors with context", () => {
			const error = createError("Test error", 500);
			const req = mockRequest("/api/test", "POST", "192.168.1.1");
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(console.error).toHaveBeenCalledWith(
				"🚨 Critical Error:",
				expect.objectContaining({
					statusCode: 500,
					message: "Test error",
					url: "/api/test",
					method: "POST",
					ip: "192.168.1.1",
					userAgent: "test-user-agent",
				}),
			);
		});
	});

	describe("Custom Error Classes", () => {
		it("should handle ValidationError", () => {
			const error = new ValidationError("Invalid input", { field: "email" });
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Invalid input",
					details: { field: "email" },
					timestamp: expect.any(String),
				},
			});
		});

		it("should handle AuthenticationError", () => {
			const error = new AuthenticationError("Invalid credentials");
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "AUTHENTICATION_ERROR",
					message: "Invalid credentials",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});

		it("should handle AuthorizationError", () => {
			const error = new AuthorizationError("Access denied");
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "AUTHORIZATION_ERROR",
					message: "Access denied",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});

		it("should handle NotFoundError", () => {
			const error = new NotFoundError("User not found");
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "NOT_FOUND",
					message: "User not found",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});

		it("should handle ConflictError", () => {
			const error = new ConflictError("Username already exists");
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "CONFLICT",
					message: "Username already exists",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});

		it("should handle DatabaseError", () => {
			const originalError = new Error("Connection failed");
			const error = new DatabaseError(
				"Database operation failed",
				originalError,
			);
			const req = mockRequest();
			const res = mockResponse();

			errorHandler(error, req, res, mockNext);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "DATABASE_ERROR",
					message: "Database operation failed",
					details: null,
					timestamp: expect.any(String),
				},
			});
		});
	});

	describe("createError", () => {
		it("should create error with default values", () => {
			const error = createError("Test error");

			expect(error.message).toBe("Test error");
			expect(error.statusCode).toBe(500);
			expect(error.code).toBeUndefined();
			expect(error.details).toBeUndefined();
			expect(error.isOperational).toBe(false);
		});

		it("should create error with custom values", () => {
			const error = createError("Test error", 400, "CUSTOM_ERROR", {
				field: "test",
			});

			expect(error.message).toBe("Test error");
			expect(error.statusCode).toBe(400);
			expect(error.code).toBe("CUSTOM_ERROR");
			expect(error.details).toEqual({ field: "test" });
			expect(error.isOperational).toBe(true);
		});
	});

	describe("asyncHandler", () => {
		it("should wrap async function and catch errors", async () => {
			const asyncFn = vi.fn().mockImplementation(async () => {
				throw new Error("Async error");
			});
			const handler = asyncHandler(asyncFn);
			const req = mockRequest();
			const res = mockResponse();

			console.log("Before calling handler");
			await handler(req, res, mockNext);
			console.log("After calling handler");
			console.log(
				"mockNext calls:",
				(mockNext as ReturnType<typeof vi.fn>).mock.calls.length,
			);

			expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
			expect(
				(mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0].message,
			).toBe("Async error");
		});

		it("should pass through successful async operations", async () => {
			const asyncFn = vi.fn().mockResolvedValue(undefined);
			const handler = asyncHandler(asyncFn);
			const req = mockRequest();
			const res = mockResponse();

			await handler(req, res, mockNext);

			expect(asyncFn).toHaveBeenCalledWith(req, res, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("notFoundHandler", () => {
		it("should create NotFoundError for unmatched routes", () => {
			const req = mockRequest("/api/nonexistent", "POST");
			const res = mockResponse();

			notFoundHandler(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Route POST /api/nonexistent not found",
					statusCode: 404,
					code: "NOT_FOUND",
				}),
			);
		});
	});

	// describe('Global Error Handlers', () => {
	//   it('should handle uncaught exceptions', () => {
	//     const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
	//       throw new Error('exit');
	//     });
	//     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	//
	//     const error = new Error('Uncaught exception');
	//
	//     try {
	//       const { handleUncaughtException } = require('../errorHandler');
	//       handleUncaughtException(error);
	//     } catch {
	//       // Expected to exit
	//     }
	//
	//     expect(consoleSpy).toHaveBeenCalledWith('🚨 Uncaught Exception:', error);
	//     expect(mockExit).toHaveBeenCalledWith(1);
	//   });
	//
	//   it('should handle unhandled promise rejections', () => {
	//     const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
	//       throw new Error('exit');
	//     });
	//     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	//
	//     const reason = 'Promise rejection reason';
	//     const promise = Promise.reject(reason);
	//
	//     try {
	//       const { handleUnhandledRejection } = require('../errorHandler');
	//       handleUnhandledRejection(reason, promise);
	//     } catch {
	//       // Expected to exit
	//     }
	//
	//     expect(consoleSpy).toHaveBeenCalledWith('🚨 Unhandled Promise Rejection:', reason);
	//     expect(consoleSpy).toHaveBeenCalledWith('Promise:', promise);
	//     expect(mockExit).toHaveBeenCalledWith(1);
	//   });
	// });
});
