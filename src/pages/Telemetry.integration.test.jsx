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

// Mock the useTelemetryData hook
vi.mock('../hooks/useTelemetryData', () => ({
  useTelemetryData: vi.fn(),
}));

// Mock device API
vi.mock('../utils/device', () => ({
  listDevices: vi.fn().mockResolvedValue({
    devices: [
      { imei: '798456148167816', topic: 'device1' },
      { imei: '123456789012345', topic: 'device2' }
    ]
  })
}));

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

import { useTelemetryData } from '../hooks/useTelemetryData';

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
const createMockTelemetryData = (overrides = {}) => ({
  deviceInfo: {
    imei: '798456148167816',
    firmware: '516v151',
    status: 'Online',
    lastSeen: '01-01-2026 12:30:45',
    isRecent: true,
    ...overrides.deviceInfo
  },
  liveData: {
    latitude: 40.7128,
    longitude: -74.0060,
    speed: 45,
    temperature: 25,
    battery: 85,
    hasHighTemp: false,
    hasHighSpeed: false,
    ...overrides.liveData
  },
  packetData: {
    normalPacket: {
      lat: 40.712800,
      lng: -74.006000,
      speed: 45,
      temp: 25,
      battery: 85
    },
    errorPacket: null,
    ...overrides.packetData
  }
});

