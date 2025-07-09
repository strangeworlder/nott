import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { createError } from "../middleware/errorHandler";
import { roomService } from "../services/roomService";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		username: string;
		email: string;
	};
}

// Validation schemas
const createRoomSchema = z.object({
	name: z.string().min(1).max(50),
	maxPlayers: z.number().min(2).max(8).optional(),
});

const joinRoomSchema = z.object({
	roomId: z.string().uuid(),
});

export const gameController = {
	/**
	 * Create a new game room
	 */
	async createRoom(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) {
		try {
			// Get user from JWT token (set by auth middleware)
			const user = req.user;
			if (!user) {
				return next(createError("Authentication required", 401));
			}

			// Validate request body
			const validatedData = createRoomSchema.parse(req.body);

			// Create room
			const room = roomService.createRoom({
				name: validatedData.name,
				maxPlayers: validatedData.maxPlayers ?? 4,
				directorId: String(user.id),
				directorUsername: user.username,
			});

			res.status(201).json({
				success: true,
				room: {
					id: room.id,
					name: room.name,
					status: room.status,
					maxPlayers: room.maxPlayers,
					currentPlayers: room.players.size + (room.director ? 1 : 0),
					director: room.director,
					settings: room.settings,
					createdAt: room.createdAt,
				},
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return next(
					createError("Invalid request data", 400, undefined, error.errors),
				);
			}
			return next(error);
		}
	},

	/**
	 * Get all available rooms
	 */
	async getRooms(req: Request, res: Response, next: NextFunction) {
		try {
			const rooms = roomService.getJoinableRooms();

			res.json({
				success: true,
				rooms: rooms.map((room) => ({
					id: room.id,
					name: room.name,
					status: room.status,
					maxPlayers: room.maxPlayers,
					currentPlayers: room.players.size + (room.director ? 1 : 0),
					director: room.director,
					settings: room.settings,
					createdAt: room.createdAt,
				})),
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Get a specific room by ID
	 */
	async getRoom(req: Request, res: Response, next: NextFunction) {
		try {
			const { roomId } = req.params;
			const room = roomService.getRoom(roomId);

			if (!room) {
				return next(createError("Room not found", 404));
			}

			res.json({
				success: true,
				room: {
					id: room.id,
					name: room.name,
					status: room.status,
					maxPlayers: room.maxPlayers,
					currentPlayers: room.players.size + (room.director ? 1 : 0),
					players: Array.from(room.players.values()),
					director: room.director,
					settings: room.settings,
					createdAt: room.createdAt,
					updatedAt: room.updatedAt,
				},
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Join a room
	 */
	async joinRoom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			// Validate request body
			const validatedData = joinRoomSchema.parse(req.body);

			// Get user from JWT token
			const user = req.user;
			if (!user) {
				return next(createError("Authentication required", 401));
			}

			const result = roomService.joinRoom(validatedData.roomId, {
				userId: String(user.id),
				username: user.username,
			});

			if (!result.success) {
				return next(createError(result.error || "Failed to join room", 400));
			}

			res.json({
				success: true,
				room: {
					id: result.room?.id,
					name: result.room?.name,
					status: result.room?.status,
					maxPlayers: result.room?.maxPlayers,
					currentPlayers: result.room
						? result.room.players.size + (result.room.director ? 1 : 0)
						: 0,
					players: result.room ? Array.from(result.room.players.values()) : [],
					director: result.room?.director,
					settings: result.room?.settings,
				},
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return next(
					createError("Invalid request data", 400, undefined, error.errors),
				);
			}
			return next(error);
		}
	},

	/**
	 * Leave a room
	 */
	async leaveRoom(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) {
		try {
			const { roomId } = req.params;

			// Get user from JWT token
			const user = req.user;
			if (!user) {
				return next(createError("Authentication required", 401));
			}

			const result = roomService.leaveRoom(roomId, String(user.id));

			if (!result.success) {
				return next(createError(result.error || "Failed to leave room", 400));
			}

			res.json({
				success: true,
				message: "Successfully left room",
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return next(
					createError("Invalid request data", 400, undefined, error.errors),
				);
			}
			return next(error);
		}
	},

	/**
	 * Get room statistics
	 */
	async getRoomStats(req: Request, res: Response, next: NextFunction) {
		try {
			const stats = roomService.getRoomStats();

			res.json({
				success: true,
				stats,
			});
		} catch (error) {
			return next(error);
		}
	},
};
