import { createServer } from "node:http";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { config } from "./config";
import { connectDatabase } from "./db/connection";
import {
	errorHandler,
	handleUncaughtException,
	handleUnhandledRejection,
	notFoundHandler,
} from "./middleware/errorHandler";
import {
	memoryUsageMiddleware,
	performanceMiddleware,
} from "./middleware/performance";
import { rateLimiter } from "./middleware/rateLimiter";
import routes from "./routes";
import monitoringRoutes from "./routes/monitoring";
// --- Sentry Integration ---
import {
	initializeSentry,
	sentryMiddleware,
} from "./services/monitoring/sentry";
import { setupSocketHandlers } from "./socket/handlers";

// Load environment variables
dotenv.config();

// Initialize Sentry (must be before any other middleware)
// Temporarily disable Sentry to debug startup issues
// initializeSentry();

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: config.frontendUrl,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// --- Sentry request/tracing middleware (must be first) ---
// Temporarily disable Sentry middleware to debug startup issues
// app.use(sentryMiddleware.requestHandler);
// app.use(sentryMiddleware.tracingHandler);

// Middleware
app.use(helmet());
app.use(compression());
app.use(
	cors({
		origin: config.frontendUrl,
		credentials: true,
	}),
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Add performance monitoring middleware
app.use(performanceMiddleware);
app.use(memoryUsageMiddleware);

// Add monitoring routes
app.use("/api/monitoring", monitoringRoutes);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Socket.io setup
setupSocketHandlers(io);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// --- Sentry error handler (must be before custom error handler) ---
// Temporarily disable Sentry error handler to debug startup issues
// app.use(sentryMiddleware.errorHandler);

// Error handling
app.use(errorHandler);

// Global error handlers
process.on("uncaughtException", handleUncaughtException);
process.on("unhandledRejection", handleUnhandledRejection);

// Start server
const startServer = async () => {
	try {
		// Try to connect to database (but don't fail if it doesn't work)
		await connectDatabase();

		server.listen(config.port, () => {
			console.log(`🚀 Server running on port ${config.port}`);
			console.log(`📊 Environment: ${config.nodeEnv}`);
			console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

export { app, io };
