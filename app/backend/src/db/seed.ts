import { query } from "./connection";

const seedData = async () => {
	try {
		console.log("🌱 Starting database seeding...");

		// Check if we already have data
		const userCount = await query("SELECT COUNT(*) FROM users");
		if (Number.parseInt(userCount.rows[0].count) > 0) {
			console.log("✅ Database already has data, skipping seed");
			return;
		}

		// Create test users
		const testUsers = [
			{
				username: "testuser1",
				email: "test1@example.com",
				password_hash: "$2a$10$dummy.hash.for.testing.purposes.only",
			},
			{
				username: "testuser2",
				email: "test2@example.com",
				password_hash: "$2a$10$dummy.hash.for.testing.purposes.only",
			},
		];

		for (const user of testUsers) {
			await query(
				"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
				[user.username, user.email, user.password_hash],
			);
		}

		console.log("✅ Database seeded successfully");
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		throw error;
	}
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedData();
}

export { seedData };
