import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { logout } from "../authController";

describe("AuthController", () => {
	describe("logout", () => {
		it("should return logout message", () => {
			const mockReq = {} as Request;
			const mockRes = {
				json: vi.fn(),
			} as unknown as Response;

			logout(mockReq, mockRes);

			expect(mockRes.json).toHaveBeenCalledWith({
				message: "Logged out",
			});
		});
	});
});
