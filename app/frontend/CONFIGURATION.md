# Configuration Guide for NotT Frontend

This document outlines the environment-specific configurations and how to use them in the NotT frontend application.

## Environment Configuration

The NotT frontend supports three main environments:

- **Development**: Local development with hot reload, debugging, and development tools
- **Staging**: Pre-production testing with enhanced monitoring and debugging
- **Production**: Optimized builds with minimal logging and maximum performance

## Environment Files

### Required Environment Files

You need to create the following environment files manually (they are blocked by globalIgnore):

#### `.env.development`
```bash
# Development Environment Configuration
VITE_APP_ENV=development
VITE_APP_TITLE=NotT - Horror Tabletop Game (Dev)
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:4013
VITE_API_TIMEOUT=10000
VITE_SOCKET_URL=http://localhost:4013
VITE_SOCKET_TIMEOUT=5000
VITE_ENABLE_DEBUG=true
VITE_ENABLE_LOGGING=true
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_SOURCE_MAPS=true
VITE_ENABLE_PROFILING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_ERROR_OVERLAY=true
VITE_BUILD_ANALYZE=false
VITE_BUILD_COMPRESS=false
VITE_ENABLE_PWA=false
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_ANALYTICS=false
VITE_DEV_SERVER_PORT=3000
VITE_DEV_SERVER_HOST=localhost
```

#### `.env.staging`
```bash
# Staging Environment Configuration
# Replace placeholder URLs with your actual staging URLs
VITE_APP_ENV=staging
VITE_APP_TITLE=NotT - Horror Tabletop Game (Staging)
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://your-staging-api.example.com
VITE_API_TIMEOUT=12000
VITE_SOCKET_URL=https://your-staging-api.example.com
VITE_SOCKET_TIMEOUT=8000
VITE_ENABLE_DEBUG=true
VITE_ENABLE_LOGGING=true
VITE_ENABLE_HOT_RELOAD=false
VITE_ENABLE_SOURCE_MAPS=true
VITE_ENABLE_PROFILING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_ERROR_OVERLAY=true
VITE_BUILD_ANALYZE=true
VITE_BUILD_COMPRESS=true
VITE_ENABLE_PWA=false
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_CDN_URL=https://your-staging-cdn.example.com
VITE_ASSET_PREFIX=/assets/
```

#### `.env.production`
```bash
# Production Environment Configuration
# Replace placeholder URLs with your actual production URLs
VITE_APP_ENV=production
VITE_APP_TITLE=NotT - Horror Tabletop Game
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://your-production-api.example.com
VITE_API_TIMEOUT=15000
VITE_SOCKET_URL=https://your-production-api.example.com
VITE_SOCKET_TIMEOUT=10000
VITE_ENABLE_DEBUG=false
VITE_ENABLE_LOGGING=false
VITE_ENABLE_HOT_RELOAD=false
VITE_ENABLE_SOURCE_MAPS=false
VITE_ENABLE_PROFILING=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_ERROR_OVERLAY=false
VITE_BUILD_ANALYZE=false
VITE_BUILD_COMPRESS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ANALYTICS=true
VITE_CDN_URL=https://your-production-cdn.example.com
VITE_ASSET_PREFIX=/assets/
```

## Configuration Files

### Core Configuration

- `src/config/environment.ts` - Environment variable management
- `src/config/development.ts` - Development-specific utilities
- `src/config/staging.ts` - Staging-specific utilities
- `src/config/production.ts` - Production-specific utilities
- `src/config/api.ts` - API configuration
- `src/config/index.ts` - Configuration exports

### Vite Configurations

- `vite.config.ts` - Base configuration
- `vite.config.development.ts` - Development-specific build config
- `vite.config.staging.ts` - Staging-specific build config
- `vite.config.production.ts` - Production-specific build config

## Usage

### Running in Different Environments

```bash
# Development
npm run dev                    # Development server
npm run dev:debug             # Development with debug mode
npm run dev:profile           # Development with profiling

# Staging
npm run dev:staging           # Staging server
npm run build:staging         # Staging build
npm run preview:staging       # Preview staging build

# Production
npm run dev:production        # Production server (for testing)
npm run build                 # Production build
npm run build:production      # Explicit production build
```

### Using Configuration in Code

```typescript
import { environment, getEnvironmentConfig, initializeConfig } from '@/config';

// Access environment variables
console.log(environment.API_BASE_URL);
console.log(environment.ENABLE_DEBUG);

// Get environment-specific configuration
const config = getEnvironmentConfig();
config.config.info('Application started');

// Initialize configuration
const envConfig = initializeConfig();
```

