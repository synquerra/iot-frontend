/**
 * Property-Based Tests for DeviceSettings Parameter Validation
 * 
 * Feature: device-command-migration
 * Property 2: Parameter Validation Behavior
 * 
 * These tests verify universal properties of parameter validation behavior
 * across many randomly generated inputs to ensure correctness.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import fc from 'fast-check';
import DeviceSettings from './DeviceSettings.jsx';

// Mock the deviceCommandAPI module
vi.mock('../utils/deviceCommandAPI.js', () => ({
  sendDeviceCommand: vi.fn()
}));

// Mock the deviceCommandsAPI module
vi.mock('../utils/deviceCommandsAPI.js', () => ({
  fetchDeviceCommands: vi.fn().mockResolvedValue([]),
  parseDeviceCommands: vi.fn().mockReturnValue([])
}));

// Mock the deviceConfigAPI module
vi.mock('../utils/deviceConfigAPI.js', () => ({
  fetchDeviceConfig: vi.fn().mockResolvedValue([]),
  getConfigAcknowledgments: vi.fn().mockReturnValue([])
}));

/**
 * Helper function to get the device command select element
 * Filters out the emergency contact select element
 */
const getDeviceCommandSelect = () => {
  const selects = screen.getAllByRole('combobox');
  return selects.find(select =>
    select.querySelector('option')?.textContent === 'Select a command...'
  );
};

