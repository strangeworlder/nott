// Bundle optimization configuration for NotT frontend
// Provides comprehensive settings for bundle size optimization and performance

import { environment } from './environment';

// Bundle size thresholds (in KB)
export const BUNDLE_THRESHOLDS = {
  CRITICAL: 1000, // 1MB - Immediate action required
  WARNING: 500, // 500KB - Optimization recommended
  GOOD: 200, // 200KB - Good size
  EXCELLENT: 100, // 100KB - Excellent size
} as const;

// Chunk optimization settings
export const CHUNK_OPTIMIZATION = {
  // Manual chunk splitting for better caching
  manualChunks: {
    // Core Vue ecosystem
    vendor: ['vue', 'vue-router', 'pinia'],

    // 3D graphics and physics
    three: ['three', 'cannon-es'],

    // UI components
    ui: ['@headlessui/vue', '@heroicons/vue'],

    // Audio system
    audio: ['howler'],

    // Animation system
    animation: ['gsap'],

    // Utility libraries
    utils: ['lodash-es', 'date-fns', 'uuid'],

    // Network and real-time communication
    network: ['socket.io-client', 'simple-peer'],
  },

  // Dynamic imports for route-based splitting (commented until components exist)
  dynamicImports: {
    // Game components (loaded only when needed)
    // game: () => import('@/components/game/index'),
    // Three.js components (loaded only for 3D scenes)
    // three: () => import('@/components/three/index'),
    // Audio components (loaded only for audio features)
    // audio: () => import('@/components/audio/index'),
  },
} as const;

// Compression settings
export const COMPRESSION_CONFIG = {
  gzip: {
    algorithm: 'gzip' as const,
    ext: '.gz',
    threshold: 1024, // Only compress files > 1KB
    deleteOriginFile: false,
  },
  brotli: {
    algorithm: 'brotliCompress' as const,
    ext: '.br',
    threshold: 1024,
    deleteOriginFile: false,
  },
} as const;

// Tree shaking configuration
export const TREE_SHAKING_CONFIG = {
  // Packages that should be tree-shaken
  packages: ['lodash-es', 'date-fns', '@headlessui/vue', '@heroicons/vue'],

  // Side effects configuration
  sideEffects: ['*.css', '*.scss', '*.vue'],
} as const;

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  // Bundle analysis settings
  bundleAnalysis: {
    enabled: environment.ENABLE_PERFORMANCE_MONITORING,
    filename: 'dist/stats.html',
    open: true,
    gzipSize: true,
    brotliSize: true,
    template: 'treemap', // or 'sunburst', 'network'
  },

  // Performance budgets
  budgets: {
    initial: 1000, // 1MB initial load
    vendor: 500, // 500KB vendor bundle
    three: 300, // 300KB Three.js bundle
    ui: 200, // 200KB UI bundle
    utils: 100, // 100KB utils bundle
  },

  // Monitoring thresholds
  thresholds: {
    // Core Web Vitals targets
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100, // First Input Delay (ms)
    cls: 0.1, // Cumulative Layout Shift (score)

    // Bundle size targets
    totalSize: 2000, // 2MB total bundle size
    chunkSize: 500, // 500KB per chunk
  },
} as const;

// Optimization strategies
export const OPTIMIZATION_STRATEGIES = {
  // Code splitting strategies
  codeSplitting: {
    // Route-based splitting
    routes: true,

    // Component-based splitting
    components: true,

    // Vendor splitting
    vendor: true,

    // Dynamic imports
    dynamic: true,
  },

  // Tree shaking strategies
  treeShaking: {
    // ES modules
    esModules: true,

    // Side effects
    sideEffects: true,

    // Unused exports
    unusedExports: true,
  },

  // Compression strategies
  compression: {
    // Gzip compression
    gzip: true,

    // Brotli compression
    brotli: true,

    // Minification
    minification: true,

    // Dead code elimination
    deadCodeElimination: true,
  },

  // Caching strategies
  caching: {
    // Content hashing
    contentHash: true,

    // Long-term caching
    longTermCaching: true,

    // Service worker caching
    serviceWorker: true,
  },
} as const;

// Bundle analysis utilities
export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private metrics: Record<string, number> = {};

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  // Record bundle metrics
  recordMetric(name: string, value: number): void {
    this.metrics[name] = value;
  }

  // Get bundle metrics
  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  // Analyze bundle size
  analyzeBundleSize(size: number): {
    status: 'CRITICAL' | 'WARNING' | 'GOOD' | 'EXCELLENT';
    message: string;
    recommendation: string;
  } {
    if (size > BUNDLE_THRESHOLDS.CRITICAL) {
      return {
        status: 'CRITICAL',
        message: `Bundle size ${size}KB exceeds critical threshold`,
        recommendation:
          'Immediate optimization required. Consider code splitting and tree shaking.',
      };
    }

    if (size > BUNDLE_THRESHOLDS.WARNING) {
      return {
        status: 'WARNING',
        message: `Bundle size ${size}KB exceeds warning threshold`,
        recommendation: 'Optimization recommended. Review large dependencies.',
      };
    }

    if (size > BUNDLE_THRESHOLDS.GOOD) {
      return {
        status: 'GOOD',
        message: `Bundle size ${size}KB is within good range`,
        recommendation: 'Monitor for future growth.',
      };
    }

    return {
      status: 'EXCELLENT',
      message: `Bundle size ${size}KB is excellent`,
      recommendation: 'Maintain current optimization practices.',
    };
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): Array<{
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendation: string;
    impact: string;
  }> {
    const recommendations = [];

    // Check for large dependencies
    const largeDeps = this.getLargeDependencies();
    if (largeDeps.length > 0) {
      recommendations.push({
        category: 'Dependencies',
        priority: 'HIGH' as const,
        recommendation: `Consider alternatives or lazy loading for: ${largeDeps.join(', ')}`,
        impact: 'High - Can reduce bundle size significantly',
      });
    }

    // Check for unused code
    if (this.metrics.unusedCode && this.metrics.unusedCode > 50) {
      recommendations.push({
        category: 'Tree Shaking',
        priority: 'MEDIUM' as const,
        recommendation: 'Enable tree shaking for unused exports',
        impact: 'Medium - Can reduce bundle size by 10-20%',
      });
    }

    // Check for compression
    if (!this.metrics.compressionRatio || this.metrics.compressionRatio < 0.7) {
      recommendations.push({
        category: 'Compression',
        priority: 'LOW' as const,
        recommendation: 'Enable Brotli compression for better ratios',
        impact: 'Low - Can improve loading speed by 5-10%',
      });
    }

    return recommendations;
  }

  private getLargeDependencies(): string[] {
    // This would be populated from actual bundle analysis
    return ['three', 'cannon-es', 'gsap'];
  }
}

// Export default configuration
export default {
  BUNDLE_THRESHOLDS,
  CHUNK_OPTIMIZATION,
  COMPRESSION_CONFIG,
  TREE_SHAKING_CONFIG,
  PERFORMANCE_CONFIG,
  OPTIMIZATION_STRATEGIES,
  BundleAnalyzer,
};
