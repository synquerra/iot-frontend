/**
 * Responsive Color Utilities
 * Provides comprehensive responsive color behavior for the colorful UI redesign
 * Ensures colors work well across all screen sizes and maintain accessibility
 */

import { breakpointValues } from './responsive.js';
import { spectrumColors, semanticColors } from '../tokens/colors.js';

// Color contrast calculation utilities
export const contrastUtils = {
  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Calculate relative luminance
  getLuminance: (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1, color2) => {
    const rgb1 = typeof color1 === 'string' ? contrastUtils.hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? contrastUtils.hexToRgb(color2) : color2;
    
    if (!rgb1 || !rgb2) return 1;
    
    const lum1 = contrastUtils.getLuminance(rgb1);
    const lum2 = contrastUtils.getLuminance(rgb2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG requirements
  meetsWCAG: (color1, color2, level = 'AA', size = 'normal') => {
    const ratio = contrastUtils.getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    // AA level (default)
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  },
};

// Responsive color behavior configuration
export const responsiveColorConfig = {
  // Breakpoint-specific color adjustments
  breakpoints: {
    mobile: {
      // Mobile devices (xs, sm)
      contrastBoost: 1.1,        // Boost contrast for outdoor viewing
      saturationBoost: 1.05,     // Slightly more vibrant
      touchTargetMin: 44,        // Minimum touch target size (px)
      gradientComplexity: 'simple', // Simpler gradients for performance
      glowEffects: false,        // Disable glow effects on mobile
    },
    tablet: {
      // Tablet devices (md)
      contrastBoost: 1.0,        // Standard contrast
      saturationBoost: 1.0,      // Standard saturation
      touchTargetMin: 40,        // Slightly smaller touch targets
      gradientComplexity: 'moderate',
      glowEffects: true,         // Enable moderate glow effects
    },
    desktop: {
      // Desktop devices (lg, xl, 2xl)
      contrastBoost: 1.0,        // Standard contrast
      saturationBoost: 0.95,     // Slightly more subtle
      touchTargetMin: 32,        // Standard click targets
      gradientComplexity: 'full',
      glowEffects: true,         // Full glow effects
    },
  },

  // Touch feedback colors for mobile
  touchFeedback: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.16)',
  },

  // Gradient simplification for mobile
  gradientSimplification: {
    simple: {
      maxStops: 2,
      removeBlur: true,
      reduceOpacity: 0.8,
    },
    moderate: {
      maxStops: 3,
      removeBlur: false,
      reduceOpacity: 0.9,
    },
    full: {
      maxStops: 5,
      removeBlur: false,
      reduceOpacity: 1.0,
    },
  },
};

