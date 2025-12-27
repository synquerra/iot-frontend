/**
 * Performance Optimization Utilities for Colorful UI Components
 * Provides lazy loading, CSS optimization, and performance monitoring
 */

// Performance monitoring utilities
export const performanceMonitor = {
  // Track component render times
  measureRenderTime: (componentName, renderFn) => {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      
      // Warn if render time is too high
      if (renderTime > 16) { // 60fps = 16.67ms per frame
        console.warn(`[Performance Warning] ${componentName} render time (${renderTime.toFixed(2)}ms) exceeds 16ms budget`);
      }
    }
    
    return { result, renderTime };
  },

  // Track paint and layout metrics
  measurePaintMetrics: (elementId) => {
    if (!window.PerformanceObserver) return null;

    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const paintMetrics = {
          firstPaint: null,
          firstContentfulPaint: null,
          largestContentfulPaint: null,
        };

        entries.forEach((entry) => {
          switch (entry.name) {
            case 'first-paint':
              paintMetrics.firstPaint = entry.startTime;
              break;
            case 'first-contentful-paint':
              paintMetrics.firstContentfulPaint = entry.startTime;
              break;
            case 'largest-contentful-paint':
              paintMetrics.largestContentfulPaint = entry.startTime;
              break;
          }
        });

        observer.disconnect();
        resolve(paintMetrics);
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 5000);
    });
  },

  // Monitor memory usage for colorful components
  measureMemoryUsage: () => {
    if (!window.performance?.memory) return null;

    return {
      usedJSHeapSize: window.performance.memory.usedJSHeapSize,
      totalJSHeapSize: window.performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  },

  // Track frame rate during animations
  measureFrameRate: (duration = 1000) => {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      
      const countFrame = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - startTime < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
          resolve(fps);
        }
      };
      
      requestAnimationFrame(countFrame);
    });
  },

  // Comprehensive performance report
  generatePerformanceReport: async (componentName) => {
    const startTime = performance.now();
    
    const [paintMetrics, memoryBefore, frameRate] = await Promise.all([
      performanceMonitor.measurePaintMetrics(),
      performanceMonitor.measureMemoryUsage(),
      performanceMonitor.measureFrameRate(2000), // 2 second measurement
    ]);
    
    const memoryAfter = performanceMonitor.measureMemoryUsage();
    const totalTime = performance.now() - startTime;
    
    const report = {
      componentName,
      timestamp: new Date().toISOString(),
      metrics: {
        totalMeasurementTime: totalTime,
        paintMetrics,
        frameRate,
        memory: {
          before: memoryBefore,
          after: memoryAfter,
          delta: memoryAfter && memoryBefore ? {
            usedJSHeapSize: memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize,
            totalJSHeapSize: memoryAfter.totalJSHeapSize - memoryBefore.totalJSHeapSize,
          } : null,
        },
      },
      performance: {
        isGoodFrameRate: frameRate >= 55, // Good if above 55fps
        isGoodMemoryUsage: memoryAfter ? (memoryAfter.usedJSHeapSize / memoryAfter.jsHeapSizeLimit) < 0.8 : true,
        isGoodPaintTime: paintMetrics?.firstContentfulPaint ? paintMetrics.firstContentfulPaint < 1000 : true,
      },
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.group(`[Performance Report] ${componentName}`);
      console.log('Frame Rate:', `${frameRate}fps`);
      console.log('Paint Metrics:', paintMetrics);
      console.log('Memory Usage:', memoryAfter);
      console.log('Performance Status:', report.performance);
      console.groupEnd();
    }
    
    return report;
  },
};

