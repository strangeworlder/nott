import { config } from "../config";
import { query } from "./connection";

interface Migration {
	id: number;
	name: string;
	sql: string;
}

const migrations: Migration[] = [
	{
		id: 1,
		name: "create_users_table",
		sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
	},
	{
		id: 2,
		name: "create_games_table",
		sql: `
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        max_players INTEGER DEFAULT 4,
        current_players INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
	},
	{
		id: 3,
		name: "create_game_players_table",
		sql: `
      CREATE TABLE IF NOT EXISTS game_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        player_order INTEGER,
        is_host BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(game_id, user_id)
      );
    `,
	},
	{
		id: 4,
		name: "create_migrations_table",
		sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
	},
];

const createMigrationsTable = async () => {
	try {
		await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
		console.log("✅ Migrations table created/verified");
	} catch (error) {
		console.error("❌ Failed to create migrations table:", error);
		throw error;
	}
};

const getExecutedMigrations = async (): Promise<string[]> => {
	try {
		const result = await query("SELECT name FROM migrations ORDER BY id");
		return result.rows.map((row) => row.name);
	} catch (error) {
		console.error("❌ Failed to get executed migrations:", error);
		return [];
	}
};

const executeMigration = async (migration: Migration) => {
	try {
		console.log(`🔄 Executing migration: ${migration.name}`);
		await query(migration.sql);
		await query("INSERT INTO migrations (name) VALUES ($1)", [migration.name]);
		console.log(`✅ Migration ${migration.name} completed`);
	} catch (error) {
		console.error(`❌ Failed to execute migration ${migration.name}:`, error);
		throw error;
	}
};

const runMigrations = async () => {
	try {
		console.log("🚀 Starting database migrations...");

		// Create migrations table first
		await createMigrationsTable();

		// Get already executed migrations
		const executedMigrations = await getExecutedMigrations();

		// Filter out already executed migrations
		const pendingMigrations = migrations.filter(
			(migration) => !executedMigrations.includes(migration.name),
		);

		if (pendingMigrations.length === 0) {
			console.log("✅ All migrations are up to date");
			return;
		}

		console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

		// Execute pending migrations
		for (const migration of pendingMigrations) {
			await executeMigration(migration);
		}

		console.log("🎉 All migrations completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runMigrations();
}

export { runMigrations };
