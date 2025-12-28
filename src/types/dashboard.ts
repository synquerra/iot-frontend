/**
 * TypeScript interfaces for Dashboard components
 * Requirements: 8.3, 8.4, 8.5
 */

// Core data models
export interface AnalyticsData {
  id: string;
  imei: string;
  speed: number;
  latitude: number;
  longitude: number;
  type: string;
  timestamp: string;
  timestampIso?: string;
  // Enhanced fields for better visualization
  speedCategory?: 'low' | 'medium' | 'high';
  locationAccuracy?: number;
  deviceStatus?: 'active' | 'inactive' | 'warning';
}

export interface Device {
  topic: string;
  imei: string;
  interval: number;
  geoid: string;
  // Enhanced fields
  status?: 'online' | 'offline' | 'maintenance';
  lastSeen?: string;
  batteryLevel?: number;
  signalStrength?: number;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  time: string;
}

export interface ChartDataPoint {
  name: string;
  count: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

// Dashboard state model
export interface DashboardState {
  // Core data
  totalAnalytics: number;
  recentAnalytics: AnalyticsData[];
  devices: Device[];
  
  // Chart data
  speedChart: ChartDataPoint[];
  geoPie: PieChartData[];
  
  // Map data
  locationPath: LocationPoint[];
  selectedImei: string;
  
  // UI state
  loading: boolean;
  locationLoading: boolean;
  error: string | null;
  
  // Computed stats
  stats: {
    totalAnalytics: number;
    devicesCount: number;
    recentCount: number;
  };
}

// Component interfaces
export interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  stats: {
    devicesCount: number;
    recentCount: number;
    totalAnalytics: number;
  };
  onRefresh: () => void;
  loading?: boolean;
}

export interface KpiGridProps {
  metrics: Array<{
    title: string;
    value: string | number;
    subtitle: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    colorScheme: string;
    type?: 'performance' | 'status' | 'growth';
  }>;
  responsive?: boolean;
}

export interface MapSectionProps {
  devices: Device[];
  selectedImei: string;
  locationPath: LocationPoint[];
  onDeviceSelect: (imei: string) => void;
  loading?: boolean;
}

export interface ChartsGridProps {
  speedChart: ChartDataPoint[];
  geoPie: PieChartData[];
  responsive?: boolean;
  animated?: boolean;
}

export interface EnhancedTableProps {
  data: any[];
  columns: TableColumn[];
  variant: 'analytics' | 'devices';
  colorScheme: string;
}

export interface TableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// Hook interfaces
export interface UseDashboardDataReturn extends DashboardState {
  // Actions
  loadHistory: (imei: string) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  addOptimisticAnalytics: (data: AnalyticsData) => void;
  
  // Individual refresh functions
  refreshCount: () => Promise<void>;
  refreshRecent: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  refreshAllAnalytics: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  
  // Error handling
  errors: Record<string, Error>;
}

// Error boundary interfaces
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}

export interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

// Responsive utilities interfaces
export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveHookReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
  width: number;
  height: number;
}

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  mobileLayout?: React.ComponentType<any>;
  tabletLayout?: React.ComponentType<any>;
  desktopLayout?: React.ComponentType<any>;
  breakpoints?: Partial<BreakpointConfig>;
}

// Performance monitoring interfaces
export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  reRenderCount: number;
}

export interface PerformanceMonitorProps {
  componentName: string;
  threshold?: number;
  onThresholdExceeded?: (metrics: PerformanceMetrics) => void;
  children: React.ReactNode;
}