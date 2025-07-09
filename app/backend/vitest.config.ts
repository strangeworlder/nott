import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./src/test/setup.ts"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@/types": resolve(__dirname, "./src/types"),
			"@/controllers": resolve(__dirname, "./src/controllers"),
			"@/services": resolve(__dirname, "./src/services"),
			"@/models": resolve(__dirname, "./src/models"),
			"@/routes": resolve(__dirname, "./src/routes"),
			"@/middleware": resolve(__dirname, "./src/middleware"),
			"@/utils": resolve(__dirname, "./src/utils"),
			"@/db": resolve(__dirname, "./src/db"),
		},
	},
});