// Main responsive color utilities
export const responsiveColors = {
  // Get current breakpoint category
  getBreakpointCategory: (width = window?.innerWidth || 1024) => {
    if (width < breakpointValues.md) return 'mobile';
    if (width < breakpointValues.lg) return 'tablet';
    return 'desktop';
  },

  // Get responsive color configuration for current breakpoint
  getConfig: (width = window?.innerWidth || 1024) => {
    const category = responsiveColors.getBreakpointCategory(width);
    return responsiveColorConfig.breakpoints[category];
  },

  // Adjust color intensity based on breakpoint
  adjustColorIntensity: (colorValue, intensity = 'vibrant', width = window?.innerWidth || 1024) => {
    const config = responsiveColors.getConfig(width);
    
    if (!colorValue || !colorValue.startsWith('#')) return colorValue;
    
    const rgb = contrastUtils.hexToRgb(colorValue);
    if (!rgb) return colorValue;
    
    // Apply saturation boost
    const boost = intensity === 'subtle' ? config.saturationBoost * 0.9 : config.saturationBoost;
    
    // Simple saturation adjustment (this is a simplified approach)
    const adjustedR = Math.min(255, Math.round(rgb.r * boost));
    const adjustedG = Math.min(255, Math.round(rgb.g * boost));
    const adjustedB = Math.min(255, Math.round(rgb.b * boost));
    
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
  },

  // Get appropriate touch target size
  getTouchTargetSize: (size = 'medium', width = window?.innerWidth || 1024) => {
    const config = responsiveColors.getConfig(width);
    const baseSize = config.touchTargetMin;
    
    const sizeMultipliers = {
      small: 1.0,
      medium: 1.2,
      large: 1.5,
    };
    
    return Math.round(baseSize * (sizeMultipliers[size] || 1.2));
  },

  // Simplify gradient for mobile performance
  simplifyGradient: (gradient, width = window?.innerWidth || 1024) => {
    const config = responsiveColors.getConfig(width);
    const simplification = responsiveColorConfig.gradientSimplification[config.gradientComplexity];
    
    if (config.gradientComplexity === 'full') return gradient;
    
    // For simple gradients, remove intermediate stops
    if (config.gradientComplexity === 'simple') {
      // Convert complex gradients to simple 2-stop gradients
      const matches = gradient.match(/linear-gradient\(([^,]+),\s*([^,]+)\s+\d+%,.*,\s*([^)]+)\s+\d+%\)/);
      if (matches) {
        return `linear-gradient(${matches[1]}, ${matches[2]}, ${matches[3]})`;
      }
    }
    
    return gradient;
  },

  // Get touch feedback color
  getTouchFeedback: (intensity = 'medium') => {
    return responsiveColorConfig.touchFeedback[intensity] || responsiveColorConfig.touchFeedback.medium;
  },

  // Check if glow effects should be enabled
  shouldEnableGlow: (width = window?.innerWidth || 1024) => {
    const config = responsiveColors.getConfig(width);
    return config.glowEffects;
  },

  // Ensure color meets contrast requirements
  ensureContrast: (foregroundColor, backgroundColor, level = 'AA', width = window?.innerWidth || 1024) => {
    const config = responsiveColors.getConfig(width);
    
    // Check current contrast
    const currentRatio = contrastUtils.getContrastRatio(foregroundColor, backgroundColor);
    const requiredRatio = level === 'AAA' ? 7 : 4.5;
    const adjustedRequiredRatio = requiredRatio * config.contrastBoost;
    
    if (currentRatio >= adjustedRequiredRatio) {
      return foregroundColor; // Already meets requirements
    }
    
    // If contrast is insufficient, return a high-contrast alternative
    // This is a simplified approach - in production, you'd want more sophisticated color adjustment
    const rgb = contrastUtils.hexToRgb(backgroundColor);
    if (!rgb) return foregroundColor;
    
    const luminance = contrastUtils.getLuminance(rgb);
    return luminance > 0.5 ? '#000000' : '#ffffff'; // Use black on light, white on dark
  },

  // Get responsive color scale
  getResponsiveColorScale: (colorName, scale = 500, width = window?.innerWidth || 1024) => {
    const color = spectrumColors[colorName];
    if (!color) return null;
    
    const baseColor = color[scale] || color.vibrant;
    return responsiveColors.adjustColorIntensity(baseColor, 'vibrant', width);
  },

  // Generate responsive CSS custom properties
  generateResponsiveColorProperties: (width = window?.innerWidth || 1024) => {
    const config = responsiveColors.getConfig(width);
    const category = responsiveColors.getBreakpointCategory(width);
    
    return {
      '--color-contrast-boost': config.contrastBoost,
      '--color-saturation-boost': config.saturationBoost,
      '--touch-target-min': `${config.touchTargetMin}px`,
      '--gradient-complexity': config.gradientComplexity,
      '--glow-effects-enabled': config.glowEffects ? '1' : '0',
      '--breakpoint-category': category,
      '--touch-feedback-light': responsiveColorConfig.touchFeedback.light,
      '--touch-feedback-medium': responsiveColorConfig.touchFeedback.medium,
      '--touch-feedback-strong': responsiveColorConfig.touchFeedback.strong,
    };
  },
};

