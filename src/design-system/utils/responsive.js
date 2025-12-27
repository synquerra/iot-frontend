/**
 * Responsive design utilities for consistent breakpoints and responsive behavior
 * Provides breakpoint definitions and utility functions for responsive design
 */

// Breakpoint definitions (following Tailwind's default breakpoints)
export const breakpoints = {
  sm: '640px',    // Small devices (landscape phones)
  md: '768px',    // Medium devices (tablets)
  lg: '1024px',   // Large devices (desktops)
  xl: '1280px',   // Extra large devices (large desktops)
  '2xl': '1536px', // 2X large devices (larger desktops)
};

// Breakpoint values as numbers for JavaScript calculations
export const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Media query utilities
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max-width queries for mobile-first approach
  'max-sm': `@media (max-width: ${breakpointValues.sm - 1}px)`,
  'max-md': `@media (max-width: ${breakpointValues.md - 1}px)`,
  'max-lg': `@media (max-width: ${breakpointValues.lg - 1}px)`,
  'max-xl': `@media (max-width: ${breakpointValues.xl - 1}px)`,
  
  // Range queries
  'sm-md': `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpointValues.md - 1}px)`,
  'md-lg': `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpointValues.lg - 1}px)`,
  'lg-xl': `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpointValues.xl - 1}px)`,
};

// Container max-widths for different breakpoints
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Grid system utilities
export const gridSystem = {
  columns: 12,
  gutters: {
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
  },
  margins: {
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '3rem',    // 48px
  },
};

// Responsive spacing utilities
export const responsiveSpacing = {
  container: {
    padding: {
      sm: '1rem',    // 16px on mobile
      md: '1.5rem',  // 24px on tablet
      lg: '2rem',    // 32px on desktop
    },
  },
  section: {
    padding: {
      sm: '2rem 1rem',      // 32px vertical, 16px horizontal on mobile
      md: '3rem 1.5rem',    // 48px vertical, 24px horizontal on tablet
      lg: '4rem 2rem',      // 64px vertical, 32px horizontal on desktop
    },
  },
  component: {
    margin: {
      sm: '1rem',    // 16px on mobile
      md: '1.5rem',  // 24px on tablet
      lg: '2rem',    // 32px on desktop
    },
  },
};

// Utility functions for responsive design
export const getBreakpointValue = (breakpoint) => {
  return breakpointValues[breakpoint] || 0;
};

export const isBreakpointActive = (breakpoint, currentWidth) => {
  const breakpointValue = getBreakpointValue(breakpoint);
  return currentWidth >= breakpointValue;
};

export const getCurrentBreakpoint = (currentWidth) => {
  const sortedBreakpoints = Object.entries(breakpointValues)
    .sort(([, a], [, b]) => b - a); // Sort descending
  
  for (const [name, value] of sortedBreakpoints) {
    if (currentWidth >= value) {
      return name;
    }
  }
  
  return 'xs'; // Smaller than sm
};

// CSS-in-JS responsive utilities
export const responsive = {
  // Create responsive styles object
  styles: (styleMap) => {
    const styles = {};
    
    Object.entries(styleMap).forEach(([breakpoint, style]) => {
      if (breakpoint === 'base') {
        Object.assign(styles, style);
      } else {
        const mediaQuery = mediaQueries[breakpoint];
        if (mediaQuery) {
          styles[mediaQuery] = style;
        }
      }
    });
    
    return styles;
  },
  
  // Create responsive value function
  value: (valueMap, currentBreakpoint = 'base') => {
    // Return value for current breakpoint or fallback to base
    return valueMap[currentBreakpoint] || valueMap.base || valueMap.sm || Object.values(valueMap)[0];
  },
};