### Environment-Specific Features

#### Development
- Hot reload enabled
- Source maps enabled
- Debug logging enabled
- DevTools enabled
- Error overlay enabled
- Performance profiling enabled

#### Staging
- Enhanced monitoring
- Feature flag testing
- Performance testing utilities
- Health checks
- Analytics enabled
- Source maps enabled

#### Production
- Optimized builds
- Minimal logging
- Error reporting
- Performance monitoring
- PWA enabled
- Offline mode enabled
- Analytics enabled

## Configuration Features

### Environment Detection

```typescript
import { isDevelopment, isProduction, isTest } from '@/config';

if (isDevelopment()) {
  // Development-specific code
}

if (isProduction()) {
  // Production-specific code
}
```

### Performance Monitoring

```typescript
import { getEnvironmentConfig } from '@/config';

const { performance } = getEnvironmentConfig();

performance.mark('start-operation');
// ... operation code ...
performance.mark('end-operation');
performance.measure('operation', 'start-operation', 'end-operation');
```

### Error Reporting

```typescript
import { getEnvironmentConfig } from '@/config';

const { utils } = getEnvironmentConfig();

try {
  // ... code that might fail ...
} catch (error) {
  utils.reportError(error, { context: 'user-action' });
}
```

### Feature Flags

```typescript
import { stagingUtils } from '@/config';

if (stagingUtils.featureFlags.isEnabled('new-ui')) {
  // Use new UI components
}

const timeout = stagingUtils.featureFlags.getValue('api-timeout', 10000);
```

## Build Optimizations

### Development Build
- Source maps enabled
- No minification
- Debug tools enabled
- Hot reload enabled

### Staging Build
- Source maps enabled
- Terser minification
- Debug tools enabled
- Performance monitoring enabled

### Production Build
- No source maps
- Terser minification
- Console statements removed
- Debug tools disabled
- Optimized chunk splitting

## Environment Variables

### Required Variables
- `VITE_APP_ENV` - Environment name
- `VITE_API_BASE_URL` - API server URL
- `VITE_SOCKET_URL` - WebSocket server URL

### Optional Variables
- `VITE_APP_TITLE` - Application title
- `VITE_APP_VERSION` - Application version
- `VITE_API_TIMEOUT` - API request timeout
- `VITE_SOCKET_TIMEOUT` - WebSocket timeout
- `VITE_ENABLE_DEBUG` - Enable debug mode
- `VITE_ENABLE_LOGGING` - Enable logging
- `VITE_ENABLE_HOT_RELOAD` - Enable hot reload
- `VITE_ENABLE_SOURCE_MAPS` - Enable source maps
- `VITE_ENABLE_PROFILING` - Enable performance profiling
- `VITE_ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring
- `VITE_ENABLE_DEVTOOLS` - Enable Vue DevTools
- `VITE_ENABLE_ERROR_OVERLAY` - Enable error overlay
- `VITE_BUILD_ANALYZE` - Enable build analysis
- `VITE_BUILD_COMPRESS` - Enable build compression
- `VITE_ENABLE_PWA` - Enable PWA features
- `VITE_ENABLE_OFFLINE_MODE` - Enable offline mode
- `VITE_ENABLE_ANALYTICS` - Enable analytics
- `VITE_CDN_URL` - CDN URL for assets
- `VITE_ASSET_PREFIX` - Asset URL prefix

## Validation

The configuration system includes validation to ensure all required environment variables are present:

```typescript
import { validateConfig, initializeConfig } from '@/config';

// Validate configuration
if (!validateConfig()) {
  console.error('Invalid configuration');
  process.exit(1);
}

// Initialize configuration
try {
  const config = initializeConfig();
  console.log('Configuration initialized successfully');
} catch (error) {
  console.error('Failed to initialize configuration:', error);
  process.exit(1);
}
```

## Best Practices

1. **Environment Files**: Always create environment files for each environment
2. **Validation**: Use configuration validation in your application startup
3. **Type Safety**: Use the typed configuration exports
4. **Performance**: Use environment-specific performance monitoring
5. **Error Handling**: Use environment-specific error reporting
6. **Feature Flags**: Use feature flags for gradual rollouts
7. **Monitoring**: Enable appropriate monitoring for each environment

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all required variables are set
2. **Configuration Errors**: Check environment file syntax
3. **Build Failures**: Verify environment-specific build configurations
4. **Performance Issues**: Check environment-specific optimizations

### Debug Commands

```bash
# Check environment variables
npm run dev:debug

# Validate configuration
npm run validate

# Check TypeScript types
npm run type-check

# Run tests with coverage
npm run test:coverage
``` 