// CSS optimization utilities
export const cssOptimizer = {
  // Optimize gradient CSS for better performance
  optimizeGradient: (gradient, deviceType = 'desktop') => {
    if (!gradient || typeof gradient !== 'string') return gradient;
    
    // Simplify gradients on mobile devices
    if (deviceType === 'mobile') {
      // Convert complex gradients to simple 2-stop gradients
      const gradientMatch = gradient.match(/linear-gradient\(([^,]+),\s*([^,]+)\s+\d+%.*,\s*([^)]+)\s+\d+%\)/);
      if (gradientMatch) {
        return `linear-gradient(${gradientMatch[1]}, ${gradientMatch[2]}, ${gradientMatch[3]})`;
      }
    }
    
    return gradient;
  },

  // Generate optimized CSS custom properties
  generateOptimizedProperties: (colors, deviceType = 'desktop') => {
    const properties = {};
    
    // Optimize color properties based on device capabilities
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('linear-gradient')) {
        properties[`--${key}`] = cssOptimizer.optimizeGradient(value, deviceType);
      } else {
        properties[`--${key}`] = value;
      }
    });
    
    // Add performance-optimized properties
    if (deviceType === 'mobile') {
      properties['--animation-duration'] = '200ms'; // Faster animations on mobile
      properties['--blur-intensity'] = '4px'; // Reduced blur on mobile
      properties['--shadow-intensity'] = '0.1'; // Lighter shadows on mobile
    } else {
      properties['--animation-duration'] = '300ms';
      properties['--blur-intensity'] = '8px';
      properties['--shadow-intensity'] = '0.2';
    }
    
    return properties;
  },

  // Optimize CSS for reduced paint complexity
  optimizeForPaint: (styles) => {
    const optimized = { ...styles };
    
    // Use transform instead of changing layout properties
    if (optimized.left || optimized.top) {
      const translateX = optimized.left ? `translateX(${optimized.left})` : '';
      const translateY = optimized.top ? `translateY(${optimized.top})` : '';
      optimized.transform = `${translateX} ${translateY}`.trim();
      delete optimized.left;
      delete optimized.top;
    }
    
    // Use opacity instead of visibility for better performance
    if (optimized.visibility === 'hidden') {
      optimized.opacity = '0';
      optimized.pointerEvents = 'none';
      delete optimized.visibility;
    }
    
    // Add will-change for animated properties
    const animatedProps = ['transform', 'opacity', 'filter'];
    const hasAnimatedProps = animatedProps.some(prop => optimized[prop]);
    if (hasAnimatedProps) {
      optimized.willChange = 'transform, opacity, filter';
    }
    
    return optimized;
  },

  // Generate critical CSS for above-the-fold content
  generateCriticalCSS: (components = []) => {
    const criticalStyles = [];
    
    // Base critical styles for colorful components
    criticalStyles.push(`
      /* Critical colorful component styles */
      .colorful-component {
        contain: layout style paint;
        transform: translateZ(0); /* Force GPU acceleration */
      }
      
      /* Optimized gradient backgrounds */
      .gradient-bg {
        background-attachment: fixed;
        will-change: transform;
      }
      
      /* Performance-optimized animations */
      .animate-optimized {
        animation-fill-mode: both;
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `);
    
    // Component-specific critical styles
    components.forEach(component => {
      switch (component) {
        case 'card':
          criticalStyles.push(`
            .card-colorful {
              contain: layout style;
              transform: translateZ(0);
            }
          `);
          break;
        case 'button':
          criticalStyles.push(`
            .button-colorful {
              contain: layout style paint;
              will-change: transform, box-shadow;
            }
          `);
          break;
        case 'chart':
          criticalStyles.push(`
            .chart-colorful {
              contain: size layout style paint;
              transform: translateZ(0);
            }
          `);
          break;
      }
    });
    
    return criticalStyles.join('\n');
  },
};

// Lazy loading utilities for complex gradients
export const lazyLoader = {
  // Intersection Observer for lazy loading
  createIntersectionObserver: (callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    if (!window.IntersectionObserver) {
      // Fallback for browsers without Intersection Observer
      callback(null, true);
      return null;
    }
    
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        callback(entry.target, entry.isIntersecting);
      });
    }, observerOptions);
  },

  // Lazy load complex gradients
  lazyLoadGradient: (element, complexGradient, simpleGradient = null) => {
    if (!element) return;
    
    const observer = lazyLoader.createIntersectionObserver((target, isVisible) => {
      if (isVisible) {
        // Load complex gradient when element is visible
        target.style.backgroundImage = complexGradient;
        target.classList.add('gradient-loaded');
        observer?.unobserve(target);
      }
    });
    
    // Set simple gradient initially
    if (simpleGradient) {
      element.style.backgroundImage = simpleGradient;
    }
    
    observer?.observe(element);
    
    return observer;
  },

  // Lazy load chart colors
  lazyLoadChartColors: (chartElement, colorConfig) => {
    if (!chartElement) return;
    
    const observer = lazyLoader.createIntersectionObserver((target, isVisible) => {
      if (isVisible) {
        // Apply full color configuration when chart is visible
        target.setAttribute('data-colors-loaded', 'true');
        
        // Trigger chart re-render with full colors
        const event = new CustomEvent('colorsLoaded', { 
          detail: colorConfig 
        });
        target.dispatchEvent(event);
        
        observer?.unobserve(target);
      }
    });
    
    observer?.observe(chartElement);
    return observer;
  },

  // Preload critical visual assets
  preloadCriticalAssets: (assets = []) => {
    const promises = assets.map(asset => {
      return new Promise((resolve, reject) => {
        if (asset.type === 'image') {
          const img = new Image();
          img.onload = () => resolve(asset);
          img.onerror = () => reject(asset);
          img.src = asset.url;
        } else if (asset.type === 'font') {
          const font = new FontFace(asset.family, `url(${asset.url})`);
          font.load().then(() => {
            document.fonts.add(font);
            resolve(asset);
          }).catch(() => reject(asset));
        } else {
          resolve(asset);
        }
      });
    });
    
    return Promise.allSettled(promises);
  },
};

