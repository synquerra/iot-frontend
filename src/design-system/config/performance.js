/**
 * Performance Configuration for Colorful UI Components
 * Centralized configuration for performance optimization settings
 */

// Performance thresholds and targets
export const performanceThresholds = {
  // Render performance (in milliseconds)
  render: {
    excellent: 8,    // Grade A: Under 8ms
    good: 16,        // Grade B: Under 16ms (60fps budget)
    acceptable: 32,  // Grade C: Under 32ms (30fps budget)
    poor: 64,        // Grade D: Over 32ms
  },

  // Frame rate (in fps)
  frameRate: {
    excellent: 60,   // Smooth 60fps
    good: 55,        // Good 55fps+
    acceptable: 30,  // Acceptable 30fps+
    poor: 15,        // Poor under 30fps
  },

  // Memory usage (percentage of heap limit)
  memory: {
    excellent: 40,   // Under 40% heap usage
    good: 60,        // Under 60% heap usage
    acceptable: 80,  // Under 80% heap usage
    poor: 90,        // Over 80% heap usage
  },

  // Paint metrics (in milliseconds)
  paint: {
    firstPaint: 1000,           // First Paint under 1s
    firstContentfulPaint: 1500, // FCP under 1.5s
    largestContentfulPaint: 2500, // LCP under 2.5s
  },

  // Animation performance
  animation: {
    minFrameRate: 55,           // Minimum acceptable frame rate during animations
    maxMemoryIncrease: 5242880, // Max 5MB memory increase during animations
    maxDuration: 500,           // Max animation duration in ms
  },
};

// Device-specific optimization configurations
export const deviceConfigurations = {
  mobile: {
    low: {
      enableGradients: false,
      enableAnimations: false,
      enableGlowEffects: false,
      enableBlur: false,
      maxColors: 4,
      animationDuration: 150,
      shadowIntensity: 0.05,
      backdropBlur: false,
      complexGradients: false,
      particleEffects: false,
    },
    medium: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: false,
      enableBlur: false,
      maxColors: 6,
      animationDuration: 200,
      shadowIntensity: 0.1,
      backdropBlur: false,
      complexGradients: false,
      particleEffects: false,
    },
    high: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: false,
      enableBlur: true,
      maxColors: 8,
      animationDuration: 200,
      shadowIntensity: 0.1,
      backdropBlur: true,
      complexGradients: false,
      particleEffects: false,
    },
  },
  tablet: {
    low: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: false,
      enableBlur: true,
      maxColors: 8,
      animationDuration: 250,
      shadowIntensity: 0.15,
      backdropBlur: true,
      complexGradients: false,
      particleEffects: false,
    },
    medium: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: true,
      enableBlur: true,
      maxColors: 10,
      animationDuration: 250,
      shadowIntensity: 0.15,
      backdropBlur: true,
      complexGradients: true,
      particleEffects: false,
    },
    high: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: true,
      enableBlur: true,
      maxColors: 12,
      animationDuration: 300,
      shadowIntensity: 0.2,
      backdropBlur: true,
      complexGradients: true,
      particleEffects: true,
    },
  },
  desktop: {
    low: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: true,
      enableBlur: true,
      maxColors: 10,
      animationDuration: 300,
      shadowIntensity: 0.2,
      backdropBlur: true,
      complexGradients: true,
      particleEffects: false,
    },
    medium: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: true,
      enableBlur: true,
      maxColors: 12,
      animationDuration: 300,
      shadowIntensity: 0.2,
      backdropBlur: true,
      complexGradients: true,
      particleEffects: true,
    },
    high: {
      enableGradients: true,
      enableAnimations: true,
      enableGlowEffects: true,
      enableBlur: true,
      maxColors: 16,
      animationDuration: 350,
      shadowIntensity: 0.25,
      backdropBlur: true,
      complexGradients: true,
      particleEffects: true,
    },
  },
};

// Connection-specific optimizations
export const connectionOptimizations = {
  'slow-2g': {
    enableGradients: false,
    enableAnimations: false,
    enableGlowEffects: false,
    enableBlur: false,
    maxColors: 3,
    preloadAssets: false,
    lazyLoadThreshold: 0.5,
  },
  '2g': {
    enableGradients: false,
    enableAnimations: false,
    enableGlowEffects: false,
    enableBlur: false,
    maxColors: 4,
    preloadAssets: false,
    lazyLoadThreshold: 0.3,
  },
  '3g': {
    enableGradients: true,
    enableAnimations: true,
    enableGlowEffects: false,
    enableBlur: false,
    maxColors: 6,
    preloadAssets: true,
    lazyLoadThreshold: 0.2,
  },
  '4g': {
    enableGradients: true,
    enableAnimations: true,
    enableGlowEffects: true,
    enableBlur: true,
    maxColors: 12,
    preloadAssets: true,
    lazyLoadThreshold: 0.1,
  },
};

