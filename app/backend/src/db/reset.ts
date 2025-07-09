import { query } from "./connection";

const resetDatabase = async () => {
	try {
		console.log("🗑️  Resetting database...");

		// Drop all tables in correct order (respecting foreign keys)
		await query("DROP TABLE IF EXISTS game_players CASCADE");
		await query("DROP TABLE IF EXISTS games CASCADE");
		await query("DROP TABLE IF EXISTS users CASCADE");
		await query("DROP TABLE IF EXISTS migrations CASCADE");

		console.log("✅ Database reset completed");
		console.log('💡 Run "npm run db:migrate" to recreate tables');
	} catch (error) {
		console.error("❌ Database reset failed:", error);
		throw error;
	}
};

// Run reset if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	resetDatabase();
}

export { resetDatabase };
