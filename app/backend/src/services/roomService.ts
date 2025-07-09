import { v4 as uuidv4 } from "uuid";

export interface Player {
	userId: string;
	username: string;
	isReady: boolean;
	joinedAt: Date;
	lastSeen: Date;
}

export interface Director {
	userId: string;
	username: string;
	assignedAt: Date;
}

export interface RoomState {
	id: string;
	name: string;
	status: "waiting" | "playing" | "finished" | "cancelled";
	maxPlayers: number;
	players: Map<string, Player>;
	director?: Director;
	createdAt: Date;
	updatedAt: Date;
	settings: {
		gameType: string;
		difficulty: "easy" | "medium" | "hard";
		timeLimit?: number;
		customRules?: Record<string, unknown>;
	};
}

export interface CreateRoomData {
	name: string;
	maxPlayers?: number;
	directorId: string;
	directorUsername: string;
	settings?: Partial<RoomState["settings"]>;
}

export interface JoinRoomData {
	userId: string;
	username: string;
	role?: "player" | "director";
}

export interface RoomStats {
	totalRooms: number;
	activeRooms: number;
	totalPlayers: number;
	averagePlayersPerRoom: number;
}

class RoomService {
	private rooms = new Map<string, RoomState>();
	private userRooms = new Map<string, string>(); // userId -> roomId

	/**
	 * Create a new game room
	 */
	createRoom(data: CreateRoomData): RoomState {
		const roomId = uuidv4();
		const now = new Date();

		const room: RoomState = {
			id: roomId,
			name: data.name,
			status: "waiting",
			maxPlayers: data.maxPlayers || 5,
			players: new Map(),
			director: {
				userId: data.directorId,
				username: data.directorUsername,
				assignedAt: now,
			},
			createdAt: now,
			updatedAt: now,
			settings: {
				gameType: "not-t",
				difficulty: "medium",
				timeLimit: undefined,
				customRules: {},
				...data.settings,
			} as RoomState["settings"],
		};

		this.rooms.set(roomId, room);
		this.userRooms.set(data.directorId, roomId);

		console.log(
			`🏠 Room created: ${room.name} (${roomId}) by ${data.directorUsername}`,
		);
		return room;
	}

	/**
	 * Join a room as a player or director
	 */
	joinRoom(
		roomId: string,
		data: JoinRoomData,
	): { success: boolean; room?: RoomState; error?: string } {
		const room = this.rooms.get(roomId);
		if (!room) {
			return { success: false, error: "Room not found" };
		}

		if (room.status !== "waiting") {
			return { success: false, error: "Room is not accepting players" };
		}

		const now = new Date();
		const playerCount = room.players.size + (room.director ? 1 : 0);

		if (playerCount >= room.maxPlayers) {
			return { success: false, error: "Room is full" };
		}

		// Check if user is already in a room
		const currentRoomId = this.userRooms.get(data.userId);
		if (currentRoomId && currentRoomId !== roomId) {
			this.leaveRoom(currentRoomId, data.userId);
		}

		if (data.role === "director" || !room.director) {
			// Assign as director
			room.director = {
				userId: data.userId,
				username: data.username,
				assignedAt: now,
			};
		} else {
			// Add as player
			const player: Player = {
				userId: data.userId,
				username: data.username,
				isReady: false,
				joinedAt: now,
				lastSeen: now,
			};
			room.players.set(data.userId, player);
		}

		room.updatedAt = now;
		this.userRooms.set(data.userId, roomId);

		console.log(`👤 ${data.username} joined room ${room.name} (${roomId})`);
		return { success: true, room };
	}

	/**
	 * Leave a room
	 */
	leaveRoom(
		roomId: string,
		userId: string,
	): { success: boolean; room?: RoomState; error?: string } {
		const room = this.rooms.get(roomId);
		if (!room) {
			return { success: false, error: "Room not found" };
		}

		const now = new Date();

		// Remove from players
		if (room.players.has(userId)) {
			const player = room.players.get(userId);
			if (player) {
				room.players.delete(userId);
				console.log(`👤 ${player.username} left room ${room.name} (${roomId})`);
			}
		}

		// Check if director is leaving
		if (room.director?.userId === userId) {
			const director = room.director;
			room.director = undefined;
			console.log(
				`🎭 Director ${director.username} left room ${room.name} (${roomId})`,
			);
		}

		room.updatedAt = now;
		this.userRooms.delete(userId);

		// Clean up empty rooms
		const playerCount = room.players.size + (room.director ? 1 : 0);
		if (playerCount === 0) {
			this.rooms.delete(roomId);
			console.log(
				`🗑️  Room ${room.name} (${roomId}) cleaned up (no players left)`,
			);
			return { success: true };
		}

		return { success: true, room };
	}

