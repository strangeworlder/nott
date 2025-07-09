export const config = {
	nodeEnv: process.env.NODE_ENV || "development",
	port: process.env.PORT || "4000",
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:3013",

	// Database
	database: {
		url:
			process.env.DATABASE_URL ||
			"postgresql://nott_user:nott_password@localhost:5432/nott_dev",
	},

	// Redis
	redis: {
		url: process.env.REDIS_URL || "redis://localhost:6379",
	},

	// JWT
	jwt: {
		secret: process.env.JWT_SECRET || "your-jwt-secret",
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	},

	// WebRTC
	webrtc: {
		turnServerUrl:
			process.env.TURN_SERVER_URL || "stun:stun.l.google.com:19302",
		turnUsername: process.env.TURN_USERNAME || "nott_user",
		turnPassword: process.env.TURN_PASSWORD || "nott_password",
	},

	// Rate limiting
	rateLimit: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
	},

	// CORS
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:3013",
		credentials: true,
	},
} as const;

export type Config = typeof config;
