import { getClient, query } from "@/db/connection";
import { createError } from "@/middleware/errorHandler";
import type {
	DatabaseResult,
	QueryResult,
	User,
	UserStats,
} from "@/types/database";

export interface CreateUserData {
	username: string;
	email: string;
	password_hash: string;
	bio?: string;
	avatar_url?: string;
}

export interface UpdateUserData {
	username?: string;
	email?: string;
	bio?: string;
	avatar_url?: string;
	is_online?: boolean;
}

export interface UserService {
	createUser(userData: CreateUserData): Promise<User>;
	findById(id: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	updateUser(id: string, updates: UpdateUserData): Promise<User>;
	deleteUser(id: string): Promise<void>;
	updateOnlineStatus(id: string, isOnline: boolean): Promise<void>;
	getUserStats(userId: string): Promise<UserStats | null>;
	updateUserStats(
		userId: string,
		stats: Partial<UserStats>,
	): Promise<UserStats>;
	searchUsers(query: string, limit?: number): Promise<User[]>;
	getOnlineUsers(): Promise<User[]>;
}

class UserServiceImpl implements UserService {
	async createUser(userData: CreateUserData): Promise<User> {
		try {
			const result = await query(
				`INSERT INTO users (username, email, password_hash, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
				[
					userData.username,
					userData.email,
					userData.password_hash,
					userData.bio || null,
					userData.avatar_url || null,
				],
			);

			if (result.rowCount === 0) {
				throw createError("Failed to create user", 500);
			}

			return result.rows[0];
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes("unique constraint")
			) {
				throw createError("Username or email already exists", 409);
			}
			throw error;
		}
	}

	async findById(id: string): Promise<User | null> {
		try {
			const result = await query("SELECT * FROM users WHERE id = $1", [id]);

			return result.rows[0] || null;
		} catch (error) {
			console.error("Error finding user by ID:", error);
			throw error;
		}
	}

	async findByUsername(username: string): Promise<User | null> {
		try {
			const result = await query("SELECT * FROM users WHERE username = $1", [
				username,
			]);

			return result.rows[0] || null;
		} catch (error) {
			console.error("Error finding user by username:", error);
			throw error;
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		try {
			const result = await query("SELECT * FROM users WHERE email = $1", [
				email,
			]);

			return result.rows[0] || null;
		} catch (error) {
			console.error("Error finding user by email:", error);
			throw error;
		}
	}

	async updateUser(id: string, updates: UpdateUserData): Promise<User> {
		try {
			const setClauses: string[] = [];
			const values: unknown[] = [];
			let paramIndex = 1;

			// Build dynamic SET clause
			for (const [key, value] of Object.entries(updates)) {
				if (value !== undefined) {
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
				`UPDATE users 
         SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING *`,
				values,
			);

			if (result.rowCount === 0) {
				throw createError("User not found", 404);
			}

			return result.rows[0];
		} catch (error) {
			console.error("Error updating user:", error);
			throw error;
		}
	}

	async deleteUser(id: string): Promise<void> {
		try {
			const result = await query("DELETE FROM users WHERE id = $1", [id]);

			if (result.rowCount === 0) {
				throw createError("User not found", 404);
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			throw error;
		}
	}

	async updateOnlineStatus(id: string, isOnline: boolean): Promise<void> {
		try {
			await query(
				`UPDATE users 
         SET is_online = $1, last_seen = CURRENT_TIMESTAMP
         WHERE id = $2`,
				[isOnline, id],
			);
		} catch (error) {
			console.error("Error updating online status:", error);
			throw error;
		}
	}

	async getUserStats(userId: string): Promise<UserStats | null> {
		try {
			const result = await query(
				"SELECT * FROM user_stats WHERE user_id = $1",
				[userId],
			);

			return result.rows[0] || null;
		} catch (error) {
			console.error("Error getting user stats:", error);
			throw error;
		}
	}

	async updateUserStats(
		userId: string,
		stats: Partial<UserStats>,
	): Promise<UserStats> {
		try {
			const setClauses: string[] = [];
			const values: unknown[] = [];
			let paramIndex = 1;

			// Build dynamic SET clause
			for (const [key, value] of Object.entries(stats)) {
				if (value !== undefined && key !== "id" && key !== "user_id") {
					setClauses.push(`${key} = $${paramIndex}`);
					values.push(value);
					paramIndex++;
				}
			}

			if (setClauses.length === 0) {
				throw createError("No valid stats updates provided", 400);
			}

			values.push(userId);
			const result = await query(
				`INSERT INTO user_stats (user_id, games_played, games_won, games_directed, total_score, best_score, survival_rate, average_strikes, total_dice_rolls, successful_tests, failed_tests)
         VALUES ($${paramIndex}, 0, 0, 0, 0, 0, 0.0, 0.0, 0, 0, 0)
         ON CONFLICT (user_id) DO UPDATE SET
           ${setClauses.join(", ")},
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
				values,
			);

			return result.rows[0];
		} catch (error) {
			console.error("Error updating user stats:", error);
			throw error;
		}
	}

	async searchUsers(query: string, limit = 10): Promise<User[]> {
		try {
			const result = await query(
				`SELECT * FROM users 
         WHERE username ILIKE $1 OR email ILIKE $1
         ORDER BY username
         LIMIT $2`,
				[`%${query}%`, limit],
			);

			return result.rows;
		} catch (error) {
			console.error("Error searching users:", error);
			throw error;
		}
	}

	async getOnlineUsers(): Promise<User[]> {
		try {
			const result = await query(
				`SELECT * FROM users 
         WHERE is_online = true
         ORDER BY last_seen DESC`,
			);

			return result.rows;
		} catch (error) {
			console.error("Error getting online users:", error);
			throw error;
		}
	}
}

export const userService = new UserServiceImpl();
