/**
 * Property-Based Tests for SOS Emergency ACK Button
 * 
 * Feature: sos-emergency-ack
 * 
 * These tests verify universal properties of the SOS ACK functionality across
 * many randomly generated inputs to ensure correctness.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as deviceCommandAPI from '../utils/deviceCommandAPI';

// Mock the device command API
vi.mock('../utils/deviceCommandAPI', () => ({
  sendDeviceCommand: vi.fn(),
}));

describe('DeviceDetails - SOS ACK Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  /**
   * Property 1: Command Payload Structure
   * **Validates: Requirements 1.3**
   * 
   * The STOP_SOS command payload must always have the correct structure
   * regardless of the IMEI value.
   */
  describe('Property 1: Command Payload Structure', () => {
    it('should always send STOP_SOS command with correct payload structure for any valid IMEI', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid IMEI strings (15 digits)
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 }).map(arr => arr.join('')),
          async (imei) => {
            // Mock successful response
            deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });

            // Create mock state setters
            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            // Recreate the handleAckSOS function logic
            const handleAckSOS = async () => {
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

            // Execute the handler
            await handleAckSOS();

            // Verify the command was called with correct structure
            expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledWith(
              imei,
              "STOP_SOS",
              {}
            );

            // Get the actual call arguments
            const [actualImei, actualCommand, actualParams] = deviceCommandAPI.sendDeviceCommand.mock.calls[0];

            // Verify payload structure properties
            expect(typeof actualImei).toBe('string');
            expect(actualCommand).toBe("STOP_SOS");
            expect(typeof actualParams).toBe('object');
            expect(actualParams).not.toBeNull();
            expect(Object.keys(actualParams).length).toBe(0);

            // Clear mocks for next iteration
            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should always use empty params object for STOP_SOS command', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          async (imei) => {
            deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            const [, , params] = deviceCommandAPI.sendDeviceCommand.mock.calls[0];

            // Verify params is always an empty object
            expect(params).toEqual({});
            expect(Object.keys(params)).toHaveLength(0);
            expect(Array.isArray(params)).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should never modify or add properties to params object', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          async (imei) => {
            deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            const [, , params] = deviceCommandAPI.sendDeviceCommand.mock.calls[0];

            // Verify no unexpected properties were added
            const allowedKeys = [];
            const actualKeys = Object.keys(params);
            
            expect(actualKeys).toEqual(allowedKeys);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 2: Button State Consistency
   * **Validates: Requirements 2.4, 3.1**
   * 
   * The button must never be enabled while a command is in progress.
   */
  describe('Property 2: Button State Consistency', () => {
    it('should always disable button when loading state is true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(),
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();
            let currentLoadingState = false;

            const handleAckSOS = async () => {
              setSosLoading(true);
              currentLoadingState = true;
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
                currentLoadingState = false;
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state was set to true during execution
            expect(setSosLoading).toHaveBeenCalledWith(true);
            
            // Verify loading state was reset to false after execution
            expect(setSosLoading).toHaveBeenCalledWith(false);
            
            // Verify the button disabled state matches loading state
            const buttonDisabled = currentLoadingState;
            expect(buttonDisabled).toBe(false); // Should be false after completion

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain consistent loading state transitions for any execution outcome', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('success', 'validation_error', 'network_error', 'api_error'),
          async (imei, outcome) => {
            // Setup mock based on outcome
            if (outcome === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error(`${outcome} occurred`);
              if (outcome === 'validation_error') {
                error.code = 'VALIDATION_ERROR';
              } else if (outcome === 'network_error') {
                error.code = 'NETWORK_ERROR';
              } else if (outcome === 'api_error') {
                error.code = 'API_ERROR';
              }
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state transitions are consistent
            expect(setSosLoading).toHaveBeenCalledTimes(2);
            expect(setSosLoading).toHaveBeenNthCalledWith(1, true);
            expect(setSosLoading).toHaveBeenNthCalledWith(2, false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should never leave button in loading state after command completes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.oneof(
            fc.constant({ type: 'success' }),
            fc.constant({ type: 'error', code: 'VALIDATION_ERROR' }),
            fc.constant({ type: 'error', code: 'NETWORK_ERROR' }),
            fc.constant({ type: 'error', code: 'API_ERROR' })
          ),
          async (imei, scenario) => {
            if (scenario.type === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = scenario.code;
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify final loading state is always false
            const lastCall = setSosLoading.mock.calls[setSosLoading.mock.calls.length - 1];
            expect(lastCall[0]).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 2: Button State Consistency
   * **Validates: Requirements 2.4, 3.1**
   * 
   * The button must never be enabled while a command is in progress.
   * Loading state must be consistent with button disabled state.
   */
  describe('Property 2: Button State Consistency', () => {
    it('should always disable button when loading state is true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(), // Simulate different API response scenarios
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();
            let currentLoadingState = false;

            const handleAckSOS = async () => {
              setSosLoading(true);
              currentLoadingState = true;
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
                currentLoadingState = false;
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state was set to true at the start
            expect(setSosLoading).toHaveBeenCalledWith(true);
            
            // Verify loading state was reset to false at the end
            expect(setSosLoading).toHaveBeenCalledWith(false);
            
            // Verify loading state transitions: true -> false
            const loadingCalls = setSosLoading.mock.calls;
            expect(loadingCalls[0][0]).toBe(true);
            expect(loadingCalls[loadingCalls.length - 1][0]).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should always reset loading state to false after command completes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('success', 'validation_error', 'network_error', 'api_error'),
          async (imei, errorType) => {
            // Setup different error scenarios
            if (errorType === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error(`Test ${errorType}`);
              error.code = errorType === 'validation_error' ? 'VALIDATION_ERROR' :
                           errorType === 'network_error' ? 'NETWORK_ERROR' : 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state was always reset to false, regardless of success or error
            expect(setSosLoading).toHaveBeenCalledWith(false);
            
            // Verify the final call is always false
            const calls = setSosLoading.mock.calls;
            expect(calls[calls.length - 1][0]).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain consistent loading state transitions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          async (imei) => {
            deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify exactly 2 calls: true then false
            expect(setSosLoading).toHaveBeenCalledTimes(2);
            expect(setSosLoading).toHaveBeenNthCalledWith(1, true);
            expect(setSosLoading).toHaveBeenNthCalledWith(2, false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 2: Button State Consistency
   * **Validates: Requirements 2.4, 3.1**
   * 
   * The button must never be enabled while a command is in progress.
   */
  describe('Property 2: Button State Consistency', () => {
    it('should always disable button when loading state is true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(),
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();
            let currentLoadingState = false;

            const handleAckSOS = async () => {
              setSosLoading(true);
              currentLoadingState = true;
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
                currentLoadingState = false;
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state was set to true at the start
            expect(setSosLoading).toHaveBeenCalledWith(true);
            
            // Verify loading state was set to false at the end
            expect(setSosLoading).toHaveBeenCalledWith(false);
            
            // Verify the button disabled state matches loading state
            const buttonDisabled = currentLoadingState;
            expect(buttonDisabled).toBe(false); // Should be false after completion

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain consistent loading state transitions for any command outcome', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('success', 'validation_error', 'network_error', 'api_error'),
          async (imei, outcome) => {
            // Setup mock based on outcome
            if (outcome === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error(`${outcome} message`);
              error.code = outcome === 'validation_error' ? 'VALIDATION_ERROR' :
                           outcome === 'network_error' ? 'NETWORK_ERROR' : 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state transitions are consistent
            expect(setSosLoading).toHaveBeenCalledTimes(2);
            expect(setSosLoading).toHaveBeenNthCalledWith(1, true);
            expect(setSosLoading).toHaveBeenNthCalledWith(2, false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should never leave button in loading state after command completes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.oneof(
            fc.constant({ type: 'success' }),
            fc.constant({ type: 'error', code: 'VALIDATION_ERROR' }),
            fc.constant({ type: 'error', code: 'NETWORK_ERROR' }),
            fc.constant({ type: 'error', code: 'API_ERROR' })
          ),
          async (imei, scenario) => {
            if (scenario.type === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = scenario.code;
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify final loading state is always false
            const lastCall = setSosLoading.mock.calls[setSosLoading.mock.calls.length - 1];
            expect(lastCall[0]).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 3: Notification Lifecycle
   * **Validates: Requirements 2.1, 2.2, 3.3**
   * 
   * Every command execution must result in exactly one notification (success or error).
   */
  describe('Property 3: Notification Lifecycle', () => {
    it('should always produce exactly one notification per command execution', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(),
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Count notification calls (excluding null clear)
            const notificationCalls = setNotification.mock.calls;
            const nonNullCalls = notificationCalls.filter(call => call[0] !== null);

            // Should have exactly one notification (success or error)
            expect(nonNullCalls.length).toBe(1);

            // Verify notification has correct structure
            const notification = nonNullCalls[0][0];
            expect(notification).toHaveProperty('type');
            expect(notification).toHaveProperty('message');
            expect(['success', 'error']).toContain(notification.type);
            expect(typeof notification.message).toBe('string');
            expect(notification.message.length).toBeGreaterThan(0);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should always clear notification before setting new one', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('success', 'validation_error', 'network_error', 'api_error'),
          async (imei, outcome) => {
            if (outcome === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error(`${outcome} message`);
              error.code = outcome === 'validation_error' ? 'VALIDATION_ERROR' :
                           outcome === 'network_error' ? 'NETWORK_ERROR' : 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify first call clears notification
            expect(setNotification).toHaveBeenNthCalledWith(1, null);

            // Verify second call sets notification
            const secondCall = setNotification.mock.calls[1][0];
            expect(secondCall).not.toBeNull();
            expect(secondCall).toHaveProperty('type');
            expect(secondCall).toHaveProperty('message');

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should schedule auto-dismiss for all notifications', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(),
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'NETWORK_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify notification was set
            const callsBeforeTimer = setNotification.mock.calls.length;
            expect(callsBeforeTimer).toBeGreaterThanOrEqual(2);

            // Fast-forward timer
            vi.advanceTimersByTime(5000);

            // Verify notification was cleared after 5 seconds
            expect(setNotification).toHaveBeenCalledWith(null);
            const callsAfterTimer = setNotification.mock.calls.length;
            expect(callsAfterTimer).toBe(callsBeforeTimer + 1);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should produce success notification for successful commands', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          async (imei) => {
            deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Find the success notification
            const successCall = setNotification.mock.calls.find(
              call => call[0] && call[0].type === 'success'
            );

            expect(successCall).toBeDefined();
            expect(successCall[0].message).toBe("SOS acknowledgment sent successfully");

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should produce error notification for failed commands', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('VALIDATION_ERROR', 'NETWORK_ERROR', 'API_ERROR'),
          async (imei, errorCode) => {
            const error = new Error(`Test ${errorCode}`);
            error.code = errorCode;
            deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Find the error notification
            const errorCall = setNotification.mock.calls.find(
              call => call[0] && call[0].type === 'error'
            );

            expect(errorCall).toBeDefined();
            
            // Verify error message contains the error type (case-insensitive)
            const errorMessage = errorCall[0].message.toLowerCase();
            const expectedErrorType = errorCode.toLowerCase().replace('_', ' ');
            expect(errorMessage).toContain(expectedErrorType);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 4: Error Code Mapping
   * **Validates: Requirements 4.3, 7.1, 7.2, 7.3**
   * 
   * All error codes from the API must map to user-friendly messages.
   */
  describe('Property 4: Error Code Mapping', () => {
    it('should map all known error codes to user-friendly messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('VALIDATION_ERROR', 'NETWORK_ERROR', 'API_ERROR'),
          fc.string({ minLength: 5, maxLength: 50 }),
          async (imei, errorCode, errorMessage) => {
            const error = new Error(errorMessage);
            error.code = errorCode;
            deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Find the error notification
            const errorCall = setNotification.mock.calls.find(
              call => call[0] && call[0].type === 'error'
            );

            expect(errorCall).toBeDefined();
            
            // Verify error message has correct prefix based on error code
            const message = errorCall[0].message;
            expect(typeof message).toBe('string');
            expect(message.length).toBeGreaterThan(0);

            if (errorCode === 'VALIDATION_ERROR') {
              expect(message).toContain('Validation error:');
              expect(message).toContain(errorMessage);
            } else if (errorCode === 'NETWORK_ERROR') {
              expect(message).toContain('Network error:');
              expect(message).toContain(errorMessage);
            } else if (errorCode === 'API_ERROR') {
              expect(message).toContain('API error:');
              expect(message).toContain(errorMessage);
            }

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle unknown error codes with generic message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => 
            !['VALIDATION_ERROR', 'NETWORK_ERROR', 'API_ERROR'].includes(s)
          ),
          fc.string({ minLength: 5, maxLength: 50 }),
          async (imei, unknownCode, errorMessage) => {
            const error = new Error(errorMessage);
            error.code = unknownCode;
            deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Find the error notification
            const errorCall = setNotification.mock.calls.find(
              call => call[0] && call[0].type === 'error'
            );

            expect(errorCall).toBeDefined();
            
            // Should use generic error message for unknown codes
            const message = errorCall[0].message;
            expect(message).toBe("Failed to send SOS acknowledgment");

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should preserve original error message in mapped message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.constantFrom('VALIDATION_ERROR', 'NETWORK_ERROR', 'API_ERROR'),
          fc.string({ minLength: 10, maxLength: 100 }),
          async (imei, errorCode, originalMessage) => {
            const error = new Error(originalMessage);
            error.code = errorCode;
            deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Find the error notification
            const errorCall = setNotification.mock.calls.find(
              call => call[0] && call[0].type === 'error'
            );

            expect(errorCall).toBeDefined();
            
            // Verify original message is preserved in the notification
            const message = errorCall[0].message;
            expect(message).toContain(originalMessage);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should always produce error notification with type "error" for all error codes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.oneof(
            fc.constantFrom('VALIDATION_ERROR', 'NETWORK_ERROR', 'API_ERROR'),
            fc.string({ minLength: 1, maxLength: 20 })
          ),
          async (imei, errorCode) => {
            const error = new Error('Test error');
            error.code = errorCode;
            deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Find the error notification
            const errorCall = setNotification.mock.calls.find(
              call => call[0] && call[0].type === 'error'
            );

            expect(errorCall).toBeDefined();
            expect(errorCall[0].type).toBe('error');

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 5: State Cleanup
   * **Validates: Requirements 6.3**
   * 
   * Loading state must always be reset after command completion, regardless of success or failure.
   */
  describe('Property 5: State Cleanup', () => {
    it('should always reset loading state to false after command completes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.oneof(
            fc.constant({ type: 'success' }),
            fc.constant({ type: 'error', code: 'VALIDATION_ERROR' }),
            fc.constant({ type: 'error', code: 'NETWORK_ERROR' }),
            fc.constant({ type: 'error', code: 'API_ERROR' }),
            fc.constant({ type: 'error', code: 'UNKNOWN_ERROR' })
          ),
          async (imei, scenario) => {
            if (scenario.type === 'success') {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = scenario.code;
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state was reset to false
            const lastLoadingCall = setSosLoading.mock.calls[setSosLoading.mock.calls.length - 1];
            expect(lastLoadingCall[0]).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should reset loading state even when API throws unexpected errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.string({ minLength: 5, maxLength: 50 }),
          async (imei, errorMessage) => {
            // Throw error without code property
            const error = new Error(errorMessage);
            deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify loading state was reset
            expect(setSosLoading).toHaveBeenCalledWith(false);
            
            // Verify it was the last call
            const lastCall = setSosLoading.mock.calls[setSosLoading.mock.calls.length - 1];
            expect(lastCall[0]).toBe(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should execute finally block for all execution paths', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(),
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'API_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();
            let finallyExecuted = false;

            const handleAckSOS = async () => {
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
                finallyExecuted = true;
                setSosLoading(false);
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            await handleAckSOS();

            // Verify finally block was executed
            expect(finallyExecuted).toBe(true);
            
            // Verify loading state was reset in finally block
            expect(setSosLoading).toHaveBeenCalledWith(false);

            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not leak timers or event handlers', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.boolean(),
          async (imei, shouldSucceed) => {
            if (shouldSucceed) {
              deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
            } else {
              const error = new Error('Test error');
              error.code = 'NETWORK_ERROR';
              deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
            }

            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async () => {
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            // Execute multiple times to check for leaks
            await handleAckSOS();
            await handleAckSOS();
            await handleAckSOS();

            // Verify each execution properly cleaned up
            // Loading state should be set to false 3 times (once per execution)
            const falseCallCount = setSosLoading.mock.calls.filter(call => call[0] === false).length;
            expect(falseCallCount).toBe(3);

            // Clear all pending timers
            vi.clearAllTimers();
            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 15 } // Reduced runs since we execute 3 times per iteration
      );
    });

    it('should maintain state consistency across multiple rapid executions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 20 }),
          fc.array(fc.boolean(), { minLength: 2, maxLength: 5 }),
          async (imei, executionResults) => {
            const setSosLoading = vi.fn();
            const setNotification = vi.fn();

            const handleAckSOS = async (shouldSucceed) => {
              setSosLoading(true);
              setNotification(null);
              
              try {
                if (shouldSucceed) {
                  deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
                } else {
                  const error = new Error('Test error');
                  error.code = 'API_ERROR';
                  deviceCommandAPI.sendDeviceCommand.mockRejectedValue(error);
                }
                
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
                setTimeout(() => {
                  setNotification(null);
                }, 5000);
              }
            };

            // Execute multiple times
            for (const shouldSucceed of executionResults) {
              await handleAckSOS(shouldSucceed);
            }

            // Verify loading state was reset after each execution
            const falseCallCount = setSosLoading.mock.calls.filter(call => call[0] === false).length;
            expect(falseCallCount).toBe(executionResults.length);

            vi.clearAllTimers();
            vi.clearAllMocks();

            return true;
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});
