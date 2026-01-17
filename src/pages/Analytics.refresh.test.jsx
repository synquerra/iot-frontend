import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Analytics from './Analytics';
import * as deviceFiltered from '../utils/deviceFiltered';
import * as useDeviceFilterModule from '../hooks/useDeviceFilter';

// Mock the dependencies
vi.mock('../utils/deviceFiltered');
vi.mock('../hooks/useDeviceFilter');

describe('Analytics - Refresh Functionality', () => {
  const mockDevices = [
    { id: 1, name: 'Device 1', status: 'active', interval: '30s' },
    { id: 2, name: 'Device 2', status: 'inactive', interval: '-' },
    { id: 3, name: 'Device 3', status: 'active', interval: '60s' },
  ];

  beforeEach(() => {
    // Mock useDeviceFilter hook
    vi.spyOn(useDeviceFilterModule, 'useDeviceFilter').mockReturnValue({
      filterDevices: (devices) => devices,
      shouldFilterDevices: () => false,
    });

    // Mock listDevicesFiltered
    vi.spyOn(deviceFiltered, 'listDevicesFiltered').mockResolvedValue({
      devices: mockDevices,
    });

    // Mock visibility API
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should refresh data when refresh button is clicked', async () => {
    render(<Analytics />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Should show refreshing state
    await waitFor(() => {
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });

    // Should complete refresh
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    // API should be called twice (initial + refresh)
    expect(deviceFiltered.listDevicesFiltered).toHaveBeenCalledTimes(2);
  });

  it('should disable refresh button during refresh', async () => {
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Button should be disabled during refresh
    await waitFor(() => {
      expect(refreshButton).toBeDisabled();
    });

    // Button should be enabled after refresh
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('should handle API errors gracefully', async () => {
    render(<Analytics />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    // Mock API failure for refresh
    vi.spyOn(deviceFiltered, 'listDevicesFiltered').mockRejectedValueOnce(
      new Error('API Error')
    );

    // Click refresh to trigger error
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to refresh data/i)).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should update timestamp after successful refresh', async () => {
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    // Mock Date to control time
    const originalDate = Date;
    let currentTime = new Date('2024-01-01T12:00:00').getTime();
    
    global.Date = class extends originalDate {
      constructor(...args) {
        if (args.length === 0) {
          super(currentTime);
        } else {
          super(...args);
        }
      }
      
      static now() {
        return currentTime;
      }
      
      toLocaleTimeString(...args) {
        return new originalDate(currentTime).toLocaleTimeString(...args);
      }
    };

    // Get initial timestamp - find the text that contains the time
    const getTimestamp = () => {
      const footerText = screen.getByText(/Analytics data is updated every 30 seconds/i);
      const parent = footerText.parentElement;
      const timeSpan = parent.querySelector('span');
      return timeSpan ? timeSpan.textContent : '';
    };

    const initialTimestamp = getTimestamp();

    // Advance time by 2 seconds
    currentTime += 2000;

    // Click refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    // Timestamp should be updated
    const newTimestamp = getTimestamp();
    expect(newTimestamp).not.toBe(initialTimestamp);
    
    // Restore original Date
    global.Date = originalDate;
  });

  it('should update device metrics after refresh', async () => {
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    // Should show correct initial metrics
    expect(screen.getByText('3')).toBeInTheDocument(); // Total devices
    expect(screen.getByText('2')).toBeInTheDocument(); // Active devices

    // Mock updated data
    const updatedDevices = [
      ...mockDevices,
      { id: 4, name: 'Device 4', status: 'active', interval: '30s' },
    ];
    vi.spyOn(deviceFiltered, 'listDevicesFiltered').mockResolvedValueOnce({
      devices: updatedDevices,
    });

    // Refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument(); // Updated total
    });
  });

  it('should preserve previous data on refresh failure', async () => {
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    // Verify initial data is displayed
    expect(screen.getByText('3')).toBeInTheDocument();

    // Mock API failure for refresh
    vi.spyOn(deviceFiltered, 'listDevicesFiltered').mockRejectedValueOnce(
      new Error('Network error')
    );

    // Try to refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to refresh data/i)).toBeInTheDocument();
    });

    // Previous data should still be visible
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should clear error on successful retry', async () => {
    render(<Analytics />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });

    // Mock API failure for refresh
    vi.spyOn(deviceFiltered, 'listDevicesFiltered').mockRejectedValueOnce(
      new Error('API Error')
    );

    // Trigger refresh to cause error
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to refresh data/i)).toBeInTheDocument();
    });

    // Mock successful API call for retry
    vi.spyOn(deviceFiltered, 'listDevicesFiltered').mockResolvedValueOnce({
      devices: mockDevices,
    });

    // Click retry
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Failed to refresh data/i)).not.toBeInTheDocument();
    });
  });
});
