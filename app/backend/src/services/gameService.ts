import { getClient, query } from "@/db/connection";
import { createError } from "@/middleware/errorHandler";
import type {
	CreateGameRequest,
	Game,
	GamePlayer,
	GameState,
	JoinGameRequest,
} from "@/types/database";

interface GameStats {
	id: string;
	name: string;
	director_id: string;
	max_players: number;
	status: string;
	game_phase: string;
	settings: Record<string, unknown>;
	winner_id?: string;
	created_at: Date;
	updated_at: Date;
	started_at?: Date;
	ended_at?: Date;
	total_players: string;
	eliminated_players: string;
	directors: string;
	players: string;
}

export interface GameService {
	createGame(gameData: CreateGameRequest): Promise<Game>;
	findById(id: string): Promise<Game | null>;
	updateGameState(id: string, state: Partial<Game>): Promise<Game>;
	addPlayer(
		gameId: string,
		userId: string,
		role: "director" | "player",
		playerNumber?: number,
	): Promise<GamePlayer>;
	removePlayer(gameId: string, userId: string): Promise<void>;
	getGamePlayers(gameId: string): Promise<GamePlayer[]>;
	getActiveGames(): Promise<Game[]>;
	getGamesByUser(userId: string): Promise<Game[]>;
	startGame(gameId: string): Promise<Game>;
	endGame(gameId: string, winnerId?: string): Promise<Game>;
	updatePlayerStatus(
		gameId: string,
		userId: string,
		isReady: boolean,
	): Promise<GamePlayer>;
	awardStrike(
		gameId: string,
		playerId: string,
		reason: string,
		source: string,
	): Promise<void>;
	getGameStats(gameId: string): Promise<GameStats | null>;
}

class GameServiceImpl implements GameService {
	async createGame(gameData: CreateGameRequest): Promise<Game> {
		try {
			const client = await getClient();
			try {
				await client.query("BEGIN");

				// Create the game
				const gameResult = await client.query(
					`INSERT INTO games (name, director_id, max_players, settings)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
					[
						gameData.name,
						gameData.director_id,
						gameData.max_players || 5,
						JSON.stringify(gameData.settings || {}),
					],
				);

				const game = gameResult.rows[0];

				// Add director as first player
				await client.query(
					`INSERT INTO game_players (game_id, user_id, role)
           VALUES ($1, $2, $3)`,
					[game.id, gameData.director_id, "director"],
				);

				await client.query("COMMIT");
				return game;
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			} finally {
				client.release();
			}
		} catch (error) {
			console.error("Error creating game:", error);
			throw error;
		}
	}

	async findById(id: string): Promise<Game | null> {
		try {
			const result = await query("SELECT * FROM games WHERE id = $1", [id]);

			return result.rows[0] || null;
		} catch (error) {
			console.error("Error finding game by ID:", error);
			throw error;
		}
	}

	async updateGameState(id: string, updates: Partial<Game>): Promise<Game> {
		try {
			const setClauses: string[] = [];
			const values: unknown[] = [];
			let paramIndex = 1;

			// Build dynamic SET clause
			for (const [key, value] of Object.entries(updates)) {
				if (value !== undefined && key !== "id") {
					setClauses.push(`${key} = $${paramIndex}`);
					values.push(value);
					paramIndex++;
				}
			}

			if (setClauses.length === 0) {
				throw createError("No valid updates provided", 400);
			}

			values.push(id);
			const result = await query(
				`UPDATE games 
         SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING *`,
				values,
			);

			if (result.rowCount === 0) {
				throw createError("Game not found", 404);
			}

			return result.rows[0];
		} catch (error) {
			console.error("Error updating game:", error);
			throw error;
		}
	}

	async addPlayer(
		gameId: string,
		userId: string,
		role: "director" | "player",
		playerNumber?: number,
	): Promise<GamePlayer> {
		try {
			const result = await query(
				`INSERT INTO game_players (game_id, user_id, role, player_number)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
				[gameId, userId, role, playerNumber],
			);

			return result.rows[0];
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes("unique constraint")
			) {
				throw createError("Player already in game", 409);
			}
			console.error("Error adding player to game:", error);
			throw error;
		}
	}

	async removePlayer(gameId: string, userId: string): Promise<void> {
		try {
			const result = await query(
				"DELETE FROM game_players WHERE game_id = $1 AND user_id = $2",
				[gameId, userId],
			);

			if (result.rowCount === 0) {
				throw createError("Player not found in game", 404);
			}
		} catch (error) {
			console.error("Error removing player from game:", error);
			throw error;
		}
	}

	async getGamePlayers(gameId: string): Promise<GamePlayer[]> {
		try {
			const result = await query(
				`SELECT gp.*, u.username, u.avatar_url
         FROM game_players gp
         JOIN users u ON gp.user_id = u.id
         WHERE gp.game_id = $1
         ORDER BY gp.player_number, gp.role`,
				[gameId],
			);

			return result.rows;
		} catch (error) {
			console.error("Error getting game players:", error);
			throw error;
		}
	}

