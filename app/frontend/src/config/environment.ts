// Environment configuration for NotT frontend
// Centralized environment variable management with type safety

import type { EnvironmentConfig } from '@/types';

// Environment variable access
const env = import.meta.env;

// Type-safe environment configuration
export const environment: EnvironmentConfig = {
  // Application
  APP_ENV: env.VITE_APP_ENV || 'development',
  APP_TITLE: env.VITE_APP_TITLE || 'NotT - Horror Tabletop Game',
  APP_VERSION: env.VITE_APP_VERSION || '1.0.0',

  // API Configuration
  API_BASE_URL: env.VITE_API_BASE_URL || 'http://localhost:4013',
  API_TIMEOUT: Number.parseInt(env.VITE_API_TIMEOUT || '10000'),

  // Socket.io Configuration
  SOCKET_URL: env.VITE_SOCKET_URL || 'http://localhost:4013',
  SOCKET_TIMEOUT: Number.parseInt(env.VITE_SOCKET_TIMEOUT || '5000'),

  // Development Features
  ENABLE_DEBUG: env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_LOGGING: env.VITE_ENABLE_LOGGING === 'true',
  ENABLE_HOT_RELOAD: env.VITE_ENABLE_HOT_RELOAD === 'true',
  ENABLE_SOURCE_MAPS: env.VITE_ENABLE_SOURCE_MAPS === 'true',

  // Performance & Monitoring
  ENABLE_PROFILING: env.VITE_ENABLE_PROFILING === 'true',
  ENABLE_PERFORMANCE_MONITORING: env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',

  // Development Tools
  ENABLE_DEVTOOLS: env.VITE_ENABLE_DEVTOOLS === 'true',
  ENABLE_ERROR_OVERLAY: env.VITE_ENABLE_ERROR_OVERLAY === 'true',

  // Feature Flags
  ENABLE_ANALYTICS: env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: env.VITE_ENABLE_PWA === 'true',
  ENABLE_OFFLINE_MODE: env.VITE_ENABLE_OFFLINE_MODE === 'true',

  // CDN Configuration
  CDN_URL: env.VITE_CDN_URL,
  ASSET_PREFIX: env.VITE_ASSET_PREFIX,
};

// Environment validation
export function validateEnvironment(): void {
  const requiredVars = ['VITE_API_BASE_URL', 'VITE_SOCKET_URL'] as const;

  const missingVars = requiredVars.filter((varName) => !env[varName]);

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
  }
}

// Environment helpers
export function isDevelopment(): boolean {
  return environment.APP_ENV === 'development';
}

export function isProduction(): boolean {
  return environment.APP_ENV === 'production';
}

export function isTest(): boolean {
  return environment.APP_ENV === 'test';
}

// Debug logging
export function logEnvironment(): void {
  if (environment.ENABLE_DEBUG) {
    console.group('🔧 Environment Configuration');
    console.info('Environment:', environment.APP_ENV);
    console.info('Title:', environment.APP_TITLE);
    console.info('Version:', environment.APP_VERSION);
    console.info('API URL:', environment.API_BASE_URL);
    console.info('Socket URL:', environment.SOCKET_URL);
    console.info('Debug Enabled:', environment.ENABLE_DEBUG);
    console.info('Logging Enabled:', environment.ENABLE_LOGGING);
    console.info('Hot Reload:', environment.ENABLE_HOT_RELOAD);
    console.info('Source Maps:', environment.ENABLE_SOURCE_MAPS);
    console.info('Profiling:', environment.ENABLE_PROFILING);
    console.info('Performance Monitoring:', environment.ENABLE_PERFORMANCE_MONITORING);
    console.info('DevTools:', environment.ENABLE_DEVTOOLS);
    console.info('Error Overlay:', environment.ENABLE_ERROR_OVERLAY);
    console.groupEnd();
  }
}

// Initialize environment
validateEnvironment();

if (environment.ENABLE_DEBUG) {
  logEnvironment();
}

export default environment;
