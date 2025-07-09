// Development configuration and utilities
import environment, { isDevelopment } from './environment';

// Development logger
export const developmentConfig = {
  info: (...args: unknown[]) => {
    if (isDevelopment()) {
      console.info('[NotT Dev]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment()) {
      console.warn('[NotT Dev]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment()) {
      console.error('[NotT Dev]', ...args);
    }
  },
};

// Performance monitoring
export const performance = {
  mark: (name: string) => {
    if (isDevelopment()) {
      window.performance?.mark?.(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (isDevelopment()) {
      window.performance?.measure?.(name, startMark, endMark);
    }
  },
  time: (name: string, fn: () => void) => {
    if (isDevelopment()) {
      const start = window.performance.now();
      fn();
      const end = window.performance.now();
      developmentConfig.info(`${name} took ${end - start}ms`);
    } else {
      fn();
    }
  },
};

// Development utilities
export const devUtils = {
  // Mock data for development
  mockData: {
    user: {
      id: 'dev-user-1',
      username: 'DevUser',
      email: 'dev@nott.local',
    },
    game: {
      id: 'dev-game-1',
      name: 'Development Game',
      status: 'waiting',
    },
  },

  // Development shortcuts
  shortcuts: {
    // Press Ctrl+Shift+D to toggle debug mode
    init: () => {
      if (isDevelopment()) {
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            developmentConfig.info('Debug mode toggled');
            // Add debug mode toggle logic here
          }
        });
      }
    },
  },
};

// Initialize development features
if (isDevelopment()) {
  devUtils.shortcuts.init();
  developmentConfig.info('Development mode initialized');
  developmentConfig.info('Config:', environment);
}
