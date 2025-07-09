import { User } from "@/types/database";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { roomService } from "../../services/roomService";
import type { RoomState, RoomStats } from "../../services/roomService";
import { gameController } from "../gameController";

// Mock the roomService
vi.mock("../../services/roomService", () => ({
	roomService: {
		createRoom: vi.fn(),
		getJoinableRooms: vi.fn(),
		getRoom: vi.fn(),
		joinRoom: vi.fn(),
		leaveRoom: vi.fn(),
		getRoomStats: vi.fn(),
	},
}));

// Mock Express objects
const mockRequest = {
	body: {},
	params: {},
	user: { id: "1", username: "testuser" },
} as Request & { user?: { id: string; username: string; email: string } };

const mockResponse = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn().mockReturnThis(),
} as unknown as Response;

const mockNext = vi.fn() as unknown as NextFunction;

// Mock the error handler
vi.mock("../../middleware/errorHandler", () => ({
	createError: vi.fn((message: string, statusCode: number) => {
		const error = new Error(message) as Error & { statusCode: number };
		error.statusCode = statusCode;
		return error;
	}),
}));

describe("Game Controller", () => {
	beforeEach(() => {
		mockRequest.body = {};
		mockRequest.params = {};
		mockRequest.user = {
			id: "1",
			username: "testuser",
			email: "test@example.com",
		};
		vi.clearAllMocks();
	});

	describe("createRoom", () => {
		it("should create a room successfully", async () => {
			const mockRoom = {
				id: "room-1",
				name: "Test Room",
				status: "waiting" as const,
				maxPlayers: 5,
				players: new Map(),
				director: {
					userId: "1",
					username: "testuser",
					assignedAt: new Date(),
				},
				createdAt: new Date(),
				updatedAt: new Date(),
				settings: {
					gameType: "not-t",
					difficulty: "medium" as const,
					timeLimit: undefined,
					customRules: {},
				},
			};

			(roomService.createRoom as ReturnType<typeof vi.fn>).mockReturnValue(
				mockRoom,
			);
			mockRequest.body = {
				name: "Test Room",
				maxPlayers: 5,
			};

			await gameController.createRoom(mockRequest, mockResponse, mockNext);

			expect(roomService.createRoom).toHaveBeenCalledWith({
				name: "Test Room",
				maxPlayers: 5,
				directorId: "1",
				directorUsername: "testuser",
			});

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				room: {
					id: mockRoom.id,
					name: mockRoom.name,
					status: mockRoom.status,
					maxPlayers: mockRoom.maxPlayers,
					currentPlayers: 1,
					director: mockRoom.director,
					settings: mockRoom.settings,
					createdAt: mockRoom.createdAt,
				},
			});
		});

		it("should handle validation errors", async () => {
			mockRequest.body = {};

			await gameController.createRoom(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalled();
			const callArgs = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(callArgs.message).toBe("Invalid request data");
			expect(callArgs.statusCode).toBe(400);
		});

		it("should require authentication", async () => {
			(mockRequest as unknown as { user?: unknown }).user = undefined;

			await gameController.createRoom(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalled();
			const callArgs = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(callArgs.message).toBe("Authentication required");
			expect(callArgs.statusCode).toBe(401);
		});
	});

	describe("getRooms", () => {
		it("should return all joinable rooms", async () => {
			const mockRooms = [
				{
					id: "room-1",
					name: "Room 1",
					status: "waiting" as const,
					maxPlayers: 5,
					players: new Map(),
					director: {
						userId: "1",
						username: "user1",
						assignedAt: new Date(),
					},
					createdAt: new Date(),
					updatedAt: new Date(),
					settings: {
						gameType: "not-t",
						difficulty: "medium" as const,
						timeLimit: undefined,
						customRules: {},
					},
				},
			];

			(
				roomService.getJoinableRooms as ReturnType<typeof vi.fn>
			).mockReturnValue(mockRooms);

			await gameController.getRooms(mockRequest, mockResponse, mockNext);

			expect(roomService.getJoinableRooms).toHaveBeenCalled();
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				rooms: [
					{
						id: mockRooms[0].id,
						name: mockRooms[0].name,
						status: mockRooms[0].status,
						maxPlayers: mockRooms[0].maxPlayers,
						currentPlayers: 1,
						director: mockRooms[0].director,
						settings: mockRooms[0].settings,
						createdAt: mockRooms[0].createdAt,
					},
				],
			});
		});
	});

	describe("getRoom", () => {
		it("should return a specific room", async () => {
			const mockRoom = {
				id: "room-1",
				name: "Test Room",
				status: "waiting" as const,
				maxPlayers: 5,
				players: new Map(),
				director: {
					userId: "1",
					username: "testuser",
					assignedAt: new Date(),
				},
				createdAt: new Date(),
				updatedAt: new Date(),
				settings: {
					gameType: "not-t",
					difficulty: "medium" as const,
					timeLimit: undefined,
					customRules: {},
				},
			};

			(roomService.getRoom as ReturnType<typeof vi.fn>).mockReturnValue(
				mockRoom,
			);
			mockRequest.params = { roomId: "room-1" };

			await gameController.getRoom(mockRequest, mockResponse, mockNext);

			expect(roomService.getRoom).toHaveBeenCalledWith("room-1");
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				room: {
					id: mockRoom.id,
					name: mockRoom.name,
					status: mockRoom.status,
					maxPlayers: mockRoom.maxPlayers,
					currentPlayers: 1,
					players: [],
					director: mockRoom.director,
					settings: mockRoom.settings,
					createdAt: mockRoom.createdAt,
					updatedAt: mockRoom.updatedAt,
				},
			});
		});

		it("should handle room not found", async () => {
			(roomService.getRoom as ReturnType<typeof vi.fn>).mockReturnValue(
				undefined,
			);
			mockRequest.params = { roomId: "nonexistent" };

			await gameController.getRoom(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalled();
			const callArgs = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(callArgs.message).toBe("Room not found");
			expect(callArgs.statusCode).toBe(404);
		});
	});

	describe("joinRoom", () => {
		it("should join a room successfully", async () => {
			const mockRoom = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				name: "Test Room",
				status: "waiting" as const,
				maxPlayers: 5,
				players: new Map(),
				director: {
					userId: "1",
					username: "testuser",
					assignedAt: new Date(),
				},
				createdAt: new Date(),
				updatedAt: new Date(),
				settings: {
					gameType: "not-t",
					difficulty: "medium" as const,
					timeLimit: undefined,
					customRules: {},
				},
			};

			(roomService.joinRoom as ReturnType<typeof vi.fn>).mockReturnValue({
				success: true,
				room: mockRoom,
			});

			mockRequest.body = {
				roomId: "550e8400-e29b-41d4-a716-446655440000",
			};

			await gameController.joinRoom(mockRequest, mockResponse, mockNext);

			expect(roomService.joinRoom).toHaveBeenCalledWith(
				"550e8400-e29b-41d4-a716-446655440000",
				{
					userId: "1",
					username: "testuser",
				},
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				room: {
					id: mockRoom.id,
					name: mockRoom.name,
					status: mockRoom.status,
					maxPlayers: mockRoom.maxPlayers,
					currentPlayers: 1,
					players: [],
					director: mockRoom.director,
					settings: mockRoom.settings,
				},
			});
		});

		it("should handle join room failure", async () => {
			(roomService.joinRoom as ReturnType<typeof vi.fn>).mockReturnValue({
				success: false,
				error: "Room is full",
			});

			mockRequest.body = {
				roomId: "550e8400-e29b-41d4-a716-446655440000",
			};

			await gameController.joinRoom(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalled();
			const callArgs = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(callArgs.message).toBe("Room is full");
			expect(callArgs.statusCode).toBe(400);
		});
	});

	describe("leaveRoom", () => {
		it("should leave a room successfully", async () => {
			(roomService.leaveRoom as ReturnType<typeof vi.fn>).mockReturnValue({
				success: true,
			});

			mockRequest.params = { roomId: "room-1" };

			await gameController.leaveRoom(mockRequest, mockResponse, mockNext);

			expect(roomService.leaveRoom).toHaveBeenCalledWith("room-1", "1");
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				message: "Successfully left room",
			});
		});

		it("should handle leave room failure", async () => {
			(roomService.leaveRoom as ReturnType<typeof vi.fn>).mockReturnValue({
				success: false,
				error: "Room not found",
			});

			mockRequest.params = { roomId: "nonexistent" };

			await gameController.leaveRoom(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalled();
			const callArgs = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(callArgs.message).toBe("Room not found");
			expect(callArgs.statusCode).toBe(400);
		});
	});

	describe("getRoomStats", () => {
		it("should return room statistics", async () => {
			const mockStats = {
				totalRooms: 5,
				activeRooms: 3,
				totalPlayers: 12,
				averagePlayersPerRoom: 2.4,
			};

			(roomService.getRoomStats as ReturnType<typeof vi.fn>).mockReturnValue(
				mockStats,
			);

			await gameController.getRoomStats(mockRequest, mockResponse, mockNext);

			expect(roomService.getRoomStats).toHaveBeenCalled();
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				stats: mockStats,
			});
		});
	});
});
