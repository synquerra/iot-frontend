# Enhanced Dashboard Components

This directory contains the enhanced component structure and interfaces for the dashboard redesign project.

## Components

### Error Boundary
- **DashboardErrorBoundary**: Comprehensive error boundary with fallback UI
- **withErrorBoundary**: HOC for wrapping components with error boundaries

### Responsive Layout
- **ResponsiveLayout**: Adaptive layout component for different screen sizes
- **ResponsiveContainer**: Container with automatic spacing and max-width
- **ResponsiveGrid**: Grid component with responsive column adjustment
- **ResponsiveSection**: Section component with responsive spacing

### Enhanced Dashboard
- **EnhancedDashboard**: Main dashboard wrapper with error boundary and performance monitoring
- **DashboardProvider**: Context provider for sharing dashboard state
- **withPerformanceMonitoring**: HOC for performance monitoring

## Hooks

### Responsive Hooks
- **useResponsive**: Main responsive hook with breakpoint detection
- **useResponsiveColumns**: Hook for responsive grid columns
- **useResponsiveSpacing**: Hook for responsive spacing classes
- **useResponsiveTypography**: Hook for responsive typography classes
- **useMediaQuery**: Hook for media query matching

### Performance Hooks
- **usePerformanceMonitor**: Hook for component performance monitoring
- **useMemoryMonitor**: Hook for memory usage monitoring

## Utilities

### Performance Utilities
- **RenderTracker**: Class for tracking component render metrics
- **createPerformanceProfiler**: Factory for performance profilers
- **debounce**: Debounce utility for performance optimization
- **throttle**: Throttle utility for performance optimization
- **memoize**: Memoization utility for expensive computations

### Responsive Utilities
- **getResponsiveClasses**: Utility for creating responsive class names
- **createResponsiveGrid**: Utility for responsive grid classes
- **mediaQueries**: Pre-defined media query strings

## TypeScript Interfaces

All components are fully typed with comprehensive TypeScript interfaces:

- **DashboardState**: Main dashboard state interface
- **Component Props**: Interfaces for all component props
- **Hook Returns**: Interfaces for hook return values
- **Performance Metrics**: Interfaces for performance monitoring
- **Responsive Config**: Interfaces for responsive configuration

## Usage

```tsx
import { 
  EnhancedDashboard,
  DashboardErrorBoundary,
  useResponsive,
  usePerformanceMonitor 
} from './components/dashboard';

// Use the enhanced dashboard wrapper
<EnhancedDashboard 
  onError={(error, errorInfo) => console.error(error)}
  performanceThreshold={100}
/>

// Use responsive hooks
const { isMobile, isTablet, isDesktop } = useResponsive();

// Use performance monitoring
const { metrics, recordRender } = usePerformanceMonitor('MyComponent');
```

## Requirements Satisfied

- **8.3**: Component architecture with proper separation of concerns
- **8.4**: Error boundaries and error handling
- **8.5**: TypeScript-compatible patterns for type safety