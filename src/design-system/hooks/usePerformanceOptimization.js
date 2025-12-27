/**
 * React Hook for Performance Optimization
 * Provides performance monitoring and optimization for colorful UI components
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  performanceMonitor, 
  cssOptimizer, 
  lazyLoader, 
  deviceOptimizer,
  performanceTester 
} from '../utils/performance.js';

// Hook for general performance optimization
export const usePerformanceOptimization = (componentName, options = {}) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState(null);
  const componentRef = useRef(null);
  
  const {
    enableMonitoring = process.env.NODE_ENV === 'development',
    enableLazyLoading = true,
    optimizeForDevice = true,
  } = options;

  // Get device capabilities on mount
  useEffect(() => {
    const capabilities = deviceOptimizer.getDeviceCapabilities();
    setDeviceCapabilities(capabilities);
  }, []);

  // Generate optimized configuration based on device
  const optimizedConfig = useMemo(() => {
    if (!deviceCapabilities) return null;
    return deviceOptimizer.getOptimizedConfig(deviceCapabilities);
  }, [deviceCapabilities]);

  // Performance monitoring
  const measurePerformance = useCallback(async () => {
    if (!enableMonitoring || !componentName) return null;
    
    try {
      const metrics = await performanceMonitor.generatePerformanceReport(componentName);
      setPerformanceMetrics(metrics);
      return metrics;
    } catch (error) {
      console.warn(`[Performance] Failed to measure ${componentName}:`, error);
      return null;
    }
  }, [componentName, enableMonitoring]);

  // Optimize CSS properties
  const optimizeStyles = useCallback((styles) => {
    if (!optimizedConfig) return styles;
    
    const optimized = cssOptimizer.optimizeForPaint(styles);
    
    // Apply device-specific optimizations
    if (deviceCapabilities?.type === 'mobile') {
      optimized.animationDuration = `${optimizedConfig.animationDuration}ms`;
      if (!optimizedConfig.enableBlur && optimized.backdropFilter) {
        delete optimized.backdropFilter;
      }
      if (!optimizedConfig.enableGlowEffects && optimized.filter?.includes('drop-shadow')) {
        optimized.filter = optimized.filter.replace(/drop-shadow\([^)]*\)/g, '').trim();
      }
    }
    
    return optimized;
  }, [optimizedConfig, deviceCapabilities]);

  // Generate optimized CSS custom properties
  const generateCSSProperties = useCallback((colors) => {
    if (!deviceCapabilities) return {};
    
    return cssOptimizer.generateOptimizedProperties(colors, deviceCapabilities.type);
  }, [deviceCapabilities]);

  // Measure render time
  const measureRenderTime = useCallback((renderFn) => {
    if (!enableMonitoring) return renderFn();
    
    return performanceMonitor.measureRenderTime(componentName, renderFn);
  }, [componentName, enableMonitoring]);

  // Initialize optimization
  useEffect(() => {
    if (deviceCapabilities && optimizedConfig) {
      setIsOptimized(true);
      
      // Run initial performance measurement
      if (enableMonitoring) {
        measurePerformance();
      }
    }
  }, [deviceCapabilities, optimizedConfig, enableMonitoring, measurePerformance]);

  return {
    isOptimized,
    deviceCapabilities,
    optimizedConfig,
    performanceMetrics,
    optimizeStyles,
    generateCSSProperties,
    measureRenderTime,
    measurePerformance,
    componentRef,
  };
};

// Hook for lazy loading gradients
export const useLazyGradients = (gradients = {}, options = {}) => {
  const [loadedGradients, setLoadedGradients] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef(null);
  
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enableLazyLoading = true,
  } = options;

  // Create intersection observer
  useEffect(() => {
    if (!enableLazyLoading) {
      setLoadedGradients(gradients);
      setIsLoading(false);
      return;
    }

    observerRef.current = lazyLoader.createIntersectionObserver(
      (target, isVisible) => {
        if (isVisible) {
          const gradientKey = target.dataset.gradientKey;
          if (gradientKey && gradients[gradientKey]) {
            setLoadedGradients(prev => ({
              ...prev,
              [gradientKey]: gradients[gradientKey],
            }));
          }
        }
      },
      { rootMargin, threshold }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [gradients, enableLazyLoading, rootMargin, threshold]);

  // Register element for lazy loading
  const registerElement = useCallback((element, gradientKey) => {
    if (!element || !observerRef.current || !enableLazyLoading) return;
    
    element.dataset.gradientKey = gradientKey;
    observerRef.current.observe(element);
  }, [enableLazyLoading]);

  // Get gradient (loaded or placeholder)
  const getGradient = useCallback((key, placeholder = null) => {
    if (!enableLazyLoading) return gradients[key];
    
    return loadedGradients[key] || placeholder;
  }, [gradients, loadedGradients, enableLazyLoading]);

  // Check if all gradients are loaded
  useEffect(() => {
    if (!enableLazyLoading) {
      setIsLoading(false);
      return;
    }

    const totalGradients = Object.keys(gradients).length;
    const loadedCount = Object.keys(loadedGradients).length;
    setIsLoading(totalGradients > 0 && loadedCount < totalGradients);
  }, [gradients, loadedGradients, enableLazyLoading]);

  return {
    loadedGradients,
    isLoading,
    registerElement,
    getGradient,
  };
};

// Hook for chart performance optimization
export const useChartPerformance = (chartData, options = {}) => {
  const [optimizedData, setOptimizedData] = useState(chartData);
  const [colorConfig, setColorConfig] = useState(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const chartRef = useRef(null);
  
  const {
    maxDataPoints = 100,
    enableColorOptimization = true,
    enableDataOptimization = true,
  } = options;

  const { deviceCapabilities, optimizedConfig } = usePerformanceOptimization('chart');

  // Optimize chart data for performance
  useEffect(() => {
    if (!enableDataOptimization || !chartData) {
      setOptimizedData(chartData);
      return;
    }

    let optimized = chartData;

    // Reduce data points on mobile devices
    if (deviceCapabilities?.type === 'mobile' && Array.isArray(chartData) && chartData.length > maxDataPoints) {
      const step = Math.ceil(chartData.length / maxDataPoints);
      optimized = chartData.filter((_, index) => index % step === 0);
    }

    setOptimizedData(optimized);
  }, [chartData, deviceCapabilities, maxDataPoints, enableDataOptimization]);

  // Optimize color configuration
  useEffect(() => {
    if (!enableColorOptimization || !optimizedConfig) return;

    const colors = {
      maxColors: optimizedConfig.maxColors,
      enableGradients: optimizedConfig.enableGradients,
      enableAnimations: optimizedConfig.enableAnimations,
    };

    setColorConfig(colors);
  }, [optimizedConfig, enableColorOptimization]);

  // Set up lazy loading for chart colors
  useEffect(() => {
    if (!chartRef.current || !colorConfig) return;

    const observer = lazyLoader.lazyLoadChartColors(chartRef.current, colorConfig);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [colorConfig]);

  // Mark as optimized when ready
  useEffect(() => {
    if (optimizedData && colorConfig) {
      setIsOptimized(true);
    }
  }, [optimizedData, colorConfig]);

  return {
    optimizedData,
    colorConfig,
    isOptimized,
    chartRef,
    deviceCapabilities,
  };
};

// Hook for animation performance
export const useAnimationPerformance = (animationName, options = {}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const animationRef = useRef(null);
  
  const {
    enableOnMobile = false,
    respectReducedMotion = true,
    measurePerformance = process.env.NODE_ENV === 'development',
  } = options;

  const { deviceCapabilities, optimizedConfig } = usePerformanceOptimization('animation');

  // Check if animations should be enabled
  useEffect(() => {
    let shouldEnable = true;

    // Respect reduced motion preference
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shouldEnable = false;
    }

    // Disable on mobile if not explicitly enabled
    if (!enableOnMobile && deviceCapabilities?.type === 'mobile') {
      shouldEnable = false;
    }

    // Disable if device optimization suggests it
    if (optimizedConfig && !optimizedConfig.enableAnimations) {
      shouldEnable = false;
    }

    setIsEnabled(shouldEnable);
  }, [deviceCapabilities, optimizedConfig, enableOnMobile, respectReducedMotion]);

  // Measure animation performance
  const measureAnimationPerformance = useCallback(async (duration = 2000) => {
    if (!measurePerformance || !animationName) return null;

    try {
      const metrics = await performanceTester.testAnimationPerformance(animationName, duration);
      setPerformanceMetrics(metrics);
      return metrics;
    } catch (error) {
      console.warn(`[Animation Performance] Failed to measure ${animationName}:`, error);
      return null;
    }
  }, [animationName, measurePerformance]);

  // Get optimized animation duration
  const getAnimationDuration = useCallback(() => {
    if (!isEnabled) return 0;
    
    return optimizedConfig?.animationDuration || 300;
  }, [isEnabled, optimizedConfig]);

  return {
    isEnabled,
    performanceMetrics,
    animationRef,
    measureAnimationPerformance,
    getAnimationDuration,
    deviceCapabilities,
  };
};

// Hook for memory monitoring
export const useMemoryMonitoring = (componentName, options = {}) => {
  const [memoryMetrics, setMemoryMetrics] = useState(null);
  const [isMemoryConstrained, setIsMemoryConstrained] = useState(false);
  const intervalRef = useRef(null);
  
  const {
    monitoringInterval = 5000, // 5 seconds
    memoryThreshold = 0.8, // 80% of heap limit
    enableMonitoring = process.env.NODE_ENV === 'development',
  } = options;

  // Start memory monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    const monitor = () => {
      const metrics = performanceMonitor.measureMemoryUsage();
      if (metrics) {
        setMemoryMetrics(metrics);
        
        const memoryUsageRatio = metrics.usedJSHeapSize / metrics.jsHeapSizeLimit;
        setIsMemoryConstrained(memoryUsageRatio > memoryThreshold);
        
        if (process.env.NODE_ENV === 'development' && memoryUsageRatio > memoryThreshold) {
          console.warn(`[Memory Warning] ${componentName} memory usage: ${(memoryUsageRatio * 100).toFixed(1)}%`);
        }
      }
    };

    // Initial measurement
    monitor();
    
    // Set up interval monitoring
    intervalRef.current = setInterval(monitor, monitoringInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [componentName, enableMonitoring, monitoringInterval, memoryThreshold]);

  return {
    memoryMetrics,
    isMemoryConstrained,
  };
};

export default {
  usePerformanceOptimization,
  useLazyGradients,
  useChartPerformance,
  useAnimationPerformance,
  useMemoryMonitoring,
};