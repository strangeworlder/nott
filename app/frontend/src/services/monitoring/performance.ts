// Performance monitoring service for NotT frontend
// Provides comprehensive performance tracking and profiling

import { environment } from '@/config/environment';

// Performance metrics interface
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte

  // Custom metrics
  componentRenderTime: Record<string, number>;
  apiResponseTime: Record<string, number>;
  memoryUsage?: number;
  frameRate?: number;

  // User interactions
  userInteractions: Array<{
    type: string;
    timestamp: number;
    duration?: number;
  }>;

  // Errors
  errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
    context?: Record<string, unknown>;
  }>;
}

// Performance observer for Core Web Vitals
class PerformanceMonitor {
  private observer: globalThis.PerformanceObserver | null = null;
  private metrics: PerformanceMetrics;

  constructor() {
    this.metrics = {
      componentRenderTime: {},
      apiResponseTime: {},
      userInteractions: [],
      errors: [],
    };
    this.init();
  }

  private init(): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observer = new window.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe different performance entry types
      if (this.observer) {
        this.observer.observe({
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'],
        });
      }
    }

    // Monitor frame rate
    this.startFrameRateMonitoring();

    // Monitor memory usage
    this.startMemoryMonitoring();
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
        break;
      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        break;
      case 'first-input': {
        const firstInput = entry as PerformanceEventTiming;
        this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        break;
      }
      case 'layout-shift': {
        const layoutShift = entry as LayoutShift;
        this.metrics.cls = (this.metrics.cls || 0) + layoutShift.value;
        break;
      }
    }
  }

  private startFrameRateMonitoring(): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        this.metrics.frameRate = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  private startMemoryMonitoring(): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    setInterval(() => {
      if ('memory' in performance) {
        const memory = (
          performance as Performance & {
            memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
          }
        ).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }
    }, 5000);
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    this.metrics.componentRenderTime[componentName] = renderTime;

    if (environment.ENABLE_DEBUG) {
    }
  }

  // Track API response time
  trackApiResponse(apiName: string, responseTime: number): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    this.metrics.apiResponseTime[apiName] = responseTime;

    if (environment.ENABLE_DEBUG) {
    }
  }

  // Track user interactions
  trackUserInteraction(type: string, duration?: number): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    this.metrics.userInteractions.push({
      type,
      timestamp: performance.now(),
      ...(duration !== undefined && { duration }),
    });
  }

  // Track errors
  trackError(error: Error, context?: Record<string, unknown>): void {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    this.metrics.errors.push({
      message: error.message,
      timestamp: performance.now(),
      ...(error.stack && { stack: error.stack }),
      ...(context && { context }),
    });
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Send metrics to monitoring service
  async sendMetrics(): Promise<void> {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    try {
      const response = await fetch(`${environment.API_BASE_URL}/api/monitoring/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.metrics),
      });

      if (!response.ok) {
        console.warn('[Performance] Failed to send metrics');
      }
    } catch (error) {
      console.warn('[Performance] Error sending metrics:', error);
    }
  }

  // Cleanup
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Performance profiler for detailed analysis
export class PerformanceProfiler {
  private profiles: Map<string, number> = new Map();
  private activeProfiles: Map<string, number> = new Map();

  // Start profiling a section
  startProfile(name: string): void {
    if (!environment.ENABLE_PROFILING) {
      return;
    }

    this.activeProfiles.set(name, performance.now());
  }

  // End profiling a section
  endProfile(name: string): number {
    if (!environment.ENABLE_PROFILING) {
      return 0;
    }

    const startTime = this.activeProfiles.get(name);
    if (!startTime) {
      return 0;
    }

    const duration = performance.now() - startTime;
    this.profiles.set(name, duration);
    this.activeProfiles.delete(name);

    if (environment.ENABLE_DEBUG) {
    }

    return duration;
  }

  // Profile a function
  async profileFunction<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    if (!environment.ENABLE_PROFILING) {
      return await fn();
    }

    this.startProfile(name);
    try {
      const result = await fn();
      this.endProfile(name);
      return result;
    } catch (error) {
      this.endProfile(name);
      throw error;
    }
  }

  // Get all profiles
  getProfiles(): Record<string, number> {
    return Object.fromEntries(this.profiles);
  }

  // Clear profiles
  clearProfiles(): void {
    this.profiles.clear();
    this.activeProfiles.clear();
  }
}

// Global performance monitoring instance
export const performanceMonitor = new PerformanceMonitor();
export const performanceProfiler = new PerformanceProfiler();

// Auto-send metrics every 30 seconds
if (environment.ENABLE_PERFORMANCE_MONITORING) {
  setInterval(() => {
    performanceMonitor.sendMetrics();
  }, 30000);
}

// Track page visibility changes
if (environment.ENABLE_PERFORMANCE_MONITORING) {
  document.addEventListener('visibilitychange', () => {
    performanceMonitor.trackUserInteraction('visibility_change', undefined);
  });
}

export default performanceMonitor;
