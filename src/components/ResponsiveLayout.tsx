/**
 * Responsive Layout Component
 * Requirements: 8.3, 8.4, 8.5
 */

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import type { ResponsiveLayoutProps } from '../types/dashboard';

/**
 * Responsive layout component that renders different layouts based on screen size
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  mobileLayout: MobileLayout,
  tabletLayout: TabletLayout,
  desktopLayout: DesktopLayout,
  breakpoints,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive(breakpoints);

  // If specific layouts are provided, use them
  if (MobileLayout && isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  if (TabletLayout && isTablet) {
    return <TabletLayout>{children}</TabletLayout>;
  }

  if (DesktopLayout && (isDesktop || (!TabletLayout && !MobileLayout))) {
    return <DesktopLayout>{children}</DesktopLayout>;
  }

  // Default: render children as-is
  return <>{children}</>;
};

/**
 * Responsive container component with automatic spacing and layout
 */
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}> = ({ 
  children, 
  className = '', 
  maxWidth = 'full',
  padding = true 
}) => {
  const { isMobile, isTablet } = useResponsive();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = padding
    ? isMobile
      ? 'px-4 py-4'
      : isTablet
      ? 'px-6 py-6'
      : 'px-8 py-8'
    : '';

  return (
    <div 
      className={`
        mx-auto 
        ${maxWidthClasses[maxWidth]} 
        ${paddingClasses} 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

/**
 * Responsive grid component with automatic column adjustment
 */
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  wideColumns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  wideColumns = 4,
  gap = 'md',
  className = '',
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const getColumns = () => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    if (isDesktop) return desktopColumns;
    return wideColumns;
  };

  const columns = getColumns();

  return (
    <div 
      className={`
        grid 
        grid-cols-${columns} 
        ${gapClasses[gap]} 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

/**
 * Responsive section component with automatic spacing
 */
export const ResponsiveSection: React.FC<{
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ 
  children, 
  spacing = 'md',
  className = '' 
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getSpacingClass = () => {
    const baseSpacing = {
      sm: isMobile ? 'space-y-2' : isTablet ? 'space-y-3' : 'space-y-4',
      md: isMobile ? 'space-y-4' : isTablet ? 'space-y-6' : 'space-y-8',
      lg: isMobile ? 'space-y-6' : isTablet ? 'space-y-8' : 'space-y-10',
      xl: isMobile ? 'space-y-8' : isTablet ? 'space-y-10' : 'space-y-12',
    };
    return baseSpacing[spacing];
  };

  return (
    <div className={`${getSpacingClass()} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;