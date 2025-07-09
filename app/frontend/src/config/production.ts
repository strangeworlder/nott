// Production configuration and utilities
import environment, { isProduction } from './environment';

// Production logger (minimal logging)
export const productionConfig = {
  info: (...args: unknown[]) => {
    // Only log critical info in production
    if (isProduction() && environment.ENABLE_LOGGING) {
      console.info('[NotT Prod]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    // Always log warnings in production
    if (isProduction()) {
      console.warn('[NotT Prod]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors in production
    if (isProduction()) {
      console.error('[NotT Prod]', ...args);
    }
  },
};

// Performance monitoring for production
export const performance = {
  mark: (name: string) => {
    if (isProduction() && environment.ENABLE_PERFORMANCE_MONITORING) {
      window.performance?.mark?.(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (isProduction() && environment.ENABLE_PERFORMANCE_MONITORING) {
      window.performance?.measure?.(name, startMark, endMark);
    }
  },
  time: (name: string, fn: () => void) => {
    if (isProduction() && environment.ENABLE_PERFORMANCE_MONITORING) {
      const start = window.performance.now();
      fn();
      const end = window.performance.now();
      // Only log if performance is poor
      const duration = end - start;
      if (duration > 100) {
        productionConfig.warn(`${name} took ${duration}ms`);
      }
    } else {
      fn();
    }
  },
};

// Production utilities
export const prodUtils = {
  // Error reporting
  reportError: (error: Error, context?: Record<string, unknown>) => {
    if (isProduction()) {
      // Send to error reporting service
      console.error('Error reported:', error, context);
      // TODO: Integrate with error reporting service (Sentry, etc.)
    }
  },

  // Performance monitoring
  trackEvent: (eventName: string, data?: Record<string, unknown>) => {
    if (isProduction() && environment.ENABLE_ANALYTICS) {
      // Send to analytics service
      console.info('Event tracked:', eventName, data);
      // TODO: Integrate with analytics service (Google Analytics, etc.)
    }
  },

  // Cache management
  cache: {
    set: (key: string, value: unknown, ttl?: number) => {
      try {
        const item = {
          value,
          timestamp: Date.now(),
          ttl: ttl || 3600000, // 1 hour default
        };
        localStorage.setItem(`nott_cache_${key}`, JSON.stringify(item));
      } catch (error) {
        productionConfig.warn('Cache set failed:', error);
      }
    },
    get: (key: string) => {
      try {
        const item = localStorage.getItem(`nott_cache_${key}`);
        if (!item) {
          return null;
        }

        const parsed = JSON.parse(item);
        const now = Date.now();

        if (now - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(`nott_cache_${key}`);
          return null;
        }

        return parsed.value;
      } catch (error) {
        productionConfig.warn('Cache get failed:', error);
        return null;
      }
    },
    clear: () => {
      try {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith('nott_cache_'));
        for (const key of keys) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        productionConfig.warn('Cache clear failed:', error);
      }
    },
  },

  // Security utilities
  security: {
    sanitizeInput: (input: string): string => {
      // Basic XSS prevention
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    },

    validateToken: (token: string): boolean => {
      // Basic JWT token validation
      if (!token || typeof token !== 'string') {
        return false;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      try {
        const payload = JSON.parse(atob(parts[1] || ''));
        const now = Date.now() / 1000;
        return payload.exp > now;
      } catch {
        return false;
      }
    },
  },
};

// Initialize production features
if (isProduction()) {
  productionConfig.info('Production mode initialized');
  productionConfig.info('Config:', environment);

  // Set up error handling
  window.addEventListener('error', (event) => {
    prodUtils.reportError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    prodUtils.reportError(new Error(event.reason), {
      type: 'unhandledrejection',
    });
  });
}
