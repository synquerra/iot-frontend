/**
 * Enhanced Performance Monitoring Utilities for Dashboard Redesign
 * Specialized performance tracking for dashboard components and interactions
 * Requirements: 2.3, 7.1
 */

import { performanceMonitor, deviceOptimizer } from './performance.js';

// Dashboard-specific performance metrics
export const dashboardPerformanceMonitor = {
  // Track KPI card render performance
  measureKpiCardPerformance: async (cardCount = 4) => {
    const startTime = performance.now();
    
    // Simulate KPI card rendering
    const renderPromises = Array.from({ length: cardCount }, (_, index) => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          const cardStartTime = performance.now();
          
          // Simulate card render work
          setTimeout(() => {
            const cardEndTime = performance.now();
            resolve({
              cardIndex: index,
              renderTime: cardEndTime - cardStartTime
            });
          }, Math.random() * 10); // Random render time up to 10ms
        });
      });
    });
    
    const cardResults = await Promise.all(renderPromises);
    const totalTime = performance.now() - startTime;
    
    const averageCardRenderTime = cardResults.reduce((sum, result) => sum + result.renderTime, 0) / cardCount;
    
    return {
      totalTime,
      averageCardRenderTime,
      cardResults,
      performance: {
        isGoodTotalTime: totalTime < 100, // Total dashboard load under 100ms
        isGoodAverageCardTime: averageCardRenderTime < 16, // Each card under 16ms
        grade: totalTime < 50 ? 'A' : totalTime < 100 ? 'B' : totalTime < 200 ? 'C' : 'D'
      }
    };
  },

  // Monitor grid layout performance
  measureGridLayoutPerformance: async (itemCount = 12) => {
    const startTime = performance.now();
    
    // Measure layout thrashing
    const layoutMetrics = {
      layoutCount: 0,
      paintCount: 0,
      compositeCount: 0
    };
    
    // Use Performance Observer to track layout events
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'layout') layoutMetrics.layoutCount++;
          if (entry.name === 'paint') layoutMetrics.paintCount++;
          if (entry.name === 'composite') layoutMetrics.compositeCount++;
        });
      });
      
      try {
        observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        // Fallback if measure type not supported
      }
    }
    
    // Simulate grid operations
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        // Simulate responsive grid calculations
        const gridCalculationTime = performance.now();
        
        // Mock grid item positioning calculations
        for (let i = 0; i < itemCount; i++) {
          const itemWidth = Math.floor(Math.random() * 300) + 200;
          const itemHeight = Math.floor(Math.random() * 200) + 150;
          // Simulate layout calculations
        }
        
        const calculationEndTime = performance.now();
        resolve(calculationEndTime - gridCalculationTime);
      });
    });
    
    const totalTime = performance.now() - startTime;
    
    return {
      totalTime,
      itemCount,
      layoutMetrics,
      performance: {
        isGoodLayoutTime: totalTime < 50,
        hasLayoutThrashing: layoutMetrics.layoutCount > itemCount * 2,
        grade: totalTime < 25 ? 'A' : totalTime < 50 ? 'B' : totalTime < 100 ? 'C' : 'D'
      }
    };
  },

  // Monitor animation performance during interactions
  measureAnimationPerformance: async (animationType = 'hover', duration = 1000) => {
    const frameRates = [];
    const startTime = performance.now();
    let frameCount = 0;
    
    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - startTime < duration) {
        requestAnimationFrame(measureFrame);
      } else {
        const averageFrameRate = (frameCount * 1000) / (currentTime - startTime);
        frameRates.push(averageFrameRate);
      }
    };
    
    // Start measuring
    requestAnimationFrame(measureFrame);
    
    // Wait for measurement to complete
    await new Promise(resolve => setTimeout(resolve, duration + 100));
    
    const finalFrameRate = frameRates[0] || 0;
    const memoryUsage = performanceMonitor.measureMemoryUsage();
    
    return {
      animationType,
      duration,
      frameRate: Math.round(finalFrameRate),
      frameCount,
      memoryUsage,
      performance: {
        isGoodFrameRate: finalFrameRate >= 55,
        isAcceptableFrameRate: finalFrameRate >= 30,
        memoryEfficient: memoryUsage ? memoryUsage.usedJSHeapSize < 50 * 1024 * 1024 : true, // Under 50MB
        grade: finalFrameRate >= 55 ? 'A' : finalFrameRate >= 45 ? 'B' : finalFrameRate >= 30 ? 'C' : 'D'
      }
    };
  },

  // Comprehensive dashboard performance audit
  runDashboardPerformanceAudit: async () => {
    const auditStartTime = performance.now();
    const deviceCapabilities = deviceOptimizer.getDeviceCapabilities();
    
    console.log('[Dashboard Performance Audit] Starting comprehensive audit...');
    
    const results = {
      timestamp: new Date().toISOString(),
      deviceCapabilities,
      tests: {}
    };
    
    try {
      // Test KPI cards performance
      console.log('[Dashboard Performance Audit] Testing KPI cards...');
      results.tests.kpiCards = await dashboardPerformanceMonitor.measureKpiCardPerformance(4);
      
      // Test grid layout performance
      console.log('[Dashboard Performance Audit] Testing grid layout...');
      results.tests.gridLayout = await dashboardPerformanceMonitor.measureGridLayoutPerformance(12);
      
      // Test hover animations
      console.log('[Dashboard Performance Audit] Testing hover animations...');
      results.tests.hoverAnimations = await dashboardPerformanceMonitor.measureAnimationPerformance('hover', 500);
      
      // Test overall memory usage
      console.log('[Dashboard Performance Audit] Measuring memory usage...');
      results.tests.memoryUsage = performanceMonitor.measureMemoryUsage();
      
      // Calculate overall performance score
      const scores = [];
      if (results.tests.kpiCards?.performance?.grade) {
        const gradeToScore = { A: 100, B: 80, C: 60, D: 40 };
        scores.push(gradeToScore[results.tests.kpiCards.performance.grade] || 0);
      }
      if (results.tests.gridLayout?.performance?.grade) {
        const gradeToScore = { A: 100, B: 80, C: 60, D: 40 };
        scores.push(gradeToScore[results.tests.gridLayout.performance.grade] || 0);
      }
      if (results.tests.hoverAnimations?.performance?.grade) {
        const gradeToScore = { A: 100, B: 80, C: 60, D: 40 };
        scores.push(gradeToScore[results.tests.hoverAnimations.performance.grade] || 0);
      }
      
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      results.overallPerformance = {
        score: Math.round(averageScore),
        grade: averageScore >= 90 ? 'A' : averageScore >= 75 ? 'B' : averageScore >= 60 ? 'C' : 'D',
        recommendations: generatePerformanceRecommendations(results, deviceCapabilities)
      };
      
    } catch (error) {
      console.error('[Dashboard Performance Audit] Error during audit:', error);
      results.error = error.message;
    }
    
    const auditDuration = performance.now() - auditStartTime;
    results.auditDuration = Math.round(auditDuration);
    
    console.log('[Dashboard Performance Audit] Audit completed in', auditDuration.toFixed(2), 'ms');
    console.log('[Dashboard Performance Audit] Overall grade:', results.overallPerformance?.grade);
    
    return results;
  }
};

