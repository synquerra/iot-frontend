/**
 * Dashboard components index
 * Requirements: 8.3, 8.4, 8.5
 */

// Enhanced dashboard header
export { DashboardHeader } from './DashboardHeader';

// Error boundary components
export { 
  DashboardErrorBoundary, 
  withErrorBoundary 
} from '../DashboardErrorBoundary';

// Responsive layout components
export { 
  ResponsiveLayout,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveSection
} from '../ResponsiveLayout';

// Enhanced dashboard wrapper
export { 
  EnhancedDashboard,
  withPerformanceMonitoring,
  DashboardContext,
  useDashboardContext,
  DashboardProvider
} from '../EnhancedDashboard';

// Hooks
export {
  useResponsive,
  useResponsiveColumns,
  useResponsiveSpacing,
  useResponsiveTypography,
  getResponsiveClasses,
  createResponsiveGrid,
  mediaQueries,
  useMediaQuery
} from '../../hooks/useResponsive';

// Performance utilities
export {
  usePerformanceMonitor,
  useMemoryMonitor,
  RenderTracker,
  createPerformanceProfiler,
  debounce,
  throttle,
  memoize
} from '../../utils/performanceMonitor';

// Types
export type * from '../../types/dashboard';