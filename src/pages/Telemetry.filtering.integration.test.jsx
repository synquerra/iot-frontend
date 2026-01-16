/**
 * Integration Tests for Telemetry Page Device Filtering
 * 
 * This test suite validates that device filtering works correctly on the Telemetry page,
 * ensuring that PARENTS users only see authorized devices in the dropdown while ADMIN users see all devices.
 * 
 * Requirements covered: 4.3
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom navigate and location
const mockNavigate = vi.fn();
let mockLocation = { search: '' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
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
import Telemetry from './Telemetry';

// Helper function to set mock user context
const setMockUserContext = (context) => {
  Object.assign(mockUserContext, context);
};

// Helper function to set mock location
const setMockLocation = (search) => {
  mockLocation = { search };
};

describe('Telemetry Page Integration Test - Device Filtering', () => {
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
      latitude: 40.7128,
      longitude: -74.0060,
      speed: 45,
      timestamp: '2026-01-15T10:30:00Z',
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
    
    // Reset mock location
    setMockLocation('');
    
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

  describe('PARENTS user device dropdown filtering', () => {
    it('should show only assigned devices in dropdown for PARENTS user with single IMEI', async () => {
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

      // Set location to show error state with device selector
      setMockLocation('?imei=999999999999999'); // Unauthorized IMEI

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for error message to appear (unauthorized device)
      await waitFor(() => {
        expect(screen.getByText('Unauthorized Device Access')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device selector dropdown is present
      await waitFor(() => {
        const dropdown = screen.getByRole('combobox');
        expect(dropdown).toBeInTheDocument();
      });

      // Get the dropdown element
      const dropdown = screen.getByRole('combobox');
      const options = dropdown.querySelectorAll('option');

      // Verify only authorized device appears in dropdown (plus the "Choose a device..." option)
      expect(options).toHaveLength(2); // 1 placeholder + 1 authorized device

      // Verify the authorized device is in the dropdown
      const deviceOptions = Array.from(options).filter(opt => opt.value !== '');
      expect(deviceOptions).toHaveLength(1);
      expect(deviceOptions[0].value).toBe('123456789012345');
      expect(deviceOptions[0].textContent).toContain('123456789012345');
      expect(deviceOptions[0].textContent).toContain('device-001');

      // Verify unauthorized devices are NOT in the dropdown
      const allOptionsText = Array.from(options).map(opt => opt.textContent).join(' ');
      expect(allOptionsText).not.toContain('999999999999999');
      expect(allOptionsText).not.toContain('111111111111111');
    });

    it('should show only assigned devices in dropdown for PARENTS user with multiple IMEIs', async () => {
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

      // Set location to show error state with device selector
      setMockLocation('?imei=999999999999999'); // Unauthorized IMEI

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Unauthorized Device Access')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device selector dropdown is present
      await waitFor(() => {
        const dropdown = screen.getByRole('combobox');
        expect(dropdown).toBeInTheDocument();
      });

      // Get the dropdown element
      const dropdown = screen.getByRole('combobox');
      const options = dropdown.querySelectorAll('option');

      // Verify only authorized devices appear in dropdown (plus the "Choose a device..." option)
      expect(options).toHaveLength(3); // 1 placeholder + 2 authorized devices

      // Verify the authorized devices are in the dropdown
      const deviceOptions = Array.from(options).filter(opt => opt.value !== '');
      expect(deviceOptions).toHaveLength(2);
      
      const deviceValues = deviceOptions.map(opt => opt.value);
      expect(deviceValues).toContain('123456789012345');
      expect(deviceValues).toContain('111111111111111');

      // Verify device topics are shown
      const allOptionsText = Array.from(options).map(opt => opt.textContent).join(' ');
      expect(allOptionsText).toContain('device-001');
      expect(allOptionsText).toContain('device-003');

      // Verify unauthorized device is NOT in the dropdown
      expect(allOptionsText).not.toContain('999999999999999');
      expect(allOptionsText).not.toContain('device-002');
    });

    it('should show no devices in dropdown for PARENTS user with no assigned IMEIs', async () => {
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

      // Set location with no IMEI parameter
      setMockLocation('');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for error message to appear (no authorized devices)
      await waitFor(() => {
        const messages = screen.getAllByText('No authorized devices available for your account.');
        expect(messages.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // Verify no device selector dropdown is shown (no devices available)
      const dropdown = screen.queryByRole('combobox');
      expect(dropdown).not.toBeInTheDocument();

      // Verify message about no authorized devices appears at least once
      const messages = screen.getAllByText('No authorized devices available for your account.');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should block access to unauthorized device for PARENTS user', async () => {
      // Setup PARENTS user context with single IMEI
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        uniqueId: 'parent999',
        email: 'parent4@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      // Try to access unauthorized device via URL
      setMockLocation('?imei=999999999999999');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for unauthorized access error
      await waitFor(() => {
        expect(screen.getByText('Unauthorized Device Access')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify access denied message
      expect(screen.getByText(/Access denied: Device 999999999999999 is not authorized for your account/i)).toBeInTheDocument();

      // Verify device selector shows only authorized device
      const dropdown = screen.getByRole('combobox');
      const options = dropdown.querySelectorAll('option');
      const deviceOptions = Array.from(options).filter(opt => opt.value !== '');
      
      expect(deviceOptions).toHaveLength(1);
      expect(deviceOptions[0].value).toBe('123456789012345');
    });

    it('should allow access to authorized device for PARENTS user', async () => {
      // Setup PARENTS user context with single IMEI
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        uniqueId: 'parent111',
        email: 'parent5@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      // Access authorized device via URL
      setMockLocation('?imei=123456789012345');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for telemetry data to load
      await waitFor(() => {
        expect(getAnalyticsByImei).toHaveBeenCalledWith('123456789012345');
      }, { timeout: 3000 });

      // Verify no error message is shown
      expect(screen.queryByText('Unauthorized Device Access')).not.toBeInTheDocument();
      expect(screen.queryByText('Access denied')).not.toBeInTheDocument();

      // Verify telemetry page content is displayed
      await waitFor(() => {
        expect(screen.getByText('Data Telemetry')).toBeInTheDocument();
      });
    });
  });

  describe('ADMIN user device dropdown filtering', () => {
    it('should show all devices in dropdown for ADMIN user', async () => {
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

      // Set location to show error state with device selector (invalid IMEI format)
      setMockLocation('?imei=invalid');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for error message to appear (invalid IMEI format)
      await waitFor(() => {
        expect(screen.getByText('Invalid Device IMEI')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device selector dropdown is present
      await waitFor(() => {
        const dropdown = screen.getByRole('combobox');
        expect(dropdown).toBeInTheDocument();
      });

      // Get the dropdown element
      const dropdown = screen.getByRole('combobox');
      const options = dropdown.querySelectorAll('option');

      // Verify ALL devices appear in dropdown for ADMIN (plus the "Choose a device..." option)
      expect(options).toHaveLength(4); // 1 placeholder + 3 devices

      // Verify all device IMEIs are in the dropdown
      const deviceOptions = Array.from(options).filter(opt => opt.value !== '');
      expect(deviceOptions).toHaveLength(3);
      
      const deviceValues = deviceOptions.map(opt => opt.value);
      expect(deviceValues).toContain('123456789012345');
      expect(deviceValues).toContain('999999999999999');
      expect(deviceValues).toContain('111111111111111');

      // Verify all device topics are shown
      const allOptionsText = Array.from(options).map(opt => opt.textContent).join(' ');
      expect(allOptionsText).toContain('device-001');
      expect(allOptionsText).toContain('device-002');
      expect(allOptionsText).toContain('device-003');
    });

    it('should allow ADMIN user to access any device', async () => {
      // Setup ADMIN user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
        uniqueId: 'admin456',
        email: 'admin2@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      // Access any device via URL
      setMockLocation('?imei=999999999999999');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for telemetry data to load
      await waitFor(() => {
        expect(getAnalyticsByImei).toHaveBeenCalledWith('999999999999999');
      }, { timeout: 3000 });

      // Verify no error message is shown
      expect(screen.queryByText('Unauthorized Device Access')).not.toBeInTheDocument();
      expect(screen.queryByText('Access denied')).not.toBeInTheDocument();

      // Verify telemetry page content is displayed
      await waitFor(() => {
        expect(screen.getByText('Data Telemetry')).toBeInTheDocument();
      });
    });

    it('should show all devices in dropdown for ADMIN user even with IMEIs assigned', async () => {
      // Setup ADMIN user context with IMEIs (should be ignored)
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: ['123456789012345'], // ADMIN with IMEIs - should be ignored
        uniqueId: 'admin789',
        email: 'admin3@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      // Set location to show error state with device selector (invalid IMEI format)
      setMockLocation('?imei=invalid');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid Device IMEI')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify device selector dropdown is present
      await waitFor(() => {
        const dropdown = screen.getByRole('combobox');
        expect(dropdown).toBeInTheDocument();
      });

      // Get the dropdown element
      const dropdown = screen.getByRole('combobox');
      const options = dropdown.querySelectorAll('option');

      // Verify ALL devices appear in dropdown (IMEIs ignored for ADMIN)
      expect(options).toHaveLength(4); // 1 placeholder + 3 devices

      // Verify all device IMEIs are in the dropdown
      const deviceOptions = Array.from(options).filter(opt => opt.value !== '');
      expect(deviceOptions).toHaveLength(3);
      
      const deviceValues = deviceOptions.map(opt => opt.value);
      expect(deviceValues).toContain('123456789012345');
      expect(deviceValues).toContain('999999999999999');
      expect(deviceValues).toContain('111111111111111');
    });
  });

  describe('Case-insensitive IMEI matching', () => {
    it('should perform case-insensitive IMEI matching for PARENTS user', async () => {
      // Setup PARENTS user context with lowercase IMEI
      setMockUserContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'], // lowercase in context
        uniqueId: 'parent222',
        email: 'parent6@example.com',
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

      // Access device with uppercase IMEI
      setMockLocation('?imei=123456789012345');

      render(
        <BrowserRouter>
          <Telemetry />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for telemetry data to load
      await waitFor(() => {
        expect(getAnalyticsByImei).toHaveBeenCalledWith('123456789012345');
      }, { timeout: 3000 });

      // Verify no error message is shown (case-insensitive match succeeded)
      expect(screen.queryByText('Unauthorized Device Access')).not.toBeInTheDocument();
      expect(screen.queryByText('Access denied')).not.toBeInTheDocument();

      // Verify telemetry page content is displayed
      await waitFor(() => {
        expect(screen.getByText('Data Telemetry')).toBeInTheDocument();
      });
    });
  });
});
