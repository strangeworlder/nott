import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	formatZodError,
	safeValidate,
	schemas,
	validate,
	validateData,
} from "../validation";

// Mock Express objects
const mockRequest = (
	body: Record<string, unknown> = {},
	query: Record<string, unknown> = {},
	params: Record<string, unknown> = {},
) =>
	({
		body,
		query,
		params,
	}) as Request;

const mockResponse = () => {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res;
};

const mockNext = vi.fn() as unknown as NextFunction;

describe("Zod Validation Middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("validate middleware", () => {
		it("should pass validation for valid data", () => {
			const schema = z.object({
				name: z.string(),
				age: z.number(),
			});

			const req = mockRequest({ name: "John", age: 25 });
			const res = mockResponse();

			validate(schema)(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.body).toEqual({ name: "John", age: 25 });
		});

		it("should validate query parameters", () => {
			const schema = z.object({
				page: z.coerce.number(),
				limit: z.coerce.number(),
			});

			const req = mockRequest({}, { page: "1", limit: "10" });
			const res = mockResponse();

			validate(schema, "query")(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.query).toEqual({ page: 1, limit: 10 });
		});

		it("should validate URL parameters", () => {
			const schema = z.object({
				id: z.string().uuid(),
			});

			const req = mockRequest(
				{},
				{},
				{ id: "123e4567-e89b-12d3-a456-426614174000" },
			);
			const res = mockResponse();

			validate(schema, "params")(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(req.params).toEqual({
				id: "123e4567-e89b-12d3-a456-426614174000",
			});
		});

		it("should handle validation errors", () => {
			const schema = z.object({
				name: z.string().min(3),
				age: z.number().min(18),
			});

			const req = mockRequest({ name: "Jo", age: 15 });
			const res = mockResponse();

			validate(schema)(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringContaining("Validation error"),
					statusCode: 400,
				}),
			);
		});

		it("should handle non-Zod errors", () => {
			const schema = z.object({
				name: z.string(),
			});

			const req = mockRequest({ name: "John" });
			const res = mockResponse();

			// Mock schema.parse to throw a non-Zod error
			vi.spyOn(schema, "parse").mockImplementation(() => {
				throw new Error("Unexpected error");
			});

			validate(schema)(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Validation failed",
					statusCode: 400,
				}),
			);
		});
	});

	describe("auth schemas", () => {
		describe("register schema", () => {
			it("should validate valid registration data", () => {
				const validData = {
					username: "testuser",
					email: "test@example.com",
					password: "Password123",
				};

				const result = schemas.auth.register.safeParse(validData);
				expect(result.success).toBe(true);
			});

			it("should reject invalid username", () => {
				const invalidData = {
					username: "ab", // too short
					email: "test@example.com",
					password: "Password123",
				};

				const result = schemas.auth.register.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain(
						"at least 3 characters",
					);
				}
			});

			it("should reject invalid email", () => {
				const invalidData = {
					username: "testuser",
					email: "invalid-email",
					password: "Password123",
				};

				const result = schemas.auth.register.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain(
						"Invalid email format",
					);
				}
			});

			it("should reject weak password", () => {
				const invalidData = {
					username: "testuser",
					email: "test@example.com",
					password: "weak",
				};

				const result = schemas.auth.register.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain(
						"at least 8 characters",
					);
				}
			});
		});

		describe("login schema", () => {
			it("should validate valid login data", () => {
				const validData = {
					email: "test@example.com",
					password: "password123",
				};

				const result = schemas.auth.login.safeParse(validData);
				expect(result.success).toBe(true);
			});

			it("should reject empty password", () => {
				const invalidData = {
					email: "test@example.com",
					password: "",
				};

				const result = schemas.auth.login.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain("required");
				}
			});
		});
	});

	describe("user schemas", () => {
		describe("updateProfile schema", () => {
			it("should validate valid profile update data", () => {
				const validData = {
					username: "newusername",
					bio: "My bio",
					avatar_url: "https://example.com/avatar.jpg",
				};

				const result = schemas.user.updateProfile.safeParse(validData);
				expect(result.success).toBe(true);
			});

			it("should allow partial updates", () => {
				const partialData = {
					username: "newusername",
				};

				const result = schemas.user.updateProfile.safeParse(partialData);
				expect(result.success).toBe(true);
			});

			it("should reject invalid avatar URL", () => {
				const invalidData = {
					avatar_url: "not-a-url",
				};

				const result = schemas.user.updateProfile.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain(
						"Invalid URL format",
					);
				}
			});
		});

		describe("search schema", () => {
			it("should validate valid search query", () => {
				const validData = {
					query: "search term",
					limit: 20,
				};

				const result = schemas.user.search.safeParse(validData);
				expect(result.success).toBe(true);
			});

			it("should use default limit when not provided", () => {
				const data = {
					query: "search term",
				};

				const result = schemas.user.search.parse(data);
				expect(result.limit).toBe(10);
			});

			it("should reject empty query", () => {
				const invalidData = {
					query: "",
					limit: 10,
				};

				const result = schemas.user.search.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain("required");
				}
			});
		});
	});

	describe("game schemas", () => {
		describe("create schema", () => {
			it("should validate valid game creation data", () => {
				const validData = {
					name: "Test Game",
					max_players: 4,
					settings: { difficulty: "hard" },
				};

				const result = schemas.game.create.safeParse(validData);
				expect(result.success).toBe(true);
			});

			it("should use default max_players when not provided", () => {
				const data = {
					name: "Test Game",
				};

				const result = schemas.game.create.parse(data);
				expect(result.max_players).toBe(5);
			});

			it("should reject invalid max_players", () => {
				const invalidData = {
					name: "Test Game",
					max_players: 6, // too high
				};

				const result = schemas.game.create.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain("at most 5");
				}
			});
		});

		describe("join schema", () => {
			it("should validate valid join data", () => {
				const validData = {
					role: "player",
					player_number: 2,
					character_name: "Detective",
				};

				const result = schemas.game.join.safeParse(validData);
				expect(result.success).toBe(true);
			});

			it("should reject invalid role", () => {
				const invalidData = {
					role: "invalid_role",
				};

				const result = schemas.game.join.safeParse(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toContain(
						'director" or "player',
					);
				}
			});
		});
	});

	describe("utility functions", () => {
		describe("formatZodError", () => {
			it("should format Zod error messages correctly", () => {
				const schema = z.object({
					name: z.string().min(3),
					age: z.number().min(18),
				});

				const result = schema.safeParse({ name: "Jo", age: 15 });
				expect(result.success).toBe(false);
				if (!result.success) {
					const formatted = formatZodError(result.error);
					expect(formatted).toContain(
						"name: String must contain at least 3 character(s)",
					);
					expect(formatted).toContain(
						"age: Number must be greater than or equal to 18",
					);
				}
			});
		});

		describe("validateData", () => {
			it("should return validated data", () => {
				const schema = z.object({
					name: z.string(),
					age: z.number(),
				});

				const data = { name: "John", age: 25 };
				const result = validateData(schema, data);
				expect(result).toEqual(data);
			});

			it("should throw error for invalid data", () => {
				const schema = z.object({
					name: z.string().min(3),
				});

				expect(() => validateData(schema, { name: "Jo" })).toThrow();
			});
		});

		describe("safeValidate", () => {
			it("should return validated data for valid input", () => {
				const schema = z.object({
					name: z.string(),
				});

				const result = safeValidate(schema, { name: "John" });
				expect(result).toEqual({ name: "John" });
			});

			it("should return null for invalid input", () => {
				const schema = z.object({
					name: z.string().min(3),
				});

				const result = safeValidate(schema, { name: "Jo" });
				expect(result).toBeNull();
			});
		});
	});
});
