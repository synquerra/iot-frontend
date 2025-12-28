/**
 * Enhanced Dashboard Wrapper Component
 * Requirements: 8.3, 8.4, 8.5
 */

import React, { Suspense } from 'react';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { ResponsiveContainer, ResponsiveSection } from './ResponsiveLayout';
import { Loading } from '../design-system/components/Loading';
import { usePerformanceMonitor } from '../utils/performanceMonitor';
import type { 
  DashboardState, 
  UseDashboardDataReturn,
  PerformanceMetrics 
} from '../types/dashboard';

// Lazy load the main dashboard component for better performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));

interface EnhancedDashboardProps {
  onError?: (error: Error, errorInfo: any) => void;
  onPerformanceThreshold?: (metrics: PerformanceMetrics) => void;
  performanceThreshold?: number;
  className?: string;
}

/**
 * Enhanced Dashboard wrapper with error boundary, performance monitoring, and responsive layout
 */
export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  onError,
  onPerformanceThreshold,
  performanceThreshold = 100, // 100ms threshold
  className = '',
}) => {
  const { metrics, recordRender } = usePerformanceMonitor(
    'EnhancedDashboard',
    performanceThreshold
  );

  // Record render start
  React.useEffect(() => {
    recordRender();
  });

  // Call performance callback if threshold exceeded
  React.useEffect(() => {
    if (metrics.renderTime > performanceThreshold && onPerformanceThreshold) {
      onPerformanceThreshold(metrics);
    }
  }, [metrics, performanceThreshold, onPerformanceThreshold]);

  const fallbackComponent = React.useCallback(
    ({ error, errorInfo, resetError }: any) => (
      <ResponsiveContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-status-error text-xl font-semibold">
              Dashboard Error
            </div>
            <div className="text-text-secondary">
              {error.message}
            </div>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ResponsiveContainer>
    ),
    []
  );

  const loadingFallback = (
    <ResponsiveContainer>
      <div className="min-h-screen flex items-center justify-center">
        <Loading 
          type="spinner" 
          size="xl" 
          text="Loading dashboard..." 
          textPosition="bottom"
        />
      </div>
    </ResponsiveContainer>
  );

  return (
    <DashboardErrorBoundary
      fallbackComponent={fallbackComponent}
      onError={onError}
      resetOnPropsChange={true}
    >
      <ResponsiveContainer className={className}>
        <ResponsiveSection spacing="lg">
          <Suspense fallback={loadingFallback}>
            <Dashboard />
          </Suspense>
        </ResponsiveSection>
      </ResponsiveContainer>
    </DashboardErrorBoundary>
  );
};

/**
 * Performance monitoring wrapper for dashboard components
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  threshold: number = 16
) {
  const WrappedComponent = (props: P) => {
    const { recordRender } = usePerformanceMonitor(componentName, threshold);

    React.useEffect(() => {
      recordRender();
    });

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Dashboard context for sharing state across components
 */
export const DashboardContext = React.createContext<UseDashboardDataReturn | null>(null);

export const useDashboardContext = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

/**
 * Dashboard provider component
 */
export const DashboardProvider: React.FC<{
  children: React.ReactNode;
  dashboardData: UseDashboardDataReturn;
}> = ({ children, dashboardData }) => {
  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
};

export default EnhancedDashboard;