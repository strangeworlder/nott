import jwt from "jsonwebtoken";
import type { Server } from "socket.io";
import type { Socket } from "socket.io";
import { config } from "../config";
import { createError } from "../middleware/errorHandler";
import { roomService } from "../services/roomService";
import type { SocketEvents } from "../types/database";

interface AuthenticatedSocket extends Socket {
	userId: string;
	username: string;
	gameId?: string;
}

export const setupSocketHandlers = (io: Server) => {
	// Authentication middleware
	io.use(async (socket, next) => {
		try {
			const token =
				socket.handshake.auth.token ||
				socket.handshake.headers.authorization?.replace("Bearer ", "");

			if (!token) {
				return next(createError("Authentication required", 401));
			}

			const decoded = jwt.verify(token, config.jwt.secret) as {
				id: string;
				username: string;
			};
			(socket as AuthenticatedSocket).userId = decoded.id;
			(socket as AuthenticatedSocket).username = decoded.username;

			next();
		} catch (error) {
			next(createError("Invalid token", 401));
		}
	});

	io.on("connection", (sock) => {
		const socket = sock as AuthenticatedSocket;
		console.log(`User connected: ${socket.username} (${socket.userId})`);

		// Join game room
		socket.on(
			"game:join",
			async (data: { gameId: string; role?: "player" | "director" }) => {
				try {
					if (!socket.userId || !socket.username) {
						throw new Error(
							"Socket missing userId or username after authentication",
						);
					}
					const userId = socket.userId;
					const username = socket.username;
					const { gameId } = data;
					const role: "player" | "director" = data.role || "player";

					// Leave previous room if any
					if (socket.gameId) {
						socket.leave(socket.gameId);
						await handlePlayerLeave(socket, socket.gameId);
					}

					// Join new room using room service
					const result = roomService.joinRoom(gameId, {
						userId: socket.userId,
						username: socket.username,
						role,
					});

					if (!result.success) {
						socket.emit("error", { message: result.error });
						return;
					}

					// Join socket room
					socket.join(gameId);
					socket.gameId = gameId;

					// Notify other players
					socket.to(gameId).emit("player:joined", {
						userId,
						username,
						role,
						timestamp: new Date(),
					});

					// Send current room state to joining player
					if (result.room) {
						socket.emit("room:state", {
							gameId: result.room.id,
							name: result.room.name,
							status: result.room.status,
							maxPlayers: result.room.maxPlayers,
							players: Array.from(result.room.players.values()),
							director: result.room.director,
							playerCount:
								result.room.players.size + (result.room.director ? 1 : 0),
							settings: result.room.settings,
						});
					}

					console.log(
						`Player ${socket.username} joined game ${gameId} as ${role}`,
					);
				} catch (error) {
					console.error("Error joining game:", error);
					socket.emit("error", { message: "Failed to join game" });
				}
			},
		);

		// Leave game room
		socket.on("game:leave", async () => {
			if (socket.gameId) {
				await handlePlayerLeave(socket, socket.gameId);
				socket.leave(socket.gameId);
				socket.gameId = undefined;
			}
		});

		// Player ready status
		socket.on("player:ready", (isReady: boolean) => {
			if (!socket.gameId) return;

			const result = roomService.updatePlayerReady(
				socket.gameId,
				socket.userId,
				isReady,
			);
			if (result.success) {
				socket.to(socket.gameId).emit("player:ready", {
					userId: socket.userId,
					username: socket.username,
					isReady,
					timestamp: new Date(),
				});
			}
		});

		// Game actions
		socket.on(
			"game:action",
			(data: { action: string; data?: Record<string, unknown> }) => {
				if (!socket.gameId) return;

				socket.to(socket.gameId).emit("game:action", {
					userId: socket.userId,
					username: socket.username,
					action: data.action,
					data: data.data,
					timestamp: new Date(),
				});
			},
		);

		// Dice roll
		socket.on(
			"dice:roll",
			(data: { diceType: string; count: number; modifier?: number }) => {
				if (!socket.gameId) return;

				const rolls = Array.from(
					{ length: data.count },
					() => Math.floor(Math.random() * 6) + 1,
				);
				const total =
					rolls.reduce((sum, roll) => sum + roll, 0) + (data.modifier || 0);

				const result = {
					userId: socket.userId,
					username: socket.username,
					diceType: data.diceType,
					count: data.count,
					modifier: data.modifier || 0,
					rolls,
					total,
					timestamp: new Date(),
				};

				socket.to(socket.gameId).emit("dice:rolled", result);
				socket.emit("dice:rolled", result); // Also send back to sender
			},
		);

		// Card actions
		socket.on("card:play", (data: { cardId: string; position?: number }) => {
			if (!socket.gameId) return;

			socket.to(socket.gameId).emit("card:played", {
				userId: socket.userId,
				username: socket.username,
				cardId: data.cardId,
				position: data.position,
				timestamp: new Date(),
			});
		});

		// Voice chat signaling
		socket.on("voice:signal", (data: { to: string; signal: unknown }) => {
			if (!socket.gameId) return;

			socket.to(data.to).emit("voice:signal", {
				from: socket.userId,
				signal: data.signal,
				timestamp: new Date(),
			});
		});

		// Chat messages
		socket.on(
			"chat:message",
			(data: { message: string; type?: "player" | "system" }) => {
				if (!socket.gameId) return;

				const chatMessage = {
					userId: socket.userId,
					username: socket.username,
					message: data.message,
					type: data.type || "player",
					timestamp: new Date(),
				};

				io.to(socket.gameId).emit("chat:message", chatMessage);
			},
		);

		// Director actions
		socket.on(
			"director:action",
			(data: {
				action: string;
				targetPlayer?: string;
				data?: Record<string, unknown>;
			}) => {
				if (!socket.gameId) return;

				const room = roomService.getRoom(socket.gameId);
				if (!room?.director || room.director.userId !== socket.userId) {
					socket.emit("error", {
						message: "Only director can perform this action",
					});
					return;
				}

				socket.to(socket.gameId).emit("director:action", {
					action: data.action,
					targetPlayer: data.targetPlayer,
					data: data.data,
					timestamp: new Date(),
				});
			},
		);

		// Disconnect handling
		socket.on("disconnect", async () => {
			console.log(`User disconnected: ${socket.username} (${socket.userId})`);

			if (socket.gameId) {
				await handlePlayerLeave(socket, socket.gameId);
			}
		});
	});
};

async function handlePlayerLeave(socket: AuthenticatedSocket, gameId: string) {
	if (!socket.userId) return;

	const result = roomService.leaveRoom(gameId, socket.userId);
	if (result.success) {
		socket.to(gameId).emit("player:left", {
			userId: socket.userId,
			username: socket.username,
			timestamp: new Date(),
		});
	}

	if (socket.username) {
		console.log(`Player ${socket.username} left game ${gameId}`);
	}
}
