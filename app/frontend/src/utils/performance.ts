// Performance monitoring utilities for NotT
import environment from '@/config/environment';
import type { Camera, Scene, WebGLRenderer } from 'three';

// Type definitions for Performance API extensions
interface LargestContentfulPaint extends PerformanceEntry {
  element?: Element;
}

interface FirstInput extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<{
    node: Node;
    currentRect: DOMRectReadOnly;
    previousRect: DOMRectReadOnly;
  }>;
}

interface ResourceTiming extends PerformanceEntry {
  initiatorType: string;
  transferSize: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetricObserver {
  onMetric: (metric: PerformanceMetric) => void;
}

class PerformanceMonitor {
  private observers: PerformanceMetricObserver[] = [];
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = environment.ENABLE_PERFORMANCE_MONITORING;
    this.initialize();
  }

  private initialize(): void {
    if (!this.isEnabled) {
      return;
    }

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor network performance
    this.monitorNetworkPerformance();

    // Monitor Three.js performance
    this.monitorThreeJSPerformance();
  }

  private monitorCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new globalThis.PerformanceObserver((list) => {
      const entries = list.getEntries() as LargestContentfulPaint[];
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.recordMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'loading',
          metadata: { element: lastEntry.element?.tagName },
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      new globalThis.PerformanceObserver((list) => {
        const entries = list.getEntries() as FirstInput[];
        for (const entry of entries) {
          this.recordMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'interaction',
          });
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      new globalThis.PerformanceObserver((list) => {
        const entries = list.getEntries() as LayoutShift[];
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            this.recordMetric({
              name: 'CLS',
              value: entry.value,
              unit: 'score',
              timestamp: Date.now(),
              category: 'visual',
            });
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Resource Timing
      new globalThis.PerformanceObserver((list) => {
        const entries = list.getEntries() as ResourceTiming[];
        for (const entry of entries) {
          if (entry.entryType === 'resource') {
            this.recordMetric({
              name: 'ResourceLoad',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'resource',
              metadata: {
                name: entry.name,
                initiatorType: entry.initiatorType,
                transferSize: entry.transferSize,
              },
            });
          }
        }
      }).observe({ entryTypes: ['resource'] });
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as PerformanceWithMemory).memory;
        if (memory) {
          this.recordMetric({
            name: 'Memory Usage',
            value: memory.usedJSHeapSize / 1024 / 1024,
            unit: 'MB',
            timestamp: Date.now(),
            metadata: {
              total: memory.totalJSHeapSize / 1024 / 1024,
              limit: memory.jsHeapSizeLimit / 1024 / 1024,
            },
          });
        }
      }, 5000);
    }
  }

  private monitorNetworkPerformance(): void {
    // Monitor resource loading times
    new globalThis.PerformanceObserver((list) => {
      const entries = list.getEntries() as ResourceTiming[];
      for (const entry of entries) {
        if (entry.entryType === 'resource') {
          this.recordMetric({
            name: 'Resource Load',
            value: entry.duration,
            unit: 'ms',
            timestamp: Date.now(),
            metadata: {
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize,
            },
          });
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  private monitorThreeJSPerformance(): void {
    // Monitor Three.js specific metrics
    // This will be enhanced when Three.js components are implemented
    setInterval(() => {
      const performanceWithMemory = performance as PerformanceWithMemory;
      if (performanceWithMemory.memory) {
        this.recordMetric({
          name: 'Three.js Memory',
          value: 0, // Will be updated when Three.js is implemented
          unit: 'MB',
          timestamp: Date.now(),
          metadata: { component: 'ThreeJS' },
        });
      }
    }, 1000);
  }

  public recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) {
      return;
    }

    this.metrics.push(metric);
    this.notifyObservers(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  public addObserver(observer: PerformanceMetricObserver): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: PerformanceMetricObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(metric: PerformanceMetric): void {
    for (const observer of this.observers) {
      try {
        observer.onMetric(metric);
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((metric) => metric.name === name);
  }

  public getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.getMetricsByName(name);
    return metrics.length > 0 ? (metrics[metrics.length - 1] ?? null) : null;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance measurements
export const measureFunction = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      name: `Function: ${name}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      name: `Function: ${name} (error)`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
};

export const measureAsyncFunction = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      name: `Async Function: ${name}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      name: `Async Function: ${name} (error)`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
};

// Three.js specific performance monitoring
export const monitorThreeJSFrame = (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera
): void => {
  if (!environment.ENABLE_PERFORMANCE_MONITORING) {
    return;
  }

  const start = performance.now();
  renderer.render(scene, camera);
  const duration = performance.now() - start;

  performanceMonitor.recordMetric({
    name: 'Three.js Frame Render',
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
    metadata: {
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      points: renderer.info.render.points,
      lines: renderer.info.render.lines,
    },
  });
};
