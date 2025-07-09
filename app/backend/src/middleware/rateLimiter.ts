import rateLimit from "express-rate-limit";
import { config } from "../config";

export const rateLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.max,
	message: {
		success: false,
		error: {
			code: "RATE_LIMIT_EXCEEDED",
			message: "Too many requests from this IP, please try again later.",
			timestamp: new Date().toISOString(),
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: {
		success: false,
		error: {
			code: "AUTH_RATE_LIMIT_EXCEEDED",
			message: "Too many authentication attempts, please try again later.",
			timestamp: new Date().toISOString(),
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});
