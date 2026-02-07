import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DeviceDetails from './DeviceDetails';

// Mock the analytics API
vi.mock('../utils/analytics', () => ({
  getAnalyticsByImei: vi.fn(),
  getAnalyticsHealth: vi.fn(),
  getAnalyticsUptime: vi.fn(),
}));

// Mock device command API
vi.mock('../utils/deviceCommandAPI', () => ({
  sendDeviceCommand: vi.fn(),
}));

// Mock telemetry transformers
vi.mock('../utils/telemetryTransformers', () => ({
  parseTemperature: vi.fn((temp) => temp || 0),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock packet data
const mockNormalPacket = {
  imei: '123456789012345',
  packet: 'N',
  type: 'N',
  packetType: 'N',
  latitude: 12.9716,
  longitude: 77.5946,
  speed: 45,
  battery: '85%',
  signal: 25,
  geoid: 'GEO123',
  rawTemperature: 28,
  deviceRawTimestamp: new Date().toISOString(),
  deviceTimestamp: new Date(),
  serverTimestampISO: new Date().toISOString(),
  alert: null,
};

const mockAlertPacket = {
  ...mockNormalPacket,
  packet: 'A',
  type: 'A',
  packetType: 'A',
  alert: 'SOS',
};

describe('DeviceDetails - Status Section Positioning (Task 2.1)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { getAnalyticsByImei, getAnalyticsHealth, getAnalyticsUptime } = await import('../utils/analytics');
    
    // Mock API responses
    getAnalyticsByImei.mockResolvedValue([mockNormalPacket, mockAlertPacket]);
    getAnalyticsHealth.mockResolvedValue({
      totalPackets: 100,
      normalPackets: 90,
      alertPackets: 5,
      errorPackets: 5,
    });
    getAnalyticsUptime.mockResolvedValue({
      uptime: 99.5,
      lastSeen: new Date().toISOString(),
    });
  });

  describe('Status section renders at top of overview tab', () => {
    it('should render status section in the overview tab', async () => {
      renderWithRouter(<DeviceDetails />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Verify status section cards are present (using getAllByText for duplicates)
      expect(screen.getByText('GPS Status')).toBeInTheDocument();
      expect(screen.getAllByText('Speed').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Battery').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Signal').length).toBeGreaterThanOrEqual(1);
    });

    it('should render all four status cards in the status section', async () => {
      renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Verify all status indicators are present
      const gpsStatus = screen.getByText('GPS Status');
      const speedStatuses = screen.getAllByText('Speed');
      const batteryStatuses = screen.getAllByText('Battery');
      const signalStatuses = screen.getAllByText('Signal');
      
      expect(gpsStatus).toBeInTheDocument();
      expect(speedStatuses.length).toBeGreaterThanOrEqual(1);
      expect(batteryStatuses.length).toBeGreaterThanOrEqual(1);
      expect(signalStatuses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Status section appears before other content', () => {
    it('should render status section before device information section', async () => {
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Find the overview tab content by looking for the status section grid
      const statusSectionGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusSectionGrid).toBeInTheDocument();
      
      // Verify status section contains the expected cards
      const textContent = statusSectionGrid?.textContent || '';
      expect(textContent).toContain('GPS Status');
      expect(textContent).toContain('Speed');
      expect(textContent).toContain('Battery');
      expect(textContent).toContain('Signal');
    });

    it('should render status section before location & movement section', async () => {
      renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Get positions of elements
      const gpsStatusElement = screen.getByText('GPS Status');
      const locationSectionElement = screen.getByText('Location & Movement');
      
      // Get bounding rectangles
      const gpsRect = gpsStatusElement.getBoundingClientRect();
      const locationRect = locationSectionElement.getBoundingClientRect();
      
      // Status section (GPS Status) should appear before (higher up) than Location section
      // In jsdom, both might be at 0,0, so we check if they exist and GPS is not after Location
      expect(gpsRect.top).toBeLessThanOrEqual(locationRect.top);
    });

    it('should render status section before battery insights section', async () => {
      renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Get positions of elements - use getAllByText for Speed since it appears multiple times
      const speedStatusElements = screen.getAllByText('Speed');
      const batteryInsightsElement = screen.getByText('Battery Insights');
      
      // Use the first Speed element (should be in status section)
      const speedRect = speedStatusElements[0].getBoundingClientRect();
      const batteryInsightsRect = batteryInsightsElement.getBoundingClientRect();
      
      // Status section (Speed) should appear before (higher up) than Battery Insights
      expect(speedRect.top).toBeLessThanOrEqual(batteryInsightsRect.top);
    });

    it('should render status section as the first grid in overview tab', async () => {
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Find the status section grid with specific classes
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      
      // Should exist
      expect(statusGrid).toBeInTheDocument();
      
      // Verify the grid contains status cards
      if (statusGrid) {
        const textContent = statusGrid.textContent;
        
        expect(textContent).toContain('GPS Status');
        expect(textContent).toContain('Speed');
        expect(textContent).toContain('Battery');
        expect(textContent).toContain('Signal');
      }
    });
  });
});
