# Docker Development Environment for NotT

This document outlines the Docker development environment setup for the NotT application, including all services, configurations, and usage instructions.

## Overview

The NotT Docker development environment provides a complete containerized setup for local development, including:

- **Frontend**: Vue.js development server with hot reload
- **Backend**: Node.js API server with auto-restart
- **Database**: PostgreSQL with persistent data
- **Cache**: Redis for sessions and caching
- **WebRTC**: TURN server for real-time communication
- **Proxy**: Nginx reverse proxy for unified access
- **Tools**: Development utilities and debugging tools

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vue.js)      │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│   Port: 3013    │    │   Port: 4013    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │     Redis       │    │   TURN Server   │
│   (Reverse      │    │   (Cache)       │    │   (WebRTC)      │
│    Proxy)       │    │   Port: 6379    │    │   Port: 3478    │
│   Port: 8013    │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

## Services

### Frontend Service
- **Image**: Custom Node.js Alpine
- **Port**: 3013 (mapped to 3000)
- **Features**: Hot reload, source maps, debugging
- **Environment**: Development with full debugging enabled

### Backend Service
- **Image**: Custom Node.js Alpine
- **Port**: 4013 (mapped to 4000)
- **Features**: Auto-restart, database connection, WebSocket support
- **Environment**: Development with database and Redis integration

### Database Service
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Database**: Configurable via environment variables
- **Features**: Persistent data, initialization scripts

### Redis Service
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Features**: Session storage, caching, pub/sub

### TURN Server
- **Image**: Coturn 4.6.2
- **Ports**: 3478 (TCP/UDP), 49152-49162 (UDP)
- **Features**: WebRTC relay, STUN/TURN protocols

### Nginx Proxy
- **Image**: Nginx Alpine
- **Ports**: 8013 (HTTP), 443 (HTTPS)
- **Features**: Reverse proxy, load balancing, SSL termination

## Environment Variables

The Docker environment uses environment variables for configuration, making it flexible and secure. All sensitive information and environment-specific settings are configurable via environment variables.

### Core Environment Variables

```bash
# Database Configuration
POSTGRES_DB=nott_dev                    # Database name
POSTGRES_USER=nott_user                 # Database user
POSTGRES_PASSWORD=nott_password         # Database password

# Authentication
JWT_SECRET=your-jwt-secret-dev         # JWT signing secret

# TURN Server Configuration
TURN_USERNAME=nott_user                 # TURN server username
TURN_PASSWORD=nott_password             # TURN server password
TURN_REALM=nott.local                  # TURN server realm

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:4013 # API base URL
VITE_SOCKET_URL=http://localhost:4013   # WebSocket URL
VITE_API_TIMEOUT=10000                 # API timeout (ms)
VITE_SOCKET_TIMEOUT=5000               # WebSocket timeout (ms)

# Feature Flags
VITE_ENABLE_DEBUG=true                  # Enable debug mode
VITE_ENABLE_LOGGING=true               # Enable logging
VITE_ENABLE_HOT_RELOAD=true            # Enable hot reload
VITE_ENABLE_SOURCE_MAPS=true           # Enable source maps
VITE_ENABLE_PROFILING=true             # Enable performance profiling
VITE_ENABLE_PERFORMANCE_MONITORING=true # Enable performance monitoring
VITE_ENABLE_DEVTOOLS=true              # Enable Vue DevTools
VITE_ENABLE_ERROR_OVERLAY=true         # Enable error overlay
VITE_BUILD_ANALYZE=false               # Enable build analysis
VITE_BUILD_COMPRESS=false              # Enable build compression
VITE_ENABLE_PWA=false                  # Enable PWA features
VITE_ENABLE_OFFLINE_MODE=false         # Enable offline mode
VITE_ENABLE_ANALYTICS=false            # Enable analytics

# CDN Configuration
VITE_CDN_URL=                          # CDN URL for assets
VITE_ASSET_PREFIX=/assets/             # Asset URL prefix
```

### Environment-Specific Defaults

The Docker Compose files include sensible defaults for each environment:

- **Development**: Local URLs, debugging enabled, hot reload
- **Staging**: Staging URLs, monitoring enabled, analytics
- **Production**: Production URLs, optimization enabled, security

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose available
- At least 4GB RAM available for Docker

### 1. Set Environment Variables (Optional)
```bash
# Set environment variables (optional - defaults are provided)
export POSTGRES_DB=nott_dev
export POSTGRES_USER=nott_user
export POSTGRES_PASSWORD=your-secure-password
export JWT_SECRET=your-secure-jwt-secret
export VITE_API_BASE_URL=http://localhost:4013
export VITE_SOCKET_URL=http://localhost:4013
```