	async getActiveGames(): Promise<Game[]> {
		try {
			const result = await query(
				`SELECT g.*, u.username as director_name
         FROM games g
         JOIN users u ON g.director_id = u.id
         WHERE g.status IN ('lobby', 'active')
         ORDER BY g.created_at DESC`,
			);

			return result.rows;
		} catch (error) {
			console.error("Error getting active games:", error);
			throw error;
		}
	}

	async getGamesByUser(userId: string): Promise<Game[]> {
		try {
			const result = await query(
				`SELECT DISTINCT g.*, u.username as director_name
         FROM games g
         JOIN users u ON g.director_id = u.id
         JOIN game_players gp ON g.id = gp.game_id
         WHERE gp.user_id = $1
         ORDER BY g.created_at DESC`,
				[userId],
			);

			return result.rows;
		} catch (error) {
			console.error("Error getting games by user:", error);
			throw error;
		}
	}

	async startGame(gameId: string): Promise<Game> {
		try {
			const client = await getClient();
			try {
				await client.query("BEGIN");

				// Check if game exists and is in lobby status
				const gameResult = await client.query(
					"SELECT * FROM games WHERE id = $1 AND status = $2",
					[gameId, "lobby"],
				);

				if (gameResult.rowCount === 0) {
					throw createError("Game not found or not ready to start", 404);
				}

				// Check if all players are ready
				const playersResult = await client.query(
					"SELECT COUNT(*) as total, COUNT(CASE WHEN is_ready = true THEN 1 END) as ready FROM game_players WHERE game_id = $1",
					[gameId],
				);

				const { total, ready } = playersResult.rows[0];
				if (Number.parseInt(ready) < Number.parseInt(total)) {
					throw createError("Not all players are ready", 400);
				}

				// Start the game
				const result = await client.query(
					`UPDATE games 
           SET status = 'active', game_phase = 'setup', started_at = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING *`,
					[gameId],
				);

				await client.query("COMMIT");
				return result.rows[0];
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			} finally {
				client.release();
			}
		} catch (error) {
			console.error("Error starting game:", error);
			throw error;
		}
	}

	async endGame(gameId: string, winnerId?: string): Promise<Game> {
		try {
			const result = await query(
				`UPDATE games 
         SET status = 'completed', game_phase = 'ended', ended_at = CURRENT_TIMESTAMP, winner_id = $2
         WHERE id = $1
         RETURNING *`,
				[gameId, winnerId],
			);

			if (result.rowCount === 0) {
				throw createError("Game not found", 404);
			}

			return result.rows[0];
		} catch (error) {
			console.error("Error ending game:", error);
			throw error;
		}
	}

	async updatePlayerStatus(
		gameId: string,
		userId: string,
		isReady: boolean,
	): Promise<GamePlayer> {
		try {
			const result = await query(
				`UPDATE game_players 
         SET is_ready = $3, last_action_at = CURRENT_TIMESTAMP
         WHERE game_id = $1 AND user_id = $2
         RETURNING *`,
				[gameId, userId, isReady],
			);

			if (result.rowCount === 0) {
				throw createError("Player not found in game", 404);
			}

			return result.rows[0];
		} catch (error) {
			console.error("Error updating player status:", error);
			throw error;
		}
	}

	async awardStrike(
		gameId: string,
		playerId: string,
		reason: string,
		source: string,
	): Promise<void> {
		try {
			const client = await getClient();
			try {
				await client.query("BEGIN");

				// Add strike record
				await client.query(
					`INSERT INTO strikes (game_id, player_id, strike_reason, strike_source)
           VALUES ($1, $2, $3, $4)`,
					[gameId, playerId, reason, source],
				);

				// Update player strikes count
				await client.query(
					`UPDATE game_players 
           SET strikes = strikes + 1
           WHERE game_id = $1 AND user_id = $2`,
					[gameId, playerId],
				);

				// Check if player should be eliminated (3 strikes)
				const playerResult = await client.query(
					"SELECT strikes FROM game_players WHERE game_id = $1 AND user_id = $2",
					[gameId, playerId],
				);

				if (playerResult.rows[0].strikes >= 3) {
					await client.query(
						`UPDATE game_players 
             SET is_eliminated = true
             WHERE game_id = $1 AND user_id = $2`,
						[gameId, playerId],
					);
				}

				await client.query("COMMIT");
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			} finally {
				client.release();
			}
		} catch (error) {
			console.error("Error awarding strike:", error);
			throw error;
		}
	}

	async getGameStats(gameId: string): Promise<GameStats | null> {
		try {
			const result = await query(
				`SELECT 
           g.*,
           COUNT(gp.id) as total_players,
           COUNT(CASE WHEN gp.is_eliminated = true THEN 1 END) as eliminated_players,
           COUNT(CASE WHEN gp.role = 'director' THEN 1 END) as directors,
           COUNT(CASE WHEN gp.role = 'player' THEN 1 END) as players
         FROM games g
         LEFT JOIN game_players gp ON g.id = gp.game_id
         WHERE g.id = $1
         GROUP BY g.id`,
				[gameId],
			);

			return result.rows[0] || null;
		} catch (error) {
			console.error("Error getting game stats:", error);
			throw error;
		}
	}
}

export const gameService = new GameServiceImpl();
