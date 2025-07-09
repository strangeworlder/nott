import { Pool } from "pg";
import { config } from "../config";

const pool = new Pool({
	connectionString: config.database.url,
	ssl: config.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
});

export const connectDatabase = async () => {
	try {
		const client = await pool.connect();
		client.release();
		console.log("✅ Database connected successfully");
	} catch (error) {
		console.warn("⚠️  Database connection failed:", error);
		console.warn("⚠️  Continuing without database - some features may not work");
		console.warn(
			"⚠️  To set up database, run: docker-compose up -d postgres redis",
		);
		// Don't throw error - allow app to continue without database
	}
};

export const query = async (text: string, params?: unknown[]) => {
	try {
		const start = Date.now();
		const res = await pool.query(text, params);
		const duration = Date.now() - start;
		return res;
	} catch (error) {
		console.error("Query error:", error);
		throw error;
	}
};

export const getClient = () => {
	return pool.connect();
};

export default pool;