// Component-specific performance configurations
export const componentConfigurations = {
  Card: {
    criticalCSS: true,
    lazyLoadGradients: true,
    optimizeForPaint: true,
    maxNestingLevel: 3,
    enableGPUAcceleration: true,
  },
  Button: {
    criticalCSS: true,
    lazyLoadGradients: false, // Buttons should load immediately
    optimizeForPaint: true,
    maxNestingLevel: 2,
    enableGPUAcceleration: true,
  },
  Chart: {
    criticalCSS: false,
    lazyLoadGradients: true,
    optimizeForPaint: true,
    maxDataPoints: {
      mobile: 50,
      tablet: 100,
      desktop: 200,
    },
    enableGPUAcceleration: true,
    useWebGL: true,
  },
  Input: {
    criticalCSS: true,
    lazyLoadGradients: false,
    optimizeForPaint: true,
    maxNestingLevel: 2,
    enableGPUAcceleration: false, // Avoid GPU acceleration for form inputs
  },
  Modal: {
    criticalCSS: false,
    lazyLoadGradients: true,
    optimizeForPaint: true,
    maxNestingLevel: 4,
    enableGPUAcceleration: true,
  },
};

// Performance monitoring configuration
export const monitoringConfig = {
  // Enable monitoring in development
  enableInDevelopment: true,
  
  // Enable monitoring in production (with sampling)
  enableInProduction: false,
  
  // Sampling rate for production monitoring (0.1 = 10% of users)
  productionSamplingRate: 0.1,
  
  // Monitoring intervals
  intervals: {
    realTime: 2000,      // Real-time monitoring every 2 seconds
    periodic: 30000,     // Periodic reports every 30 seconds
    memoryCheck: 5000,   // Memory checks every 5 seconds
  },
  
  // Metrics to collect
  metrics: {
    renderTime: true,
    frameRate: true,
    memoryUsage: true,
    paintMetrics: true,
    userInteractions: true,
    errorTracking: true,
  },
  
  // Thresholds for alerts
  alertThresholds: {
    renderTime: 32,      // Alert if render time > 32ms
    frameRate: 30,       // Alert if frame rate < 30fps
    memoryUsage: 80,     // Alert if memory usage > 80%
    errorRate: 0.05,     // Alert if error rate > 5%
  },
  
  // Performance budget
  budget: {
    totalBundleSize: 500 * 1024,    // 500KB total bundle size
    criticalCSS: 50 * 1024,         // 50KB critical CSS
    imageAssets: 200 * 1024,        // 200KB image assets
    fontAssets: 100 * 1024,         // 100KB font assets
  },
};

// Lazy loading configuration
export const lazyLoadingConfig = {
  // Intersection Observer options
  intersectionOptions: {
    rootMargin: '50px',
    threshold: 0.1,
  },
  
  // Component-specific lazy loading
  components: {
    gradients: {
      enabled: true,
      placeholder: 'linear-gradient(135deg, #1a2332 0%, #243142 100%)',
      threshold: 0.2,
    },
    charts: {
      enabled: true,
      placeholder: null,
      threshold: 0.1,
    },
    images: {
      enabled: true,
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWEyMzMyIi8+PC9zdmc+',
      threshold: 0.1,
    },
  },
  
  // Preloading configuration
  preloading: {
    criticalAssets: true,
    aboveFoldComponents: true,
    userInteractionPrediction: false,
  },
};

// CSS optimization configuration
export const cssOptimizationConfig = {
  // Enable CSS containment
  enableContainment: true,
  
  // Enable GPU acceleration
  enableGPUAcceleration: true,
  
  // Optimize for paint
  optimizeForPaint: true,
  
  // Critical CSS extraction
  criticalCSS: {
    enabled: true,
    inlineThreshold: 10 * 1024, // 10KB inline threshold
    components: ['Card', 'Button', 'Input'],
  },
  
  // CSS purging
  purgeCSS: {
    enabled: true,
    safelist: [
      /^colorful-/,
      /^gradient-/,
      /^glow-/,
      /^animate-/,
    ],
  },
  
  // CSS minification
  minification: {
    enabled: true,
    removeComments: true,
    removeWhitespace: true,
    optimizeSelectors: true,
  },
};

// Export default configuration
export const defaultPerformanceConfig = {
  thresholds: performanceThresholds,
  devices: deviceConfigurations,
  connections: connectionOptimizations,
  components: componentConfigurations,
  monitoring: monitoringConfig,
  lazyLoading: lazyLoadingConfig,
  cssOptimization: cssOptimizationConfig,
};

// Utility functions for configuration
export const getDeviceConfig = (deviceType, memoryLevel) => {
  return deviceConfigurations[deviceType]?.[memoryLevel] || deviceConfigurations.desktop.medium;
};

export const getConnectionConfig = (connectionType) => {
  return connectionOptimizations[connectionType] || connectionOptimizations['4g'];
};

export const getComponentConfig = (componentName) => {
  return componentConfigurations[componentName] || componentConfigurations.Card;
};

export const shouldEnableFeature = (feature, deviceConfig, connectionConfig) => {
  // Feature is enabled if both device and connection allow it
  return deviceConfig[feature] && connectionConfig[feature] !== false;
};

export const getOptimalColorCount = (deviceConfig, connectionConfig) => {
  // Use the minimum of device and connection limits
  const deviceMax = deviceConfig.maxColors || 12;
  const connectionMax = connectionConfig.maxColors || 12;
  return Math.min(deviceMax, connectionMax);
};

export const getOptimalAnimationDuration = (deviceConfig, connectionConfig) => {
  // Use device-specific duration, but disable if connection is slow
  if (connectionConfig.enableAnimations === false) return 0;
  return deviceConfig.animationDuration || 300;
};

export default defaultPerformanceConfig;