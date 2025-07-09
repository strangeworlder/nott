import type { Request, Response, NextFunction } from "express";
import { webRTCService } from "../services/webRTCService";
import { createError } from "../middleware/errorHandler";

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		username: string;
		email: string;
	};
}

export const webRTCController = {
	/**
	 * Get WebRTC configuration (TURN/STUN servers)
	 */
	async getWebRTCConfig(req: Request, res: Response, next: NextFunction) {
		try {
			const config = webRTCService.getWebRTCConfig();

			res.json({
				success: true,
				config: {
					iceServers: config.iceServers,
					turnServerConfigured: !!config.turnServerUrl,
				},
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Validate TURN/STUN server configuration
	 */
	async validateConfig(req: Request, res: Response, next: NextFunction) {
		try {
			const validation = webRTCService.validateTURNConfig();

			res.json({
				success: true,
				validation,
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Get voice room statistics
	 */
	async getVoiceStats(req: Request, res: Response, next: NextFunction) {
		try {
			const stats = webRTCService.getVoiceStats();

			res.json({
				success: true,
				stats,
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Get voice room by ID
	 */
	async getVoiceRoom(req: Request, res: Response, next: NextFunction) {
		try {
			const { roomId } = req.params;
			const room = webRTCService.getVoiceRoom(roomId);

			if (!room) {
				return next(createError("Voice room not found", 404));
			}

			res.json({
				success: true,
				room: {
					id: room.id,
					isActive: room.isActive,
					participantCount: room.participants.size,
					participants: Array.from(room.participants.values()).map((p) => ({
						userId: p.userId,
						username: p.username,
						isConnected: p.isConnected,
						isMuted: p.isMuted,
						isDeafened: p.isDeafened,
						audioLevel: p.audioLevel,
						lastSeen: p.lastSeen,
					})),
					createdAt: room.createdAt,
					updatedAt: room.updatedAt,
				},
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Join a voice room
	 */
	async joinVoiceRoom(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) {
		try {
			const { roomId } = req.params;
			const user = req.user;

			if (!user) {
				return next(createError("Authentication required", 401));
			}

			const connection = webRTCService.joinVoiceRoom(
				roomId,
				user.id,
				user.username,
			);

			res.json({
				success: true,
				connection: {
					userId: connection.userId,
					username: connection.username,
					isConnected: connection.isConnected,
					isMuted: connection.isMuted,
					isDeafened: connection.isDeafened,
					audioLevel: connection.audioLevel,
				},
			});
		} catch (error) {
			return next(error);
		}
	},

	/**
	 * Leave a voice room
	 */
	async leaveVoiceRoom(
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) {
		try {
			const { roomId } = req.params;
			const user = req.user;

			if (!user) {
				return next(createError("Authentication required", 401));
			}

			const success = webRTCService.leaveVoiceRoom(roomId, user.id);

			if (!success) {
				return next(
					createError("Voice room not found or user not in room", 404),
				);
			}

			res.json({
				success: true,
				message: "Successfully left voice room",
			});
		} catch (error) {
			return next(error);
		}
	},
};