	/**
	 * Get room by ID
	 */
	getRoom(roomId: string): RoomState | undefined {
		return this.rooms.get(roomId);
	}

	/**
	 * Get room by user ID
	 */
	getRoomByUser(userId: string): RoomState | undefined {
		const roomId = this.userRooms.get(userId);
		return roomId ? this.rooms.get(roomId) : undefined;
	}

	/**
	 * Get all rooms
	 */
	getAllRooms(): RoomState[] {
		return Array.from(this.rooms.values());
	}

	/**
	 * Get active rooms (waiting or playing)
	 */
	getActiveRooms(): RoomState[] {
		return Array.from(this.rooms.values()).filter(
			(room) => room.status === "waiting" || room.status === "playing",
		);
	}

	/**
	 * Update room status
	 */
	updateRoomStatus(
		roomId: string,
		status: RoomState["status"],
	): { success: boolean; room?: RoomState; error?: string } {
		const room = this.rooms.get(roomId);
		if (!room) {
			return { success: false, error: "Room not found" };
		}

		room.status = status;
		room.updatedAt = new Date();

		console.log(
			`🔄 Room ${room.name} (${roomId}) status updated to: ${status}`,
		);
		return { success: true, room };
	}

	/**
	 * Update player ready status
	 */
	updatePlayerReady(
		roomId: string,
		userId: string,
		isReady: boolean,
	): { success: boolean; player?: Player; error?: string } {
		const room = this.rooms.get(roomId);
		if (!room) {
			return { success: false, error: "Room not found" };
		}

		const player = room.players.get(userId);
		if (!player) {
			return { success: false, error: "Player not found in room" };
		}

		player.isReady = isReady;
		player.lastSeen = new Date();
		room.updatedAt = new Date();

		console.log(`✅ Player ${player.username} ready status: ${isReady}`);
		return { success: true, player };
	}

	/**
	 * Update player last seen
	 */
	updatePlayerLastSeen(roomId: string, userId: string): void {
		const room = this.rooms.get(roomId);
		if (!room) return;

		const player = room.players.get(userId);
		if (player) {
			player.lastSeen = new Date();
		}
	}

	/**
	 * Get room statistics
	 */
	getRoomStats(): RoomStats {
		const totalRooms = this.rooms.size;
		const activeRooms = this.getActiveRooms().length;
		const totalPlayers = Array.from(this.rooms.values()).reduce(
			(sum, room) => sum + room.players.size + (room.director ? 1 : 0),
			0,
		);

		return {
			totalRooms,
			activeRooms,
			totalPlayers,
			averagePlayersPerRoom: totalRooms > 0 ? totalPlayers / totalRooms : 0,
		};
	}

	/**
	 * Clean up inactive rooms (older than 24 hours)
	 */
	cleanupInactiveRooms(): number {
		const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
		let cleanedCount = 0;

		for (const [roomId, room] of this.rooms.entries()) {
			if (room.updatedAt < cutoff && room.status === "waiting") {
				this.rooms.delete(roomId);

				// Clean up user room mappings
				for (const [userId, userRoomId] of this.userRooms.entries()) {
					if (userRoomId === roomId) {
						this.userRooms.delete(userId);
					}
				}

				console.log(`🧹 Cleaned up inactive room: ${room.name} (${roomId})`);
				cleanedCount++;
			}
		}

		return cleanedCount;
	}

	/**
	 * Get rooms that can be joined
	 */
	getJoinableRooms(): RoomState[] {
		return this.getActiveRooms().filter((room) => {
			const playerCount = room.players.size + (room.director ? 1 : 0);
			return room.status === "waiting" && playerCount < room.maxPlayers;
		});
	}
}

// Export singleton instance
export const roomService = new RoomService();
