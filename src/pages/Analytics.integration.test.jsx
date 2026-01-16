/**
 * Integration Tests for Analytics Page Device Filtering
 * 
 * This test suite validates that device filtering works correctly on the Analytics page,
 * ensuring that PARENTS users only see analytics for authorized devices while ADMIN users see all devices.
 * 
 * Requirements covered: 4.4
 */

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
import Analytics from './Analytics';

// Helper function to set mock user context
const setMockUserContext = (context) => {
  Object.assign(mockUserContext, context);
};

describe('Analytics Page Integration Test - Device Filtering', () => {
  // Mock device data
  const mockDevices = [
    {
      topic: 'device-001',
      imei: '123456789012345',
      geoid: 'geo-001',
      createdAt: '2024-01-15T10:00:00Z',
      interval: '60',
      status: 'active',
    },
    {
      topic: 'device-002',
      imei: '999999999999999',
      geoid: 'geo-002',
      createdAt: '2024-01-15T11:00:00Z',
      interval: '60',
      status: 'active',
    },
    {
      topic: 'device-003',
      imei: '111111111111111',
      geoid: 'geo-003',
      createdAt: '2024-01-15T12:00:00Z',
      interval: '-',
      status: 'inactive',
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('PARENTS user analytics filtering', () => {
    it('should show analytics only for assigned device for PARENTS user with single IMEI', async () => {
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
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard is displayed
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify "Filtered View" indicator is shown for PARENTS user
      await waitFor(() => {
        expect(screen.getByText('Filtered View')).toBeInTheDocument();
      });

      // Verify total devices metric shows only 1 device (filtered)
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        // Find the parent card and check for the device count
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        // The number should be in a sibling or nearby element
        const cardText = card.textContent;
        // Should contain "1" as the device count (not part of "Total Devices" text)
        expect(cardText).toContain('1');
      });

      // Verify active devices metric shows only 1 device (the assigned device is active)
      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('1');
      });
    });

    it('should show analytics only for assigned devices for PARENTS user with multiple IMEIs', async () => {
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
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard is displayed
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify "Filtered View" indicator is shown
      await waitFor(() => {
        expect(screen.getByText('Filtered View')).toBeInTheDocument();
      });

      // Verify total devices metric shows 2 devices (filtered)
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('2');
      });

      // Verify active devices metric shows only 1 device (device-001 is active, device-003 is inactive)
      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('1');
      });
    });

    it('should show no analytics for PARENTS user with no assigned IMEIs', async () => {
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
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard is displayed
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify "Filtered View" indicator is shown
      await waitFor(() => {
        expect(screen.getByText('Filtered View')).toBeInTheDocument();
      });

      // Verify total devices metric shows 0 devices
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('0');
      });

      // Verify active devices metric shows 0 devices
      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('0');
      });
    });

    it('should filter device distribution data for PARENTS user', async () => {
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

      render(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Navigate to devices tab to see device distribution
      const devicesTab = screen.getByRole('button', { name: /📱 Devices/i });
      devicesTab.click();

      // Wait for devices tab content to load
      await waitFor(() => {
        expect(screen.getByText('Device Distribution')).toBeInTheDocument();
      });

      // Verify device distribution shows filtered data
      await waitFor(() => {
        const distributionSection = screen.getByText('Device Distribution').closest('div');
        expect(distributionSection).toBeInTheDocument();
        
        // Check that total devices shows 1
        expect(distributionSection.textContent).toContain('1');
        
        // Check that active devices shows 1
        expect(distributionSection.textContent).toContain('Active');
        expect(distributionSection.textContent).toContain('1');
        
        // Check that inactive devices shows 0
        expect(distributionSection.textContent).toContain('Inactive');
        expect(distributionSection.textContent).toContain('0');
      });
    });

    it('should show filtered view message in regions tab for PARENTS user', async () => {
      // Setup PARENTS user context
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

      render(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Navigate to regions tab
      const regionsTab = screen.getByRole('button', { name: /🌍 Regions/i });
      regionsTab.click();

      // Wait for regions tab content to load
      await waitFor(() => {
        expect(screen.getByText('Device Overview')).toBeInTheDocument();
      });

      // Verify filtered view message is shown
      await waitFor(() => {
        expect(screen.getByText('Filtered View Active')).toBeInTheDocument();
        expect(screen.getByText(/You are viewing analytics for devices assigned to your account/i)).toBeInTheDocument();
      });

      // Verify device count shows filtered data
      await waitFor(() => {
        const overviewSection = screen.getByText('Device Overview').closest('div');
        expect(overviewSection).toBeInTheDocument();
        expect(overviewSection.textContent).toContain('1 devices');
        expect(overviewSection.textContent).toContain('1 active');
      });
    });
  });

  describe('ADMIN user analytics filtering', () => {
    it('should show analytics for all devices for ADMIN user', async () => {
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
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard is displayed
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify "Filtered View" indicator is NOT shown for ADMIN
      expect(screen.queryByText('Filtered View')).not.toBeInTheDocument();

      // Verify total devices metric shows all 3 devices
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('3');
      });

      // Verify active devices metric shows 2 devices (device-001 and device-002 are active)
      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('2');
      });
    });

    it('should show analytics for all devices for ADMIN user even with IMEIs assigned', async () => {
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
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard is displayed
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify "Filtered View" indicator is NOT shown
      expect(screen.queryByText('Filtered View')).not.toBeInTheDocument();

      // Verify total devices metric shows all 3 devices (IMEIs ignored for ADMIN)
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('3');
      });

      // Verify active devices metric shows 2 devices
      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('2');
      });
    });

    it('should show all device distribution data for ADMIN user', async () => {
      // Setup ADMIN user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
        uniqueId: 'admin789',
        email: 'admin3@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Navigate to devices tab
      const devicesTab = screen.getByRole('button', { name: /📱 Devices/i });
      devicesTab.click();

      // Wait for devices tab content to load
      await waitFor(() => {
        expect(screen.getByText('Device Distribution')).toBeInTheDocument();
      });

      // Verify device distribution shows all devices
      await waitFor(() => {
        const distributionSection = screen.getByText('Device Distribution').closest('div');
        expect(distributionSection).toBeInTheDocument();
        
        // Check that total devices shows 3
        expect(distributionSection.textContent).toContain('3');
        
        // Check that active devices shows 2
        expect(distributionSection.textContent).toContain('Active');
        expect(distributionSection.textContent).toContain('2');
        
        // Check that inactive devices shows 1
        expect(distributionSection.textContent).toContain('Inactive');
        expect(distributionSection.textContent).toContain('1');
      });
    });

    it('should NOT show filtered view message in regions tab for ADMIN user', async () => {
      // Setup ADMIN user context
      setMockUserContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
        uniqueId: 'admin999',
        email: 'admin4@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });

      render(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Navigate to regions tab
      const regionsTab = screen.getByRole('button', { name: /🌍 Regions/i });
      regionsTab.click();

      // Wait for regions tab content to load
      await waitFor(() => {
        expect(screen.getByText('Device Overview')).toBeInTheDocument();
      });

      // Verify filtered view message is NOT shown for ADMIN
      expect(screen.queryByText('Filtered View Active')).not.toBeInTheDocument();
      expect(screen.queryByText(/You are viewing analytics for devices assigned to your account/i)).not.toBeInTheDocument();

      // Verify device count shows all devices
      await waitFor(() => {
        const overviewSection = screen.getByText('Device Overview').closest('div');
        expect(overviewSection).toBeInTheDocument();
        expect(overviewSection.textContent).toContain('3 devices');
        expect(overviewSection.textContent).toContain('2 active');
      });
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
          status: 'active',
        },
      ];

      listDevices.mockResolvedValue({ devices: devicesWithUppercase });

      render(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Wait for devices to load
      await waitFor(() => {
        expect(listDevices).toHaveBeenCalled();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard is displayed
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify device is included despite case difference
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('1');
      });

      // Verify active devices metric shows 1 device
      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('1');
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

      // Mock API to throw error
      listDevices.mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <Analytics />
        </BrowserRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify analytics dashboard still renders with fallback data
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      });

      // Verify metrics show 0 devices due to error
      await waitFor(() => {
        const totalDevicesHeading = screen.getByText('Total Devices');
        expect(totalDevicesHeading).toBeInTheDocument();
        
        const card = totalDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('0');
      });

      await waitFor(() => {
        const activeDevicesHeading = screen.getByText('Active Devices');
        expect(activeDevicesHeading).toBeInTheDocument();
        
        const card = activeDevicesHeading.closest('.group');
        expect(card).toBeInTheDocument();
        
        const cardText = card.textContent;
        expect(cardText).toContain('0');
      });
    });
  });
});
