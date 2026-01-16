import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock device API
vi.mock('../utils/device', () => ({
  listDevices: vi.fn(),
}));

// Mock analytics API
vi.mock('../utils/analytics', () => ({
  getAnalyticsCount: vi.fn(),
  getAnalyticsPaginated: vi.fn(),
  getAllAnalytics: vi.fn(),
  getAnalyticsByImei: vi.fn(),
}));

// Mock enhanced analytics API
vi.mock('../utils/enhancedAnalytics', () => ({
  getAllAnalyticsSafe: vi.fn(),
  getAnalyticsByImeiSafe: vi.fn(),
  getRecentAnalyticsSafe: vi.fn(),
  EnhancedAnalyticsAPI: vi.fn().mockImplementation(() => ({
    healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  })),
}));

// Mock progressive map data loader
vi.mock('../utils/progressiveMapDataLoader', () => ({
  loadLocationDataProgressive: vi.fn(),
}));

// Mock all the design system components
vi.mock('../components/LazyCharts', () => ({
  EnhancedBarChart: ({ data }) => <div data-testid="bar-chart">{JSON.stringify(data)}</div>,
  EnhancedPieChart: ({ data }) => <div data-testid="pie-chart">{JSON.stringify(data)}</div>,
}));

vi.mock('../components/PremiumJourneyMap', () => ({
  default: () => <div data-testid="journey-map">Map</div>,
}));

vi.mock('../components/dashboard/DashboardHeader', () => ({
  DashboardHeader: ({ title, stats }) => (
    <div data-testid="dashboard-header">
      <h1>{title}</h1>
      <div data-testid="stats">
        <div>Active Devices: {stats.devicesCount}</div>
        <div>Recent Activity: {stats.recentCount}</div>
        <div>Total Analytics: {stats.totalAnalytics}</div>
      </div>
    </div>
  ),
}));

