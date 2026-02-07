import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DeviceDetails from './DeviceDetails';
import * as deviceCommandAPI from '../utils/deviceCommandAPI';
import * as analytics from '../utils/analytics';

// Mock the device command API
vi.mock('../utils/deviceCommandAPI', () => ({
  sendDeviceCommand: vi.fn(),
}));

// Mock analytics utilities
vi.mock('../utils/analytics', () => ({
  getAnalyticsByImei: vi.fn(),
  getAnalyticsHealth: vi.fn(),
  getAnalyticsUptime: vi.fn(),
}));

/**
 * Integration tests for SOS ACK Button functionality in DeviceDetails component
 * 
 * These tests verify the complete user flow from button click through API call
 * to notification display, testing the integration of all components.
 */
describe('DeviceDetails - SOS ACK Button Integration Tests', () => {
  const mockImei = '123456789012345';
  
  // Mock data for the component
  const mockPackets = [
    {
      imei: mockImei,
      packetType: 'N',
      latitude: 12.9716,
      longitude: 77.5946,
      speed: 45,
      battery: '85%',
      signal: 25,
      rawTemperature: '35',
      deviceTimestamp: '2024-01-15T10:30:00Z',
      deviceRawTimestamp: '2024-01-15T10:30:00Z',
      serverTimestampISO: '2024-01-15T10:30:05Z',
      geoid: 'GEO123',
    }
  ];

  const mockHealth = {
    gpsScore: 95,
    temperatureStatus: 'Normal',
    temperatureHealthIndex: 'Good',
    movement: ['Moving', 'Idle', 'Moving'],
    movementStats: ['Avg Speed: 45 km/h', 'Max Speed: 70 km/h'],
  };

  const mockUptime = {
    score: 98,
    expectedPackets: 100,
    receivedPackets: 98,
    dropouts: 2,
    largestGapSec: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Don't use fake timers for these integration tests as they interfere with async operations
    // vi.useFakeTimers();
    
    // Setup default mock responses
    analytics.getAnalyticsByImei.mockResolvedValue(mockPackets);
    analytics.getAnalyticsHealth.mockResolvedValue(mockHealth);
    analytics.getAnalyticsUptime.mockResolvedValue(mockUptime);
  });

  afterEach(() => {
    // vi.runOnlyPendingTimers();
    // vi.useRealTimers();
  });

  /**
   * Helper function to render DeviceDetails with router context
   */
  const renderDeviceDetails = async () => {
    const user = userEvent.setup({ delay: null });
    
    const result = render(
      <MemoryRouter initialEntries={[`/devices/${mockImei}`]}>
        <Routes>
          <Route path="/devices/:imei" element={<DeviceDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(analytics.getAnalyticsByImei).toHaveBeenCalledWith(mockImei);
    }, { timeout: 15000 });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading device details/i)).not.toBeInTheDocument();
    }, { timeout: 15000 });

    return { ...result, user };
  };

  /**
   * Helper function to navigate to alerts tab and find ACK button
   */
  const navigateToAlertsTab = async (user) => {
    // Find and click the Alerts tab - look for button with text containing "Alerts"
    const alertsTab = await screen.findByRole('button', { name: /Alerts/i });
    await user.click(alertsTab);
    
    // Wait for alerts tab content to be visible
    await waitFor(() => {
      expect(screen.getByText(/SOS Emergency/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find the ACK button within the SOS Emergency section
    const ackButton = await screen.findByRole('button', { name: /^ACK$/i });
    
    return ackButton;
  };

  describe('8.1 Test full flow from button click to success notification', () => {
    it('displays success notification after successful command', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the ACK button
      await user.click(ackButton);
      
      // Verify API was called with correct parameters
      await waitFor(() => {
        expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledWith(
          mockImei,
          'STOP_SOS',
          {}
        );
      });
      
      // Verify success notification appears
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      // Verify notification has success styling
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('bg-green-500/20');
    }, 15000);

    it('shows loading state during API call', async () => {
      // Create a promise we can control
      let resolveCommand;
      const commandPromise = new Promise((resolve) => {
        resolveCommand = resolve;
      });
      deviceCommandAPI.sendDeviceCommand.mockReturnValue(commandPromise);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the ACK button
      await user.click(ackButton);
      
      // Verify button shows loading state
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
      
      // Verify spinner is visible
      const loadingButton = screen.getByRole('button', { name: /Sending/i });
      const spinner = loadingButton.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Resolve the command
      resolveCommand({ success: true });
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
      });
    }, 15000);

    it('completes full flow from click to notification display', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Initial state: button is enabled and shows "ACK"
      expect(ackButton).toBeEnabled();
      expect(ackButton).toHaveTextContent('ACK');
      
      // Click the button
      await user.click(ackButton);
      
      // Loading state: button is disabled and shows "Sending..."
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
      
      // Success state: notification appears
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      // Final state: button returns to normal
      await waitFor(() => {
        const finalButton = screen.getByRole('button', { name: /^ACK$/i });
        expect(finalButton).toBeEnabled();
        expect(finalButton).toHaveTextContent('ACK');
      });
    }, 15000);
  });

  describe('8.2 Test full flow from button click to error notification', () => {
    it('displays error notification on network error', async () => {
      const networkError = new Error('Unable to connect to server');
      networkError.code = 'NETWORK_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(networkError);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the ACK button
      await user.click(ackButton);
      
      // Verify error notification appears
      await waitFor(() => {
        expect(screen.getByText('Network error: Unable to connect to server')).toBeInTheDocument();
      });
      
      // Verify notification has error styling
      const notification = screen.getByRole('alert');
      expect(notification).toHaveClass('bg-red-500/20');
    }, 15000);

    it('displays error notification on API error', async () => {
      const apiError = new Error('Device not found');
      apiError.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(apiError);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the ACK button
      await user.click(ackButton);
      
      // Verify error notification appears
      await waitFor(() => {
        expect(screen.getByText('API error: Device not found')).toBeInTheDocument();
      });
    }, 15000);

    it('displays error notification on validation error', async () => {
      const validationError = new Error('Invalid IMEI format');
      validationError.code = 'VALIDATION_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(validationError);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the ACK button
      await user.click(ackButton);
      
      // Verify error notification appears
      await waitFor(() => {
        expect(screen.getByText('Validation error: Invalid IMEI format')).toBeInTheDocument();
      });
    }, 15000);

    it('displays generic error message for unknown errors', async () => {
      const unknownError = new Error('Something went wrong');
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(unknownError);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the ACK button
      await user.click(ackButton);
      
      // Verify generic error notification appears
      await waitFor(() => {
        expect(screen.getByText('Failed to send SOS acknowledgment')).toBeInTheDocument();
      });
    }, 15000);

    it('button returns to normal state after error', async () => {
      const error = new Error('Test error');
      error.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the button
      await user.click(ackButton);
      
      // Wait for error notification
      await waitFor(() => {
        expect(screen.getByText('API error: Test error')).toBeInTheDocument();
      });
      
      // Verify button is back to normal state
      const finalButton = screen.getByRole('button', { name: /^ACK$/i });
      expect(finalButton).toBeEnabled();
      expect(finalButton).toHaveTextContent('ACK');
    }, 15000);
  });

  describe('8.3 Test button disabled during command execution', () => {
    it('disables button immediately after click', async () => {
      // Create a promise we can control
      let resolveCommand;
      const commandPromise = new Promise((resolve) => {
        resolveCommand = resolve;
      });
      deviceCommandAPI.sendDeviceCommand.mockReturnValue(commandPromise);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Verify button is initially enabled
      expect(ackButton).toBeEnabled();
      
      // Click the button
      await user.click(ackButton);
      
      // Verify button is disabled during loading
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /Sending/i });
        expect(loadingButton).toBeDisabled();
      });
      
      // Resolve the command
      resolveCommand({ success: true });
      
      // Wait for button to be enabled again
      await waitFor(() => {
        const finalButton = screen.getByRole('button', { name: /^ACK$/i });
        expect(finalButton).toBeEnabled();
      });
    }, 15000);

    it('prevents multiple clicks while command is in progress', async () => {
      // Create a promise we can control
      let resolveCommand;
      const commandPromise = new Promise((resolve) => {
        resolveCommand = resolve;
      });
      deviceCommandAPI.sendDeviceCommand.mockReturnValue(commandPromise);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the button
      await user.click(ackButton);
      
      // Try to click again while loading
      const loadingButton = await screen.findByRole('button', { name: /Sending/i });
      await user.click(loadingButton);
      await user.click(loadingButton);
      
      // Verify API was only called once
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledTimes(1);
      
      // Resolve the command
      resolveCommand({ success: true });
    }, 15000);

    it('keeps button disabled throughout entire API call', async () => {
      const delay = 1000;
      deviceCommandAPI.sendDeviceCommand.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ success: true }), delay))
      );
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the button
      await user.click(ackButton);
      
      // Verify button is disabled
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /Sending/i });
        expect(loadingButton).toBeDisabled();
      });
      
      // Advance time partially
      vi.advanceTimersByTime(delay / 2);
      
      // Button should still be disabled
      const midButton = screen.getByRole('button', { name: /Sending/i });
      expect(midButton).toBeDisabled();
      
      // Advance time to complete
      vi.advanceTimersByTime(delay / 2);
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      // Button should be enabled again
      const finalButton = screen.getByRole('button', { name: /^ACK$/i });
      expect(finalButton).toBeEnabled();
    }, 15000);

    it('re-enables button after error', async () => {
      const error = new Error('Network error');
      error.code = 'NETWORK_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the button
      await user.click(ackButton);
      
      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
      
      // Verify button is enabled again
      const finalButton = screen.getByRole('button', { name: /^ACK$/i });
      expect(finalButton).toBeEnabled();
      
      // Verify we can click again
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      await user.click(finalButton);
      
      // Verify second call was made
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledTimes(2);
    }, 15000);
  });

  describe('8.4 Test notification auto-dismiss functionality', () => {
    it('auto-dismisses success notification after 5 seconds', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Use fake timers after rendering to control setTimeout
      vi.useFakeTimers();
      
      // Click the button
      await user.click(ackButton);
      
      // Wait for success notification
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      // Notification should be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // Advance time by 4 seconds (less than 5)
      await vi.advanceTimersByTimeAsync(4000);
      
      // Notification should still be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // Advance time by 1 more second (total 5 seconds)
      await vi.advanceTimersByTimeAsync(1000);
      
      // Notification should be dismissed
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
      
      vi.useRealTimers();
    }, 15000);

    it('auto-dismisses error notification after 5 seconds', async () => {
      const error = new Error('Test error');
      error.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Use fake timers after rendering
      vi.useFakeTimers();
      
      // Click the button
      await user.click(ackButton);
      
      // Wait for error notification
      await waitFor(() => {
        expect(screen.getByText('API error: Test error')).toBeInTheDocument();
      });
      
      // Notification should be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // Advance time by 5 seconds
      await vi.advanceTimersByTimeAsync(5000);
      
      // Notification should be dismissed
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
      
      vi.useRealTimers();
    }, 15000);

    it('allows manual dismissal of error notification', async () => {
      const error = new Error('Test error');
      error.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Click the button
      await user.click(ackButton);
      
      // Wait for error notification
      await waitFor(() => {
        expect(screen.getByText('API error: Test error')).toBeInTheDocument();
      });
      
      // Find and click the dismiss button
      const dismissButton = screen.getByRole('button', { name: /Dismiss notification/i });
      await user.click(dismissButton);
      
      // Notification should be dismissed immediately
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    }, 15000);

    it('clears previous notification when new command is sent', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Use fake timers after rendering
      vi.useFakeTimers();
      
      // First click
      await user.click(ackButton);
      
      // Wait for first notification
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      // Click again before auto-dismiss
      await vi.advanceTimersByTimeAsync(2000); // Only 2 seconds
      const ackButtonAgain = screen.getByRole('button', { name: /^ACK$/i });
      await user.click(ackButtonAgain);
      
      // Wait for loading state
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
      
      // Previous notification should be cleared during loading
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      
      // Wait for new notification
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      vi.useRealTimers();
    }, 15000);

    it('does not dismiss notification before 5 seconds', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      const { user } = await renderDeviceDetails();
      const ackButton = await navigateToAlertsTab(user);
      
      // Use fake timers after rendering
      vi.useFakeTimers();
      
      // Click the button
      await user.click(ackButton);
      
      // Wait for notification
      await waitFor(() => {
        expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      });
      
      // Advance time by 4.9 seconds
      await vi.advanceTimersByTimeAsync(4900);
      
      // Notification should still be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('SOS acknowledgment sent successfully')).toBeInTheDocument();
      
      vi.useRealTimers();
    }, 15000);
  });
});
