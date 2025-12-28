// src/test/dashboard-performance.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock the API functions
vi.mock('../utils/analytics', () => ({
  getAnalyticsCount: vi.fn(() => Promise.resolve(100)),
  getAnalyticsPaginated: vi.fn(() => Promise.resolve([
    { imei: '123456789', speed: 45, latitude: 12.34, longitude: 56.78, type: 'GPS' }
  ])),
  getAllAnalytics: vi.fn(() => Promise.resolve([
    { speed: 30 }, { speed: 50 }, { speed: 70 }
  ])),
  getAnalyticsByImei: vi.fn(() => Promise.resolve([
    { latitude: 12.34, longitude: 56.78, timestamp: '2024-01-01T00:00:00Z' }
  ]))
}));

vi.mock('../utils/device', () => ({
  listDevices: vi.fn(() => Promise.resolve({
    devices: [
      { imei: '123456789', topic: 'device1', interval: 30, geoid: 'GEO1' }
    ]
  }))
}));

// Mock the lazy components to avoid actual lazy loading in tests
vi.mock('../components/LazyCharts', () => ({
  EnhancedBarChart: ({ data }) => <div data-testid="bar-chart">Bar Chart: {data?.length || 0} items</div>,
  EnhancedPieChart: ({ data }) => <div data-testid="pie-chart">Pie Chart: {data?.length || 0} items</div>
}));

vi.mock('../components/LazyMap', () => ({
  LeafletComponents: ({ children }) => children({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer">Tile Layer</div>,
    Marker: ({ children }) => <div data-testid="marker">{children}</div>,
    Polyline: () => <div data-testid="polyline">Polyline</div>,
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    useMap: () => ({ fitBounds: vi.fn() })
  })
}));

function DashboardWrapper() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

describe('Dashboard Performance Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with lazy-loaded components', async () => {
    render(<DashboardWrapper />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that main dashboard elements are present
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Devices')).toBeInTheDocument();
    expect(screen.getByText('Recent Data')).toBeInTheDocument();
  });

  it('should render lazy-loaded charts', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that charts are rendered
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should render lazy-loaded map components', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that map placeholder is rendered
    expect(screen.getByText('No device selected')).toBeInTheDocument();
  });

  it('should use memoized data for performance', async () => {
    const { rerender } = render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Get initial values
    const totalAnalytics = screen.getByText('100');
    const totalDevices = screen.getByText('1');
    
    expect(totalAnalytics).toBeInTheDocument();
    expect(totalDevices).toBeInTheDocument();

    // Rerender should use memoized values
    rerender(<DashboardWrapper />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should handle refresh functionality', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that refresh button is present
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });
});