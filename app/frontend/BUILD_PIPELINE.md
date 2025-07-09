# NotT Build Pipeline Documentation

## Overview

The NotT frontend uses an enhanced Vite build pipeline with advanced features for development, testing, and production deployment. This pipeline is optimized for the horror-themed tabletop game with Three.js integration.

## 🚀 Build Pipeline Features

### Core Features
- **Vite 7.x**: Fast development server and optimized builds
- **Vue 3**: Composition API with TypeScript support
- **Three.js Integration**: Optimized for 3D graphics performance
- **PWA Support**: Offline functionality and app-like experience
- **Performance Monitoring**: Real-time performance tracking
- **Bundle Analysis**: Visual bundle size analysis
- **Compression**: Gzip and Brotli compression for production

### Development Features
- **Hot Module Replacement (HMR)**: Instant updates during development
- **Source Maps**: Debug-friendly development builds
- **TypeScript**: Strict type checking and IntelliSense
- **Biome**: Fast linting and formatting
- **Vitest**: Unit and component testing
- **Environment Configuration**: Multi-environment support

## 📦 Build Scripts

### Development
```bash
# Start development server
npm run dev

# Development with debug mode
npm run dev:debug

# Development with profiling
npm run dev:profile
```

### Building
```bash
# Production build
npm run build

# Preview build (staging)
npm run build:preview

# Production build with analysis
npm run build:analyze

# Production build (explicit)
npm run build:production
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests once
npm run test:run

# Run E2E tests (when configured)
npm run test:e2e

# Run visual regression tests (when configured)
npm run test:visual
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format

# Full validation
npm run validate

# Clean build artifacts
npm run clean
```

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)

#### Plugins
- **Vue Plugin**: Vue 3 support with SFC compilation
- **PWA Plugin**: Service worker and manifest generation
- **Compression Plugin**: Gzip and Brotli compression
- **Visualizer Plugin**: Bundle analysis (analyze mode)

#### Build Optimization
```typescript
build: {
  outDir: "dist",
  sourcemap: mode === "development",
  minify: mode === "production" ? "terser" : false,
  target: "es2020",
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["vue", "vue-router", "pinia"],
        three: ["three", "cannon-es"],
        ui: ["@headlessui/vue", "@heroicons/vue"],
        audio: ["howler"],
        animation: ["gsap"],
        utils: ["lodash-es", "date-fns", "uuid"],
        network: ["socket.io-client", "simple-peer"],
      }
    }
  }
}
```

#### Chunk Strategy
- **Vendor**: Core Vue ecosystem
- **Three**: 3D graphics and physics
- **UI**: UI component libraries
- **Audio**: Sound management
- **Animation**: GSAP animations
- **Utils**: Utility libraries
- **Network**: Real-time communication

### Environment Configuration

#### Development Mode
- Source maps enabled
- Hot reload active
- Debug tools available
- Performance monitoring enabled
- Error overlay active

#### Production Mode
- Minified builds
- Tree shaking enabled
- Console logs removed
- Performance optimized
- PWA features active

#### Analyze Mode
- Bundle visualization
- Size analysis
- Performance profiling
- Detailed metrics

## 📊 Performance Monitoring

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: Loading performance
- **FID (First Input Delay)**: Interactivity
- **CLS (Cumulative Layout Shift)**: Visual stability

### Custom Metrics
- **Memory Usage**: JavaScript heap monitoring
- **Resource Loading**: Network performance
- **Three.js Performance**: 3D rendering metrics
- **Function Performance**: Custom timing measurements

### Usage
```typescript
import { performanceMonitor, measureFunction } from "@/utils/performance";

// Monitor a function
const result = measureFunction("expensiveOperation", () => {
  // Your code here
});

// Get metrics
const metrics = performanceMonitor.getMetrics();
const lcpMetric = performanceMonitor.getLatestMetric("LCP");
```

## 🎯 PWA Features

### Service Worker
- **Caching Strategy**: Network-first for API, cache-first for assets
- **Offline Support**: Basic offline functionality
- **Auto Update**: Automatic service worker updates

### Manifest
- **App Name**: "NotT - Horror Tabletop Game"
- **Theme Color**: Horror red (#dc2626)
- **Background Color**: Dark theme (#020617)
- **Display Mode**: Standalone
- **Orientation**: Landscape (optimized for game)

### Icons
- Multiple sizes: 72x72 to 512x512
- PNG format for compatibility
- Horror-themed design

## 🔍 Bundle Analysis

### Visualizer
```bash
npm run build:analyze
```
Generates `dist/stats.html` with:
- Bundle size breakdown
- Chunk relationships
- Gzip and Brotli sizes
- Dependency tree

### Performance Insights
- **Vendor Bundle**: Core dependencies
- **Three.js Bundle**: 3D graphics overhead
- **UI Bundle**: Component library size
- **Audio Bundle**: Sound system impact
- **Network Bundle**: Real-time features

## 🛠️ Development Tools

### Environment Configuration
```typescript
// src/config/environment.ts
export const config = {
  APP_ENV: "development",
  API_BASE_URL: "http://localhost:4013",
  ENABLE_DEBUG: true,
  ENABLE_PROFILING: true,
  // ... more config
};
```

### Development Utilities
- **Performance Monitoring**: Real-time metrics
- **Error Tracking**: Development error overlay
- **Hot Reload**: Instant updates
- **Source Maps**: Debug-friendly builds

## 🚀 Deployment

### Production Build
```bash
npm run build
```
Creates optimized `dist/` folder with:
- Minified JavaScript
- Compressed assets
- Service worker
- PWA manifest
- Optimized chunks

### Preview Build
```bash
npm run build:preview
npm run preview
```
For staging and testing before production.

### Docker Deployment
```bash
# Build Docker image
docker build -t nott-frontend .

# Run container
docker run -p 3000:80 nott-frontend
```

## 📈 Performance Targets

### Core Web Vitals
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds
- **CLS**: < 0.1

### Bundle Size
- **Total Bundle**: < 2MB
- **Initial Load**: < 1MB
- **Vendor Bundle**: < 500KB
- **Three.js Bundle**: < 300KB

### Performance Metrics
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Memory Usage**: < 100MB
- **Frame Rate**: 60 FPS

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Performance Issues
```bash
# Analyze bundle
npm run build:analyze

# Check metrics
npm run dev:profile
```

#### Type Errors
```bash
# Type check
npm run type-check

# Fix linting
npm run lint:fix
```

### Debug Mode
```bash
# Enable debug logging
npm run dev:debug
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Three.js Documentation](https://threejs.org/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Performance Monitoring](https://web.dev/vitals/)

## 🎯 Next Steps

### Planned Enhancements
- [ ] **Storybook Integration**: Component documentation
- [ ] **E2E Testing**: Playwright setup
- [ ] **Visual Testing**: Chromatic integration
- [ ] **CI/CD Pipeline**: GitHub Actions
- [ ] **Error Tracking**: Sentry integration
- [ ] **Analytics**: User behavior tracking

### Performance Optimizations
- [ ] **Code Splitting**: Route-based splitting
- [ ] **Lazy Loading**: Component lazy loading
- [ ] **Image Optimization**: WebP and AVIF support
- [ ] **CDN Integration**: Asset delivery optimization
- [ ] **Caching Strategy**: Advanced caching rules

The build pipeline is now **production-ready** with comprehensive features for development, testing, and deployment of the NotT horror tabletop game. 