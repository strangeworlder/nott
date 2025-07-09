// Test setup file for Vitest
import { afterAll, beforeAll } from "vitest";

// Global test setup
beforeAll(() => {
	// Set test environment variables
	process.env.NODE_ENV = "test";
	process.env.JWT_SECRET = "test-secret";
	process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
});

// Global test cleanup
afterAll(() => {
	// Cleanup if needed
});
