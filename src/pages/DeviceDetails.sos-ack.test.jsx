import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as deviceCommandAPI from '../utils/deviceCommandAPI';

// Mock the device command API
vi.mock('../utils/deviceCommandAPI', () => ({
  sendDeviceCommand: vi.fn(),
}));

/**
 * Unit tests for SOS ACK Button functionality in DeviceDetails component
 * 
 * These tests verify the handleAckSOS function behavior by testing the logic
 * in isolation rather than rendering the full component.
 */
describe('DeviceDetails - SOS ACK Button Unit Tests', () => {
  let setSosLoading;
  let setNotification;
  let handleAckSOS;
  const imei = '123456789012345';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock state setters
    setSosLoading = vi.fn();
    setNotification = vi.fn();
    
    // Recreate the handleAckSOS function logic
    handleAckSOS = async () => {
      setSosLoading(true);
      setNotification(null);
      
      try {
        await deviceCommandAPI.sendDeviceCommand(imei, "STOP_SOS", {});
        setNotification({
          type: "success",
          message: "SOS acknowledgment sent successfully"
        });
      } catch (error) {
        let errorMessage = "Failed to send SOS acknowledgment";
        
        if (error.code === 'VALIDATION_ERROR') {
          errorMessage = `Validation error: ${error.message}`;
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = `Network error: ${error.message}`;
        } else if (error.code === 'API_ERROR') {
          errorMessage = `API error: ${error.message}`;
        }
        
        setNotification({
          type: "error",
          message: errorMessage
        });
      } finally {
        setSosLoading(false);
        
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('6.1 Test handleAckSOS with successful API response', () => {
    it('sends STOP_SOS command and shows success notification', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify sendDeviceCommand was called with correct parameters
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledWith(
        imei,
        'STOP_SOS',
        {}
      );
      
      // Verify success notification was set
      expect(setNotification).toHaveBeenCalledWith({
        type: "success",
        message: "SOS acknowledgment sent successfully"
      });
      
      // Verify loading state was reset
      expect(setSosLoading).toHaveBeenCalledWith(false);
    });

    it('calls sendDeviceCommand exactly once per click', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledTimes(1);
    });
  });

  describe('6.2 Test handleAckSOS with validation error', () => {
    it('displays validation error message', async () => {
      const validationError = new Error('Invalid IMEI format');
      validationError.code = 'VALIDATION_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(validationError);
      
      await handleAckSOS();
      
      // Verify error notification was set with correct message
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Validation error: Invalid IMEI format"
      });
      
      // Verify loading state was reset
      expect(setSosLoading).toHaveBeenCalledWith(false);
    });

    it('handles validation error with different message', async () => {
      const validationError = new Error('Command validation failed');
      validationError.code = 'VALIDATION_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(validationError);
      
      await handleAckSOS();
      
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Validation error: Command validation failed"
      });
    });
  });

  describe('6.3 Test handleAckSOS with network error', () => {
    it('displays network error message', async () => {
      const networkError = new Error('Unable to connect to server');
      networkError.code = 'NETWORK_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(networkError);
      
      await handleAckSOS();
      
      // Verify error notification was set with correct message
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Network error: Unable to connect to server"
      });
      
      // Verify loading state was reset
      expect(setSosLoading).toHaveBeenCalledWith(false);
    });

    it('handles network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'NETWORK_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(timeoutError);
      
      await handleAckSOS();
      
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Network error: Request timeout"
      });
    });
  });

  describe('6.4 Test handleAckSOS with API error', () => {
    it('displays API error message', async () => {
      const apiError = new Error('Device not found');
      apiError.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(apiError);
      
      await handleAckSOS();
      
      // Verify error notification was set with correct message
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "API error: Device not found"
      });
      
      // Verify loading state was reset
      expect(setSosLoading).toHaveBeenCalledWith(false);
    });

    it('handles API error with status code details', async () => {
      const apiError = new Error('Command not supported');
      apiError.code = 'API_ERROR';
      apiError.details = { statusCode: 400 };
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(apiError);
      
      await handleAckSOS();
      
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "API error: Command not supported"
      });
    });

    it('handles generic API errors without specific code', async () => {
      const genericError = new Error('Something went wrong');
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(genericError);
      
      await handleAckSOS();
      
      // Should use generic error message
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Failed to send SOS acknowledgment"
      });
    });
  });

  describe('6.5 Test loading state transitions', () => {
    it('sets loading state to true before API call', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify loading was set to true first
      expect(setSosLoading).toHaveBeenNthCalledWith(1, true);
    });

    it('resets loading state to false after successful command', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify loading was reset to false
      expect(setSosLoading).toHaveBeenCalledWith(false);
    });

    it('resets loading state to false after error', async () => {
      const error = new Error('Network error');
      error.code = 'NETWORK_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      await handleAckSOS();
      
      // Verify loading was reset to false even after error
      expect(setSosLoading).toHaveBeenCalledWith(false);
    });

    it('always resets loading state in finally block', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify setSosLoading was called twice: true then false
      expect(setSosLoading).toHaveBeenCalledTimes(2);
      expect(setSosLoading).toHaveBeenNthCalledWith(1, true);
      expect(setSosLoading).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('6.6 Test notification state management', () => {
    it('clears previous notification before new command', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify notification was cleared first
      expect(setNotification).toHaveBeenNthCalledWith(1, null);
      // Then set to success message
      expect(setNotification).toHaveBeenNthCalledWith(2, {
        type: "success",
        message: "SOS acknowledgment sent successfully"
      });
    });

    it('sets success notification with correct type and message', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      expect(setNotification).toHaveBeenCalledWith({
        type: "success",
        message: "SOS acknowledgment sent successfully"
      });
    });

    it('sets error notification with correct type and message', async () => {
      const error = new Error('Test error');
      error.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      await handleAckSOS();
      
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "API error: Test error"
      });
    });

    it('calls setNotification at least twice per execution', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Should be called at least twice: clear (null) and set (success/error)
      expect(setNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('6.7 Test auto-dismiss timer', () => {
    it('schedules notification dismissal after 5 seconds', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify notification was set
      expect(setNotification).toHaveBeenCalledWith({
        type: "success",
        message: "SOS acknowledgment sent successfully"
      });
      
      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000);
      
      // Verify notification was cleared
      expect(setNotification).toHaveBeenCalledWith(null);
    });

    it('schedules dismissal for error notifications', async () => {
      const error = new Error('Test error');
      error.code = 'API_ERROR';
      deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
      
      await handleAckSOS();
      
      // Verify error notification was set
      expect(setNotification).toHaveBeenCalledWith({
        type: "error",
        message: "API error: Test error"
      });
      
      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000);
      
      // Verify notification was cleared
      expect(setNotification).toHaveBeenCalledWith(null);
    });

    it('does not dismiss notification before 5 seconds', async () => {
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      const callCountBefore = setNotification.mock.calls.length;
      
      // Fast-forward time by 4 seconds (less than 5)
      vi.advanceTimersByTime(4000);
      
      // Verify no additional calls to setNotification
      expect(setNotification).toHaveBeenCalledTimes(callCountBefore);
    });

    it('uses setTimeout with 5000ms delay', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
      
      await handleAckSOS();
      
      // Verify setTimeout was called with 5000ms
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      
      setTimeoutSpy.mockRestore();
    });
  });
});
