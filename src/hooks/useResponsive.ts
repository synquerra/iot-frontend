/**
 * Responsive layout utilities and hooks
 * Requirements: 8.3, 8.4, 8.5
 */

import { useState, useEffect, useMemo } from 'react';
import type { BreakpointConfig, ResponsiveHookReturn } from '../types/dashboard';

// Default breakpoint configuration
const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

/**
 * Hook for responsive behavior based on viewport size
 */
export function useResponsive(
  customBreakpoints?: Partial<BreakpointConfig>
): ResponsiveHookReturn {
  const breakpoints = useMemo(
    () => ({ ...DEFAULT_BREAKPOINTS, ...customBreakpoints }),
    [customBreakpoints]
  );

  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Debounce resize events for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedHandleResize);
    
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const responsive = useMemo(() => {
    const { width } = dimensions;
    
    const isMobile = width < breakpoints.mobile;
    const isTablet = width >= breakpoints.mobile && width < breakpoints.tablet;
    const isDesktop = width >= breakpoints.tablet && width < breakpoints.desktop;
    const isWide = width >= breakpoints.desktop;

    let breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
    if (isMobile) breakpoint = 'mobile';
    else if (isTablet) breakpoint = 'tablet';
    else if (isDesktop) breakpoint = 'desktop';
    else breakpoint = 'wide';

    return {
      isMobile,
      isTablet,
      isDesktop,
      isWide,
      breakpoint,
      width: dimensions.width,
      height: dimensions.height,
    };
  }, [dimensions, breakpoints]);

  return responsive;
}

/**
 * Hook for responsive grid columns
 */
export function useResponsiveColumns(
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3,
  wideColumns: number = 4
): number {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return useMemo(() => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    if (isDesktop) return desktopColumns;
    return wideColumns;
  }, [isMobile, isTablet, isDesktop, mobileColumns, tabletColumns, desktopColumns, wideColumns]);
}

/**
 * Hook for responsive spacing
 */
export function useResponsiveSpacing() {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    const spacingMap = {
      mobile: {
        section: 'space-y-4',
        grid: 'gap-4',
        padding: 'p-4',
        margin: 'm-4',
      },
      tablet: {
        section: 'space-y-6',
        grid: 'gap-6',
        padding: 'p-6',
        margin: 'm-6',
      },
      desktop: {
        section: 'space-y-8',
        grid: 'gap-8',
        padding: 'p-8',
        margin: 'm-8',
      },
      wide: {
        section: 'space-y-10',
        grid: 'gap-10',
        padding: 'p-10',
        margin: 'm-10',
      },
    };

    return spacingMap[breakpoint];
  }, [breakpoint]);
}

/**
 * Hook for responsive typography
 */
export function useResponsiveTypography() {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    const typographyMap = {
      mobile: {
        h1: 'text-2xl font-bold',
        h2: 'text-xl font-semibold',
        h3: 'text-lg font-medium',
        body: 'text-sm',
        caption: 'text-xs',
      },
      tablet: {
        h1: 'text-3xl font-bold',
        h2: 'text-2xl font-semibold',
        h3: 'text-xl font-medium',
        body: 'text-base',
        caption: 'text-sm',
      },
      desktop: {
        h1: 'text-4xl font-bold',
        h2: 'text-3xl font-semibold',
        h3: 'text-2xl font-medium',
        body: 'text-base',
        caption: 'text-sm',
      },
      wide: {
        h1: 'text-5xl font-bold',
        h2: 'text-4xl font-semibold',
        h3: 'text-3xl font-medium',
        body: 'text-lg',
        caption: 'text-base',
      },
    };

    return typographyMap[breakpoint];
  }, [breakpoint]);
}

/**
 * Utility function to get responsive class names
 */
export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string,
  wide?: string
): string {
  const classes = [mobile];
  
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  if (wide) classes.push(`xl:${wide}`);
  
  return classes.join(' ');
}

/**
 * Utility function to create responsive grid classes
 */
export function createResponsiveGrid(
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3,
  wideColumns: number = 4
): string {
  return getResponsiveClasses(
    `grid-cols-${mobileColumns}`,
    `grid-cols-${tabletColumns}`,
    `grid-cols-${desktopColumns}`,
    `grid-cols-${wideColumns}`
  );
}

/**
 * Media query utilities for CSS-in-JS
 */
export const mediaQueries = {
  mobile: `(max-width: ${DEFAULT_BREAKPOINTS.mobile - 1}px)`,
  tablet: `(min-width: ${DEFAULT_BREAKPOINTS.mobile}px) and (max-width: ${DEFAULT_BREAKPOINTS.tablet - 1}px)`,
  desktop: `(min-width: ${DEFAULT_BREAKPOINTS.tablet}px) and (max-width: ${DEFAULT_BREAKPOINTS.desktop - 1}px)`,
  wide: `(min-width: ${DEFAULT_BREAKPOINTS.desktop}px)`,
  
  // Utility queries
  mobileUp: `(min-width: ${DEFAULT_BREAKPOINTS.mobile}px)`,
  tabletUp: `(min-width: ${DEFAULT_BREAKPOINTS.tablet}px)`,
  desktopUp: `(min-width: ${DEFAULT_BREAKPOINTS.desktop}px)`,
  
  mobileDown: `(max-width: ${DEFAULT_BREAKPOINTS.mobile - 1}px)`,
  tabletDown: `(max-width: ${DEFAULT_BREAKPOINTS.tablet - 1}px)`,
  desktopDown: `(max-width: ${DEFAULT_BREAKPOINTS.desktop - 1}px)`,
};

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}