// Generate performance recommendations based on audit results
function generatePerformanceRecommendations(auditResults, deviceCapabilities) {
  const recommendations = [];
  
  // KPI Cards recommendations
  if (auditResults.tests.kpiCards) {
    const kpiPerf = auditResults.tests.kpiCards.performance;
    if (!kpiPerf.isGoodTotalTime) {
      recommendations.push({
        category: 'KPI Cards',
        issue: 'Slow KPI card rendering',
        suggestion: 'Consider reducing animation complexity or implementing lazy loading for KPI cards',
        priority: 'high'
      });
    }
    if (!kpiPerf.isGoodAverageCardTime) {
      recommendations.push({
        category: 'KPI Cards',
        issue: 'Individual KPI cards render slowly',
        suggestion: 'Optimize KPI card components with React.memo and reduce DOM complexity',
        priority: 'medium'
      });
    }
  }
  
  // Grid Layout recommendations
  if (auditResults.tests.gridLayout) {
    const gridPerf = auditResults.tests.gridLayout.performance;
    if (gridPerf.hasLayoutThrashing) {
      recommendations.push({
        category: 'Grid Layout',
        issue: 'Layout thrashing detected',
        suggestion: 'Use CSS transforms instead of layout properties for animations',
        priority: 'high'
      });
    }
    if (!gridPerf.isGoodLayoutTime) {
      recommendations.push({
        category: 'Grid Layout',
        issue: 'Slow grid calculations',
        suggestion: 'Consider using CSS Grid with fixed dimensions or virtual scrolling',
        priority: 'medium'
      });
    }
  }
  
  // Animation recommendations
  if (auditResults.tests.hoverAnimations) {
    const animPerf = auditResults.tests.hoverAnimations.performance;
    if (!animPerf.isGoodFrameRate) {
      recommendations.push({
        category: 'Animations',
        issue: 'Poor animation frame rate',
        suggestion: 'Reduce animation complexity or disable animations on low-end devices',
        priority: 'high'
      });
    }
    if (!animPerf.memoryEfficient) {
      recommendations.push({
        category: 'Memory',
        issue: 'High memory usage during animations',
        suggestion: 'Implement animation cleanup and reduce concurrent animations',
        priority: 'medium'
      });
    }
  }
  
  // Device-specific recommendations
  if (deviceCapabilities.type === 'mobile') {
    recommendations.push({
      category: 'Mobile Optimization',
      issue: 'Mobile device detected',
      suggestion: 'Consider reducing visual complexity and animation duration for mobile devices',
      priority: 'low'
    });
  }
  
  if (deviceCapabilities.memoryLimit === 'low') {
    recommendations.push({
      category: 'Memory Optimization',
      issue: 'Low memory device detected',
      suggestion: 'Disable non-essential visual effects and implement aggressive cleanup',
      priority: 'high'
    });
  }
  
  if (deviceCapabilities.connectionSpeed === 'slow') {
    recommendations.push({
      category: 'Network Optimization',
      issue: 'Slow network connection detected',
      suggestion: 'Implement progressive loading and reduce initial bundle size',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

// Real-time performance monitoring for dashboard
export const dashboardPerformanceTracker = {
  // Track dashboard load time
  trackDashboardLoad: () => {
    const startTime = performance.now();
    
    return {
      markLoadComplete: () => {
        const loadTime = performance.now() - startTime;
        
        // Store performance metric
        if (window.localStorage) {
          const perfHistory = JSON.parse(localStorage.getItem('dashboard-perf-history') || '[]');
          perfHistory.push({
            timestamp: Date.now(),
            loadTime: Math.round(loadTime),
            type: 'dashboard-load'
          });
          
          // Keep only last 50 entries
          if (perfHistory.length > 50) {
            perfHistory.splice(0, perfHistory.length - 50);
          }
          
          localStorage.setItem('dashboard-perf-history', JSON.stringify(perfHistory));
        }
        
        return {
          loadTime: Math.round(loadTime),
          performance: {
            isGood: loadTime < 2000, // Under 2 seconds
            isAcceptable: loadTime < 5000, // Under 5 seconds
            grade: loadTime < 1000 ? 'A' : loadTime < 2000 ? 'B' : loadTime < 5000 ? 'C' : 'D'
          }
        };
      }
    };
  },

  // Get performance history
  getPerformanceHistory: () => {
    if (!window.localStorage) return [];
    
    try {
      return JSON.parse(localStorage.getItem('dashboard-perf-history') || '[]');
    } catch (e) {
      return [];
    }
  },

  // Clear performance history
  clearPerformanceHistory: () => {
    if (window.localStorage) {
      localStorage.removeItem('dashboard-perf-history');
    }
  }
};

// Export utilities
export default {
  dashboardPerformanceMonitor,
  dashboardPerformanceTracker
};