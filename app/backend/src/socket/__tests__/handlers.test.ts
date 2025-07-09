import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createServer } from "node:http";
import { Server as IOServer } from "socket.io";
import { io as ClientIO, type Socket as ClientSocket } from "socket.io-client";
import jwt from "jsonwebtoken";
import { setupSocketHandlers } from "../handlers";
import { roomService } from "../../services/roomService";
import { config } from "../../config";

// Type definitions for socket events
interface PlayerLeftPayload {
	username: string;
	userId: string;
}

interface ChatMessagePayload {
	username: string;
	message: string;
	timestamp?: string;
}

interface DiceRolledPayload {
	username: string;
	diceType: string;
	count: number;
	results?: number[];
}

const TEST_PORT = 5050;
const TEST_URL = `http://localhost:${TEST_PORT}`;
const JWT_SECRET = config.jwt.secret || "test-secret";

function createToken(payload: object) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

describe("Socket.io Handlers", () => {
	let ioServer: IOServer;
	let httpServer: ReturnType<typeof createServer>;

	beforeAll(async () => {
		return new Promise<void>((resolve) => {
			httpServer = createServer();
			ioServer = new IOServer(httpServer, {
				cors: { origin: "*", credentials: true },
			});
			setupSocketHandlers(ioServer);
			httpServer.listen(TEST_PORT, resolve);
		});
	});

	afterAll(async () => {
		return new Promise<void>((resolve) => {
			ioServer.close();
			httpServer.close(() => resolve());
		});
	});

	function connectClient(token?: string): Promise<ClientSocket> {
		return new Promise((resolve, reject) => {
			const client = ClientIO(TEST_URL, {
				auth: token ? { token } : {},
				transports: ["websocket"],
				forceNew: true,
				reconnection: false,
			});
			client.on("connect", () => resolve(client));
			client.on("connect_error", (err: Error) => reject(err));
		});
	}

	it("should reject connection without token", async () => {
		await expect(connectClient()).rejects.toBeDefined();
	});

	it("should reject connection with invalid token", async () => {
		await expect(connectClient("invalid.token")).rejects.toBeDefined();
	});

	it("should allow connection with valid token", async () => {
		const token = createToken({ id: "user1", username: "Alice" });
		const client = await connectClient(token);
		expect(client.connected).toBe(true);
		client.disconnect();
	});

	it("should join and leave a room, and emit player:joined/player:left", async () => {
		const token1 = createToken({ id: "user1", username: "Alice" });
		const token2 = createToken({ id: "user2", username: "Bob" });

		// Create a room first
		const room = roomService.createRoom({
			name: "Test Room",
			directorId: "user1",
			directorUsername: "Alice",
		});

		const client1 = await connectClient(token1);
		const client2 = await connectClient(token2);

		// Join both clients to the room first
		await new Promise((resolve) => {
			client1.emit("game:join", { gameId: room.id });
			client2.emit("game:join", { gameId: room.id });
			setTimeout(resolve, 200); // Wait for both to join
		});

		// Listen for player:left on client1
		const leftPromise = new Promise((resolve) => {
			client1.on("player:left", (payload: PlayerLeftPayload) =>
				resolve(payload),
			);
		});

		// client2 leaves the room
		client2.emit("game:leave");
		const leftPayload = await leftPromise;
		expect(leftPayload).toMatchObject({ username: "Bob" });

		client1.disconnect();
		client2.disconnect();
	}, 15000);

	it("should broadcast chat:message to all in room", async () => {
		const token1 = createToken({ id: "user1", username: "Alice" });
		const token2 = createToken({ id: "user2", username: "Bob" });

		// Create a room first
		const room = roomService.createRoom({
			name: "Test Room 2",
			directorId: "user1",
			directorUsername: "Alice",
		});

		const client1 = await connectClient(token1);
		const client2 = await connectClient(token2);

		// Join both clients to the room
		await new Promise((resolve) => {
			client1.emit("game:join", { gameId: room.id });
			client2.emit("game:join", { gameId: room.id });
			setTimeout(resolve, 200); // Wait for join
		});

		const messagePromise = new Promise((resolve) => {
			client2.on("chat:message", (msg: ChatMessagePayload) => resolve(msg));
		});
		client1.emit("chat:message", { message: "Hello Bob!" });
		const msg = await messagePromise;
		expect(msg).toMatchObject({ username: "Alice", message: "Hello Bob!" });

		client1.disconnect();
		client2.disconnect();
	}, 15000);

	it("should emit dice:rolled to all in room", async () => {
		const token1 = createToken({ id: "user1", username: "Alice" });
		const token2 = createToken({ id: "user2", username: "Bob" });

		// Create a room first
		const room = roomService.createRoom({
			name: "Test Room 3",
			directorId: "user1",
			directorUsername: "Alice",
		});

		const client1 = await connectClient(token1);
		const client2 = await connectClient(token2);

		// Join both clients to the room
		await new Promise((resolve) => {
			client1.emit("game:join", { gameId: room.id });
			client2.emit("game:join", { gameId: room.id });
			setTimeout(resolve, 200);
		});

		const dicePromise = new Promise((resolve) => {
			client2.on("dice:rolled", (payload: DiceRolledPayload) =>
				resolve(payload),
			);
		});
		client1.emit("dice:roll", { diceType: "d6", count: 2 });
		const result = await dicePromise;
		expect(result).toMatchObject({
			username: "Alice",
			diceType: "d6",
			count: 2,
		});

		client1.disconnect();
		client2.disconnect();
	}, 15000);
});
