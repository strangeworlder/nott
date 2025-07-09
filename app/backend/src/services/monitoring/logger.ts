// Simple logger utility for backend (Node.js)
// Replace with a more robust logger (e.g. winston) if needed

export const logger = {
	info: (...args: unknown[]) => console.info("[INFO]", ...args),
	warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
	error: (...args: unknown[]) => console.error("[ERROR]", ...args),
};
