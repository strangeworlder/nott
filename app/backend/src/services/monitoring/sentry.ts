import * as Sentry from "@sentry/node";
import type { Request, Response } from "express";
import type { Socket } from "socket.io";
import { config } from "../../config";
import { enhancedLogger } from "./logger";

// Initialize Sentry
export const initializeSentry = () => {
	if (!config.sentryDsn) {
		enhancedLogger.warn("Sentry DSN not configured, error tracking disabled");
		return;
	}

	try {
		Sentry.init({
			dsn: config.sentryDsn,
			environment: config.nodeEnv,
			release: process.env.npm_package_version || "1.0.0",
			tracesSampleRate: config.nodeEnv === "production" ? 0.1 : 1.0,
			profilesSampleRate: config.nodeEnv === "production" ? 0.1 : 1.0,

			integrations: [
				// Automatically instrument Express.js
				new Sentry.Integrations.Express({ app: undefined }),
				// Automatically instrument Node.js libraries and frameworks
				new Sentry.Integrations.Node(),
			],

			// Before send callback to filter sensitive data
			beforeSend(event: Sentry.Event, hint: Sentry.EventHint) {
				// Remove sensitive data from events
				if (event.request?.headers) {
					event.request.headers.authorization = undefined;
					event.request.headers.cookie = undefined;
				}

				// Add custom context
				event.tags = {
					...event.tags,
					service: "nott-backend",
					component: "api",
				};

				return event;
			},

			// Debug mode for development
			debug: config.nodeEnv === "development",
		});

		enhancedLogger.info("Sentry initialized successfully", {
			environment: config.nodeEnv,
			dsn: `${config.sentryDsn.substring(0, 20)}...`,
		});
	} catch (error) {
		enhancedLogger.error("Failed to initialize Sentry", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

// Sentry error tracking utilities
export const sentryUtils = {
	// Capture and report errors
	captureException: (error: Error, context?: Record<string, unknown>) => {
		if (!config.sentryDsn) return;

		try {
			Sentry.withScope((scope: Sentry.Scope) => {
				if (context) {
					for (const [key, value] of Object.entries(context)) {
						scope.setExtra(key, value);
					}
				}
				Sentry.captureException(error);
			});

			enhancedLogger.error("Error captured by Sentry", {
				error: error.message,
				stack: error.stack,
				context,
			});
		} catch (sentryError) {
			enhancedLogger.error("Failed to capture error in Sentry", {
				originalError: error.message,
				sentryError:
					sentryError instanceof Error ? sentryError.message : "Unknown error",
			});
		}
	},

	// Capture messages
	captureMessage: (
		message: string,
		level: Sentry.SeverityLevel = "info",
		context?: Record<string, unknown>,
	) => {
		if (!config.sentryDsn) return;

		try {
			Sentry.withScope((scope: Sentry.Scope) => {
				if (context) {
					for (const [key, value] of Object.entries(context)) {
						scope.setExtra(key, value);
					}
				}
				Sentry.captureMessage(message, level);
			});
		} catch (sentryError) {
			enhancedLogger.error("Failed to capture message in Sentry", {
				message,
				sentryError:
					sentryError instanceof Error ? sentryError.message : "Unknown error",
			});
		}
	},

	// Set user context
	setUser: (user: { id: string; username?: string; email?: string }) => {
		if (!config.sentryDsn) return;

		try {
			Sentry.setUser({
				id: user.id,
				username: user.username,
				email: user.email,
			});
		} catch (error) {
			enhancedLogger.error("Failed to set user in Sentry", {
				userId: user.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	// Clear user context
	clearUser: () => {
		if (!config.sentryDsn) return;

		try {
			Sentry.setUser(null);
		} catch (error) {
			enhancedLogger.error("Failed to clear user in Sentry", {
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	// Add breadcrumb for debugging
	addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
		if (!config.sentryDsn) return;

		try {
			Sentry.addBreadcrumb(breadcrumb);
		} catch (error) {
			enhancedLogger.error("Failed to add breadcrumb in Sentry", {
				breadcrumb,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	// Start performance transaction
	startTransaction: (name: string, operation: string) => {
		if (!config.sentryDsn) return null;

		try {
			return Sentry.startTransaction({
				name,
				op: operation,
			});
		} catch (error) {
			enhancedLogger.error("Failed to start Sentry transaction", {
				name,
				operation,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return null;
		}
	},

	// Set tags for filtering
	setTag: (key: string, value: string) => {
		if (!config.sentryDsn) return;

		try {
			Sentry.setTag(key, value);
		} catch (error) {
			enhancedLogger.error("Failed to set tag in Sentry", {
				key,
				value,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	// Set extra context
	setExtra: (key: string, value: unknown) => {
		if (!config.sentryDsn) return;

		try {
			Sentry.setExtra(key, value);
		} catch (error) {
			enhancedLogger.error("Failed to set extra in Sentry", {
				key,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
};

// Express middleware for Sentry
export const sentryMiddleware = {
	// Request handler for Sentry
	requestHandler: Sentry.Handlers.requestHandler(),

	// Error handler for Sentry
	errorHandler: Sentry.Handlers.errorHandler(),

	// Tracing handler for performance monitoring
	tracingHandler: Sentry.Handlers.tracingHandler(),
};

// Socket.io integration for Sentry
export const sentrySocketHandler = (socket: Socket, next: () => void) => {
	try {
		Sentry.withScope((scope: Sentry.Scope) => {
			scope.setTag("socket.id", socket.id);
			scope.setTag("socket.transport", socket.conn.transport.name);

			// Add user context if available
			const socketWithUser = socket as Socket & {
				user?: { id: string; username?: string };
			};
			if (socketWithUser.user) {
				scope.setUser({
					id: socketWithUser.user.id,
					username: socketWithUser.user.username,
				});
			}

			next();
		});
	} catch (error) {
		enhancedLogger.error("Sentry socket handler error", {
			socketId: socket.id,
			error: error instanceof Error ? error.message : "Unknown error",
		});
		next();
	}
};

// Database error tracking
export const trackDatabaseError = (
	error: Error,
	query?: string,
	params?: unknown[],
) => {
	sentryUtils.captureException(error, {
		category: "database",
		query: query
			? query.substring(0, 200) + (query.length > 200 ? "..." : "")
			: undefined,
		paramsCount: params?.length || 0,
	});
};

// API error tracking
export const trackApiError = (error: Error, req: Request, res: Response) => {
	sentryUtils.captureException(error, {
		category: "api",
		method: req.method,
		url: req.url,
		statusCode: res.statusCode,
		userAgent: req.get("User-Agent"),
		ip: req.ip,
		userId:
			(req as Request & { user?: { id: string } }).user?.id || "anonymous",
	});
};

// Game error tracking
export const trackGameError = (
	error: Error,
	gameId?: string,
	playerId?: string,
) => {
	sentryUtils.captureException(error, {
		category: "game",
		gameId,
		playerId,
	});
};
