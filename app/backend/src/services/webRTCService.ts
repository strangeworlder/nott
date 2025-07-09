import { config } from "../config";

export interface WebRTCConfig {
	turnServerUrl: string;
	turnUsername: string;
	turnPassword: string;
	iceServers: RTCIceServer[];
}

export interface VoiceConnection {
	userId: string;
	username: string;
	peerConnection?: RTCPeerConnection;
	localStream?: MediaStream;
	isConnected: boolean;
	isMuted: boolean;
	isDeafened: boolean;
	audioLevel: number;
	lastSeen: Date;
}

export interface VoiceRoom {
	id: string;
	participants: Map<string, VoiceConnection>;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * WebRTC Service for managing voice connections and TURN/STUN configuration
 */
class WebRTCService {
	private voiceRooms = new Map<string, VoiceRoom>();
	private userConnections = new Map<string, string>(); // userId -> roomId

	/**
	 * Get WebRTC configuration with TURN/STUN servers
	 */
	getWebRTCConfig(): WebRTCConfig {
		const iceServers: RTCIceServer[] = [
			// STUN servers (free, for basic NAT traversal)
			{ urls: "stun:stun.l.google.com:19302" },
			{ urls: "stun:stun1.l.google.com:19302" },
			{ urls: "stun:stun2.l.google.com:19302" },
		];

		// Add TURN server if configured
		if (
			config.webrtc.turnServerUrl &&
			config.webrtc.turnUsername &&
			config.webrtc.turnPassword
		) {
			iceServers.push({
				urls: config.webrtc.turnServerUrl,
				username: config.webrtc.turnUsername,
				credential: config.webrtc.turnPassword,
			});
		}

		return {
			turnServerUrl: config.webrtc.turnServerUrl,
			turnUsername: config.webrtc.turnUsername,
			turnPassword: config.webrtc.turnPassword,
			iceServers,
		};
	}

	/**
	 * Create a new voice room
	 */
	createVoiceRoom(roomId: string): VoiceRoom {
		const room: VoiceRoom = {
			id: roomId,
			participants: new Map(),
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.voiceRooms.set(roomId, room);
		console.log(`🎤 Voice room created: ${roomId}`);
		return room;
	}

	/**
	 * Join a voice room
	 */
	joinVoiceRoom(
		roomId: string,
		userId: string,
		username: string,
	): VoiceConnection {
		let room = this.voiceRooms.get(roomId);
		if (!room) {
			room = this.createVoiceRoom(roomId);
		}

		// Leave previous room if any
		const previousRoomId = this.userConnections.get(userId);
		if (previousRoomId && previousRoomId !== roomId) {
			this.leaveVoiceRoom(previousRoomId, userId);
		}

		const connection: VoiceConnection = {
			userId,
			username,
			isConnected: false,
			isMuted: false,
			isDeafened: false,
			audioLevel: 0,
			lastSeen: new Date(),
		};

		room.participants.set(userId, connection);
		room.updatedAt = new Date();
		this.userConnections.set(userId, roomId);

		console.log(`🎤 ${username} joined voice room ${roomId}`);
		return connection;
	}

	/**
	 * Leave a voice room
	 */
	leaveVoiceRoom(roomId: string, userId: string): boolean {
		const room = this.voiceRooms.get(roomId);
		if (!room) {
			return false;
		}

		const participant = room.participants.get(userId);
		if (participant) {
			room.participants.delete(userId);
			room.updatedAt = new Date();
			this.userConnections.delete(userId);

			console.log(`🎤 ${participant.username} left voice room ${roomId}`);

			// Clean up empty rooms
			if (room.participants.size === 0) {
				this.voiceRooms.delete(roomId);
				console.log(`🗑️ Voice room ${roomId} cleaned up (no participants)`);
			}

			return true;
		}

		return false;
	}

	/**
	 * Update voice connection state
	 */
	updateVoiceConnection(
		roomId: string,
		userId: string,
		updates: Partial<VoiceConnection>,
	): VoiceConnection | null {
		const room = this.voiceRooms.get(roomId);
		if (!room) {
			return null;
		}

		const connection = room.participants.get(userId);
		if (!connection) {
			return null;
		}

		Object.assign(connection, updates);
		connection.lastSeen = new Date();
		room.updatedAt = new Date();

		return connection;
	}

	/**
	 * Get voice room by ID
	 */
	getVoiceRoom(roomId: string): VoiceRoom | undefined {
		return this.voiceRooms.get(roomId);
	}

	/**
	 * Get voice room by user ID
	 */
	getVoiceRoomByUser(userId: string): VoiceRoom | undefined {
		const roomId = this.userConnections.get(userId);
		return roomId ? this.voiceRooms.get(roomId) : undefined;
	}

	/**
	 * Get all active voice rooms
	 */
	getActiveVoiceRooms(): VoiceRoom[] {
		return Array.from(this.voiceRooms.values()).filter((room) => room.isActive);
	}

	/**
	 * Get voice room statistics
	 */
	getVoiceStats(): {
		totalRooms: number;
		activeRooms: number;
		totalParticipants: number;
		averageParticipantsPerRoom: number;
	} {
		const totalRooms = this.voiceRooms.size;
		const activeRooms = this.getActiveVoiceRooms().length;
		const totalParticipants = Array.from(this.voiceRooms.values()).reduce(
			(sum, room) => sum + room.participants.size,
			0,
		);

		return {
			totalRooms,
			activeRooms,
			totalParticipants,
			averageParticipantsPerRoom:
				totalRooms > 0 ? totalParticipants / totalRooms : 0,
		};
	}

	/**
	 * Clean up inactive voice rooms
	 */
	cleanupInactiveVoiceRooms(): number {
		const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
		let cleanedCount = 0;

		for (const [roomId, room] of this.voiceRooms.entries()) {
			if (room.updatedAt < cutoff) {
				this.voiceRooms.delete(roomId);

				// Clean up user connections
				for (const [userId, userRoomId] of this.userConnections.entries()) {
					if (userRoomId === roomId) {
						this.userConnections.delete(userId);
					}
				}

				console.log(`🧹 Cleaned up inactive voice room: ${roomId}`);
				cleanedCount++;
			}
		}

		return cleanedCount;
	}

	/**
	 * Validate TURN/STUN server configuration
	 */
	validateTURNConfig(): {
		isValid: boolean;
		errors: string[];
		warnings: string[];
	} {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check if TURN server is configured
		if (!config.webrtc.turnServerUrl) {
			warnings.push("TURN server URL not configured - using STUN only");
		}

		if (!config.webrtc.turnUsername) {
			warnings.push("TURN username not configured");
		}

		if (!config.webrtc.turnPassword) {
			warnings.push("TURN password not configured");
		}

		// Validate TURN server URL format
		if (
			config.webrtc.turnServerUrl &&
			!config.webrtc.turnServerUrl.startsWith("turn:")
		) {
			errors.push('TURN server URL should start with "turn:"');
		}

		const isValid = errors.length === 0;

		return {
			isValid,
			errors,
			warnings,
		};
	}
}

// Export singleton instance
export const webRTCService = new WebRTCService();
