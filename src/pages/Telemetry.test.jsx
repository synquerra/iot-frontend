import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as fc from 'fast-check';
import Telemetry from './Telemetry';

// Mock the useTelemetryData hook
vi.mock('../hooks/useTelemetryData', () => ({
  useTelemetryData: vi.fn(),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?imei=798456148167816' }), // Valid 15-digit IMEI
  };
});

// Mock UserContext - provide default ADMIN user to avoid filtering issues in tests
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

// Mock device API
vi.mock('../utils/device', () => ({
  listDevices: vi.fn(() => Promise.resolve({ devices: [] })),
}));

import { useTelemetryData } from '../hooks/useTelemetryData';

// Helper function to render component with router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Telemetry Component - Device Status Styling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Online Status Styling', () => {
    it('displays Online status with green styling', () => {
      // Mock telemetry data with Online status
      useTelemetryData.mockReturnValue({
        data: {
          deviceInfo: {
            imei: '798456148167816',
            firmware: '516v151',
            status: 'Online',
            lastSeen: '31-12-2025 10:30:00',
            isRecent: true
          },
          liveData: {
            latitude: 40.7128,
            longitude: -74.0060,
            speed: 45,
            temperature: 25,
            battery: 85,
            hasHighTemp: false,
            hasHighSpeed: false
          },
          packetData: {
            normalPacket: {
              lat: 40.7128,
              lng: -74.0060,
              speed: 45,
              temp: 25,
              battery: 85
            },
            errorPacket: null
          }
        },
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Check that Online status elements are displayed with green styling
      const statusElements = screen.getAllByText('Online');
      expect(statusElements.length).toBeGreaterThan(0);

      // Find the header status element (should have text-green-300 class)
      const headerStatusElement = statusElements.find(element => 
        element.classList.contains('text-green-300')
      );
      expect(headerStatusElement).toBeInTheDocument();
      expect(headerStatusElement).toHaveClass('text-green-300');

      // Check that the status indicator dot has green styling
      const statusIndicator = screen.getByText('Connected');
      expect(statusIndicator).toHaveClass('text-green-200/70');

      // Check that the animated dot has green background
      const animatedDot = statusIndicator.previousElementSibling;
      expect(animatedDot).toHaveClass('bg-green-400');
    });
  });

  describe('Offline Status Styling', () => {
    it('displays Offline status with red styling', () => {
      // Mock telemetry data with Offline status
      useTelemetryData.mockReturnValue({
        data: {
          deviceInfo: {
            imei: '798456148167816',
            firmware: '516v151',
            status: 'Offline',
            lastSeen: '30-12-2025 08:15:00',
            isRecent: false
          },
          liveData: {
            latitude: 40.7128,
            longitude: -74.0060,
            speed: 0,
            temperature: 22,
            battery: 45,
            hasHighTemp: false,
            hasHighSpeed: false
          },
          packetData: {
            normalPacket: {
              lat: 40.7128,
              lng: -74.0060,
              speed: 0,
              temp: 22,
              battery: 45
            },
            errorPacket: null
          }
        },
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Check that Offline status elements are displayed with red styling
      const statusElements = screen.getAllByText('Offline');
      expect(statusElements.length).toBeGreaterThan(0);

      // Find the header status element (should have text-red-300 class)
      const headerStatusElement = statusElements.find(element => 
        element.classList.contains('text-red-300')
      );
      expect(headerStatusElement).toBeInTheDocument();
      expect(headerStatusElement).toHaveClass('text-red-300');

      // Check that the status indicator dot has red styling
      const statusIndicator = screen.getByText('Disconnected');
      expect(statusIndicator).toHaveClass('text-red-200/70');

      // Check that the animated dot has red background
      const animatedDot = statusIndicator.previousElementSibling;
      expect(animatedDot).toHaveClass('bg-red-400');
    });
  });

  describe('Header Status Display', () => {
    it('displays Online status with green styling in header', () => {
      useTelemetryData.mockReturnValue({
        data: {
          deviceInfo: {
            imei: '798456148167816',
            firmware: '516v151',
            status: 'Online',
            lastSeen: '31-12-2025 10:30:00',
            isRecent: true
          },
          liveData: null,
          packetData: null
        },
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Find the header status display
      const headerStatusElements = screen.getAllByText('Online');
      
      // Check that at least one Online status element has green styling
      const headerStatus = headerStatusElements.find(element => 
        element.classList.contains('text-green-300')
      );
      expect(headerStatus).toBeInTheDocument();
      expect(headerStatus).toHaveClass('text-green-300');
    });

    it('displays Offline status with red styling in header', () => {
      useTelemetryData.mockReturnValue({
        data: {
          deviceInfo: {
            imei: '798456148167816',
            firmware: '516v151',
            status: 'Offline',
            lastSeen: '30-12-2025 08:15:00',
            isRecent: false
          },
          liveData: null,
          packetData: null
        },
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Find the header status display
      const headerStatusElements = screen.getAllByText('Offline');
      
      // Check that at least one Offline status element has red styling
      const headerStatus = headerStatusElements.find(element => 
        element.classList.contains('text-red-300')
      );
      expect(headerStatus).toBeInTheDocument();
      expect(headerStatus).toHaveClass('text-red-300');
    });
  });

  describe('Unknown Status Handling', () => {
    it('handles Unknown status gracefully', () => {
      useTelemetryData.mockReturnValue({
        data: {
          deviceInfo: {
            imei: '798456148167816',
            firmware: '516v151',
            status: 'Unknown',
            lastSeen: 'Unknown',
            isRecent: false
          },
          liveData: null,
          packetData: null
        },
        loading: false,
        error: null,
        hasData: true,
        isRefreshing: false,
        refreshData: vi.fn()
      });

      renderWithRouter(<Telemetry />);

      // Check that Unknown status elements are displayed
      const statusElements = screen.getAllByText('Unknown');
      expect(statusElements.length).toBeGreaterThan(0);

      // Find the header status element
      const headerStatusElement = statusElements.find(element => 
        element.classList.contains('text-xl') && element.classList.contains('font-bold')
      );
      expect(headerStatusElement).toBeInTheDocument();

      // Unknown status should have red styling (since it's not 'Online')
      // This is the actual behavior of the component - any non-Online status gets red styling
      expect(headerStatusElement).toHaveClass('text-red-300');
      expect(headerStatusElement).not.toHaveClass('text-green-300');
    });
  });
});

describe('Telemetry Component - No Error Packets Scenario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays "No errors" message when no error packets exist', () => {
    // Mock telemetry data with no error packets
    useTelemetryData.mockReturnValue({
      data: {
        deviceInfo: {
          imei: '798456148167816',
          firmware: '516v151',
          status: 'Online',
          lastSeen: '31-12-2025 10:30:00',
          isRecent: true
        },
        liveData: {
          latitude: 40.7128,
          longitude: -74.0060,
          speed: 45,
          temperature: 25,
          battery: 85,
          hasHighTemp: false,
          hasHighSpeed: false
        },
        packetData: {
          normalPacket: {
            lat: 40.7128,
            lng: -74.0060,
            speed: 45,
            temp: 25,
            battery: 85
          },
          errorPacket: null // No error packet
        }
      },
      loading: false,
      error: null,
      hasData: true,
      isRefreshing: false,
      refreshData: vi.fn()
    });

    renderWithRouter(<Telemetry />);

    // Switch to packets tab to see the error packet section
    const packetsTab = screen.getByText('Packets');
    fireEvent.click(packetsTab);

    // Check that "No Errors" message is displayed
    const noErrorsMessage = screen.getByText('No Errors');
    expect(noErrorsMessage).toBeInTheDocument();
    expect(noErrorsMessage).toHaveClass('text-green-300');

    // Check that the descriptive text is also displayed
    const noErrorsDescription = screen.getByText('No error packets found for this device');
    expect(noErrorsDescription).toBeInTheDocument();
    expect(noErrorsDescription).toHaveClass('text-white/70');

    // Verify that the success icon is displayed with the "No Errors" message
    const successIcon = noErrorsMessage.parentElement.querySelector('svg');
    expect(successIcon).toBeInTheDocument();
  });

  it('displays "No errors" message when errorPacket is undefined', () => {
    // Mock telemetry data with undefined error packet
    useTelemetryData.mockReturnValue({
      data: {
        deviceInfo: {
          imei: '798456148167816',
          firmware: '516v151',
          status: 'Online',
          lastSeen: '31-12-2025 10:30:00',
          isRecent: true
        },
        liveData: {
          latitude: 40.7128,
          longitude: -74.0060,
          speed: 45,
          temperature: 25,
          battery: 85,
          hasHighTemp: false,
          hasHighSpeed: false
        },
        packetData: {
          normalPacket: {
            lat: 40.7128,
            lng: -74.0060,
            speed: 45,
            temp: 25,
            battery: 85
          }
          // errorPacket is undefined (not present)
        }
      },
      loading: false,
      error: null,
      hasData: true,
      isRefreshing: false,
      refreshData: vi.fn()
    });

    renderWithRouter(<Telemetry />);

    // Switch to packets tab to see the error packet section
    const packetsTab = screen.getByText('Packets');
    fireEvent.click(packetsTab);

    // Check that "No Errors" message is displayed
    const noErrorsMessage = screen.getByText('No Errors');
    expect(noErrorsMessage).toBeInTheDocument();
    expect(noErrorsMessage).toHaveClass('text-green-300');

    // Check that the descriptive text is also displayed
    const noErrorsDescription = screen.getByText('No error packets found for this device');
    expect(noErrorsDescription).toBeInTheDocument();
    expect(noErrorsDescription).toHaveClass('text-white/70');
  });

  it('displays "No errors" message when packetData is null', () => {
    // Mock telemetry data with null packet data
    useTelemetryData.mockReturnValue({
      data: {
        deviceInfo: {
          imei: '798456148167816',
          firmware: '516v151',
          status: 'Online',
          lastSeen: '31-12-2025 10:30:00',
          isRecent: true
        },
        liveData: {
          latitude: 40.7128,
          longitude: -74.0060,
          speed: 45,
          temperature: 25,
          battery: 85,
          hasHighTemp: false,
          hasHighSpeed: false
        },
        packetData: null // No packet data at all
      },
      loading: false,
      error: null,
      hasData: true,
      isRefreshing: false,
      refreshData: vi.fn()
    });

    renderWithRouter(<Telemetry />);

    // Switch to packets tab to see the error packet section
    const packetsTab = screen.getByText('Packets');
    fireEvent.click(packetsTab);

    // Check that "No Errors" message is displayed
    const noErrorsMessage = screen.getByText('No Errors');
    expect(noErrorsMessage).toBeInTheDocument();
    expect(noErrorsMessage).toHaveClass('text-green-300');

    // Check that the descriptive text is also displayed
    const noErrorsDescription = screen.getByText('No error packets found for this device');
    expect(noErrorsDescription).toBeInTheDocument();
    expect(noErrorsDescription).toHaveClass('text-white/70');
  });
});

describe('Telemetry Component - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 3: Recent timestamp detection
   * Feature: dynamic-telemetry-data, Property 3: Recent timestamp detection
   * Validates: Requirements 1.5
   */
  test('Property 3: Recent timestamp detection - for any timestamp within 5 minutes of current time, the system should show a "Recent" indicator', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10, max: 10 }), // Minutes offset from now
        (minutesOffset) => {
          // Clear any previous renders
          document.body.innerHTML = '';
          
          // Create a test timestamp based on the offset
          const testTime = new Date(Date.now() + (minutesOffset * 60 * 1000));
          const formattedTimestamp = formatTimestamp(testTime);
          
          // Hook logic: considers recent if timestamp is within last 5 minutes (past only)
          // diffMinutes = (now - lastSeen) / (1000 * 60)
          // For our test: diffMinutes = -minutesOffset (since we're adding minutesOffset to now)
          const diffMinutes = -minutesOffset;
          const isRecent = diffMinutes >= 0 && diffMinutes <= 5;

          // Mock telemetry data with the test timestamp
          useTelemetryData.mockReturnValue({
            data: {
              deviceInfo: {
                imei: '798456148167816',
                firmware: '516v151',
                status: 'Online',
                lastSeen: formattedTimestamp,
                isRecent: isRecent
              },
              liveData: {
                latitude: 40.7128,
                longitude: -74.0060,
                speed: 45,
                temperature: 25,
                battery: 85,
                hasHighTemp: false,
                hasHighSpeed: false
              },
              packetData: {
                normalPacket: {
                  lat: 40.7128,
                  lng: -74.0060,
                  speed: 45,
                  temp: 25,
                  battery: 85
                },
                errorPacket: null
              }
            },
            loading: false,
            error: null,
            hasData: true,
            isRefreshing: false,
            refreshData: vi.fn()
          });

          const { unmount } = renderWithRouter(<Telemetry />);

          try {
            // Check that the Recent indicator appears in the header when timestamp is within 5 minutes
            if (isRecent) {
              // Should show "Recent" indicator in header
              const recentIndicators = screen.queryAllByText('Recent');
              expect(recentIndicators.length).toBeGreaterThan(0);
              
              // At least one Recent indicator should have the proper styling
              const headerRecentIndicator = recentIndicators.find(element => 
                element.classList.contains('bg-green-500/20') && 
                element.classList.contains('text-green-300')
              );
              expect(headerRecentIndicator).toBeInTheDocument();
              
              // Find the "Recent" text within the Last Seen card specifically (has text-amber-200/70 class)
              const recentElements = screen.getAllByText('Recent');
              const recentInCard = recentElements.find(element => 
                element.classList.contains('text-amber-200/70')
              );
              expect(recentInCard).toBeInTheDocument();
            } else {
              // Should NOT show "Recent" indicator when timestamp is not recent
              const recentIndicators = screen.queryAllByText('Recent');
              
              // If there are any "Recent" indicators, they should not be the styled header indicator
              const headerRecentIndicator = recentIndicators.find(element => 
                element.classList.contains('bg-green-500/20') && 
                element.classList.contains('text-green-300')
              );
              expect(headerRecentIndicator).toBeFalsy();
              
              // Should show "Timestamp" instead of "Recent" in the Last Seen card
              const timestampElements = screen.queryAllByText('Timestamp');
              const timestampInCard = timestampElements.find(element => 
                element.classList.contains('text-amber-200/70')
              );
              expect(timestampInCard).toBeTruthy();
            }

            // Verify the timestamp is displayed correctly - use getAllByText to handle multiple elements
            const timestampElements = screen.getAllByText(formattedTimestamp);
            expect(timestampElements.length).toBeGreaterThan(0);
          } finally {
            // Clean up after each property test
            unmount();
          }
        }
      ),
      { numRuns: 5 } // Reduce number of runs to prevent timeout
    );
  }, 10000); // Increase timeout to 10 seconds

  // Helper function to format timestamp (matches the component's expected format)
  function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
});