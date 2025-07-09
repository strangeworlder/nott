import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticateToken, optionalAuth } from "../auth";
import { createError } from "../errorHandler";

// Mock dependencies
vi.mock("../../config", () => ({
	config: {
		jwt: {
			secret: "test-secret",
			expiresIn: "1h",
		},
	},
}));

// Mock the error handler
vi.mock("../errorHandler", () => ({
	createError: vi.fn((message: string, statusCode: number) => {
		const error = new Error(message) as Error & {
			statusCode: number;
			isOperational: boolean;
		};
		error.statusCode = statusCode;
		error.isOperational = statusCode < 500;
		return error;
	}),
}));

// Mock Express objects
const mockRequest = (headers: Record<string, string> = {}) =>
	({
		headers,
		user: undefined,
	}) as unknown as Request;

const mockResponse = () => {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res;
};

const mockNext = vi.fn() as ReturnType<typeof vi.fn>;

describe("JWT Authentication Middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("authenticateToken", () => {
		it("should authenticate valid token and inject user context", async () => {
			const token = jwt.sign(
				{ id: "user-123", username: "testuser", email: "test@example.com" },
				"test-secret",
				{ expiresIn: "1h" },
			);

			const req = mockRequest({ authorization: `Bearer ${token}` });
			const res = mockResponse();

			await authenticateToken(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.user).toEqual({
				id: "user-123",
				username: "testuser",
				email: "test@example.com",
			});
		});

		it("should reject request without token", async () => {
			const req = mockRequest();
			const res = mockResponse();

			await authenticateToken(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
				}),
			);
			expect(mockNext.mock.calls[0][0].message).toBe("Access token required");
		});

		it("should reject invalid token", async () => {
			const req = mockRequest({ authorization: "Bearer invalid-token" });
			const res = mockResponse();

			await authenticateToken(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
				}),
			);
			expect(mockNext.mock.calls[0][0].message).toBe("Invalid token");
		});

		it("should reject expired token", async () => {
			// Create a token with a specific expiration time in the past
			const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
			const token = jwt.sign(
				{ id: "user-123", username: "testuser", exp: pastTime },
				"test-secret",
			);

			const req = mockRequest({ authorization: `Bearer ${token}` });
			const res = mockResponse();

			await authenticateToken(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: 401,
				}),
			);

			expect(mockNext.mock.calls[0][0].message).toBe("Token expired");
		});
	});

	describe("optionalAuth", () => {
		it("should continue without user context when no token provided", async () => {
			const req = mockRequest();
			const res = mockResponse();

			await optionalAuth(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.user).toBeUndefined();
		});

		it("should inject user context when valid token provided", async () => {
			const token = jwt.sign(
				{ id: "user-123", username: "testuser", email: "test@example.com" },
				"test-secret",
				{ expiresIn: "1h" },
			);

			const req = mockRequest({ authorization: `Bearer ${token}` });
			const res = mockResponse();

			await optionalAuth(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.user).toEqual({
				id: "user-123",
				username: "testuser",
				email: "test@example.com",
			});
		});

		it("should continue without user context when token is invalid", async () => {
			const req = mockRequest({ authorization: "Bearer invalid-token" });
			const res = mockResponse();

			await optionalAuth(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.user).toBeUndefined();
		});
	});
});