describe('DeviceSettings Parameter Validation - Property-Based Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 2: Parameter Validation Behavior
   * For any parameter field, the following validation behaviors should hold:
   * - When a user enters a value and triggers blur, validation should execute
   * - When the value is invalid, an error message should display
   * - When the value is valid or empty, any existing error should clear
   * - Empty values should always be considered valid (all parameters are optional)
   * 
   * Feature: device-command-migration, Property 2: Parameter Validation Behavior
   * Validates: Requirements 4.2, 4.3, 4.4, 4.5
   */
  describe('Property 2: Parameter Validation Behavior', () => {
    
    /**
     * Test: Empty values should always be valid
     * All parameters are optional, so empty strings should never show errors
     */
    it('should accept empty values for all parameters (all parameters are optional)', async () => {
      const parameters = [
        'NormalSendingInterval',
        'SOSSendingInterval',
        'NormalScanningInterval',
        'AirplaneInterval',
        'TemperatureLimit',
        'SpeedLimit',
        'LowbatLimit'
      ];

      await fc.assert(
        fc.asyncProperty(
          // Generate random parameter to test
          fc.constantFrom(...parameters),
          // Generate empty or whitespace-only strings
          fc.constantFrom('', '   ', '\t', '\n'),
          async (paramName, emptyValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS to show parameter inputs
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find the parameter input by placeholder
              const placeholders = {
                'NormalSendingInterval': 'e.g., 60',
                'SOSSendingInterval': 'e.g., 10',
                'NormalScanningInterval': 'e.g., 30',
                'AirplaneInterval': 'e.g., 120',
                'TemperatureLimit': 'e.g., 50',
                'SpeedLimit': 'e.g., 80',
                'LowbatLimit': 'e.g., 20'
              };
              const input = screen.getByPlaceholderText(placeholders[paramName]);
              
              // Enter empty value
              fireEvent.change(input, { target: { value: emptyValue } });
              
              // Trigger blur to validate
              fireEvent.blur(input);
              
              // Wait for validation to complete
              await waitFor(() => {
                // Empty values should not show error messages
                const errorText = screen.queryByText(/must be|required|invalid/i);
                expect(errorText).toBeNull();
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 30000 }
      );
    }, 60000);

    /**
     * Test: Invalid values should show error messages
     * When a parameter value is invalid, an error message should display
     */
    it('should show error messages for invalid parameter values', async () => {
      // Map parameter names to their actual label text
      const paramLabelMap = {
        'NormalSendingInterval': 'Normal Sending Interval',
        'SOSSendingInterval': 'SOS Sending Interval',
        'NormalScanningInterval': 'Normal Scanning Interval',
        'AirplaneInterval': 'Airplane Interval'
      };

      await fc.assert(
        fc.asyncProperty(
          // Generate invalid values for different parameter types
          fc.record({
            paramName: fc.constantFrom(
              'NormalSendingInterval',
              'SOSSendingInterval',
              'NormalScanningInterval',
              'AirplaneInterval'
            ),
            invalidValue: fc.constantFrom(
              'abc',           // Non-numeric
              '-5',            // Negative
              '0',             // Zero (not positive)
              '3.14',          // Decimal (must be integer)
              'test123',       // Mixed
              '!!!',           // Special chars
            )
          }),
          async ({ paramName, invalidValue }) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS to show parameter inputs
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find the parameter input using the proper label text
              const input = screen.getByLabelText(new RegExp(paramLabelMap[paramName], 'i'));
              
              // Enter invalid value
              fireEvent.change(input, { target: { value: invalidValue } });
              
              // Trigger blur to validate
              fireEvent.blur(input);
              
              // Wait for error message to appear
              await waitFor(() => {
                // Should show an error message
                const errorText = screen.queryByText(/must be a positive integer string/i);
                expect(errorText).not.toBeNull();
              }, { timeout: 2000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    /**
     * Test: Valid values should clear errors
     * When a valid value is entered after an invalid one, errors should clear
     */
    it('should clear error messages when valid values are entered', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test cases with invalid then valid values
          fc.record({
            paramName: fc.constantFrom(
              'NormalSendingInterval',
              'SOSSendingInterval',
              'NormalScanningInterval',
              'AirplaneInterval'
            ),
            invalidValue: fc.constantFrom('abc', '-5', '0'),
            validValue: fc.integer({ min: 1, max: 1000 }).map(n => n.toString())
          }),
          async ({ paramName, invalidValue, validValue }) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find the parameter input by label text
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval'
              };
              const input = screen.getByLabelText(labelMap[paramName]);
              
              // Step 1: Enter invalid value
              fireEvent.change(input, { target: { value: invalidValue } });
              fireEvent.blur(input);
              
              // Wait for error to appear
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a positive integer string/i);
                expect(errorText).not.toBeNull();
              }, { timeout: 2000 });
              
              // Step 2: Enter valid value
              fireEvent.change(input, { target: { value: validValue } });
              fireEvent.blur(input);
              
              // Wait for error to clear
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a positive integer string/i);
                expect(errorText).toBeNull();
              }, { timeout: 2000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    /**
     * Test: Validation executes on blur
     * Validation should only trigger when the input loses focus (blur event)
     */
    it('should trigger validation on blur event', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'NormalSendingInterval',
            'SOSSendingInterval',
            'NormalScanningInterval',
            'AirplaneInterval'
          ),
          fc.constantFrom('abc', '-5', '0', 'invalid'),
          async (paramName, invalidValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find the parameter input by label text
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval'
              };
              const input = screen.getByLabelText(labelMap[paramName]);
              
              // Enter invalid value but don't blur yet
              fireEvent.change(input, { target: { value: invalidValue } });
              
              // Error should not appear immediately (before blur)
              let errorText = screen.queryByText(/must be a positive integer string/i);
              expect(errorText).toBeNull();
              
              // Now trigger blur
              fireEvent.blur(input);
              
              // Error should appear after blur
              await waitFor(() => {
                errorText = screen.queryByText(/must be a positive integer string/i);
                expect(errorText).not.toBeNull();
              }, { timeout: 2000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    /**
     * Test: LowbatLimit range validation (0-100)
     * LowbatLimit has special validation for battery percentage range
     */
    it('should validate LowbatLimit is between 0 and 100', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            validValue: fc.integer({ min: 0, max: 100 }).map(n => n.toString()),
            invalidValue: fc.oneof(
              fc.integer({ min: 101, max: 200 }).map(n => n.toString()),
              fc.integer({ min: -100, max: -1 }).map(n => n.toString())
            )
          }),
          async ({ validValue, invalidValue }) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find LowbatLimit input
              const input = screen.getByLabelText(/Low Battery Limit/i);
              
              // Test invalid value
              fireEvent.change(input, { target: { value: invalidValue } });
              fireEvent.blur(input);
              
              await waitFor(() => {
                const errorText = screen.queryByText(/must be between 0 and 100/i);
                expect(errorText).not.toBeNull();
              }, { timeout: 2000 });
              
              // Test valid value
              fireEvent.change(input, { target: { value: validValue } });
              fireEvent.blur(input);
              
              await waitFor(() => {
                const errorText = screen.queryByText(/must be between 0 and 100/i);
                expect(errorText).toBeNull();
              }, { timeout: 2000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    /**
     * Test: TemperatureLimit accepts any numeric value
     * TemperatureLimit can be negative or positive
     */
    it('should accept any numeric string for TemperatureLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer({ min: -100, max: 100 }).map(n => n.toString()),
            fc.float({ min: -50.5, max: 50.5 }).map(n => n.toString())
          ),
          async (numericValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find TemperatureLimit input
              const input = screen.getByLabelText(/Temperature Limit/i);
              
              // Enter numeric value
              fireEvent.change(input, { target: { value: numericValue } });
              fireEvent.blur(input);
              
              // Should not show error for valid numeric values
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a numeric string/i);
                expect(errorText).toBeNull();
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    /**
     * Test: SpeedLimit must be positive
     * SpeedLimit should reject zero and negative values
     */
    it('should validate SpeedLimit is positive', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            validValue: fc.integer({ min: 1, max: 300 }).map(n => n.toString()),
            invalidValue: fc.constantFrom('0', '-1', '-10')
          }),
          async ({ validValue, invalidValue }) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find SpeedLimit input
              const input = screen.getByLabelText(/Speed Limit/i);
              
              // Test invalid value
              fireEvent.change(input, { target: { value: invalidValue } });
              fireEvent.blur(input);
              
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a positive/i);
                expect(errorText).not.toBeNull();
              }, { timeout: 2000 });
              
              // Test valid value
              fireEvent.change(input, { target: { value: validValue } });
              fireEvent.blur(input);
              
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a positive/i);
                expect(errorText).toBeNull();
              }, { timeout: 2000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);

    /**
     * Test: Error clears when user starts typing
     * When a user starts typing in a field with an error, the error should clear
     */
    it('should clear error when user starts typing (before blur)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'NormalSendingInterval',
            'SOSSendingInterval',
            'NormalScanningInterval',
            'AirplaneInterval'
          ),
          fc.constantFrom('abc', '-5', '0'),
          fc.integer({ min: 1, max: 100 }).map(n => n.toString()),
          async (paramName, invalidValue, validValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DeviceSettings />} />
                </Routes>
              </BrowserRouter>
            );
            
            try {
              // Wait for component to render
              await waitFor(() => {
                expect(screen.getByText('Device Commands')).toBeInTheDocument();
              });

              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Find the parameter input by label text
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval'
              };
              const input = screen.getByLabelText(labelMap[paramName]);
              
              // Enter invalid value and blur to trigger error
              fireEvent.change(input, { target: { value: invalidValue } });
              fireEvent.blur(input);
              
              // Wait for error to appear
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a positive integer string/i);
                expect(errorText).not.toBeNull();
              }, { timeout: 2000 });
              
              // Start typing a new value (don't blur yet)
              fireEvent.change(input, { target: { value: validValue } });
              
              // Error should clear immediately when user starts typing
              await waitFor(() => {
                const errorText = screen.queryByText(/must be a positive integer string/i);
                expect(errorText).toBeNull();
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 60000 }
      );
    }, 120000);
  });
});
