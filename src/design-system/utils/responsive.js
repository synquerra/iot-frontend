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

// Tailwind-compatible responsive configuration
export const tailwindResponsive = {
  screens: breakpoints,
  container: {
    center: true,
    padding: responsiveSpacing.container.padding,
    screens: containerMaxWidths,
  },
};