### 2. Start Development Environment
```bash
# Navigate to the app directory
cd app

# Start development environment
./docker-dev.sh start

# Or start specific environment
./docker-dev.sh start dev      # Development (default)
./docker-dev.sh start staging  # Staging
./docker-dev.sh start prod     # Production
```

### 3. Access Services
Once started, you can access:
- **Frontend**: http://localhost:3013
- **Backend API**: http://localhost:4013
- **Nginx Proxy**: http://localhost:8013
- **Database**: localhost:5432
- **Redis**: localhost:6379

### 4. View Logs
```bash
# All services (development)
./docker-dev.sh logs

# Specific service (development)
./docker-dev.sh logs frontend
./docker-dev.sh logs backend

# Staging environment
./docker-dev.sh logs frontend staging
./docker-dev.sh logs backend staging
```

### 5. Stop Environment
```bash
# Stop development environment
./docker-dev.sh stop

# Stop specific environment
./docker-dev.sh stop dev
./docker-dev.sh stop staging
./docker-dev.sh stop prod
```

## Environment Files (Optional)

While environment variables are the preferred method, you can also create environment files for convenience. **Note**: Never commit environment files with sensitive information to version control.

### `.env.development`
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

### `.env.staging`
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

### `.env.production`
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

## Docker Compose Files

### `docker-compose.dev.yml`
Development environment with:
- Hot reload enabled
- Source maps enabled
- Debugging tools enabled
- Volume mounts for live code changes
- Health checks for all services
- Environment variable defaults for development

### `docker-compose.staging.yml`
Staging environment with:
- Production-like builds
- Enhanced monitoring
- Rate limiting
- Performance monitoring
- Environment variable defaults for staging

### `docker-compose.prod.yml`
Production environment with:
- Optimized builds
- Security hardening
- Performance optimizations
- Minimal logging
- Environment variable defaults for production

## Development Workflow

### 1. Starting Development
```bash
# Start the environment
./docker-dev.sh start

# Check status
./docker-dev.sh status

# View logs
./docker-dev.sh logs

# Check environment variables
./docker-dev.sh env-info
```

### 2. Making Changes
- Code changes are automatically reflected due to volume mounts
- Frontend hot reload will update the browser
- Backend auto-restart will reload the API

### 3. Running Tests
```bash
# Run frontend tests (development)
./docker-dev.sh test frontend

# Run backend tests (development)
./docker-dev.sh test backend

# Run tests in staging
./docker-dev.sh test frontend staging
./docker-dev.sh test backend staging
```

### 4. Executing Commands
```bash
# Run linting in frontend (development)
./docker-dev.sh exec frontend npm run lint

# Check database (development)
./docker-dev.sh exec postgres psql -U nott_user -d nott_dev

# Access Redis CLI (development)
./docker-dev.sh exec redis redis-cli

# Execute commands in staging
./docker-dev.sh exec frontend npm run build staging
```

### 5. Building Services
```bash
# Build all services (development)
./docker-dev.sh build

# Build specific service (development)
./docker-dev.sh build frontend

# Build in staging
./docker-dev.sh build frontend staging
```

## Environment-Specific Configurations

### Development Environment
- **Hot Reload**: Enabled for both frontend and backend
- **Source Maps**: Enabled for debugging
- **Debug Logging**: Full logging enabled
- **DevTools**: Vue DevTools enabled
- **Error Overlay**: Enabled for immediate feedback
- **Default URLs**: Local development URLs

### Staging Environment
- **Monitoring**: Enhanced performance monitoring
- **Rate Limiting**: API rate limiting enabled
- **Health Checks**: Comprehensive health monitoring
- **Analytics**: Basic analytics enabled
- **Feature Flags**: Testing environment for features
- **Default URLs**: Staging URLs (configurable)

### Production Environment
- **Optimization**: Full build optimization
- **Security**: Hardened security configuration
- **Performance**: Optimized for production
- **Caching**: Aggressive caching strategies
- **Monitoring**: Production monitoring enabled
- **Default URLs**: Production URLs (configurable)

## Dockerfile Enhancements

### Development Dockerfile (`Dockerfile.dev`)
- **Security**: Non-root user execution
- **Caching**: Optimized layer caching
- **Tools**: Development tools included
- **Health Checks**: Container health monitoring
- **Hot Reload**: Volume mounts for live development

### Production Dockerfile (`Dockerfile`)
- **Multi-stage**: Optimized build process
- **Security**: Non-root user execution
- **Optimization**: Terser minification
- **Caching**: Build cache optimization
- **Health Checks**: Production health monitoring

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using the ports
lsof -i :3013
lsof -i :4013
lsof -i :5432

# Stop conflicting services
sudo systemctl stop postgresql
```

#### 2. Docker Resource Issues
```bash
# Check Docker resources
docker system df

