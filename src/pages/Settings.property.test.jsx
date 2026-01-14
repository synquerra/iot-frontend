/**
 * Property-Based Tests for Settings Device Command Tab
 * 
 * Feature: settings-device-command-tab
 * 
 * These tests verify universal properties of the Device Command tab across
 * many randomly generated inputs to ensure correctness.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import Settings from './Settings.jsx';
import { sendDeviceCommand } from '../utils/deviceCommandAPI.js';

// Mock the deviceCommandAPI module
vi.mock('../utils/deviceCommandAPI.js', () => ({
  sendDeviceCommand: vi.fn()
}));

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock auth utils
vi.mock('../utils/auth', () => ({
  logoutUser: vi.fn()
}));

describe('Settings Device Command Tab - Property-Based Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 1: Whitespace IMEI Rejection
   * For any string composed entirely of whitespace characters, attempting to submit
   * a command with that IMEI should prevent submission and the form should remain
   * in its current state.
   * 
   * Feature: settings-device-command-tab, Property 1: Whitespace IMEI Rejection
   * Validates: Requirements 3.2
   */
  describe('Property 1: Whitespace IMEI Rejection', () => {
    it('should prevent submission for all whitespace IMEI strings', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random whitespace strings (spaces, tabs, newlines)
          fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 5 }).map(chars => chars.join('')),
          async (whitespaceIMEI) => {
            sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
            
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Fill in form with whitespace IMEI
              const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
              const commandSelect = screen.getByRole('combobox');
              const submitButton = screen.getByRole('button', { name: 'Send Command' });
              
              fireEvent.change(imeiInput, { target: { value: whitespaceIMEI } });
              fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
              
              // Store the values before clicking submit
              const imeiValueBefore = imeiInput.value;
              const commandValueBefore = commandSelect.value;
              
              fireEvent.click(submitButton);
              
              // Wait for validation to complete
              await waitFor(() => {
                expect(sendDeviceCommand).not.toHaveBeenCalled();
              }, { timeout: 1000 });
              
              // Error message should be displayed
              const alerts = screen.getAllByRole('alert');
              expect(alerts.length).toBeGreaterThan(0);
              
              // Form data should remain intact
              expect(imeiInput.value).toBe(imeiValueBefore);
              expect(commandSelect.value).toBe(commandValueBefore);
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });
  });

  /**
   * Property 2: Non-empty IMEI Acceptance
   * For any non-empty string that contains at least one non-whitespace character,
   * the Device Command tab should accept it as a valid IMEI and allow command
   * submission to proceed.
   * 
   * Feature: settings-device-command-tab, Property 2: Non-empty IMEI Acceptance
   * Validates: Requirements 3.4
   */
  describe('Property 2: Non-empty IMEI Acceptance', () => {
    it('should accept all non-empty strings with at least one non-whitespace character', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random non-empty strings with at least one non-whitespace character
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          async (validIMEI) => {
            sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
            
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Fill in form with valid IMEI
              const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
              const commandSelect = screen.getByRole('combobox');
              const submitButton = screen.getByRole('button', { name: 'Send Command' });
              
              fireEvent.change(imeiInput, { target: { value: validIMEI } });
              fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
              fireEvent.click(submitButton);
              
              // Wait for API call
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalledWith(validIMEI.trim(), 'STOP_SOS', {});
              });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Simple Command Submission
   * For any command type in the simple command set, when that command is selected
   * with a valid IMEI, the form should allow submission without requiring any
   * additional parameters.
   * 
   * Feature: settings-device-command-tab, Property 3: Simple Command Submission
   * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12
   */
  describe('Property 3: Simple Command Submission', () => {
    it('should allow submission of all simple commands with only IMEI', async () => {
      const simpleCommands = [
        'STOP_SOS', 'QUERY_NORMAL', 'QUERY_DEVICE_SETTINGS', 'CALL_ENABLE',
        'CALL_DISABLE', 'LED_ON', 'LED_OFF', 'AMBIENT_ENABLE',
        'AMBIENT_DISABLE', 'AMBIENT_STOP', 'AIRPLANE_ENABLE', 'GPS_DISABLE'
      ];
      
      await fc.assert(
        fc.asyncProperty(
          // Generate random selections from simple command set
          fc.constantFrom(...simpleCommands),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          async (command, imei) => {
            sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
            
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Fill in form
              const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
              const commandSelect = screen.getByRole('combobox');
              const submitButton = screen.getByRole('button', { name: 'Send Command' });
              
              fireEvent.change(imeiInput, { target: { value: imei } });
              fireEvent.change(commandSelect, { target: { value: command } });
              
              // Verify no parameter inputs are shown
              expect(screen.queryByText('Optional Parameters')).not.toBeInTheDocument();
              
              fireEvent.click(submitButton);
              
              // Wait for API call
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalledWith(imei.trim(), command, {});
              });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Device Settings Parameter Combinations
   * For any subset of DEVICE_SETTINGS parameters (including the empty set),
   * when DEVICE_SETTINGS command is selected with a valid IMEI, the form should
   * allow submission with that parameter combination.
   * 
   * Feature: settings-device-command-tab, Property 4: Device Settings Parameter Combinations
   * Validates: Requirements 6.2, 6.3
   */
  describe('Property 4: Device Settings Parameter Combinations', () => {
    it('should allow submission with any combination of DEVICE_SETTINGS parameters', async () => {
      const parameterNames = [
        'NormalSendingInterval', 'SOSSendingInterval', 'NormalScanningInterval',
        'AirplaneInterval', 'TemperatureLimit', 'SpeedLimit', 'LowbatLimit'
      ];
      
      // Map parameter names to their labels for finding inputs
      const labelMap = {
        'NormalSendingInterval': 'Normal Sending Interval',
        'SOSSendingInterval': 'SOS Sending Interval',
        'NormalScanningInterval': 'Normal Scanning Interval',
        'AirplaneInterval': 'Airplane Interval',
        'TemperatureLimit': 'Temperature Limit',
        'SpeedLimit': 'Speed Limit',
        'LowbatLimit': 'Low Battery Limit'
      };
      
      await fc.assert(
        fc.asyncProperty(
          // Generate random subsets of parameters
          fc.subarray(parameterNames),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          async (selectedParams, imei) => {
            sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
            
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Fill in form
              const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
              const commandSelect = screen.getByRole('combobox');
              
              fireEvent.change(imeiInput, { target: { value: imei } });
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Fill in selected parameters with valid values
              const expectedParams = {};
              for (const param of selectedParams) {
                let value;
                if (param === 'LowbatLimit') {
                  value = '50'; // Valid value between 0-100
                } else if (param === 'TemperatureLimit') {
                  value = '25'; // Valid numeric value
                } else if (param === 'SpeedLimit') {
                  value = '80'; // Valid positive numeric value
                } else {
                  value = '60'; // Valid positive integer for intervals
                }
                
                // Find input by label instead of placeholder
                const label = screen.getByText(labelMap[param]);
                const input = label.parentElement.querySelector('input');
                fireEvent.change(input, { target: { value } });
                expectedParams[param] = value;
              }
              
              const submitButton = screen.getByRole('button', { name: 'Send Command' });
              fireEvent.click(submitButton);
              
              // Wait for API call
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalledWith(
                  imei.trim(),
                  'DEVICE_SETTINGS',
                  expectedParams
                );
              }, { timeout: 2000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });
  });

  /**
   * Property 5: Interval Parameter Validation
   * For any interval parameter field, when a value is provided, the validation
   * should accept positive integer strings and reject non-positive values,
   * non-integer values, and non-numeric strings.
   * 
   * Feature: settings-device-command-tab, Property 5: Interval Parameter Validation
   * Validates: Requirements 6.4, 6.5, 6.6, 6.7
   */
  describe('Property 5: Interval Parameter Validation', () => {
    it('should accept positive integer strings for interval parameters', async () => {
      const intervalParams = [
        'NormalSendingInterval', 'SOSSendingInterval',
        'NormalScanningInterval', 'AirplaneInterval'
      ];
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...intervalParams),
          fc.integer({ min: 1, max: 10000 }),
          async (paramName, positiveInt) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find the input by its label
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval'
              };
              
              const label = screen.getByText(labelMap[paramName]);
              const input = label.parentElement.querySelector('input');
              
              // Enter positive integer
              fireEvent.change(input, { target: { value: positiveInt.toString() } });
              fireEvent.blur(input);
              
              // Should not show error
              await waitFor(() => {
                const errorId = `${paramName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}-error`;
                expect(screen.queryByRole('alert', { id: errorId })).not.toBeInTheDocument();
              });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid values for interval parameters', async () => {
      const intervalParams = [
        'NormalSendingInterval', 'SOSSendingInterval',
        'NormalScanningInterval', 'AirplaneInterval'
      ];
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...intervalParams),
          fc.oneof(
            fc.constant('0'),
            fc.constant('-1'),
            fc.constant('abc'),
            fc.constant('12.5'),
            fc.constant('')
          ).filter(v => v !== ''), // Empty is allowed (optional parameter)
          async (paramName, invalidValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find the input by its label
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval'
              };
              
              const label = screen.getByText(labelMap[paramName]);
              const input = label.parentElement.querySelector('input');
              
              // Enter invalid value
              fireEvent.change(input, { target: { value: invalidValue } });
              fireEvent.blur(input);
              
              // Should show error
              await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts.length).toBeGreaterThan(0);
              });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Temperature Limit Validation
   * For any value provided to TemperatureLimit, the validation should accept
   * any numeric string (including negative numbers and decimals) and reject
   * non-numeric strings.
   * 
   * Feature: settings-device-command-tab, Property 6: Temperature Limit Validation
   * Validates: Requirements 6.8
   */
  describe('Property 6: Temperature Limit Validation', () => {
    it('should accept any numeric string for TemperatureLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer({ min: -100, max: 100 }),
            fc.float({ min: -100, max: 100 }).filter(n => !isNaN(n) && isFinite(n))
          ),
          async (numericValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find Temperature Limit input
              const label = screen.getByText('Temperature Limit');
              const input = label.parentElement.querySelector('input');
              
              // Enter numeric value
              fireEvent.change(input, { target: { value: numericValue.toString() } });
              fireEvent.blur(input);
              
              // Should not show error
              await waitFor(() => {
                expect(screen.queryByRole('alert', { id: 'temperature-limit-error' })).not.toBeInTheDocument();
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });

    it('should reject non-numeric strings for TemperatureLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('abc', 'xyz', 'test', '!!!', '@@@'),
          async (nonNumericValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find Temperature Limit input
              const label = screen.getByText('Temperature Limit');
              const input = label.parentElement.querySelector('input');
              
              // Enter non-numeric value
              fireEvent.change(input, { target: { value: nonNumericValue } });
              fireEvent.blur(input);
              
              // Should show error
              await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts.length).toBeGreaterThan(0);
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    }, 15000);
  });

  /**
   * Property 7: Speed Limit Validation
   * For any value provided to SpeedLimit, the validation should accept positive
   * numeric strings (including decimals) and reject non-positive values and
   * non-numeric strings.
   * 
   * Feature: settings-device-command-tab, Property 7: Speed Limit Validation
   * Validates: Requirements 6.9
   */
  describe('Property 7: Speed Limit Validation', () => {
    it('should accept positive numeric strings for SpeedLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer({ min: 1, max: 500 }),
            fc.float({ min: Math.fround(0.1), max: Math.fround(500) }).filter(n => !isNaN(n) && isFinite(n) && n > 0)
          ),
          async (positiveNumeric) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find Speed Limit input
              const label = screen.getByText('Speed Limit');
              const input = label.parentElement.querySelector('input');
              
              // Enter positive numeric value
              fireEvent.change(input, { target: { value: positiveNumeric.toString() } });
              fireEvent.blur(input);
              
              // Should not show error
              await waitFor(() => {
                expect(screen.queryByRole('alert', { id: 'speed-limit-error' })).not.toBeInTheDocument();
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });

    it('should reject non-positive and non-numeric values for SpeedLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('0', '-1', '-10.5', 'abc', 'xyz', 'test'),
          async (invalidValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find Speed Limit input
              const label = screen.getByText('Speed Limit');
              const input = label.parentElement.querySelector('input');
              
              // Enter invalid value
              fireEvent.change(input, { target: { value: invalidValue } });
              fireEvent.blur(input);
              
              // Should show error
              await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts.length).toBeGreaterThan(0);
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    }, 15000);
  });

  /**
   * Property 8: Battery Limit Range Validation
   * For any numeric value provided to LowbatLimit, the validation should accept
   * values in the range [0, 100] and reject values outside this range or
   * non-numeric strings.
   * 
   * Feature: settings-device-command-tab, Property 8: Battery Limit Range Validation
   * Validates: Requirements 6.10
   */
  describe('Property 8: Battery Limit Range Validation', () => {
    it('should accept values in range [0, 100] for LowbatLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          async (validBatteryValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find Low Battery Limit input
              const label = screen.getByText('Low Battery Limit');
              const input = label.parentElement.querySelector('input');
              
              // Enter valid value
              fireEvent.change(input, { target: { value: validBatteryValue.toString() } });
              fireEvent.blur(input);
              
              // Should not show error
              await waitFor(() => {
                expect(screen.queryByRole('alert', { id: 'lowbat-limit-error' })).not.toBeInTheDocument();
              });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject values outside range [0, 100] for LowbatLimit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.integer({ min: -100, max: -1 }),
            fc.integer({ min: 101, max: 200 }),
            fc.string({ minLength: 1, maxLength: 5 }).filter(s => {
              const trimmed = s.trim();
              return trimmed.length > 0 && isNaN(Number(trimmed));
            })
          ),
          async (invalidValue) => {
            const { unmount } = render(
              <BrowserRouter>
                <Settings />
              </BrowserRouter>
            );
            
            try {
              // Switch to Device Command tab
              const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
              fireEvent.click(deviceCommandTab);
              
              // Select DEVICE_SETTINGS
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              // Find Low Battery Limit input
              const label = screen.getByText('Low Battery Limit');
              const input = label.parentElement.querySelector('input');
              
              // Enter invalid value
              const valueStr = typeof invalidValue === 'number' ? invalidValue.toString() : invalidValue;
              fireEvent.change(input, { target: { value: valueStr } });
              fireEvent.blur(input);
              
              // Should show error
              await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts.length).toBeGreaterThan(0);
              }, { timeout: 1000 });
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    }, 15000);
  });
});
