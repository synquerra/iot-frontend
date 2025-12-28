/**
 * Enhanced Responsive Grid System for Dashboard Layout
 * Provides flexible grid layouts with breakpoint-specific configurations
 * Requirements: 1.1, 2.3
 */

import React from 'react';
import { cn } from '../utils/cn';

// Grid container component
export const ResponsiveGrid = React.forwardRef(({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = 'md',
  autoFit = false,
  minItemWidth = '280px',
  maxItemWidth = 'none',
  alignItems = 'stretch',
  justifyItems = 'stretch',
  className,
  ...props
}, ref) => {
  // Gap size mapping
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  };

  // Alignment classes
  const alignmentClasses = {
    alignItems: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    },
    justifyItems: {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch'
    }
  };

  // Generate responsive column classes
  const getColumnClasses = () => {
    if (autoFit) {
      return `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},${maxItemWidth === 'none' ? '1fr' : maxItemWidth}))]`;
    }

    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const responsiveClasses = [];

    breakpoints.forEach(breakpoint => {
      const columnCount = columns[breakpoint];
      if (columnCount) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        responsiveClasses.push(`${prefix}grid-cols-${columnCount}`);
      }
    });

    return responsiveClasses.join(' ');
  };

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        getColumnClasses(),
        gapClasses[gap],
        alignmentClasses.alignItems[alignItems],
        alignmentClasses.justifyItems[justifyItems],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

// Grid item component with responsive span control
export const GridItem = React.forwardRef(({
  children,
  span = { xs: 1 },
  order = {},
  className,
  ...props
}, ref) => {
  // Generate responsive span classes
  const getSpanClasses = () => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const spanClasses = [];

    breakpoints.forEach(breakpoint => {
      const spanCount = span[breakpoint];
      if (spanCount) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        spanClasses.push(`${prefix}col-span-${spanCount}`);
      }
    });

    return spanClasses.join(' ');
  };

  // Generate responsive order classes
  const getOrderClasses = () => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const orderClasses = [];

    breakpoints.forEach(breakpoint => {
      const orderValue = order[breakpoint];
      if (orderValue !== undefined) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        orderClasses.push(`${prefix}order-${orderValue}`);
      }
    });

    return orderClasses.join(' ');
  };

  return (
    <div
      ref={ref}
      className={cn(
        getSpanClasses(),
        getOrderClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

GridItem.displayName = 'GridItem';

// Specialized dashboard grid layouts
export const DashboardKpiGrid = ({ children, className, ...props }) => (
  <ResponsiveGrid
    columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
    gap="md"
    className={cn('mb-8', className)}
    {...props}
  >
    {children}
  </ResponsiveGrid>
);

export const DashboardChartsGrid = ({ children, className, ...props }) => (
  <ResponsiveGrid
    columns={{ xs: 1, lg: 2 }}
    gap="lg"
    className={cn('mb-8', className)}
    {...props}
  >
    {children}
  </ResponsiveGrid>
);

export const DashboardContentGrid = ({ children, className, ...props }) => (
  <ResponsiveGrid
    columns={{ xs: 1, md: 2, xl: 3 }}
    gap="md"
    autoFit={true}
    minItemWidth="320px"
    className={className}
    {...props}
  >
    {children}
  </ResponsiveGrid>
);

// Masonry-style grid for varied content heights
export const MasonryGrid = React.forwardRef(({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className,
  ...props
}, ref) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  };

  // Generate column classes for masonry layout
  const getColumnClasses = () => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    const responsiveClasses = [];

    breakpoints.forEach(breakpoint => {
      const columnCount = columns[breakpoint];
      if (columnCount) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        responsiveClasses.push(`${prefix}columns-${columnCount}`);
      }
    });

    return responsiveClasses.join(' ');
  };

  return (
    <div
      ref={ref}
      className={cn(
        getColumnClasses(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="break-inside-avoid mb-4">
          {child}
        </div>
      ))}
    </div>
  );
});

MasonryGrid.displayName = 'MasonryGrid';

// Flex-based responsive layout for complex arrangements
export const FlexGrid = React.forwardRef(({
  children,
  direction = { xs: 'column', md: 'row' },
  wrap = 'wrap',
  gap = 'md',
  alignItems = 'stretch',
  justifyContent = 'start',
  className,
  ...props
}, ref) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  };

  // Generate responsive direction classes
  const getDirectionClasses = () => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    const directionClasses = [];

    breakpoints.forEach(breakpoint => {
      const dir = direction[breakpoint];
      if (dir) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        directionClasses.push(`${prefix}flex-${dir}`);
      }
    });

    return directionClasses.join(' ');
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        getDirectionClasses(),
        wrapClasses[wrap],
        gapClasses[gap],
        alignClasses[alignItems],
        justifyClasses[justifyContent],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

FlexGrid.displayName = 'FlexGrid';

export default {
  ResponsiveGrid,
  GridItem,
  DashboardKpiGrid,
  DashboardChartsGrid,
  DashboardContentGrid,
  MasonryGrid,
  FlexGrid
};