// Performance monitoring composable for Vue components
// Provides easy-to-use performance tracking in components

import { environment } from '@/config/environment';
import { performanceMonitor, performanceProfiler } from '@/services/monitoring/performance';
import { nextTick, onMounted, ref } from 'vue';

export function usePerformance(componentName: string) {
  const renderTime = ref(0);
  const isProfiling = ref(false);

  // Track component render time
  const trackRender = async () => {
    if (!environment.ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    const startTime = performance.now();

    await nextTick();

    const endTime = performance.now();
    renderTime.value = endTime - startTime;

    performanceMonitor.trackComponentRender(componentName, renderTime.value);
  };

  // Profile a function execution
  const profileFunction = async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
    return await performanceProfiler.profileFunction(`${componentName}:${name}`, fn);
  };

  // Track user interaction
  const trackInteraction = (type: string, duration?: number) => {
    performanceMonitor.trackUserInteraction(`${componentName}:${type}`, duration);
  };

  // Start profiling
  const startProfiling = (name: string) => {
    if (!environment.ENABLE_PROFILING) {
      return;
    }

    isProfiling.value = true;
    performanceProfiler.startProfile(`${componentName}:${name}`);
  };

  // End profiling
  const endProfiling = (name: string): number => {
    if (!environment.ENABLE_PROFILING) {
      return 0;
    }

    isProfiling.value = false;
    return performanceProfiler.endProfile(`${componentName}:${name}`);
  };

  // Track error
  const trackError = (error: Error, context?: Record<string, unknown>) => {
    performanceMonitor.trackError(error, {
      component: componentName,
      ...context,
    });
  };

  // Auto-track render time on mount
  onMounted(() => {
    trackRender();
  });

  return {
    renderTime,
    isProfiling,
    trackRender,
    profileFunction,
    trackInteraction,
    startProfiling,
    endProfiling,
    trackError,
  };
}
