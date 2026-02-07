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

describe('DeviceDetails - Missing Status Values (Task 3.2)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { getAnalyticsHealth, getAnalyticsUptime } = await import('../utils/analytics');
    
    // Mock health and uptime responses
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

  describe('Placeholder display for null/undefined speed', () => {
    it('should display "-" when speed is null', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithNullSpeed = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: null,
        battery: '85%',
        signal: 25,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithNullSpeed]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the speed status section and verify it contains "-"
      const speedLabels = screen.getAllByText('Speed');
      expect(speedLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid that contains speed
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check that the grid contains "-" for speed (placeholder)
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Speed');
      expect(gridText).toMatch(/-/); // Should contain dash placeholder
    });

    it('should display "-" when speed is undefined', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithUndefinedSpeed = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        // speed is undefined (not included)
        battery: '85%',
        signal: 25,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithUndefinedSpeed]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the speed status section and verify it contains "-"
      const speedLabels = screen.getAllByText('Speed');
      expect(speedLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Speed');
      expect(gridText).toMatch(/-/);
    });

    it('should display "-" when speed is NaN', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithNaNSpeed = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 'invalid',
        battery: '85%',
        signal: 25,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithNaNSpeed]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the speed status section and verify it contains "-"
      const speedLabels = screen.getAllByText('Speed');
      expect(speedLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Speed');
      expect(gridText).toMatch(/-/);
    });
  });

  describe('Placeholder display for null/undefined battery', () => {
    it('should display "-" when battery is null', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithNullBattery = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        battery: null,
        signal: 25,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithNullBattery]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the battery status section and verify it contains "-"
      const batteryLabels = screen.getAllByText('Battery');
      expect(batteryLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Battery');
      expect(gridText).toMatch(/-/);
    });

    it('should display "-" when battery is undefined', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithUndefinedBattery = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        // battery is undefined (not included)
        signal: 25,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithUndefinedBattery]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the battery status section and verify it contains "-"
      const batteryLabels = screen.getAllByText('Battery');
      expect(batteryLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Battery');
      expect(gridText).toMatch(/-/);
    });

    it('should display "-" when battery is invalid string', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithInvalidBattery = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        battery: 'invalid',
        signal: 25,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithInvalidBattery]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the battery status section and verify it contains "-"
      const batteryLabels = screen.getAllByText('Battery');
      expect(batteryLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Battery');
      expect(gridText).toMatch(/-/);
    });
  });

  describe('Placeholder display for null/undefined signal', () => {
    it('should display "-" when signal is null', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithNullSignal = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        battery: '85%',
        signal: null,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithNullSignal]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the signal status section and verify it contains "-"
      const signalLabels = screen.getAllByText('Signal');
      expect(signalLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Signal');
      expect(gridText).toMatch(/-/);
    });

    it('should display "-" when signal is undefined', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithUndefinedSignal = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        battery: '85%',
        // signal is undefined (not included)
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithUndefinedSignal]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the signal status section and verify it contains "-"
      const signalLabels = screen.getAllByText('Signal');
      expect(signalLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Signal');
      expect(gridText).toMatch(/-/);
    });

    it('should display "-" when signal is NaN', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithNaNSignal = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        battery: '85%',
        signal: 'invalid',
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithNaNSignal]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Look for the signal status section and verify it contains "-"
      const signalLabels = screen.getAllByText('Signal');
      expect(signalLabels.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check for placeholder
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Signal');
      expect(gridText).toMatch(/-/);
    });
  });

  describe('Combined missing values', () => {
    it('should handle multiple missing status values simultaneously', async () => {
      const { getAnalyticsByImei } = await import('../utils/analytics');
      
      const mockPacketWithMultipleMissingValues = {
        imei: '123456789012345',
        packet: 'N',
        type: 'N',
        packetType: 'N',
        latitude: 12.9716,
        longitude: 77.5946,
        speed: null,
        battery: null,
        signal: null,
        deviceRawTimestamp: new Date().toISOString(),
        serverTimestampISO: new Date().toISOString(),
        alert: null,
      };
      
      getAnalyticsByImei.mockResolvedValue([mockPacketWithMultipleMissingValues]);
      
      const { container } = renderWithRouter(<DeviceDetails />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Verify all status cards display placeholders
      const speedCards = screen.getAllByText('Speed');
      const batteryCards = screen.getAllByText('Battery');
      const signalCards = screen.getAllByText('Signal');
      
      expect(speedCards.length).toBeGreaterThanOrEqual(1);
      expect(batteryCards.length).toBeGreaterThanOrEqual(1);
      expect(signalCards.length).toBeGreaterThanOrEqual(1);
      
      // Find the status grid
      const statusGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(statusGrid).toBeInTheDocument();
      
      // Check that all status indicators show placeholders
      const gridText = statusGrid?.textContent || '';
      expect(gridText).toContain('Speed');
      expect(gridText).toContain('Battery');
      expect(gridText).toContain('Signal');
      // Should contain multiple dashes for the placeholders
      const dashCount = (gridText.match(/-/g) || []).length;
      expect(dashCount).toBeGreaterThanOrEqual(3); // At least 3 dashes for speed, battery, signal
    });
  });
});
