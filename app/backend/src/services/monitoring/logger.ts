import type { Request, Response } from "express";
import winston from "winston";
import { config } from "../../config";

// Custom log format for structured logging
const logFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.errors({ stack: true }),
	winston.format.json(),
	winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
		const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
		const stackStr = stack ? `\n${stack}` : "";
		return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}${stackStr}`;
	}),
);

// Create Winston logger instance
const logger = winston.createLogger({
	level: config.nodeEnv === "production" ? "info" : "debug",
	format: logFormat,
	defaultMeta: {
		service: "nott-backend",
		environment: config.nodeEnv,
		version: process.env.npm_package_version || "1.0.0",
	},
	transports: [
		// Console transport for development
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),

		// File transport for errors
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
			),
		}),

		// File transport for all logs
		new winston.transports.File({
			filename: "logs/combined.log",
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
			),
		}),
	],
	// Handle uncaught exceptions
	exceptionHandlers: [
		new winston.transports.File({ filename: "logs/exceptions.log" }),
	],
	// Handle unhandled promise rejections
	rejectionHandlers: [
		new winston.transports.File({ filename: "logs/rejections.log" }),
	],
});

// Create a stream for Morgan HTTP logging
export const morganStream = {
	write: (message: string) => {
		logger.info(message.trim());
	},
};

// Enhanced logger with additional methods
export const enhancedLogger = {
	// Standard logging methods
	info: (message: string, meta?: Record<string, unknown>) => {
		logger.info(message, meta);
	},

	warn: (message: string, meta?: Record<string, unknown>) => {
		logger.warn(message, meta);
	},

	error: (message: string, meta?: Record<string, unknown>) => {
		logger.error(message, meta);
	},

	debug: (message: string, meta?: Record<string, unknown>) => {
		logger.debug(message, meta);
	},

	// Specialized logging methods
	security: (message: string, meta?: Record<string, unknown>) => {
		logger.warn(`🔒 SECURITY: ${message}`, { ...meta, category: "security" });
	},

	performance: (message: string, meta?: Record<string, unknown>) => {
		logger.info(`⚡ PERFORMANCE: ${message}`, {
			...meta,
			category: "performance",
		});
	},

	database: (message: string, meta?: Record<string, unknown>) => {
		logger.info(`🗄️ DATABASE: ${message}`, { ...meta, category: "database" });
	},

	api: (message: string, meta?: Record<string, unknown>) => {
		logger.info(`🌐 API: ${message}`, { ...meta, category: "api" });
	},

	socket: (message: string, meta?: Record<string, unknown>) => {
		logger.info(`🔌 SOCKET: ${message}`, { ...meta, category: "socket" });
	},

	game: (message: string, meta?: Record<string, unknown>) => {
		logger.info(`🎮 GAME: ${message}`, { ...meta, category: "game" });
	},

	// Error logging with context
	errorWithContext: (error: Error, context?: Record<string, unknown>) => {
		logger.error(error.message, {
			stack: error.stack,
			name: error.name,
			...context,
		});
	},

	// Request logging
	request: (req: Request, res: Response, responseTime: number) => {
		logger.info("HTTP Request", {
			method: req.method,
			url: req.url,
			statusCode: res.statusCode,
			responseTime: `${responseTime}ms`,
			userAgent: req.get("User-Agent"),
			ip: req.ip,
			userId:
				(req as Request & { user?: { id: string } }).user?.id || "anonymous",
		});
	},

	// Database query logging
	query: (query: string, duration: number, params?: unknown[]) => {
		logger.debug("Database Query", {
			query: query.substring(0, 200) + (query.length > 200 ? "..." : ""),
			duration: `${duration}ms`,
			params: params?.slice(0, 3), // Log first 3 params for privacy
		});
	},

	// Socket event logging
	socketEvent: (event: string, socketId: string, data?: unknown) => {
		logger.debug("Socket Event", {
			event,
			socketId,
			dataSize: data ? JSON.stringify(data).length : 0,
		});
	},

	// Game event logging
	gameEvent: (
		event: string,
		gameId: string,
		playerId?: string,
		data?: unknown,
	) => {
		logger.info("Game Event", {
			event,
			gameId,
			playerId,
			dataSize: data ? JSON.stringify(data).length : 0,
		});
	},
};

// Export both for backward compatibility
export { logger };
