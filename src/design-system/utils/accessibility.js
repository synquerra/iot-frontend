/**
 * Accessibility Utilities for Colorful UI Redesign
 * Ensures WCAG 2.1 AA compliance and comprehensive accessibility support
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { contrastUtils } from './responsiveColors.js';
import { spectrumColors, semanticColors } from '../tokens/colors.js';

// WCAG 2.1 contrast ratio requirements
export const WCAG_LEVELS = {
  AA: {
    normal: 4.5,
    large: 3.0,
  },
  AAA: {
    normal: 7.0,
    large: 4.5,
  },
};

// Color-blind simulation matrices (simplified Brettel, Viénot and Mollon transformation)
export const COLOR_BLIND_MATRICES = {
  protanopia: {
    // Red-blind (missing L-cones)
    r: [0.567, 0.433, 0],
    g: [0.558, 0.442, 0],
    b: [0, 0.242, 0.758],
  },
  deuteranopia: {
    // Green-blind (missing M-cones)
    r: [0.625, 0.375, 0],
    g: [0.7, 0.3, 0],
    b: [0, 0.3, 0.7],
  },
  tritanopia: {
    // Blue-blind (missing S-cones)
    r: [0.95, 0.05, 0],
    g: [0, 0.433, 0.567],
    b: [0, 0.475, 0.525],
  },
};

// Alternative indicators for color-coded information
export const ALTERNATIVE_INDICATORS = {
  status: {
    success: {
      icon: '✓',
      symbol: '●',
      pattern: 'solid',
      ariaLabel: 'Success',
    },
    warning: {
      icon: '⚠',
      symbol: '▲',
      pattern: 'striped',
      ariaLabel: 'Warning',
    },
    error: {
      icon: '✗',
      symbol: '■',
      pattern: 'dotted',
      ariaLabel: 'Error',
    },
    info: {
      icon: 'ℹ',
      symbol: '◆',
      pattern: 'dashed',
      ariaLabel: 'Information',
    },
  },
  priority: {
    high: {
      icon: '🔴',
      symbol: '●●●',
      pattern: 'solid',
      ariaLabel: 'High priority',
    },
    medium: {
      icon: '🟡',
      symbol: '●●○',
      pattern: 'striped',
      ariaLabel: 'Medium priority',
    },
    low: {
      icon: '🟢',
      symbol: '●○○',
      pattern: 'dotted',
      ariaLabel: 'Low priority',
    },
  },
  trend: {
    up: {
      icon: '↗',
      symbol: '▲',
      pattern: 'solid',
      ariaLabel: 'Trending up',
    },
    down: {
      icon: '↘',
      symbol: '▼',
      pattern: 'solid',
      ariaLabel: 'Trending down',
    },
    stable: {
      icon: '→',
      symbol: '●',
      pattern: 'solid',
      ariaLabel: 'Stable',
    },
  },
};

// High contrast color variants
export const HIGH_CONTRAST_COLORS = {
  background: '#000000',
  surface: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#e0e0e0',
  border: '#ffffff',
  success: '#00ff00',
  warning: '#ffff00',
  error: '#ff0000',
  info: '#00ffff',
  primary: '#ffffff',
  secondary: '#cccccc',
};

// Color-blind friendly palette (based on ColorBrewer and research)
export const COLOR_BLIND_FRIENDLY_PALETTE = {
  // Safe colors that work for all types of color blindness
  safe: [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf', // Cyan
  ],
  // High contrast variants
  highContrast: [
    '#000080', // Navy
    '#ff4500', // Orange Red
    '#008000', // Green
    '#dc143c', // Crimson
    '#4b0082', // Indigo
    '#a0522d', // Sienna
    '#ff1493', // Deep Pink
    '#2f4f4f', // Dark Slate Gray
    '#556b2f', // Dark Olive Green
    '#008b8b', // Dark Cyan
  ],
};

// Accessibility utilities
export const accessibilityUtils = {
  // Enhanced contrast checking with WCAG 2.1 compliance
  checkContrast: (foreground, background, level = 'AA', textSize = 'normal') => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    const required = WCAG_LEVELS[level][textSize];
    
    return {
      ratio,
      required,
      passes: ratio >= required,
      grade: ratio >= WCAG_LEVELS.AAA.normal ? 'AAA' : 
             ratio >= WCAG_LEVELS.AA.normal ? 'AA' : 'Fail',
    };
  },

  // Get WCAG-compliant text color for any background
  getAccessibleTextColor: (backgroundColor, level = 'AA', textSize = 'normal') => {
    const whiteContrast = accessibilityUtils.checkContrast('#ffffff', backgroundColor, level, textSize);
    const blackContrast = accessibilityUtils.checkContrast('#000000', backgroundColor, level, textSize);
    
    if (whiteContrast.passes && blackContrast.passes) {
      // Both pass, choose the one with higher contrast
      return whiteContrast.ratio > blackContrast.ratio ? '#ffffff' : '#000000';
    } else if (whiteContrast.passes) {
      return '#ffffff';
    } else if (blackContrast.passes) {
      return '#000000';
    } else {
      // Neither passes, return the one with higher contrast and warn
      console.warn(`No accessible text color found for background ${backgroundColor}`);
      return whiteContrast.ratio > blackContrast.ratio ? '#ffffff' : '#000000';
    }
  },

  // Simulate color blindness
  simulateColorBlindness: (color, type = 'protanopia') => {
    const rgb = contrastUtils.hexToRgb(color);
    if (!rgb) return color;

    const matrix = COLOR_BLIND_MATRICES[type];
    if (!matrix) return color;

    // Normalize RGB values to 0-1 range
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    // Apply transformation matrix
    const newR = Math.round((r * matrix.r[0] + g * matrix.r[1] + b * matrix.r[2]) * 255);
    const newG = Math.round((r * matrix.g[0] + g * matrix.g[1] + b * matrix.g[2]) * 255);
    const newB = Math.round((r * matrix.b[0] + g * matrix.b[1] + b * matrix.b[2]) * 255);

    // Clamp values to 0-255 range
    const clampedR = Math.max(0, Math.min(255, newR));
    const clampedG = Math.max(0, Math.min(255, newG));
    const clampedB = Math.max(0, Math.min(255, newB));

    return `#${clampedR.toString(16).padStart(2, '0')}${clampedG.toString(16).padStart(2, '0')}${clampedB.toString(16).padStart(2, '0')}`;
  },

  // Check if colors are distinguishable for color-blind users
  areColorsDistinguishable: (color1, color2, colorBlindType = 'deuteranopia', minContrast = 1.5) => {
    const sim1 = accessibilityUtils.simulateColorBlindness(color1, colorBlindType);
    const sim2 = accessibilityUtils.simulateColorBlindness(color2, colorBlindType);
    
    const contrast = contrastUtils.getContrastRatio(sim1, sim2);
    return contrast >= minContrast;
  },

  // Get alternative indicator for color-coded information
  getAlternativeIndicator: (type, value, format = 'icon') => {
    const indicators = ALTERNATIVE_INDICATORS[type];
    if (!indicators || !indicators[value]) {
      return {
        icon: '●',
        symbol: '●',
        pattern: 'solid',
        ariaLabel: value,
      };
    }
    
    return indicators[value];
  },

  // Generate accessible color palette
  generateAccessiblePalette: (baseColors, backgroundColors, level = 'AA') => {
    const accessiblePalette = {};
    
    baseColors.forEach((color, index) => {
      const colorName = `color-${index}`;
      accessiblePalette[colorName] = {};
      
      backgroundColors.forEach((bg, bgIndex) => {
        const bgName = `bg-${bgIndex}`;
        const contrast = accessibilityUtils.checkContrast(color, bg, level);
        
        if (contrast.passes) {
          accessiblePalette[colorName][bgName] = {
            color,
            background: bg,
            contrast: contrast.ratio,
            grade: contrast.grade,
          };
        }
      });
    });
    
    return accessiblePalette;
  },

  // Get high contrast variant of a color
  getHighContrastVariant: (colorName) => {
    return HIGH_CONTRAST_COLORS[colorName] || HIGH_CONTRAST_COLORS.text;
  },

  // Get color-blind friendly alternative
  getColorBlindFriendlyColor: (index, highContrast = false) => {
    const palette = highContrast ? 
      COLOR_BLIND_FRIENDLY_PALETTE.highContrast : 
      COLOR_BLIND_FRIENDLY_PALETTE.safe;
    
    return palette[index % palette.length];
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Generate ARIA attributes for color-coded elements
  generateColorAriaAttributes: (type, value, color) => {
    const indicator = accessibilityUtils.getAlternativeIndicator(type, value);
    
    return {
      'aria-label': indicator.ariaLabel,
      'role': 'img',
      'aria-describedby': `${type}-${value}-description`,
      'data-color': color,
      'data-pattern': indicator.pattern,
    };
  },

  // Validate color palette accessibility
  validatePaletteAccessibility: (palette, backgrounds = ['#ffffff', '#000000']) => {
    const results = {
      totalColors: palette.length,
      accessibleCombinations: 0,
      failedCombinations: [],
      colorBlindSafe: true,
      recommendations: [],
    };

    palette.forEach((color, index) => {
      backgrounds.forEach((bg) => {
        const contrast = accessibilityUtils.checkContrast(color, bg);
        
        if (contrast.passes) {
          results.accessibleCombinations++;
        } else {
          results.failedCombinations.push({
            color,
            background: bg,
            contrast: contrast.ratio,
            required: contrast.required,
          });
        }
      });

      // Check color-blind safety
      palette.forEach((otherColor, otherIndex) => {
        if (index !== otherIndex) {
          const distinguishable = accessibilityUtils.areColorsDistinguishable(color, otherColor);
          if (!distinguishable) {
            results.colorBlindSafe = false;
            results.recommendations.push(
              `Colors ${color} and ${otherColor} may not be distinguishable for color-blind users`
            );
          }
        }
      });
    });

    results.accessibilityScore = (results.accessibleCombinations / (palette.length * backgrounds.length)) * 100;
    
    return results;
  },
};

// Motion accessibility utilities
export const motionAccessibility = {
  // Get animation duration based on user preference
  getAnimationDuration: (defaultDuration = 300) => {
    return accessibilityUtils.prefersReducedMotion() ? 0 : defaultDuration;
  },

  // Get transition classes with reduced motion support
  getTransitionClasses: (defaultTransition = 'transition-all duration-300') => {
    return accessibilityUtils.prefersReducedMotion() ? 
      'transition-none' : 
      defaultTransition;
  },

  // Generate CSS for reduced motion
  generateReducedMotionCSS: () => {
    return `
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
  },

  // Check if animations should be enabled
  shouldEnableAnimations: () => {
    return !accessibilityUtils.prefersReducedMotion();
  },
};

// Focus management utilities
export const focusManagement = {
  // Get focus ring classes with high contrast support
  getFocusRingClasses: (colorScheme = 'violet') => {
    const highContrast = accessibilityUtils.prefersHighContrast();
    
    if (highContrast) {
      return 'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black';
    }
    
    return `focus:outline-none focus:ring-2 focus:ring-${colorScheme}-500 focus:ring-offset-2 focus:ring-offset-surface-primary`;
  },

  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
};

// Export all utilities
export default {
  ...accessibilityUtils,
  motion: motionAccessibility,
  focus: focusManagement,
  WCAG_LEVELS,
  COLOR_BLIND_MATRICES,
  ALTERNATIVE_INDICATORS,
  HIGH_CONTRAST_COLORS,
  COLOR_BLIND_FRIENDLY_PALETTE,
};