// Device-specific optimization
export const deviceOptimizer = {
  // Detect device capabilities
  getDeviceCapabilities: () => {
    const capabilities = {
      type: 'desktop',
      supportsGPU: false,
      supportsAdvancedCSS: true,
      memoryLimit: 'high',
      connectionSpeed: 'fast',
    };
    
    // Detect device type
    if (window.innerWidth < 768) {
      capabilities.type = 'mobile';
    } else if (window.innerWidth < 1024) {
      capabilities.type = 'tablet';
    }
    
    // Detect GPU support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    capabilities.supportsGPU = !!gl;
    
    // Detect memory constraints
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory <= 2) {
        capabilities.memoryLimit = 'low';
      } else if (navigator.deviceMemory <= 4) {
        capabilities.memoryLimit = 'medium';
      }
    }
    
    // Detect connection speed
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        capabilities.connectionSpeed = 'slow';
      } else if (connection.effectiveType === '3g') {
        capabilities.connectionSpeed = 'medium';
      }
    }
    
    return capabilities;
  },

  // Get optimized configuration based on device
  getOptimizedConfig: (capabilities = null) => {
    const caps = capabilities || deviceOptimizer.getDeviceCapabilities();
    
    const config = {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: true,
      enableBlur: true,
      maxColors: 12,
      animationDuration: 300,
      shadowIntensity: 0.2,
    };
    
    // Optimize for mobile devices
    if (caps.type === 'mobile') {
      config.enableGlowEffects = false;
      config.animationDuration = 200;
      config.shadowIntensity = 0.1;
      config.maxColors = 8;
      
      if (caps.memoryLimit === 'low') {
        config.enableBlur = false;
        config.maxColors = 6;
      }
    }
    
    // Optimize for slow connections
    if (caps.connectionSpeed === 'slow') {
      config.enableGradients = false;
      config.enableAnimations = false;
      config.maxColors = 4;
    }
    
    // Optimize for low memory devices
    if (caps.memoryLimit === 'low') {
      config.enableBlur = false;
      config.enableGlowEffects = false;
      config.maxColors = Math.min(config.maxColors, 6);
    }
    
    return config;
  },
};

// Performance testing utilities
export const performanceTester = {
  // Test component render performance
  testRenderPerformance: async (componentName, renderFunction, iterations = 100) => {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const { renderTime } = performanceMonitor.measureRenderTime(
        `${componentName}-test-${i}`,
        renderFunction
      );
      results.push(renderTime);
    }
    
    const average = results.reduce((sum, time) => sum + time, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const median = results.sort((a, b) => a - b)[Math.floor(results.length / 2)];
    
    return {
      componentName,
      iterations,
      results: {
        average: parseFloat(average.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
      },
      performance: {
        isGood: average < 16, // 60fps budget
        grade: average < 8 ? 'A' : average < 16 ? 'B' : average < 32 ? 'C' : 'D',
      },
    };
  },

  // Test animation performance
  testAnimationPerformance: async (animationName, duration = 2000) => {
    const frameRate = await performanceMonitor.measureFrameRate(duration);
    const memoryBefore = performanceMonitor.measureMemoryUsage();
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, duration));
    
    const memoryAfter = performanceMonitor.measureMemoryUsage();
    
    return {
      animationName,
      duration,
      frameRate,
      memoryDelta: memoryAfter && memoryBefore ? 
        memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize : null,
      performance: {
        isGoodFrameRate: frameRate >= 55,
        isGoodMemoryUsage: memoryAfter && memoryBefore ? 
          (memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize) < 1024 * 1024 : true, // Less than 1MB
      },
    };
  },

  // Comprehensive performance test suite
  runPerformanceTestSuite: async (components = []) => {
    const results = {
      timestamp: new Date().toISOString(),
      deviceCapabilities: deviceOptimizer.getDeviceCapabilities(),
      tests: {},
    };
    
    for (const component of components) {
      try {
        const componentResults = await performanceMonitor.generatePerformanceReport(component.name);
        results.tests[component.name] = componentResults;
      } catch (error) {
        results.tests[component.name] = {
          error: error.message,
          status: 'failed',
        };
      }
    }
    
    return results;
  },
};

// Export all utilities
export default {
  performanceMonitor,
  cssOptimizer,
  lazyLoader,
  deviceOptimizer,
  performanceTester,
};