// API performance interceptor for tracking response times
// Integrates with the performance monitoring system

import { environment } from '@/config/environment';
import { performanceMonitor } from '@/services/monitoring/performance';

export interface ApiPerformanceData {
  url: string;
  method: string;
  responseTime: number;
  status: number;
  success: boolean;
  timestamp: number;
}

class ApiPerformanceInterceptor {
  private activeRequests: Map<string, number> = new Map();

  // Track request start
  trackRequest(url: string, method: string): string {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return '';
    }

    const requestId = `${method}:${url}:${Date.now()}`;
    this.activeRequests.set(requestId, performance.now());

    return requestId;
  }

  // Track request end
  trackResponse(requestId: string, _status: number): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    const startTime = this.activeRequests.get(requestId);
    if (!startTime) {
      return;
    }

    const responseTime = performance.now() - startTime;
    this.activeRequests.delete(requestId);

    const apiName = requestId.split(':')[1]; // Extract URL from requestId
    if (apiName) {
      performanceMonitor.trackApiResponse(apiName, responseTime);
    }

    // Log slow requests
    if (responseTime > 1000 && environment.ENABLE_DEBUG) {
      console.warn(`[API Performance] Slow request: ${apiName} took ${responseTime.toFixed(2)}ms`);
    }
  }

  // Track request error
  trackError(requestId: string, error: Error): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    this.activeRequests.delete(requestId);
    performanceMonitor.trackError(error, { context: 'api_request' });
  }

  // Get active requests count
  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  // Clear all active requests (useful for cleanup)
  clearActiveRequests(): void {
    this.activeRequests.clear();
  }
}

export const apiPerformanceInterceptor = new ApiPerformanceInterceptor();