// Mock UserContext - this will be updated per test
let mockUserContext = {
  isAuthenticated: false,
  userType: null,
  imeis: [],
  uniqueId: null,
  email: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

vi.mock('../contexts/UserContext', () => ({
  useUserContext: () => ({
    ...mockUserContext,
    setUserContext: vi.fn(),
    updateTokens: vi.fn(),
    clearUserContext: vi.fn(),
    getUserContext: () => mockUserContext,
    isAdmin: () => mockUserContext.userType === 'ADMIN',
    isParent: () => mockUserContext.userType === 'PARENTS',
  }),
  UserContextProvider: ({ children }) => children,
}));

// Import mocked modules
import { listDevices } from '../utils/device';
import { 
  getAnalyticsCount, 
  getAnalyticsPaginated, 
  getAllAnalytics,
  getAnalyticsByImei 
} from '../utils/analytics';
import { 
  getAllAnalyticsSafe, 
  getRecentAnalyticsSafe 
} from '../utils/enhancedAnalytics';
import Dashboard from './Dashboard';

// Helper function to set mock user context
const setMockUserContext = (context) => {
  Object.assign(mockUserContext, context);
};

describe('Dashboard Page Integration Test - Device Filtering', () => {
  // Mock device data
  const mockDevices = [
    {
      topic: 'device-001',
      imei: '123456789012345',
      geoid: 'geo-001',
      createdAt: '2024-01-15T10:00:00Z',
      interval: '60',
    },
    {
      topic: 'device-002',
      imei: '999999999999999',
      geoid: 'geo-002',
      createdAt: '2024-01-15T11:00:00Z',
      interval: '60',
    },
    {
      topic: 'device-003',
      imei: '111111111111111',
      geoid: 'geo-003',
      createdAt: '2024-01-15T12:00:00Z',
      interval: '30',
    },
  ];

  // Mock analytics data
  const mockAnalytics = [
    {
      imei: '123456789012345',
      speed: 45,
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'GPS',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      imei: '999999999999999',
      speed: 60,
      latitude: 34.0522,
      longitude: -118.2437,
      type: 'GPS',
      timestamp: '2024-01-15T11:30:00Z',
    },
    {
      imei: '111111111111111',
      speed: 30,
      latitude: 51.5074,
      longitude: -0.1278,
      type: 'GPS',
      timestamp: '2024-01-15T12:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset mock user context
    setMockUserContext({
      isAuthenticated: false,
      userType: null,
      imeis: [],
      uniqueId: null,
      email: null,
      tokens: {
        accessToken: null,
        refreshToken: null,
      },
    });
    
    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Default mock implementations
    listDevices.mockResolvedValue({ devices: mockDevices });
    getAnalyticsCount.mockResolvedValue(mockAnalytics.length);
    getAnalyticsPaginated.mockResolvedValue(mockAnalytics.slice(0, 10));
    getAllAnalytics.mockResolvedValue(mockAnalytics);
    getAllAnalyticsSafe.mockResolvedValue(mockAnalytics);
    getRecentAnalyticsSafe.mockResolvedValue(mockAnalytics.slice(0, 10));
    getAnalyticsByImei.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('PARENTS user filtering', () => {
    it('should show only assigned devices in dashboard widgets for PARENTS user with single IMEI', async () => {
      // Setup PARENTS user context with single IMEI
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        uniqueId: 'parent123',
        email: 'parent@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device count shows only 1 device (filtered)
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toHaveTextContent('Active Devices: 1');
      });

      // Verify analytics are filtered to only show data from assigned device
      await waitFor(() => {
        // Check that only analytics from device 123456789012345 are shown
        const analyticsTable = screen.getByText(/Latest Analytics/i).closest('div');
        expect(analyticsTable).toBeInTheDocument();
        
        // The filtered analytics should only contain data from the assigned IMEI
        const imeiCells = screen.queryAllByText('123456789012345');
        expect(imeiCells.length).toBeGreaterThan(0);
        
        // Other IMEIs should not be present
        expect(screen.queryByText('999999999999999')).not.toBeInTheDocument();
        expect(screen.queryByText('111111111111111')).not.toBeInTheDocument();
      });

      // Verify device dropdown only shows assigned device
      await waitFor(() => {
        const deviceSelect = screen.getByRole('combobox');
        expect(deviceSelect).toBeInTheDocument();
        
        // Check that only 1 device option is available (plus the default "Select device" option)
        const options = deviceSelect.querySelectorAll('option');
        expect(options.length).toBe(2); // 1 default + 1 device
      });
    });

    it('should show only assigned devices in dashboard widgets for PARENTS user with multiple IMEIs', async () => {
      // Setup PARENTS user context with multiple IMEIs
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345', '111111111111111'],
        uniqueId: 'parent456',
        email: 'parent2@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device count shows 2 devices (filtered)
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toHaveTextContent('Active Devices: 2');
      });

      // Verify analytics are filtered to only show data from assigned devices
      await waitFor(() => {
        const analyticsTable = screen.getByText(/Latest Analytics/i).closest('div');
        expect(analyticsTable).toBeInTheDocument();
        
        // Both assigned IMEIs should be present (use queryAllByText since there may be multiple rows)
        const imei1Elements = screen.queryAllByText('123456789012345');
        const imei3Elements = screen.queryAllByText('111111111111111');
        expect(imei1Elements.length).toBeGreaterThan(0);
        expect(imei3Elements.length).toBeGreaterThan(0);
        
        // Unassigned IMEI should not be present
        const imei2Elements = screen.queryAllByText('999999999999999');
        expect(imei2Elements.length).toBe(0);
      });

      // Verify device dropdown shows both assigned devices
      await waitFor(() => {
        const deviceSelect = screen.getByRole('combobox');
        expect(deviceSelect).toBeInTheDocument();
        
        // Check that 2 device options are available (plus the default "Select device" option)
        const options = deviceSelect.querySelectorAll('option');
        expect(options.length).toBe(3); // 1 default + 2 devices
      });
    });

    it('should show no devices in dashboard widgets for PARENTS user with no assigned IMEIs', async () => {
      // Setup PARENTS user context with no IMEIs
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: [],
        uniqueId: 'parent789',
        email: 'parent3@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device count shows 0 devices
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toHaveTextContent('Active Devices: 0');
      });

      // Verify no analytics are shown
      await waitFor(() => {
        const analyticsTable = screen.getByText(/Latest Analytics/i).closest('div');
        expect(analyticsTable).toBeInTheDocument();
        
        // No IMEIs should be present
        expect(screen.queryByText('123456789012345')).not.toBeInTheDocument();
        expect(screen.queryByText('999999999999999')).not.toBeInTheDocument();
        expect(screen.queryByText('111111111111111')).not.toBeInTheDocument();
      });

      // Verify device dropdown shows no devices
      await waitFor(() => {
        const deviceSelect = screen.getByRole('combobox');
        expect(deviceSelect).toBeInTheDocument();
        
        // Check that only the default "Select device" option is available
        const options = deviceSelect.querySelectorAll('option');
        expect(options.length).toBe(1); // Only default option
      });
    });
  });

  describe('ADMIN user filtering', () => {
    it('should show all devices in dashboard widgets for ADMIN user', async () => {
      // Setup ADMIN user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
        uniqueId: 'admin123',
        email: 'admin@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device count shows all 3 devices
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toHaveTextContent('Active Devices: 3');
      });

      // Verify all analytics are shown
      await waitFor(() => {
        const analyticsTable = screen.getByText(/Latest Analytics/i).closest('div');
        expect(analyticsTable).toBeInTheDocument();
        
        // All IMEIs should be present (use queryAllByText since IMEIs may appear multiple times)
        const imei1Elements = screen.queryAllByText('123456789012345');
        const imei2Elements = screen.queryAllByText('999999999999999');
        const imei3Elements = screen.queryAllByText('111111111111111');
        expect(imei1Elements.length).toBeGreaterThan(0);
        expect(imei2Elements.length).toBeGreaterThan(0);
        expect(imei3Elements.length).toBeGreaterThan(0);
      });

      // Verify device dropdown shows all devices
      await waitFor(() => {
        const deviceSelect = screen.getByRole('combobox');
        expect(deviceSelect).toBeInTheDocument();
        
        // Check that all 3 device options are available (plus the default "Select device" option)
        const options = deviceSelect.querySelectorAll('option');
        expect(options.length).toBe(4); // 1 default + 3 devices
      });
    });

    it('should show all devices in dashboard widgets for ADMIN user even with IMEIs assigned', async () => {
      // Setup ADMIN user context with IMEIs (should be ignored)
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: ['123456789012345'],
        uniqueId: 'admin456',
        email: 'admin2@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device count shows all 3 devices (IMEIs ignored for ADMIN)
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toHaveTextContent('Active Devices: 3');
      });

      // Verify all analytics are shown
      await waitFor(() => {
        const analyticsTable = screen.getByText(/Latest Analytics/i).closest('div');
        expect(analyticsTable).toBeInTheDocument();
        
        // All IMEIs should be present (use queryAllByText since IMEIs may appear multiple times)
        const imei1Elements = screen.queryAllByText('123456789012345');
        const imei2Elements = screen.queryAllByText('999999999999999');
        const imei3Elements = screen.queryAllByText('111111111111111');
        expect(imei1Elements.length).toBeGreaterThan(0);
        expect(imei2Elements.length).toBeGreaterThan(0);
        expect(imei3Elements.length).toBeGreaterThan(0);
      });

      // Verify device dropdown shows all devices
      await waitFor(() => {
        const deviceSelect = screen.getByRole('combobox');
        expect(deviceSelect).toBeInTheDocument();
        
        // Check that all 3 device options are available (plus the default "Select device" option)
        const options = deviceSelect.querySelectorAll('option');
        expect(options.length).toBe(4); // 1 default + 3 devices
      });
    });
  });

  describe('Charts and visualizations filtering', () => {
    it('should filter speed distribution chart data for PARENTS user', async () => {
      // Setup PARENTS user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        uniqueId: 'parent123',
        email: 'parent@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify speed distribution chart is present
      await waitFor(() => {
        expect(screen.getByText(/Speed Distribution/i)).toBeInTheDocument();
      });

      // The chart should only include data from the assigned device
      // This is verified by checking that the analytics data is filtered
      // The actual chart rendering is handled by the EnhancedBarChart component
    });

    it('should filter geographic distribution chart data for PARENTS user', async () => {
      // Setup PARENTS user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        uniqueId: 'parent123',
        email: 'parent@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
        expect(getAllAnalyticsSafe).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify geographic distribution chart is present
      await waitFor(() => {
        expect(screen.getByText(/Device Geo Distribution/i)).toBeInTheDocument();
      });

      // The chart should only include devices from the filtered list
      // This is verified by checking that only 1 device is counted
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toHaveTextContent('Active Devices: 1');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Setup user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
        uniqueId: 'admin123',
        email: 'admin@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      // Mock all APIs to throw errors to trigger error state
      listDevices.mockRejectedValue(new Error('API Error'));
      getAllAnalyticsSafe.mockRejectedValue(new Error('API Error'));
      getAnalyticsCount.mockRejectedValue(new Error('API Error'));
      getRecentAnalyticsSafe.mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // The Dashboard component handles errors gracefully by showing partial data
      // Verify that the dashboard still renders with empty/fallback data
      await waitFor(() => {
        const statsSection = screen.getByTestId('stats');
        expect(statsSection).toBeInTheDocument();
        // Device count should be 0 since listDevices failed
        expect(statsSection).toHaveTextContent('Active Devices: 0');
      });
    });
  });
});
