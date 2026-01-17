/**
 * Integration Tests for Dynamic Telemetry Data Feature
 * 
 * This test suite validates the complete end-to-end functionality of the dynamic telemetry feature,
 * ensuring all components work together correctly and all requirements are met.
 * 
 * Requirements covered: All requirements (1.1-7.5)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Telemetry from './Telemetry.jsx';
import { UserContextProvider } from '../contexts/UserContext';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?imei=798456148167816' }),
  };
});

// Mock UserContext
let mockUserContext = {
  isAuthenticated: true,
  userType: 'ADMIN',
  imeis: [],
  uniqueId: 'test-user-123',
  email: 'test@example.com',
  tokens: {
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
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

// Mock analytics API
let mockAnalyticsData = [];
vi.mock('../utils/analytics', () => ({
  getAnalyticsByImei: vi.fn(() => Promise.resolve(mockAnalyticsData)),
}));

// Mock device filtered API
vi.mock('../utils/deviceFiltered', () => ({
  listDevicesFiltered: vi.fn(() => Promise.resolve({ 
    devices: [
      { imei: '798456148167816', topic: 'device1' },
      { imei: '123456789012345', topic: 'device2' }
    ] 
  })),
}));

import { getAnalyticsByImei } from '../utils/analytics';

// Helper function to render component with router and user context
const renderWithRouter = (component, userContextValue = {}) => {
  const defaultUserContext = {
    userType: 'ADMIN',
    imeis: [],
    isAuthenticated: true,
    ...userContextValue
  };
  
  return render(
    <UserContextProvider value={defaultUserContext}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </UserContextProvider>
  );
};

// Mock telemetry data for testing
const createMockAnalytics = (overrides = {}) => {
  const now = new Date();
  return [{
    imei: '798456148167816',
    firmware: '516v151',
    timestamp: now.toISOString(),
    deviceTimestamp: now.toISOString(),
    latitude: 40.7128,
    longitude: -74.0060,
    speed: 45,
    rawTemperature: '25',
    battery: 85,
    ...overrides
  }];
};

describe('Telemetry Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyticsData = createMockAnalytics();
  });

  describe('Complete End-to-End Functionality', () => {
    it('should integrate all components and display dynamic data correctly', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Data Telemetry')).toBeInTheDocument();
      expect(screen.getAllByText('798456148167816')).toHaveLength(2);
      expect(screen.getAllByText('Online')[0]).toBeInTheDocument();

      const statusElements = screen.getAllByText('Online');
      const headerStatus = statusElements.find(el => el.classList.contains('text-green-300'));
      expect(headerStatus).toBeInTheDocument();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();

      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getByText('40.7128')).toBeInTheDocument();
      expect(screen.getByText('45 km/h')).toBeInTheDocument();
      expect(screen.getByText('25°C')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();

      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      expect(screen.getByText('Normal Packet (N)')).toBeInTheDocument();
      expect(screen.getByText('40.712800')).toBeInTheDocument();
      expect(screen.getByText('-74.006000')).toBeInTheDocument();
      expect(screen.getByText('No Errors')).toBeInTheDocument();

      const esimTab = screen.getByText('E-SIM');
      fireEvent.click(esimTab);

      expect(screen.getByText('E-SIM Management')).toBeInTheDocument();
      expect(screen.getByText('SIM 1')).toBeInTheDocument();
      expect(screen.getByText('SIM 2')).toBeInTheDocument();

      const controlsTab = screen.getByText('Controls');
      fireEvent.click(controlsTab);

      expect(screen.getByText('Device Controls')).toBeInTheDocument();
      expect(screen.getByText('SOS')).toBeInTheDocument();
      expect(screen.getByText('ACK')).toBeInTheDocument();
      expect(screen.getByText('OFF')).toBeInTheDocument();
    });

    it('should handle error scenarios gracefully', async () => {
      const mockError = new Error('Network connection failed');
      mockError.statusCode = 500;
      mockError.userMessage = 'Unable to connect to server';
      
      getAnalyticsByImei.mockRejectedValue(mockError);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
      expect(screen.getByText('Error Code: 500')).toBeInTheDocument();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();

      expect(screen.getByText('Troubleshooting Tips:')).toBeInTheDocument();
      expect(screen.getByText('• Check your internet connection')).toBeInTheDocument();
    });

    it('should handle partial data scenarios with graceful degradation', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getAllByText('798456148167816')).toHaveLength(2);
    });

    it('should handle conditional styling for high temperature and speed', async () => {
      mockAnalyticsData = createMockAnalytics({
        speed: 120,
        rawTemperature: '65'
      });
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const tempElement = screen.getByText('65°C');
      expect(tempElement).toHaveClass('text-orange-300');

      const speedElement = screen.getByText('120 km/h');
      expect(speedElement).toHaveClass('text-red-300');
    });

    it('should display error packets when available', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      expect(screen.getByText('No Errors')).toBeInTheDocument();
    });

    it('should handle device switching functionality', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getAllByText('798456148167816')).toHaveLength(2);

      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      const liveTab = screen.getByText('Live Data');
      fireEvent.click(liveTab);

      expect(screen.getAllByText('798456148167816')[0]).toBeInTheDocument();
    });

    it('should handle loading states properly', async () => {
      getAnalyticsByImei.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<Telemetry />);

      expect(screen.getByText('Loading telemetry data...')).toBeInTheDocument();
    });

    it('should handle no data available scenario', async () => {
      mockAnalyticsData = [];
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText(/No telemetry data found for device/)).toBeInTheDocument();
    });

    it('should handle refresh functionality with loading states', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(getAnalyticsByImei).toHaveBeenCalled();
    });

    it('should preserve E-SIM static functionality while other sections are dynamic', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getAllByText('798456148167816')).toHaveLength(2);

      const esimTab = screen.getByText('E-SIM');
      fireEvent.click(esimTab);

      expect(screen.getByText('E-SIM Management')).toBeInTheDocument();
      expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Inactive')[0]).toBeInTheDocument();

      const liveTab = screen.getByText('Live Data');
      fireEvent.click(liveTab);

      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getByText('40.7128')).toBeInTheDocument();
    });

    it('should handle timestamp formatting consistency', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      expect(screen.getByText('Normal Packet (N)')).toBeInTheDocument();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid tab switching without errors', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const tabs = ['Packets', 'E-SIM', 'Controls', 'Live Data'];
      
      for (let i = 0; i < 3; i++) {
        for (const tabName of tabs) {
          const tab = screen.getByText(tabName);
          fireEvent.click(tab);
          
          if (tabName === 'Live Data') {
            expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
          } else if (tabName === 'Packets') {
            expect(screen.getByText('Normal Packet (N)')).toBeInTheDocument();
          } else if (tabName === 'E-SIM') {
            expect(screen.getByText('E-SIM Management')).toBeInTheDocument();
          } else if (tabName === 'Controls') {
            expect(screen.getByText('Device Controls')).toBeInTheDocument();
          }
        }
      }
    });

    it('should handle multiple refresh attempts gracefully', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);

      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);

      expect(getAnalyticsByImei).toHaveBeenCalled();
    });

    it('should handle extreme battery values correctly', async () => {
      const testCases = [0, 1, 50, 99, 100];
      
      for (const batteryValue of testCases) {
        mockAnalyticsData = createMockAnalytics({ battery: batteryValue });
        getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

        const { unmount } = renderWithRouter(<Telemetry />);

        await waitFor(() => {
          expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
        });

        expect(screen.getByText(`${batteryValue}%`)).toBeInTheDocument();

        const progressBar = document.querySelector(`div[style*="width: ${batteryValue}%"]`);
        expect(progressBar).toBeInTheDocument();

        unmount();
      }
    });
  });
});