# Clean up Docker
./docker-dev.sh clean
```

#### 3. Database Connection Issues
```bash
# Check database status
./docker-dev.sh exec postgres pg_isready -U nott_user -d nott_dev

# Reset database
./docker-dev.sh exec postgres dropdb -U nott_user nott_dev
./docker-dev.sh exec postgres createdb -U nott_user nott_dev
```

#### 4. Frontend Build Issues
```bash
# Clear node_modules and rebuild
./docker-dev.sh exec frontend rm -rf node_modules package-lock.json
./docker-dev.sh exec frontend npm install
```

### Debugging Commands

#### Check Service Status
```bash
# All services (development)
./docker-dev.sh status

# Specific environment
./docker-dev.sh status staging
./docker-dev.sh status prod

# Specific service logs
./docker-dev.sh logs frontend
./docker-dev.sh logs backend
```

#### Access Container Shells
```bash
# Frontend container (development)
./docker-dev.sh exec frontend sh

# Backend container (development)
./docker-dev.sh exec backend sh

# Database container (development)
./docker-dev.sh exec postgres psql -U nott_user -d nott_dev

# Staging environment
./docker-dev.sh exec frontend sh staging
```

#### Monitor Resources
```bash
# Docker resource usage
docker stats

# Container resource usage
docker stats frontend backend postgres redis
```

## Performance Optimization

### Development Performance
- **Volume Mounts**: Optimized for fast file access
- **Hot Reload**: Minimal rebuild times
- **Caching**: Docker layer caching enabled
- **Memory**: Optimized memory usage

### Production Performance
- **Multi-stage Builds**: Reduced image sizes
- **Optimization**: Terser minification
- **Caching**: Aggressive caching strategies
- **Compression**: Gzip/Brotli compression

## Security Considerations

### Development Security
- **Non-root Users**: All containers run as non-root
- **Network Isolation**: Services isolated in Docker network
- **Volume Permissions**: Proper file permissions
- **Health Checks**: Container health monitoring

### Production Security
- **Image Scanning**: Regular security scans
- **Secret Management**: Environment-based secrets
- **Network Security**: Firewall rules
- **Access Control**: Role-based access

## Monitoring and Logging

### Development Monitoring
- **Container Health**: Health checks for all services
- **Log Aggregation**: Centralized logging
- **Performance Metrics**: Basic performance monitoring
- **Error Tracking**: Development error tracking

### Production Monitoring
- **Application Metrics**: Detailed application metrics
- **Infrastructure Monitoring**: System resource monitoring
- **Error Reporting**: Production error reporting
- **Performance Analysis**: Performance profiling

## Best Practices

### Development Best Practices
1. **Use Environment Variables**: Configure via environment variables instead of hardcoded values
2. **Use the Development Script**: Always use `./docker-dev.sh` for operations
3. **Check Logs Regularly**: Monitor logs for issues
4. **Clean Up Regularly**: Run cleanup to free resources
5. **Test in Containers**: Run tests in the containerized environment
6. **Use Volume Mounts**: Leverage volume mounts for live development

### Production Best Practices
1. **Security First**: Always run as non-root users
2. **Resource Limits**: Set appropriate resource limits
3. **Health Checks**: Implement comprehensive health checks
4. **Logging**: Centralized logging and monitoring
5. **Backup Strategy**: Regular database and volume backups
6. **Environment Variables**: Use environment variables for all configuration

## Advanced Usage

### Custom Environment Variables
```bash
# Override environment variables
export POSTGRES_DB=my_custom_db
export JWT_SECRET=my_secure_secret
export VITE_API_BASE_URL=https://my-api.example.com

# Start with custom environment
./docker-dev.sh start
```

### Custom Build Arguments
```bash
# Build with custom arguments
docker-compose -f docker-compose.dev.yml build --build-arg NODE_ENV=development
```

### Service Scaling
```bash
# Scale backend service
docker-compose -f docker-compose.dev.yml up -d --scale backend=2
```

### Network Configuration
```bash
# Create custom network
docker network create nott-custom

# Use custom network
docker-compose -f docker-compose.dev.yml up -d --network nott-custom
```

## Support and Maintenance

### Regular Maintenance
- **Weekly**: Clean up Docker resources
- **Monthly**: Update base images
- **Quarterly**: Security audit of containers
- **Annually**: Review and update configurations

### Troubleshooting Support
- **Logs**: Check service logs for errors
- **Health Checks**: Monitor container health
- **Resource Usage**: Monitor Docker resource usage
- **Network Issues**: Check Docker network connectivity

This Docker development environment provides a complete, production-ready setup for developing the NotT application with all necessary services, tools, and configurations for efficient development workflow. The environment variable approach ensures flexibility and security across all environments. 