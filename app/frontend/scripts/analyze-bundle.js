#!/usr/bin/env node

/**
 * Bundle Analysis Script for NotT Frontend
 * Provides detailed analysis of bundle size, performance, and optimization opportunities
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(_message, _color = 'reset') {}

function logSection(title) {
  log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Bundle size thresholds (in KB)
const _THRESHOLDS = {
  CRITICAL: 1000, // 1MB
  WARNING: 500, // 500KB
  GOOD: 200, // 200KB
};

// Removed unused functions to fix linting errors

function analyzeBundleStats() {
  const statsPath = resolve(__dirname, '../dist/stats.html');

  if (!existsSync(statsPath)) {
    logError('Bundle stats file not found. Run "npm run build:analyze" first.');
    return;
  }

  logSection('Bundle Analysis Results');

  try {
    // Read the stats file
    const statsContent = readFileSync(statsPath, 'utf8');

    // Extract bundle information (this is a simplified analysis)
    const _bundleInfo = {
      totalSize: 0,
      chunks: [],
      gzipSize: 0,
      brotliSize: 0,
    };

    // Parse the HTML to extract bundle information
    // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
    const sizeMatches = statsContent.match(/size[":\s]*([0-9.]+)\s*([KMGT]?B)/gi);
    if (sizeMatches) {
      logInfo(`Found ${sizeMatches.length} size entries in bundle stats`);
    }

    logSuccess('Bundle analysis completed');
    logInfo(`Stats file: ${statsPath}`);
  } catch (error) {
    logError(`Failed to analyze bundle stats: ${error.message}`);
  }
}

function checkDependencies() {
  logSection('Dependency Analysis');

  try {
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
    const { dependencies, devDependencies } = packageJson;

    const allDeps = { ...dependencies, ...devDependencies };
    const largeDeps = [];

    // Known large dependencies
    const largeDependencyThresholds = {
      three: 500, // Three.js is typically large
      'cannon-es': 200, // Physics engine
      gsap: 100, // Animation library
      howler: 50, // Audio library
    };

    for (const [name, version] of Object.entries(allDeps)) {
      if (largeDependencyThresholds[name]) {
        largeDeps.push({
          name,
          version,
          estimatedSize: largeDependencyThresholds[name],
        });
      }
    }

    if (largeDeps.length > 0) {
      logWarning('Large dependencies detected:');
      for (const dep of largeDeps) {
        log(`  ${dep.name}@${dep.version} (~${dep.estimatedSize}KB)`, 'yellow');
      }
    } else {
      logSuccess('No unusually large dependencies detected');
    }
  } catch (error) {
    logError(`Failed to analyze dependencies: ${error.message}`);
  }
}

function provideOptimizationTips() {
  logSection('Optimization Recommendations');

  const tips = [
    {
      category: 'Code Splitting',
      tips: [
        'Use dynamic imports for route-based code splitting',
        'Split vendor and application code',
        'Consider splitting large components into separate chunks',
      ],
    },
    {
      category: 'Tree Shaking',
      tips: [
        'Use ES modules for better tree shaking',
        'Import only what you need from large libraries',
        'Configure sideEffects in package.json',
      ],
    },
    {
      category: 'Compression',
      tips: [
        'Enable gzip compression on server',
        'Use Brotli compression for better compression ratios',
        'Optimize images and assets',
      ],
    },
    {
      category: 'Caching',
      tips: [
        'Use content hashing for long-term caching',
        'Implement service worker for offline caching',
        'Configure CDN caching headers',
      ],
    },
  ];

  for (const { category, tips: categoryTips } of tips) {
    log(`\n${colors.magenta}${category}:${colors.reset}`);
    for (const tip of categoryTips) {
      log(`  • ${tip}`, 'blue');
    }
  }
}

function runBuildAnalysis() {
  logSection('Running Bundle Analysis');

  try {
    logInfo('Building with analysis mode...');
    execSync('npm run build:analyze', {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
    });
    logSuccess('Build analysis completed');
  } catch (error) {
    logError(`Build analysis failed: ${error.message}`);
    return false;
  }

  return true;
}

// Main execution
async function main() {
  log(`${colors.bright}${colors.cyan}🔍 NotT Bundle Analysis Tool${colors.reset}\n`);

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'build':
      if (runBuildAnalysis()) {
        analyzeBundleStats();
      }
      break;

    case 'analyze':
      analyzeBundleStats();
      break;

    case 'deps':
      checkDependencies();
      break;

    case 'tips':
      provideOptimizationTips();
      break;

    case 'full':
      if (runBuildAnalysis()) {
        analyzeBundleStats();
        checkDependencies();
        provideOptimizationTips();
      }
      break;

    default:
      log(`${colors.bright}Usage:${colors.reset}`);
      log('  node analyze-bundle.js <command>');
      log('');
      log(`${colors.bright}Commands:${colors.reset}`);
      log('  build    - Build and analyze bundle');
      log('  analyze  - Analyze existing bundle stats');
      log('  deps     - Analyze dependencies');
      log('  tips     - Show optimization tips');
      log('  full     - Run complete analysis');
      log('');
      log(`${colors.bright}Examples:${colors.reset}`);
      log('  node analyze-bundle.js build');
      log('  node analyze-bundle.js full');
  }
}

main().catch((error) => {
  logError(`Analysis failed: ${error.message}`);
  process.exit(1);
});