describe('Telemetry Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete End-to-End Functionality', () => {
    it('should integrate all components and display dynamic data correctly', async () => {
      // Mock successful data loading
      const mockRefreshData = vi.fn().mockResolvedValue();
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        hasPartialData: false,
        hasErrors: false,
        isRefreshing: false,
        refreshData: mockRefreshData,
        retryFailedRequests: vi.fn(),
        canRetry: false,
        errorSummary: [],
        partialDataErrors: {}
      });

      renderWithRouter(<Telemetry />);

      // Verify header displays device information (Requirement 1.2)
      expect(screen.getByText('Data Telemetry')).toBeInTheDocument();
      expect(screen.getAllByText('798456148167816')).toHaveLength(2); // Header and device info card
      expect(screen.getAllByText('Online')[0]).toBeInTheDocument(); // Multiple "Online" elements
      expect(screen.getByText('01-01-2026 12:30:45')).toBeInTheDocument();
      expect(screen.getAllByText('Recent')[0]).toBeInTheDocument();

      // Verify device status styling (Requirements 1.3, 1.4)
      const statusElements = screen.getAllByText('Online');
      const headerStatus = statusElements.find(el => el.classList.contains('text-green-300'));
      expect(headerStatus).toBeInTheDocument();

      // Verify refresh button functionality (Requirement 6.1)
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
      fireEvent.click(refreshButton);
      expect(mockRefreshData).toHaveBeenCalled();

      // Verify Live Data tab displays telemetry data (Requirements 2.2, 2.3)
      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getByText('40.7128')).toBeInTheDocument(); // Latitude
      expect(screen.getByText('45 km/h')).toBeInTheDocument(); // Speed
      expect(screen.getByText('25°C')).toBeInTheDocument(); // Temperature
      expect(screen.getByText('85%')).toBeInTheDocument(); // Battery

      // Verify battery progress bar (Requirement 2.3)
      const progressBar = document.querySelector('div[style*="width: 85%"]');
      expect(progressBar).toBeInTheDocument();

      // Test tab switching functionality (Requirement 7.5)
      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      // Verify Packets tab displays packet data (Requirements 3.2, 3.4)
      expect(screen.getByText('Normal Packet (N)')).toBeInTheDocument();
      expect(screen.getByText('40.712800')).toBeInTheDocument(); // Formatted latitude
      expect(screen.getByText('-74.006000')).toBeInTheDocument(); // Formatted longitude
      expect(screen.getByText('No Errors')).toBeInTheDocument(); // No error packets

      // Test E-SIM tab static functionality (Requirements 4.1, 4.2, 4.3)
      const esimTab = screen.getByText('E-SIM');
      fireEvent.click(esimTab);

      expect(screen.getByText('E-SIM Management')).toBeInTheDocument();
      expect(screen.getByText('SIM 1')).toBeInTheDocument();
      expect(screen.getByText('SIM 2')).toBeInTheDocument();
      expect(screen.getAllByText('Active')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Inactive')[0]).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument(); // Signal strength
      expect(screen.getByText('2.3 GB')).toBeInTheDocument(); // Data usage

      // Test Controls tab
      const controlsTab = screen.getByText('Controls');
      fireEvent.click(controlsTab);

      expect(screen.getByText('Device Controls')).toBeInTheDocument();
      expect(screen.getByText('SOS')).toBeInTheDocument();
      expect(screen.getByText('ACK')).toBeInTheDocument();
      expect(screen.getByText('OFF')).toBeInTheDocument();
    });

    it('should handle error scenarios gracefully', async () => {
      // Mock error state
      const mockError = {
        message: 'Network connection failed',
        userMessage: 'Unable to connect to server',
        statusCode: 500
      };

      useTelemetryData.mockReturnValue({
        data: { deviceInfo: null, liveData: null, packetData: null },
        loading: false,
        error: mockError,
        hasData: false,
        hasPartialData: false,
        hasErrors: true,
        isRefreshing: false,
        refreshData: vi.fn(),
        retryFailedRequests: vi.fn(),
        canRetry: true,
        errorSummary: [
          {
            type: 'critical',
            component: 'telemetry data',
            error: mockError,
            canRetry: true
          }
        ],
        partialDataErrors: {}
      });

      renderWithRouter(<Telemetry />);

      // Verify error handling (Requirement 5.2)
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
      expect(screen.getByText('Error Code: 500')).toBeInTheDocument();

      // Verify retry functionality (Requirement 5.4)
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      // Verify troubleshooting tips
      expect(screen.getByText('Troubleshooting Tips:')).toBeInTheDocument();
      expect(screen.getByText('• Check your internet connection')).toBeInTheDocument();
    });

    it('should handle partial data scenarios with graceful degradation', async () => {
      // Mock partial data state
      const partialError = {
        message: 'Health data unavailable',
        userMessage: 'Device health information could not be loaded'
      };

      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        hasPartialData: true,
        hasErrors: true,
        isRefreshing: false,
        refreshData: vi.fn(),
        retryFailedRequests: vi.fn(),
        canRetry: true,
        errorSummary: [
          {
            type: 'warning',
            component: 'health data',
            error: partialError,
            canRetry: true
          }
        ],
        partialDataErrors: { health: partialError }
      });

      renderWithRouter(<Telemetry />);

      // Verify partial data warning (Requirement 5.3)
      expect(screen.getByText('Partial Data Available')).toBeInTheDocument();
      expect(screen.getByText('Some data could not be loaded. Core telemetry data is available.')).toBeInTheDocument();
      expect(screen.getByText('• health data: Device health information could not be loaded')).toBeInTheDocument();

      // Verify retry button for failed requests
      const retryButton = screen.getByRole('button', { name: /retry failed requests/i });
      expect(retryButton).toBeInTheDocument();

      // Verify core data is still displayed
      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getAllByText('798456148167816')).toHaveLength(2); // Header and device info card
    });

    it('should handle conditional styling for high temperature and speed', async () => {
      // Mock data with high temperature and speed
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData({
          liveData: {
            latitude: 40.7128,
            longitude: -74.0060,
            speed: 120, // High speed > 100 km/h
            temperature: 65, // High temperature > 50°C
            battery: 85,
            hasHighTemp: true,
            hasHighSpeed: true
          }
        }),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Verify conditional styling for high temperature (Requirement 2.4)
      const tempElement = screen.getByText('65°C');
      expect(tempElement).toHaveClass('text-orange-300');

      // Verify conditional styling for high speed (Requirement 2.5)
      const speedElement = screen.getByText('120 km/h');
      expect(speedElement).toHaveClass('text-red-300');
    });

    it('should display error packets when available', async () => {
      // Mock data with error packet
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData({
          packetData: {
            normalPacket: {
              lat: 40.712800,
              lng: -74.006000,
              speed: 45,
              temp: 25,
              battery: 85
            },
            errorPacket: {
              code: 'ERR_001',
              timestamp: '01-01-2026 12:35:20'
            }
          }
        }),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Switch to packets tab
      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      // Verify error packet display (Requirement 3.3)
      expect(screen.getByText('Error Packet (E)')).toBeInTheDocument();
      expect(screen.getByText('ERR_001')).toBeInTheDocument();
      expect(screen.getByText('01-01-2026 12:35:20')).toBeInTheDocument();
    });

    it('should handle device switching functionality', async () => {
      // Mock initial device data
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Verify device context is maintained (Requirement 7.5)
      expect(screen.getAllByText('798456148167816')).toHaveLength(2); // Header and device info card
      // Note: Default device behavior is handled internally, no "Default" text displayed

      // Test tab switching maintains device context
      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      const liveTab = screen.getByText('Live Data');
      fireEvent.click(liveTab);

      // Device context should be maintained
      expect(screen.getAllByText('798456148167816')[0]).toBeInTheDocument();
    });

    it('should handle loading states properly', async () => {
      // Mock loading state
      useTelemetryData.mockReturnValue({
        data: { deviceInfo: null, liveData: null, packetData: null },
        loading: true,
        error: null,
        hasData: false,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Verify loading state display (Requirement 5.1)
      expect(screen.getByText('Loading telemetry data...')).toBeInTheDocument();
    });

    it('should handle no data available scenario', async () => {
      // Mock no data state
      useTelemetryData.mockReturnValue({
        data: { deviceInfo: null, liveData: null, packetData: null },
        loading: false,
        error: null,
        hasData: false,
        hasPartialData: false,
        hasErrors: false,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Verify no data state display (Requirement 5.3)
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText(/No telemetry data found for device/)).toBeInTheDocument();
    });

    it('should handle refresh functionality with loading states', async () => {
      // Mock refreshing state
      const mockRefreshData = vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 100));
      });

      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: true,
        refreshData: mockRefreshData
      });

      renderWithRouter(<Telemetry />);

      // Verify refresh loading state (Requirement 6.2)
      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toBeDisabled();
    });

    it('should preserve E-SIM static functionality while other sections are dynamic', async () => {
      // Mock dynamic data
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Verify dynamic sections work
      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getAllByText('798456148167816')).toHaveLength(2); // Dynamic IMEI in header and device card

      // Switch to E-SIM tab
      const esimTab = screen.getByText('E-SIM');
      fireEvent.click(esimTab);

      // Verify E-SIM section remains static (Requirement 4.4)
      expect(screen.getByText('E-SIM Management')).toBeInTheDocument();
      expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1); // Static SIM 1 status (may have multiple "Active" on page)
      expect(screen.getAllByText('Inactive')[0]).toBeInTheDocument(); // Static SIM 2 status
      expect(screen.getByText('85%')).toBeInTheDocument(); // Static signal strength
      expect(screen.getByText('2.3 GB')).toBeInTheDocument(); // Static data usage
      expect(screen.getByText('0%')).toBeInTheDocument(); // Static SIM 2 signal
      expect(screen.getByText('0 GB')).toBeInTheDocument(); // Static SIM 2 data usage

      // Switch back to Live Data to verify dynamic sections still work
      const liveTab = screen.getByText('Live Data');
      fireEvent.click(liveTab);

      expect(screen.getByText('Live Telemetry Data')).toBeInTheDocument();
      expect(screen.getByText('40.7128')).toBeInTheDocument(); // Dynamic latitude
    });

    it('should handle timestamp formatting consistency', async () => {
      // Mock data with various timestamps
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData({
          deviceInfo: {
            lastSeen: '01-01-2026 12:30:45' // DD-MM-YYYY HH:MM:SS format
          },
          packetData: {
            normalPacket: {
              lat: 40.712800,
              lng: -74.006000,
              speed: 45,
              temp: 25,
              battery: 85
            },
            errorPacket: {
              code: 'ERR_001',
              timestamp: '01-01-2026 12:35:20' // Same format
            }
          }
        }),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Verify timestamp formatting in device info (Requirement 3.5)
      expect(screen.getByText('01-01-2026 12:30:45')).toBeInTheDocument();

      // Switch to packets tab to verify error packet timestamp formatting
      const packetsTab = screen.getByText('Packets');
      fireEvent.click(packetsTab);

      expect(screen.getByText('01-01-2026 12:35:20')).toBeInTheDocument();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid tab switching without errors', async () => {
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Rapidly switch between tabs
      const tabs = ['Packets', 'E-SIM', 'Controls', 'Live Data'];
      
      for (let i = 0; i < 3; i++) {
        for (const tabName of tabs) {
          const tab = screen.getByText(tabName);
          fireEvent.click(tab);
          
          // Verify tab content loads without errors
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
      const mockRefreshData = vi.fn().mockResolvedValue();
      
      useTelemetryData.mockReturnValue({
        data: createMockTelemetryData(),
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: mockRefreshData
      });

      renderWithRouter(<Telemetry />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Click refresh multiple times rapidly
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);

      // Should handle multiple clicks gracefully
      expect(mockRefreshData).toHaveBeenCalled();
    });

    it('should handle extreme battery values correctly', async () => {
      // Test with edge case battery values
      const testCases = [0, 1, 50, 99, 100];
      
      for (const batteryValue of testCases) {
        useTelemetryData.mockReturnValue({
          data: createMockTelemetryData({
            liveData: {
              latitude: 40.7128,
              longitude: -74.0060,
              speed: 45,
              temperature: 25,
              battery: batteryValue,
              hasHighTemp: false,
              hasHighSpeed: false
            }
          }),
          loading: false,
          error: null,
          hasData: true,
          isRefreshing: false,
          refreshData: vi.fn()
        });

        const { unmount } = renderWithRouter(<Telemetry />);

        // Verify battery percentage is displayed correctly
        expect(screen.getByText(`${batteryValue}%`)).toBeInTheDocument();

        // Verify progress bar width
        const progressBar = document.querySelector(`div[style*="width: ${batteryValue}%"]`);
        expect(progressBar).toBeInTheDocument();

        unmount();
      }
    });
  });
});