// React hook for responsive colors (if using React)
export const useResponsiveColors = () => {
  const [windowWidth, setWindowWidth] = React.useState(window?.innerWidth || 1024);
  
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    width: windowWidth,
    category: responsiveColors.getBreakpointCategory(windowWidth),
    config: responsiveColors.getConfig(windowWidth),
    adjustColorIntensity: (color, intensity) => responsiveColors.adjustColorIntensity(color, intensity, windowWidth),
    getTouchTargetSize: (size) => responsiveColors.getTouchTargetSize(size, windowWidth),
    simplifyGradient: (gradient) => responsiveColors.simplifyGradient(gradient, windowWidth),
    shouldEnableGlow: () => responsiveColors.shouldEnableGlow(windowWidth),
    ensureContrast: (fg, bg, level) => responsiveColors.ensureContrast(fg, bg, level, windowWidth),
    getResponsiveColorScale: (colorName, scale) => responsiveColors.getResponsiveColorScale(colorName, scale, windowWidth),
    cssProperties: responsiveColors.generateResponsiveColorProperties(windowWidth),
  };
};

// Utility for generating responsive Tailwind classes
export const responsiveTailwindClasses = {
  // Generate responsive touch target classes
  touchTarget: (size = 'medium') => {
    const sizes = {
      small: 'h-10 w-10 sm:h-8 sm:w-8 md:h-10 md:w-10',
      medium: 'h-12 w-12 sm:h-10 sm:w-10 md:h-12 md:w-12',
      large: 'h-14 w-14 sm:h-12 sm:w-12 md:h-14 md:w-14',
    };
    return sizes[size] || sizes.medium;
  },

  // Generate responsive padding for touch targets
  touchPadding: (size = 'medium') => {
    const paddings = {
      small: 'p-2 sm:p-1.5 md:p-2',
      medium: 'p-3 sm:p-2 md:p-3',
      large: 'p-4 sm:p-3 md:p-4',
    };
    return paddings[size] || paddings.medium;
  },

  // Generate responsive text sizes with proper contrast
  textSize: (size = 'base') => {
    const sizes = {
      sm: 'text-sm sm:text-xs md:text-sm',
      base: 'text-base sm:text-sm md:text-base',
      lg: 'text-lg sm:text-base md:text-lg',
      xl: 'text-xl sm:text-lg md:text-xl',
      '2xl': 'text-2xl sm:text-xl md:text-2xl',
    };
    return sizes[size] || sizes.base;
  },

  // Generate responsive gradient classes
  gradient: (gradientName = 'primary') => {
    // Simplified gradients for mobile, full gradients for desktop
    const gradients = {
      primary: 'bg-gradient-to-r from-violet-600 to-purple-600 sm:from-violet-600 sm:via-violet-500 sm:to-purple-600',
      success: 'bg-gradient-to-r from-green-600 to-teal-600 sm:from-green-600 sm:via-green-500 sm:to-teal-600',
      warning: 'bg-gradient-to-r from-amber-600 to-orange-600 sm:from-amber-600 sm:via-amber-500 sm:to-orange-600',
      error: 'bg-gradient-to-r from-red-600 to-pink-600 sm:from-red-600 sm:via-red-500 sm:to-pink-600',
    };
    return gradients[gradientName] || gradients.primary;
  },

  // Generate responsive shadow classes
  shadow: (intensity = 'medium') => {
    const shadows = {
      light: 'shadow-sm sm:shadow-md md:shadow-lg',
      medium: 'shadow-md sm:shadow-lg md:shadow-xl',
      strong: 'shadow-lg sm:shadow-xl md:shadow-2xl',
    };
    return shadows[intensity] || shadows.medium;
  },

  // Generate responsive glow effects
  glow: (colorScheme = 'violet') => {
    // No glow on mobile, moderate on tablet, full on desktop
    return `sm:drop-shadow-glow-${colorScheme} md:hover:drop-shadow-glow-${colorScheme}`;
  },
};

export default responsiveColors;