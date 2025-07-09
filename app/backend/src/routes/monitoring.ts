// Performance monitoring routes
// Provides endpoints for viewing and managing performance data

import { Router } from 'express';
import { backendPerformanceMonitor } from '../services/monitoring/performance';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../services/monitoring/logger';

const router = Router();

// Get performance metrics (protected route)
router.get('/metrics', authenticateToken, (req, res) => {
  try {
    const metrics = backendPerformanceMonitor.getMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting performance metrics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics',
    });
  }
});

// Get performance summary
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const summary = backendPerformanceMonitor.getPerformanceSummary();
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting performance summary', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance summary',
    });
  }
});

// Receive frontend performance metrics
router.post('/performance', (req, res) => {
  try {
    const frontendMetrics = req.body;
    
    // Log frontend performance data
    logger.info('Frontend performance metrics received', {
      fcp: frontendMetrics.fcp,
      lcp: frontendMetrics.lcp,
      fid: frontendMetrics.fid,
      cls: frontendMetrics.cls,
      errorCount: frontendMetrics.errors?.length || 0,
    });

    // Store or forward metrics as needed
    // In a real implementation, you might store this in a database
    // or forward to an external monitoring service

    res.json({
      success: true,
      message: 'Performance metrics received',
    });
  } catch (error) {
    logger.error('Error processing frontend performance metrics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process performance metrics',
    });
  }
});

// Health check with performance info
router.get('/health', (req, res) => {
  try {
    const metrics = backendPerformanceMonitor.getMetrics();
    const summary = backendPerformanceMonitor.getPerformanceSummary();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: metrics.memoryUsage,
      performance: {
        activeRequests: Object.keys(metrics.apiResponseTimes).length,
        averageResponseTime: summary.api_GET_health?.average || '0ms',
      },
    };

    res.json(health);
  } catch (error) {
    logger.error('Error in health check', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router; 