// Backend performance monitoring service
// Tracks API response times, database queries, and system metrics

import { logger } from "./logger";

export interface BackendPerformanceMetrics {
	// API metrics
	apiResponseTimes: Record<string, number[]>;
	apiErrorRates: Record<string, number>;
	apiThroughput: Record<string, number>;

	// Database metrics
	dbQueryTimes: Record<string, number[]>;
	dbConnectionPool: {
		total: number;
		idle: number;
		active: number;
	};

	// System metrics
	memoryUsage: {
		used: number;
		total: number;
		percentage: number;
	};
	cpuUsage: number;

	// Custom metrics
	customMetrics: Record<string, number>;

	// Timestamp
	timestamp: number;
}

export interface PerformanceProfile {
	name: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	metadata?: Record<string, unknown>;
}

class BackendPerformanceMonitor {
	private metrics: BackendPerformanceMetrics;
	private activeProfiles: Map<string, PerformanceProfile> = new Map();
	private isMonitoring = false;

	constructor() {
		this.metrics = {
			apiResponseTimes: {},
			apiErrorRates: {},
			apiThroughput: {},
			dbQueryTimes: {},
			dbConnectionPool: { total: 0, idle: 0, active: 0 },
			memoryUsage: { used: 0, total: 0, percentage: 0 },
			cpuUsage: 0,
			customMetrics: {},
			timestamp: Date.now(),
		};

		this.startMonitoring();
	}

	private startMonitoring(): void {
		if (this.isMonitoring) return;
		this.isMonitoring = true;

		// Monitor system metrics every 30 seconds
		setInterval(() => {
			this.updateSystemMetrics();
		}, 30000);

		// Send metrics every minute
		setInterval(() => {
			this.sendMetrics();
		}, 60000);
	}

	private updateSystemMetrics(): void {
		const memUsage = process.memoryUsage();
		this.metrics.memoryUsage = {
			used: memUsage.heapUsed / 1024 / 1024, // MB
			total: memUsage.heapTotal / 1024 / 1024, // MB
			percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
		};

		// Note: CPU usage monitoring would require additional libraries
		// For now, we'll track it as 0 and can be enhanced later
		this.metrics.cpuUsage = 0;
	}

	// Track API response time
	trackApiResponse(route: string, responseTime: number, status: number): void {
		if (!this.metrics.apiResponseTimes[route]) {
			this.metrics.apiResponseTimes[route] = [];
		}

		this.metrics.apiResponseTimes[route].push(responseTime);

		// Keep only last 100 measurements
		if (this.metrics.apiResponseTimes[route].length > 100) {
			this.metrics.apiResponseTimes[route] =
				this.metrics.apiResponseTimes[route].slice(-100);
		}

		// Track error rates
		if (status >= 400) {
			this.metrics.apiErrorRates[route] =
				(this.metrics.apiErrorRates[route] || 0) + 1;
		}

		// Log slow responses
		if (responseTime > 1000) {
			logger.warn(`Slow API response: ${route} took ${responseTime}ms`);
		}
	}

	// Track database query time
	trackDbQuery(query: string, queryTime: number): void {
		const queryKey = query.split(" ")[0]; // Extract first word (SELECT, INSERT, etc.)

		if (!this.metrics.dbQueryTimes[queryKey]) {
			this.metrics.dbQueryTimes[queryKey] = [];
		}

		this.metrics.dbQueryTimes[queryKey].push(queryTime);

		// Keep only last 50 measurements
		if (this.metrics.dbQueryTimes[queryKey].length > 50) {
			this.metrics.dbQueryTimes[queryKey] =
				this.metrics.dbQueryTimes[queryKey].slice(-50);
		}

		// Log slow queries
		if (queryTime > 100) {
			logger.warn(`Slow database query: ${queryKey} took ${queryTime}ms`);
		}
	}

	// Start profiling
	startProfile(name: string, metadata?: Record<string, unknown>): void {
		this.activeProfiles.set(name, {
			name,
			startTime: Date.now(),
			metadata: metadata ?? {},
		});
	}

	// End profiling
	endProfile(name: string): number {
		const profile = this.activeProfiles.get(name);
		if (!profile) return 0;

		profile.endTime = Date.now();
		profile.duration = profile.endTime - profile.startTime;

		this.activeProfiles.delete(name);

		logger.info(`Performance profile: ${name} took ${profile.duration}ms`);

		return profile.duration;
	}

	// Profile a function
	async profileFunction<T>(
		name: string,
		fn: () => Promise<T> | T,
		metadata?: Record<string, unknown>,
	): Promise<T> {
		this.startProfile(name, metadata);

		try {
			const result = await fn();
			this.endProfile(name);
			return result;
		} catch (error) {
			this.endProfile(name);
			throw error;
		}
	}

	// Track custom metric
	trackCustomMetric(name: string, value: number): void {
		this.metrics.customMetrics[name] = value;
	}

	// Get current metrics
	getMetrics(): BackendPerformanceMetrics {
		return { ...this.metrics };
	}

	// Send metrics to external monitoring service
	private async sendMetrics(): Promise<void> {
		try {
			// In a real implementation, you might send to:
			// - Prometheus
			// - DataDog
			// - New Relic
			// - Custom monitoring service

			logger.info("Performance metrics collected", {
				apiRoutes: Object.keys(this.metrics.apiResponseTimes).length,
				dbQueries: Object.keys(this.metrics.dbQueryTimes).length,
				memoryUsage: `${this.metrics.memoryUsage.percentage.toFixed(2)}%`,
			});
		} catch (error) {
			logger.error("Failed to send performance metrics", error);
		}
	}

	// Get performance summary
	getPerformanceSummary(): Record<string, unknown> {
		const summary: Record<string, unknown> = {};

		// API performance summary
		for (const [route, times] of Object.entries(
			this.metrics.apiResponseTimes,
		)) {
			if (times.length > 0) {
				const avg = times.reduce((a, b) => a + b, 0) / times.length;
				const max = Math.max(...times);
				const min = Math.min(...times);

				summary[`api_${route}`] = {
					average: avg.toFixed(2),
					max: max.toFixed(2),
					min: min.toFixed(2),
					count: times.length,
				};
			}
		}

		// Database performance summary
		for (const [query, times] of Object.entries(this.metrics.dbQueryTimes)) {
			if (times.length > 0) {
				const avg = times.reduce((a, b) => a + b, 0) / times.length;
				summary[`db_${query}`] = {
					average: avg.toFixed(2),
					count: times.length,
				};
			}
		}

		// System metrics
		summary.memory_usage = `${this.metrics.memoryUsage.percentage.toFixed(2)}%`;
		summary.active_profiles = this.activeProfiles.size;

		return summary;
	}
}

export const backendPerformanceMonitor = new BackendPerformanceMonitor();
