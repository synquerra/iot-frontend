// src/components/LazyCharts.jsx
import React, { Suspense, lazy } from 'react';
import { Loading } from '../design-system/components/Loading';

// Lazy load chart components
const LazyEnhancedBarChart = lazy(() => 
  import('../design-system/components/EnhancedCharts').then(module => ({
    default: module.EnhancedBarChart
  }))
);

const LazyEnhancedPieChart = lazy(() => 
  import('../design-system/components/EnhancedCharts').then(module => ({
    default: module.EnhancedPieChart
  }))
);

// Lazy load Recharts components
const LazyRecharts = lazy(() => 
  import('recharts').then(module => ({
    default: {
      ResponsiveContainer: module.ResponsiveContainer,
      BarChart: module.BarChart,
      Bar: module.Bar,
      XAxis: module.XAxis,
      YAxis: module.YAxis,
      Tooltip: module.Tooltip,
      PieChart: module.PieChart,
      Pie: module.Pie,
      Cell: module.Cell,
      Legend: module.Legend,
      CartesianGrid: module.CartesianGrid,
    }
  }))
);

// Loading boundary component for charts
function ChartLoadingBoundary({ children, fallback }) {
  return (
    <Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center h-64">
            <Loading 
              type="spinner" 
              size="md" 
              text="Loading chart..." 
              textPosition="bottom"
            />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Wrapped components with loading boundaries
export function EnhancedBarChart(props) {
  return (
    <ChartLoadingBoundary>
      <LazyEnhancedBarChart {...props} />
    </ChartLoadingBoundary>
  );
}

export function EnhancedPieChart(props) {
  return (
    <ChartLoadingBoundary>
      <LazyEnhancedPieChart {...props} />
    </ChartLoadingBoundary>
  );
}

// Recharts wrapper component
export function RechartsComponents({ children }) {
  return (
    <ChartLoadingBoundary>
      <LazyRecharts>
        {({ ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid }) => 
          children({ ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid })
        }
      </LazyRecharts>
    </ChartLoadingBoundary>
  );
}

export { ChartLoadingBoundary };