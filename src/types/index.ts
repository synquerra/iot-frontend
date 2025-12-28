/**
 * Types index file - exports all TypeScript interfaces
 * Requirements: 8.5
 */

// Dashboard types
export type {
  AnalyticsData,
  Device,
  LocationPoint,
  ChartDataPoint,
  PieChartData,
  DashboardState,
  DashboardHeaderProps,
  KpiGridProps,
  MapSectionProps,
  ChartsGridProps,
  EnhancedTableProps,
  TableColumn,
  UseDashboardDataReturn,
  ErrorInfo,
  ErrorFallbackProps,
  DashboardErrorBoundaryProps,
  BreakpointConfig,
  ResponsiveHookReturn,
  ResponsiveLayoutProps,
  PerformanceMetrics,
  PerformanceMonitorProps,
} from './dashboard';

// Re-export for convenience
export * from './dashboard';