// Performance monitoring middleware for Express
// Tracks request/response times and integrates with performance monitor

import { Request, Response, NextFunction } from 'express';
import { backendPerformanceMonitor } from '../services/monitoring/performance';
import { logger } from '../services/monitoring/logger';

export interface PerformanceRequest extends Request {
  startTime?: number;
  performanceId?: string;
}

export function performanceMiddleware(req: PerformanceRequest, res: Response, next: NextFunction): void {
  // Generate unique performance ID
  req.performanceId = `${req.method}:${req.path}:${Date.now()}`;
  req.startTime = Date.now();

  // Track request start
  backendPerformanceMonitor.startProfile(req.performanceId, {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Override res.end to track response time
  const originalEnd = res.end;
  res.end = function(chunk?: unknown, encoding?: BufferEncoding): Response {
    const endTime = Date.now();
    const duration = endTime - (req.startTime || endTime);

    // Track API response
    backendPerformanceMonitor.trackApiResponse(req.path, duration, res.statusCode);

    // End the profile
    backendPerformanceMonitor.endProfile(req.performanceId!);

    // Log performance info
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    } else if (duration > 500) {
      logger.info(`Moderate request: ${req.method} ${req.path} took ${duration}ms`);
    }

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Database performance middleware
export function dbPerformanceMiddleware(query: string, params: unknown[]): void {
  const startTime = Date.now();
  
  return {
    track: (result: unknown) => {
      const duration = Date.now() - startTime;
      backendPerformanceMonitor.trackDbQuery(query, duration);
      return result;
    },
    trackError: (error: Error) => {
      const duration = Date.now() - startTime;
      backendPerformanceMonitor.trackDbQuery(query, duration);
      logger.error('Database query error', { query, duration, error: error.message });
      throw error;
    },
  };
}

// Memory usage middleware
export function memoryUsageMiddleware(req: Request, res: Response, next: NextFunction): void {
  const memUsage = process.memoryUsage();
  const memoryUsageMB = memUsage.heapUsed / 1024 / 1024;
  
  // Log high memory usage
  if (memoryUsageMB > 100) {
    logger.warn(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
  }
  
  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Usage-MB', memoryUsageMB.toFixed(2));
  }
  
  next();
} 