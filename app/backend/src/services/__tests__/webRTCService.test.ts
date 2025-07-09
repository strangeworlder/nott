import { beforeEach, describe, expect, it, vi } from "vitest";
import { webRTCService } from "../webRTCService";

// Mock config
vi.mock("../../config", () => ({
	config: {
		webrtc: {
			turnServerUrl: "turn:test.turn.server:3478",
			turnUsername: "test_user",
			turnPassword: "test_password",
		},
	},
}));

describe("WebRTC Service", () => {
	beforeEach(() => {
		// Reset service state before each test
		(
			webRTCService as unknown as {
				voiceRooms: Map<string, unknown>;
				userConnections: Map<string, unknown>;
			}
		).voiceRooms.clear();
		(
			webRTCService as unknown as {
				voiceRooms: Map<string, unknown>;
				userConnections: Map<string, unknown>;
			}
		).userConnections.clear();
	});

	describe("getWebRTCConfig", () => {
		it("should return WebRTC configuration with TURN/STUN servers", () => {
			const config = webRTCService.getWebRTCConfig();

			expect(config).toHaveProperty("turnServerUrl");
			expect(config).toHaveProperty("turnUsername");
			expect(config).toHaveProperty("turnPassword");
			expect(config).toHaveProperty("iceServers");
			expect(Array.isArray(config.iceServers)).toBe(true);
			expect(config.iceServers.length).toBeGreaterThan(0);
		});

		it("should include STUN servers", () => {
			const config = webRTCService.getWebRTCConfig();
			const stunServers = config.iceServers.filter((server) =>
				server.urls.includes("stun:"),
			);

			expect(stunServers.length).toBeGreaterThan(0);
		});

		it("should include TURN server when configured", () => {
			const config = webRTCService.getWebRTCConfig();
			const turnServer = config.iceServers.find((server) =>
				server.urls.includes("turn:"),
			);

			expect(turnServer).toBeDefined();
			expect(turnServer?.username).toBe("test_user");
			expect(turnServer?.credential).toBe("test_password");
		});
	});

	describe("validateTURNConfig", () => {
		it("should validate TURN configuration correctly", () => {
			const validation = webRTCService.validateTURNConfig();

			expect(validation).toHaveProperty("isValid");
			expect(validation).toHaveProperty("errors");
			expect(validation).toHaveProperty("warnings");
			expect(Array.isArray(validation.errors)).toBe(true);
			expect(Array.isArray(validation.warnings)).toBe(true);
		});

		it("should be valid with proper TURN configuration", () => {
			const validation = webRTCService.validateTURNConfig();
			expect(validation.isValid).toBe(true);
		});
	});

	describe("Voice Room Management", () => {
		it("should create a new voice room", () => {
			const room = webRTCService.createVoiceRoom("test-room");

			expect(room.id).toBe("test-room");
			expect(room.participants.size).toBe(0);
			expect(room.isActive).toBe(true);
			expect(room.createdAt).toBeInstanceOf(Date);
			expect(room.updatedAt).toBeInstanceOf(Date);
		});

		it("should join a voice room", () => {
			const connection = webRTCService.joinVoiceRoom(
				"test-room",
				"user1",
				"TestUser",
			);

			expect(connection.userId).toBe("user1");
			expect(connection.username).toBe("TestUser");
			expect(connection.isConnected).toBe(false);
			expect(connection.isMuted).toBe(false);
			expect(connection.isDeafened).toBe(false);
			expect(connection.audioLevel).toBe(0);
			expect(connection.lastSeen).toBeInstanceOf(Date);
		});

		it("should leave a voice room", () => {
			// Join first
			webRTCService.joinVoiceRoom("test-room", "user1", "TestUser");

			// Then leave
			const success = webRTCService.leaveVoiceRoom("test-room", "user1");

			expect(success).toBe(true);

			// Room should be cleaned up
			const room = webRTCService.getVoiceRoom("test-room");
			expect(room).toBeUndefined();
		});

		it("should handle leaving non-existent room", () => {
			const success = webRTCService.leaveVoiceRoom("non-existent", "user1");
			expect(success).toBe(false);
		});

		it("should update voice connection state", () => {
			webRTCService.joinVoiceRoom("test-room", "user1", "TestUser");

			const updated = webRTCService.updateVoiceConnection(
				"test-room",
				"user1",
				{
					isMuted: true,
					audioLevel: 0.5,
				},
			);

			expect(updated).toBeDefined();
			expect(updated?.isMuted).toBe(true);
			expect(updated?.audioLevel).toBe(0.5);
		});

		it("should get voice room by ID", () => {
			webRTCService.createVoiceRoom("test-room");
			const room = webRTCService.getVoiceRoom("test-room");

			expect(room).toBeDefined();
			expect(room?.id).toBe("test-room");
		});

		it("should get voice room by user ID", () => {
			webRTCService.joinVoiceRoom("test-room", "user1", "TestUser");
			const room = webRTCService.getVoiceRoomByUser("user1");

			expect(room).toBeDefined();
			expect(room?.id).toBe("test-room");
		});

		it("should get active voice rooms", () => {
			webRTCService.createVoiceRoom("room1");
			webRTCService.createVoiceRoom("room2");

			const activeRooms = webRTCService.getActiveVoiceRooms();
			expect(activeRooms.length).toBe(2);
		});

		it("should get voice statistics", () => {
			webRTCService.joinVoiceRoom("room1", "user1", "User1");
			webRTCService.joinVoiceRoom("room1", "user2", "User2");
			webRTCService.joinVoiceRoom("room2", "user3", "User3");

			const stats = webRTCService.getVoiceStats();

			expect(stats.totalRooms).toBe(2);
			expect(stats.activeRooms).toBe(2);
			expect(stats.totalParticipants).toBe(3);
			expect(stats.averageParticipantsPerRoom).toBe(1.5);
		});
	});

	describe("Cleanup", () => {
		it("should clean up inactive voice rooms", () => {
			// Create a room and manually set it as old
			const room = webRTCService.createVoiceRoom("old-room");
			(room as unknown as { updatedAt: Date }).updatedAt = new Date(
				Date.now() - 25 * 60 * 60 * 1000,
			); // 25 hours ago

			const cleanedCount = webRTCService.cleanupInactiveVoiceRooms();
			expect(cleanedCount).toBe(1);

			const remainingRoom = webRTCService.getVoiceRoom("old-room");
			expect(remainingRoom).toBeUndefined();
		});
	});
});
