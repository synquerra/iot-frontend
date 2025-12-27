/**
 * React Hook for Responsive Color Behavior
 * Provides responsive color utilities and viewport-aware color adjustments
 */

import { useState, useEffect, useMemo } from 'react';
import { responsiveColors } from '../utils/responsiveColors.js';
import { breakpointValues } from '../utils/responsive.js';

/**
 * Custom hook for responsive color behavior
 * Automatically adjusts colors based on current viewport size
 */
export function useResponsiveColors() {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default to desktop size for SSR
  });

  // Update window width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized responsive color utilities
  const colorUtils = useMemo(() => {
    const category = responsiveColors.getBreakpointCategory(windowWidth);
    const config = responsiveColors.getConfig(windowWidth);

    return {
      // Current viewport information
      width: windowWidth,
      category,
      config,
      isMobile: category === 'mobile',
      isTablet: category === 'tablet',
      isDesktop: category === 'desktop',

      // Color adjustment functions
      adjustColorIntensity: (color, intensity = 'vibrant') => 
        responsiveColors.adjustColorIntensity(color, intensity, windowWidth),

      getTouchTargetSize: (size = 'medium') => 
        responsiveColors.getTouchTargetSize(size, windowWidth),

      simplifyGradient: (gradient) => 
        responsiveColors.simplifyGradient(gradient, windowWidth),

      shouldEnableGlow: () => 
        responsiveColors.shouldEnableGlow(windowWidth),

      ensureContrast: (foreground, background, level = 'AA') => 
        responsiveColors.ensureContrast(foreground, background, level, windowWidth),

      getResponsiveColorScale: (colorName, scale = 500) => 
        responsiveColors.getResponsiveColorScale(colorName, scale, windowWidth),

      getTouchFeedback: (intensity = 'medium') => 
        responsiveColors.getTouchFeedback(intensity),

      // CSS custom properties for current viewport
      cssProperties: responsiveColors.generateResponsiveColorProperties(windowWidth),

      // Responsive class generators
      getResponsiveTouchClasses: (size = 'medium') => {
        if (category === 'mobile') {
          return size === 'small' ? 'h-11 w-11 p-2' : 
                 size === 'large' ? 'h-14 w-14 p-3' : 'h-12 w-12 p-2.5';
        } else if (category === 'tablet') {
          return size === 'small' ? 'h-10 w-10 p-2' : 
                 size === 'large' ? 'h-12 w-12 p-3' : 'h-11 w-11 p-2.5';
        } else {
          return size === 'small' ? 'h-8 w-8 p-1.5' : 
                 size === 'large' ? 'h-10 w-10 p-2.5' : 'h-9 w-9 p-2';
        }
      },

      getResponsiveGradientClasses: (gradientName = 'primary') => {
        if (category === 'mobile') {
          // Simple gradients for mobile
          const simpleGradients = {
            primary: 'bg-gradient-to-r from-violet-600 to-purple-600',
            success: 'bg-gradient-to-r from-green-600 to-teal-600',
            warning: 'bg-gradient-to-r from-amber-600 to-orange-600',
            error: 'bg-gradient-to-r from-red-600 to-pink-600',
          };
          return simpleGradients[gradientName] || simpleGradients.primary;
        } else {
          // Complex gradients for tablet/desktop
          const complexGradients = {
            primary: 'bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600',
            success: 'bg-gradient-to-br from-green-600 via-green-500 to-teal-600',
            warning: 'bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600',
            error: 'bg-gradient-to-br from-red-600 via-red-500 to-pink-600',
          };
          return complexGradients[gradientName] || complexGradients.primary;
        }
      },

      getResponsiveShadowClasses: (intensity = 'medium') => {
        if (category === 'mobile') {
          return intensity === 'light' ? 'shadow-sm' :
                 intensity === 'strong' ? 'shadow-md' : 'shadow-sm';
        } else if (category === 'tablet') {
          return intensity === 'light' ? 'shadow-md' :
                 intensity === 'strong' ? 'shadow-lg' : 'shadow-md';
        } else {
          return intensity === 'light' ? 'shadow-lg' :
                 intensity === 'strong' ? 'shadow-xl' : 'shadow-lg';
        }
      },

      getResponsiveGlowClasses: (colorScheme = 'violet') => {
        if (category === 'mobile') {
          return ''; // No glow on mobile
        } else if (category === 'tablet') {
          return `hover:shadow-${colorScheme}-500/30`;
        } else {
          return `hover:shadow-${colorScheme}-500/40 hover:drop-shadow-glow-${colorScheme}`;
        }
      },
    };
  }, [windowWidth]);

  return colorUtils;
}

/**
 * Hook for responsive color CSS variables
 * Provides CSS custom properties that update based on viewport
 */
export function useResponsiveColorVariables() {
  const { cssProperties } = useResponsiveColors();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply CSS custom properties to root element
    Object.entries(cssProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Cleanup function to remove properties
    return () => {
      Object.keys(cssProperties).forEach((property) => {
        root.style.removeProperty(property);
      });
    };
  }, [cssProperties]);

  return cssProperties;
}

/**
 * Hook for responsive breakpoint detection
 * Provides current breakpoint information
 */
export function useBreakpoint() {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoint = useMemo(() => {
    if (windowWidth < breakpointValues.sm) return 'xs';
    if (windowWidth < breakpointValues.md) return 'sm';
    if (windowWidth < breakpointValues.lg) return 'md';
    if (windowWidth < breakpointValues.xl) return 'lg';
    if (windowWidth < breakpointValues['2xl']) return 'xl';
    return '2xl';
  }, [windowWidth]);

  const category = useMemo(() => {
    if (windowWidth < breakpointValues.md) return 'mobile';
    if (windowWidth < breakpointValues.lg) return 'tablet';
    return 'desktop';
  }, [windowWidth]);

  return {
    width: windowWidth,
    breakpoint,
    category,
    isMobile: category === 'mobile',
    isTablet: category === 'tablet',
    isDesktop: category === 'desktop',
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
  };
}

/**
 * Hook for responsive touch feedback
 * Provides touch feedback utilities for mobile interactions
 */
export function useTouchFeedback() {
  const { isMobile, getTouchFeedback } = useResponsiveColors();

  const addTouchFeedback = (element, intensity = 'medium') => {
    if (!isMobile || !element) return;

    const feedbackColor = getTouchFeedback(intensity);
    
    const handleTouchStart = () => {
      element.style.backgroundColor = feedbackColor;
    };

    const handleTouchEnd = () => {
      element.style.backgroundColor = '';
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  };

  return {
    isMobile,
    addTouchFeedback,
    getTouchFeedback,
  };
}

export default useResponsiveColors;