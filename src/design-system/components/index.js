/**
 * Design System Components Entry Point
 * This file will export enhanced components as they are created
 */

// Enhanced components
export { Button } from './Button.jsx';
export { Card, CardHeader, CardTitle, CardDescription, CardActions, CardContent, CardFooter } from './Card.jsx';
export { Input, Textarea, Select, InputWrapper } from './Input.jsx';
export { 
  Table, 
  TableContainer, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableRow, 
  TableCell, 
  TableHeaderCell 
} from './Table.jsx';
export {
  Loading,
  LoadingOverlay,
  Spinner,
  Dots,
  Pulse,
  Skeleton,
  ProgressBar,
} from './Loading.jsx';

// Gradient and glassmorphism components
export {
  GradientCard,
  GradientKpiCard,
  GradientChartCard,
  GradientHeroCard,
} from './GradientCard.jsx';

// Layout components for colorful UI redesign
export {
  SectionDivider,
  GradientHeader,
  ContentSection,
  PageContainer,
  HierarchySection
} from './LayoutComponents.jsx';

// Enhanced KPI components
export { KpiCard, PerformanceKpiCard, GrowthKpiCard, StatusKpiCard } from './KpiCard.jsx';
export { 
  EnhancedKpiCard, 
  EnhancedPerformanceKpiCard, 
  EnhancedGrowthKpiCard, 
  EnhancedStatusKpiCard 
} from './EnhancedKpiCard.jsx';

// Enhanced responsive grid system
export {
  ResponsiveGrid,
  GridItem,
  DashboardKpiGrid,
  DashboardChartsGrid,
  DashboardContentGrid,
  MasonryGrid,
  FlexGrid
} from './ResponsiveGrid.jsx';

// Performance monitoring components
export { PerformanceMonitor, PerformanceWarning, withPerformanceMonitoring } from './PerformanceMonitor.jsx';

export const DESIGN_SYSTEM_VERSION = '1.0.0';

// Component registry for tracking implemented components
export const componentRegistry = {
  button: { implemented: true, version: '1.0.0' },
  card: { implemented: true, version: '1.0.0' },
  input: { implemented: true, version: '1.0.0' },
  table: { implemented: true, version: '1.0.0' },
  loading: { implemented: true, version: '1.0.0' },
  layoutComponents: { implemented: true, version: '1.0.0' },
  kpiCard: { implemented: true, version: '1.0.0' },
  enhancedKpiCard: { implemented: true, version: '1.0.0' },
  responsiveGrid: { implemented: true, version: '1.0.0' },
  performanceMonitor: { implemented: true, version: '1.0.0' },
  gradientCard: { implemented: true, version: '1.0.0' },
};