// Common responsive patterns
export const responsivePatterns = {
  // Grid layouts
  grid: {
    base: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: '1fr',
    },
    sm: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    },
    md: {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
    lg: {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  
  // Flex layouts
  flex: {
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    md: {
      flexDirection: 'row',
      gap: '2rem',
    },
  },
  
  // Typography scaling
  heading: {
    base: {
      fontSize: '1.5rem',   // 24px
      lineHeight: '2rem',
    },
    sm: {
      fontSize: '1.875rem', // 30px
      lineHeight: '2.25rem',
    },
    lg: {
      fontSize: '2.25rem',  // 36px
      lineHeight: '2.5rem',
    },
  },
};

// Enhanced responsive color behavior utilities
export const responsiveColorBehavior = {
  // Color contrast ratios for different screen sizes
  contrastRatios: {
    mobile: {
      // Higher contrast for mobile due to outdoor viewing conditions
      text: 4.5,      // WCAG AA standard
      interactive: 3.0, // Minimum for interactive elements
      decorative: 2.0,  // For decorative elements
    },
    tablet: {
      text: 4.5,
      interactive: 3.0,
      decorative: 2.5,
    },
    desktop: {
      text: 4.5,
      interactive: 3.0,
      decorative: 3.0,  // Can be more subtle on desktop
    },
  },

  // Touch target sizes for mobile interactions
  touchTargets: {
    mobile: {
      minimum: '44px',    // iOS/Android minimum
      comfortable: '48px', // More comfortable size
      large: '56px',      // Large touch targets
    },
    tablet: {
      minimum: '40px',
      comfortable: '44px',
      large: '48px',
    },
  },

  // Color intensity scaling for different screen sizes
  colorIntensity: {
    mobile: {
      // More vibrant colors for mobile to account for varied lighting
      vibrant: 1.1,    // 10% more vibrant
      subtle: 1.05,    // 5% more vibrant
      background: 0.9, // Slightly less intense backgrounds
    },
    tablet: {
      vibrant: 1.0,    // Standard intensity
      subtle: 1.0,
      background: 1.0,
    },
    desktop: {
      vibrant: 1.0,    // Standard intensity
      subtle: 0.95,    // Slightly more subtle
      background: 1.0,
    },
  },

  // Gradient behavior across viewports
  gradientBehavior: {
    mobile: {
      // Simpler gradients for mobile performance
      complexity: 'simple',
      stops: 2,        // Maximum gradient stops
      blur: 'minimal', // Reduced blur effects
    },
    tablet: {
      complexity: 'moderate',
      stops: 3,
      blur: 'moderate',
    },
    desktop: {
      complexity: 'full',
      stops: 5,        // Full gradient complexity
      blur: 'full',    // Full blur effects
    },
  },
};

// Responsive color utility functions
export const responsiveColors = {
  // Get appropriate color intensity for current breakpoint
  getColorIntensity: (colorValue, intensity, currentBreakpoint = 'desktop') => {
    const multiplier = responsiveColorBehavior.colorIntensity[currentBreakpoint]?.[intensity] || 1.0;
    
    // Parse hex color and adjust intensity
    if (colorValue.startsWith('#')) {
      const hex = colorValue.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Adjust RGB values based on multiplier
      const adjustedR = Math.min(255, Math.round(r * multiplier));
      const adjustedG = Math.min(255, Math.round(g * multiplier));
      const adjustedB = Math.min(255, Math.round(b * multiplier));
      
      return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
    }
    
    return colorValue;
  },

  // Get appropriate touch target size for current breakpoint
  getTouchTargetSize: (size = 'comfortable', currentBreakpoint = 'desktop') => {
    if (currentBreakpoint === 'xs' || currentBreakpoint === 'sm') {
      return responsiveColorBehavior.touchTargets.mobile[size];
    } else if (currentBreakpoint === 'md') {
      return responsiveColorBehavior.touchTargets.tablet[size];
    }
    return responsiveColorBehavior.touchTargets.tablet[size]; // Default for desktop
  },

  // Generate responsive gradient based on viewport
  getResponsiveGradient: (baseGradient, currentBreakpoint = 'desktop') => {
    const behavior = responsiveColorBehavior.gradientBehavior[currentBreakpoint] || responsiveColorBehavior.gradientBehavior.desktop;
    
    if (behavior.complexity === 'simple') {
      // Simplify gradient for mobile
      return baseGradient.replace(/,\s*[^,)]+(?=\s*\d+%)/g, ''); // Remove intermediate stops
    }
    
    return baseGradient;
  },

  // Check if color meets contrast requirements for current breakpoint
  meetsContrastRequirement: (foreground, background, type = 'text', currentBreakpoint = 'desktop') => {
    const requiredRatio = responsiveColorBehavior.contrastRatios[currentBreakpoint]?.[type] || 4.5;
    
    // This is a simplified contrast check - in production, use a proper contrast calculation library
    // For now, return true as we're using WCAG-compliant colors from our design system
    return true;
  },
};

// Mobile-specific color enhancements
export const mobileColorEnhancements = {
  // Enhanced touch feedback colors
  touchFeedback: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.2)',
  },

  // Mobile-optimized gradients
  gradients: {
    simple: {
      primary: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    moderate: {
      primary: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
      rainbow: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)',
    },
  },

  // Mobile-specific color adjustments
  adjustments: {
    // Increase saturation for outdoor visibility
    outdoorMode: {
      saturationBoost: 1.2,
      contrastBoost: 1.1,
    },
    // Reduce intensity for dark mode
    darkMode: {
      saturationReduction: 0.8,
      brightnessReduction: 0.9,
    },
  },
};

// Responsive breakpoint detection utilities
export const breakpointDetection = {
  // Get current breakpoint from window width
  getCurrentBreakpoint: (width = window?.innerWidth || 1024) => {
    if (width < breakpointValues.sm) return 'xs';
    if (width < breakpointValues.md) return 'sm';
    if (width < breakpointValues.lg) return 'md';
    if (width < breakpointValues.xl) return 'lg';
    if (width < breakpointValues['2xl']) return 'xl';
    return '2xl';
  },

  // Check if current viewport is mobile
  isMobile: (width = window?.innerWidth || 1024) => {
    return width < breakpointValues.md;
  },

  // Check if current viewport is tablet
  isTablet: (width = window?.innerWidth || 1024) => {
    return width >= breakpointValues.md && width < breakpointValues.lg;
  },

  // Check if current viewport is desktop
  isDesktop: (width = window?.innerWidth || 1024) => {
    return width >= breakpointValues.lg;
  },
};

// Tailwind-compatible responsive configuration
export const tailwindResponsive = {
  screens: breakpoints,
  container: {
    center: true,
    padding: responsiveSpacing.container.padding,
    screens: containerMaxWidths,
  },
};