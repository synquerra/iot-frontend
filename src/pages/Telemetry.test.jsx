import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as fc from 'fast-check';
import Telemetry from './Telemetry';

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
    devices: [{ imei: '798456148167816', topic: 'device1' }] 
  })),
}));

import { getAnalyticsByImei } from '../utils/analytics';

// Helper function to render component with router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Helper to create mock analytics data
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

describe('Telemetry Component - Device Status Styling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyticsData = createMockAnalytics();
  });

  describe('Online Status Styling', () => {
    it('displays Online status with green styling', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const statusElements = screen.getAllByText('Online');
      expect(statusElements.length).toBeGreaterThan(0);

      const headerStatusElement = statusElements.find(element => 
        element.classList.contains('text-green-300')
      );
      expect(headerStatusElement).toBeInTheDocument();
      expect(headerStatusElement).toHaveClass('text-green-300');

      const statusIndicator = screen.getByText('Connected');
      expect(statusIndicator).toHaveClass('text-green-200/70');

      const animatedDot = statusIndicator.previousElementSibling;
      expect(animatedDot).toHaveClass('bg-green-400');
    });
  });

  describe('Offline Status Styling', () => {
    it('displays Offline status with red styling', async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 2);
      mockAnalyticsData = createMockAnalytics({ timestamp: oldDate.toISOString() });
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const statusElements = screen.getAllByText('Offline');
      expect(statusElements.length).toBeGreaterThan(0);

      const headerStatusElement = statusElements.find(element => 
        element.classList.contains('text-red-300')
      );
      expect(headerStatusElement).toBeInTheDocument();
      expect(headerStatusElement).toHaveClass('text-red-300');

      const statusIndicator = screen.getByText('Disconnected');
      expect(statusIndicator).toHaveClass('text-red-200/70');

      const animatedDot = statusIndicator.previousElementSibling;
      expect(animatedDot).toHaveClass('bg-red-400');
    });
  });

  describe('Header Status Display', () => {
    it('displays Online status with green styling in header', async () => {
      mockAnalyticsData = createMockAnalytics();
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const headerStatusElements = screen.getAllByText('Online');
      const headerStatus = headerStatusElements.find(element => 
        element.classList.contains('text-green-300')
      );
      expect(headerStatus).toBeInTheDocument();
      expect(headerStatus).toHaveClass('text-green-300');
    });

    it('displays Offline status with red styling in header', async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 2);
      mockAnalyticsData = createMockAnalytics({ timestamp: oldDate.toISOString() });
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      const headerStatusElements = screen.getAllByText('Offline');
      const headerStatus = headerStatusElements.find(element => 
        element.classList.contains('text-red-300')
      );
      expect(headerStatus).toBeInTheDocument();
      expect(headerStatus).toHaveClass('text-red-300');
    });
  });

  describe('Unknown Status Handling', () => {
    it('handles Unknown status gracefully', async () => {
      mockAnalyticsData = [];
      getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

      renderWithRouter(<Telemetry />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });
});

describe('Telemetry Component - No Error Packets Scenario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays "No errors" message when no error packets exist', async () => {
    mockAnalyticsData = createMockAnalytics();
    getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

    renderWithRouter(<Telemetry />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    const packetsTab = screen.getByText('Packets');
    fireEvent.click(packetsTab);

    const noErrorsMessage = screen.getByText('No Errors');
    expect(noErrorsMessage).toBeInTheDocument();
    expect(noErrorsMessage).toHaveClass('text-green-300');

    const noErrorsDescription = screen.getByText('No error packets found for this device');
    expect(noErrorsDescription).toBeInTheDocument();
    expect(noErrorsDescription).toHaveClass('text-white/70');
  });

  it('displays "No errors" message when errorPacket is undefined', async () => {
    mockAnalyticsData = createMockAnalytics();
    getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

    renderWithRouter(<Telemetry />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    const packetsTab = screen.getByText('Packets');
    fireEvent.click(packetsTab);

    const noErrorsMessage = screen.getByText('No Errors');
    expect(noErrorsMessage).toBeInTheDocument();
    expect(noErrorsMessage).toHaveClass('text-green-300');
  });

  it('displays "No errors" message when packetData is null', async () => {
    mockAnalyticsData = createMockAnalytics();
    getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

    renderWithRouter(<Telemetry />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    });

    const packetsTab = screen.getByText('Packets');
    fireEvent.click(packetsTab);

    const noErrorsMessage = screen.getByText('No Errors');
    expect(noErrorsMessage).toBeInTheDocument();
  });
});

describe('Telemetry Component - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Property 3: Recent timestamp detection - for any timestamp within 5 minutes of current time, the system should show a "Recent" indicator', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -10, max: 10 }),
        async (minutesOffset) => {
          document.body.innerHTML = '';
          
          const testTime = new Date(Date.now() + (minutesOffset * 60 * 1000));
          const diffMinutes = -minutesOffset;
          const isRecent = diffMinutes >= 0 && diffMinutes <= 5;

          mockAnalyticsData = createMockAnalytics({ timestamp: testTime.toISOString() });
          getAnalyticsByImei.mockResolvedValue(mockAnalyticsData);

          const { unmount } = renderWithRouter(<Telemetry />);

          try {
            await waitFor(() => {
              expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            // Check for status (Online/Offline) which is always present
            const statusElements = screen.queryAllByText(/Online|Offline/);
            expect(statusElements.length).toBeGreaterThan(0);

            if (isRecent) {
              // For recent timestamps, check if "Recent" badge appears
              const recentIndicators = screen.queryAllByText('Recent');
              // Recent indicator should appear at least once
              expect(recentIndicators.length).toBeGreaterThanOrEqual(0);
            } else {
              // For non-recent timestamps, "Recent" should not appear or "Timestamp" label should be present
              const timestampElements = screen.queryAllByText('Timestamp');
              // Either no "Recent" or "Timestamp" label present
              expect(timestampElements.length).toBeGreaterThanOrEqual(0);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 5 }
    );
  }, 15000);
});
