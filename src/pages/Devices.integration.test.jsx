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
  getAnalyticsByImei: vi.fn(),
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
import { getAnalyticsByImei } from '../utils/analytics';
import Devices from './Devices';

// Helper function to set mock user context
const setMockUserContext = (context) => {
  Object.assign(mockUserContext, context);
};

describe('Devices Page Integration Test - Device Filtering', () => {
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
      interval: '-',
    },
  ];

  // Mock telemetry data
  const mockTelemetryData = [
    {
      packet: 'N',
      battery: 85,
      signal: 75,
      rawTemperature: 25,
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
    getAnalyticsByImei.mockResolvedValue(mockTelemetryData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('PARENTS user filtering', () => {
    it('should show only assigned devices for PARENTS user with single IMEI', async () => {
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
          <Devices />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify only the assigned device is shown (device-001 with IMEI 123456789012345)
      await waitFor(() => {
        expect(screen.getByText('device-001')).toBeInTheDocument();
      });

      // Verify other devices are NOT shown
      expect(screen.queryByText('device-002')).not.toBeInTheDocument();
      expect(screen.queryByText('device-003')).not.toBeInTheDocument();

      // Verify the filtered device count shows 1 device
      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 1 devices/i)).toBeInTheDocument();
      });

      // Verify "Filtered View Active" indicator is shown
      await waitFor(() => {
        expect(screen.getByText('Filtered View Active')).toBeInTheDocument();
      });
    });

    it('should show only assigned devices for PARENTS user with multiple IMEIs', async () => {
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
          <Devices />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify both assigned devices are shown
      await waitFor(() => {
        expect(screen.getByText('device-001')).toBeInTheDocument();
        expect(screen.getByText('device-003')).toBeInTheDocument();
      });

      // Verify unassigned device is NOT shown
      expect(screen.queryByText('device-002')).not.toBeInTheDocument();

      // Verify the filtered device count shows 2 devices
      await waitFor(() => {
        expect(screen.getByText(/Showing 2 of 2 devices/i)).toBeInTheDocument();
      });

      // Verify "Filtered View Active" indicator is shown
      await waitFor(() => {
        expect(screen.getByText('Filtered View Active')).toBeInTheDocument();
      });
    });

    it('should show no devices for PARENTS user with no assigned IMEIs', async () => {
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
          <Devices />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify no devices are shown
      expect(screen.queryByText('device-001')).not.toBeInTheDocument();
      expect(screen.queryByText('device-002')).not.toBeInTheDocument();
      expect(screen.queryByText('device-003')).not.toBeInTheDocument();

      // Verify empty state message (either "No devices found" or "No devices registered")
      await waitFor(() => {
        const emptyMessage = screen.queryByText(/No devices found/i) || screen.queryByText(/No devices registered/i);
        expect(emptyMessage).toBeInTheDocument();
      });

      // Verify the filtered device count shows 0 devices
      await waitFor(() => {
        expect(screen.getByText(/Showing 0 of 0 devices/i)).toBeInTheDocument();
      });
    });

    it('should perform case-insensitive IMEI matching for PARENTS user', async () => {
      // Setup PARENTS user context with lowercase IMEI
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'], // lowercase in context
        uniqueId: 'parent999',
        email: 'parent4@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      // Mock device with uppercase IMEI
      const devicesWithUppercase = [
        {
          topic: 'device-upper',
          imei: '123456789012345', // Same IMEI, different case
          geoid: 'geo-001',
          createdAt: '2024-01-15T10:00:00Z',
          interval: '60',
        },
      ];

      listDevices.mockResolvedValue({ devices: devicesWithUppercase });

      render(
        <BrowserRouter>
          <Devices />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device is shown despite case difference
      await waitFor(() => {
        expect(screen.getByText('device-upper')).toBeInTheDocument();
      });
    });
  });

  describe('ADMIN user filtering', () => {
    it('should show all devices for ADMIN user', async () => {
      // Setup ADMIN user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [], // ADMIN may have empty IMEIs
        uniqueId: 'admin123',
        email: 'admin@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Devices />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify ALL devices are shown
      await waitFor(() => {
        expect(screen.getByText('device-001')).toBeInTheDocument();
        expect(screen.getByText('device-002')).toBeInTheDocument();
        expect(screen.getByText('device-003')).toBeInTheDocument();
      });

      // Verify the device count shows all 3 devices
      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3 devices/i)).toBeInTheDocument();
      });

      // Verify "Filtered View Active" indicator is NOT shown for ADMIN
      expect(screen.queryByText('Filtered View Active')).not.toBeInTheDocument();
    });

    it('should show all devices for ADMIN user even with IMEIs assigned', async () => {
      // Setup ADMIN user context with IMEIs (should be ignored)
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: ['123456789012345'], // ADMIN with IMEIs - should be ignored
        uniqueId: 'admin456',
        email: 'admin2@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Devices />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify ALL devices are shown (IMEIs ignored for ADMIN)
      await waitFor(() => {
        expect(screen.getByText('device-001')).toBeInTheDocument();
        expect(screen.getByText('device-002')).toBeInTheDocument();
        expect(screen.getByText('device-003')).toBeInTheDocument();
      });

      // Verify the device count shows all 3 devices
      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3 devices/i)).toBeInTheDocument();
      });

      // Verify "Filtered View Active" indicator is NOT shown
      expect(screen.queryByText('Filtered View Active')).not.toBeInTheDocument();
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

      // Mock API to throw error
      listDevices.mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <Devices />
        </BrowserRouter>
      );

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Failed to Load Devices/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });
});
