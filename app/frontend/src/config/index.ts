// Configuration index for NotT frontend
// Centralized export of all environment-specific configurations

import { performance as devPerformance, devUtils, developmentConfig } from './development';
import environment, {
  validateEnvironment,
  isDevelopment,
  isProduction,
  isTest,
  logEnvironment,
} from './environment';
import { performance as prodPerformance, prodUtils, productionConfig } from './production';
import { stagingConfig, performance as stagingPerformance, stagingUtils } from './staging';
export { environment, validateEnvironment, isDevelopment, isProduction, isTest, logEnvironment };
export { developmentConfig, performance as devPerformance, devUtils } from './development';
export { productionConfig, performance as prodPerformance, prodUtils } from './production';
export { stagingConfig, performance as stagingPerformance, stagingUtils } from './staging';

// Environment-specific configuration getter
export function getEnvironmentConfig() {
  const env = environment.APP_ENV;

  switch (env) {
    case 'development':
      return {
        config: developmentConfig,
        performance: devPerformance,
        utils: devUtils,
      };
    case 'staging':
      return {
        config: stagingConfig,
        performance: stagingPerformance,
        utils: stagingUtils,
      };
    case 'production':
      return {
        config: productionConfig,
        performance: prodPerformance,
        utils: prodUtils,
      };
    default:
      return {
        config: developmentConfig,
        performance: devPerformance,
        utils: devUtils,
      };
  }
}

// Configuration validation
export function validateConfig() {
  const requiredConfigs = ['API_BASE_URL', 'SOCKET_URL', 'APP_ENV'];

  const missing = requiredConfigs.filter((key) => !environment[key as keyof typeof environment]);

  if (missing.length > 0) {
    console.error('Missing required configuration:', missing);
    return false;
  }

  return true;
}

// Configuration initialization
export function initializeConfig() {
  validateEnvironment();

  if (!validateConfig()) {
    throw new Error('Invalid configuration');
  }

  const envConfig = getEnvironmentConfig();
  envConfig.config.info('Configuration initialized for', environment.APP_ENV);

  return envConfig;
}

// Default export
export default {
  environment,
  getEnvironmentConfig,
  validateConfig,
  initializeConfig,
};
