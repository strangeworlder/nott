// Staging configuration and utilities
import environment from './environment';

// Staging logger (enhanced logging for testing)
export const stagingConfig = {
  info: (...args: unknown[]) => {
    if (environment.APP_ENV === 'staging' && environment.ENABLE_LOGGING) {
      console.info('[NotT Staging]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (environment.APP_ENV === 'staging') {
      console.warn('[NotT Staging]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (environment.APP_ENV === 'staging') {
      console.error('[NotT Staging]', ...args);
    }
  },
};

// Performance monitoring for staging
export const performance = {
  mark: (name: string) => {
    if (environment.APP_ENV === 'staging' && environment.ENABLE_PERFORMANCE_MONITORING) {
      window.performance?.mark?.(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (environment.APP_ENV === 'staging' && environment.ENABLE_PERFORMANCE_MONITORING) {
      window.performance?.measure?.(name, startMark, endMark);
    }
  },
  time: (name: string, fn: () => void) => {
    if (environment.APP_ENV === 'staging' && environment.ENABLE_PERFORMANCE_MONITORING) {
      const start = window.performance.now();
      fn();
      const end = window.performance.now();
      const duration = end - start;
      stagingConfig.info(`${name} took ${duration}ms`);
    } else {
      fn();
    }
  },
};

// Staging utilities
export const stagingUtils = {
  // Enhanced error reporting for staging
  reportError: (error: Error, context?: Record<string, unknown>) => {
    if (environment.APP_ENV === 'staging') {
      // Send to staging error reporting service
      console.error('Staging error reported:', error, context);
      // TODO: Integrate with staging error reporting service
    }
  },

  // Analytics for staging
  trackEvent: (eventName: string, data?: Record<string, unknown>) => {
    if (environment.APP_ENV === 'staging' && environment.ENABLE_ANALYTICS) {
      // Send to staging analytics service
      console.info('Staging event tracked:', eventName, data);
      // TODO: Integrate with staging analytics service
    }
  },

  // Feature flag testing
  featureFlags: {
    isEnabled: (flag: string): boolean => {
      // Staging-specific feature flags
      const stagingFlags: Record<string, boolean> = {
        'new-ui': true,
        'beta-features': true,
        'performance-monitoring': true,
        'error-reporting': true,
      };
      return stagingFlags[flag] || false;
    },

    getValue: (flag: string, defaultValue: unknown): unknown => {
      // Staging-specific feature flag values
      const stagingValues: Record<string, unknown> = {
        'api-timeout': 12000,
        'retry-attempts': 3,
        'cache-ttl': 1800000, // 30 minutes
      };
      return stagingValues[flag] ?? defaultValue;
    },
  },

  // Testing utilities
  testing: {
    // Mock data for staging testing
    mockData: {
      user: {
        id: 'staging-user-1',
        username: 'StagingUser',
        email: 'staging@your-domain.example.com',
      },
      game: {
        id: 'staging-game-1',
        name: 'Staging Test Game',
        status: 'active',
      },
    },

    // Performance testing
    performanceTest: {
      measureLoadTime: (name: string) => {
        const start = window.performance.now();
        return () => {
          const end = window.performance.now();
          stagingConfig.info(`${name} load time: ${end - start}ms`);
        };
      },
    },
  },

  // Monitoring utilities
  monitoring: {
    // Health check
    healthCheck: () => {
      const checks = {
        api: fetch(`${environment.API_BASE_URL}/health`)
          .then(() => true)
          .catch(() => false),
        socket: fetch(`${environment.SOCKET_URL}/health`)
          .then(() => true)
          .catch(() => false),
        localStorage: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        })(),
      };

      return Promise.all(
        Object.entries(checks).map(async ([name, check]) => {
          const result = await check;
          stagingConfig.info(`Health check ${name}: ${result ? 'OK' : 'FAILED'}`);
          return { name, status: result };
        })
      );
    },

    // Performance metrics
    getMetrics: () => {
      const metrics = {
        memory: (performance as unknown as Performance & { memory?: unknown }).memory,
        timing: (performance as unknown as Performance & { timing?: unknown }).timing,
        navigation: (
          performance as unknown as Performance & { getEntriesByType?: (type: string) => unknown[] }
        ).getEntriesByType?.('navigation')?.[0],
      };
      stagingConfig.info('Performance metrics:', metrics);
      return metrics;
    },
  },
};

// Initialize staging features
if (environment.APP_ENV === 'staging') {
  stagingConfig.info('Staging mode initialized');
  stagingConfig.info('Config:', environment);

  // Set up enhanced error handling for staging
  window.addEventListener('error', (event) => {
    stagingUtils.reportError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      environment: 'staging',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    stagingUtils.reportError(new Error(event.reason), {
      type: 'unhandledrejection',
      environment: 'staging',
    });
  });

  // Run health check on load
  setTimeout(() => {
    stagingUtils.monitoring.healthCheck();
  }, 5000);
}
