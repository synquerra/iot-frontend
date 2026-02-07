/**
 * Property-Based Tests for DeviceSettings API Call Triggering
 * 
 * Feature: device-command-migration
 * Property 4: API Call Triggers Command Submission
 * 
 * These tests verify that valid command states trigger API calls with correct parameters
 * across many randomly generated inputs to ensure correctness.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import fc from 'fast-check';
import DeviceSettings from './DeviceSettings.jsx';
import { sendDeviceCommand } from '../utils/deviceCommandAPI.js';

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

describe('DeviceSettings API Call Triggering - Property-Based Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 4: API Call Triggers Command Submission
   * For any valid command state, when validation succeeds and submit is clicked,
   * the sendDeviceCommand API should be called with the route IMEI, selected command type,
   * and non-empty parameters.
   * 
   * Feature: device-command-migration, Property 4: API Call Triggers Command Submission
   * Validates: Requirements 5.5
   */
  describe('Property 4: API Call Triggers Command Submission', () => {
    
    /**
     * Test: Commands without parameters should trigger API call with IMEI and command only
     * Verifies that non-DEVICE_SETTINGS commands call the API with correct arguments
     */
    it('should call API with IMEI and command for commands without parameters', async () => {
      const commandsWithoutParams = [
        'STOP_SOS',
        'QUERY_NORMAL',
        'QUERY_DEVICE_SETTINGS',
        'CALL_ENABLE',
        'CALL_DISABLE',
        'LED_ON',
        'LED_OFF',
        'AMBIENT_ENABLE',
        'AMBIENT_DISABLE',
        'AMBIENT_STOP',
        'AIRPLANE_ENABLE',
        'GPS_DISABLE'
      ];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...commandsWithoutParams),
          async (command) => {
            // Clear mocks before each iteration
            vi.clearAllMocks();
            
            // Mock successful API response
            sendDeviceCommand.mockResolvedValueOnce({ success: true });
            
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

              // Select command
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: command } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe(command);
              });

              // Find the submit button
              const submitButton = screen.getByRole('button', { name: /Send Command/i });
              
              // Submit the command
              fireEvent.click(submitButton);
              
              // Wait for API to be called
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalled();
              }, { timeout: 2000 });
              
              // Verify API was called with correct arguments
              expect(sendDeviceCommand).toHaveBeenCalledTimes(1);
              const apiCall = sendDeviceCommand.mock.calls[0];
              
              // Verify IMEI (default test IMEI)
              expect(apiCall[0]).toBe('862942074957887');
              
              // Verify command type
              expect(apiCall[1]).toBe(command);
              
              // Verify params (should be empty object for commands without parameters)
              expect(apiCall[2]).toEqual({});
              
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
     * Test: DEVICE_SETTINGS with parameters should trigger API call with all non-empty params
     * Verifies that only non-empty parameters are sent to the API
     */
    it('should call API with IMEI, command, and non-empty parameters for DEVICE_SETTINGS', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            NormalSendingInterval: fc.option(fc.integer({ min: 1, max: 1000 }).map(n => n.toString()), { nil: '' }),
            SOSSendingInterval: fc.option(fc.integer({ min: 1, max: 1000 }).map(n => n.toString()), { nil: '' }),
            NormalScanningInterval: fc.option(fc.integer({ min: 1, max: 1000 }).map(n => n.toString()), { nil: '' }),
            AirplaneInterval: fc.option(fc.integer({ min: 1, max: 1000 }).map(n => n.toString()), { nil: '' }),
            TemperatureLimit: fc.option(fc.integer({ min: -50, max: 100 }).map(n => n.toString()), { nil: '' }),
            SpeedLimit: fc.option(fc.integer({ min: 1, max: 300 }).map(n => n.toString()), { nil: '' }),
            LowbatLimit: fc.option(fc.integer({ min: 0, max: 100 }).map(n => n.toString()), { nil: '' })
          }),
          async (params) => {
            // Clear mocks before each iteration
            vi.clearAllMocks();
            
            // Mock successful API response
            sendDeviceCommand.mockResolvedValueOnce({ success: true });
            
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

              // Select DEVICE_SETTINGS command
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Enter parameters
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval',
                'TemperatureLimit': 'Temperature Limit',
                'SpeedLimit': 'Speed Limit',
                'LowbatLimit': 'Low Battery Limit'
              };
              
              for (const [paramName, value] of Object.entries(params)) {
                const input = screen.getByLabelText(labelMap[paramName]);
                fireEvent.change(input, { target: { value } });
                if (value !== '') {
                  fireEvent.blur(input);
                }
              }
              
              // Wait for validation to complete
              await waitFor(() => {
                const errorTexts = screen.queryAllByText(/must be|required|invalid|between/i);
                const paramErrors = errorTexts.filter(el => 
                  el.className && el.className.includes('text-red')
                );
                expect(paramErrors.length).toBe(0);
              }, { timeout: 1000 });

              // Find the submit button
              const submitButton = screen.getByRole('button', { name: /Send Command/i });
              
              // Submit the command
              fireEvent.click(submitButton);
              
              // Wait for API to be called
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalled();
              }, { timeout: 2000 });
              
              // Verify API was called with correct arguments
              expect(sendDeviceCommand).toHaveBeenCalledTimes(1);
              const apiCall = sendDeviceCommand.mock.calls[0];
              
              // Verify IMEI (default test IMEI)
              expect(apiCall[0]).toBe('862942074957887');
              
              // Verify command type
              expect(apiCall[1]).toBe('DEVICE_SETTINGS');
              
              // Verify params - only non-empty parameters should be sent
              const sentParams = apiCall[2];
              
              // Build expected params (only non-empty values)
              const expectedParams = {};
              for (const [key, value] of Object.entries(params)) {
                if (value !== '') {
                  expectedParams[key] = value;
                }
              }
              
              // Verify sent params match expected params
              expect(sentParams).toEqual(expectedParams);
              
              // Verify empty parameters are NOT sent
              for (const [key, value] of Object.entries(params)) {
                if (value === '') {
                  expect(sentParams[key]).toBeUndefined();
                }
              }
              
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
     * Test: DEVICE_SETTINGS with all empty parameters should trigger API call with empty params object
     * Verifies that DEVICE_SETTINGS can be submitted with no parameters
     */
    it('should call API with empty params object when all DEVICE_SETTINGS parameters are empty', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Clear mocks before each iteration
            vi.clearAllMocks();
            
            // Mock successful API response
            sendDeviceCommand.mockResolvedValueOnce({ success: true });
            
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

              // Select DEVICE_SETTINGS command
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Don't enter any parameters (leave all empty)
              
              // Find the submit button
              const submitButton = screen.getByRole('button', { name: /Send Command/i });
              
              // Submit the command with empty parameters
              fireEvent.click(submitButton);
              
              // Wait for API to be called
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalled();
              }, { timeout: 2000 });
              
              // Verify API was called with correct arguments
              expect(sendDeviceCommand).toHaveBeenCalledTimes(1);
              const apiCall = sendDeviceCommand.mock.calls[0];
              
              // Verify IMEI (default test IMEI)
              expect(apiCall[0]).toBe('862942074957887');
              
              // Verify command type
              expect(apiCall[1]).toBe('DEVICE_SETTINGS');
              
              // Verify params is an empty object
              expect(apiCall[2]).toEqual({});
              
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
     * Test: Mixed valid and empty parameters should only send non-empty params to API
     * Verifies that the API receives only the parameters that have values
     */
    it('should call API with only non-empty parameters for DEVICE_SETTINGS', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Generate a mix of filled and empty parameters
            NormalSendingInterval: fc.oneof(
              fc.integer({ min: 1, max: 100 }).map(n => n.toString()),
              fc.constant('')
            ),
            SOSSendingInterval: fc.oneof(
              fc.integer({ min: 1, max: 100 }).map(n => n.toString()),
              fc.constant('')
            ),
            NormalScanningInterval: fc.oneof(
              fc.integer({ min: 1, max: 100 }).map(n => n.toString()),
              fc.constant('')
            ),
            AirplaneInterval: fc.oneof(
              fc.integer({ min: 1, max: 100 }).map(n => n.toString()),
              fc.constant('')
            ),
            TemperatureLimit: fc.oneof(
              fc.integer({ min: -50, max: 100 }).map(n => n.toString()),
              fc.constant('')
            ),
            SpeedLimit: fc.oneof(
              fc.integer({ min: 1, max: 200 }).map(n => n.toString()),
              fc.constant('')
            ),
            LowbatLimit: fc.oneof(
              fc.integer({ min: 0, max: 100 }).map(n => n.toString()),
              fc.constant('')
            )
          }),
          async (params) => {
            // Clear mocks before each iteration
            vi.clearAllMocks();
            
            // Mock successful API response
            sendDeviceCommand.mockResolvedValueOnce({ success: true });
            
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

              // Select DEVICE_SETTINGS command
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe('DEVICE_SETTINGS');
              });

              // Enter parameters (both filled and empty)
              const labelMap = {
                'NormalSendingInterval': 'Normal Sending Interval',
                'SOSSendingInterval': 'SOS Sending Interval',
                'NormalScanningInterval': 'Normal Scanning Interval',
                'AirplaneInterval': 'Airplane Interval',
                'TemperatureLimit': 'Temperature Limit',
                'SpeedLimit': 'Speed Limit',
                'LowbatLimit': 'Low Battery Limit'
              };
              
              for (const [paramName, value] of Object.entries(params)) {
                const input = screen.getByLabelText(labelMap[paramName]);
                fireEvent.change(input, { target: { value } });
                if (value !== '') {
                  fireEvent.blur(input);
                }
              }
              
              // Wait for validation to complete
              await waitFor(() => {
                const errorTexts = screen.queryAllByText(/must be|required|invalid|between/i);
                const paramErrors = errorTexts.filter(el => 
                  el.className && el.className.includes('text-red')
                );
                expect(paramErrors.length).toBe(0);
              }, { timeout: 1000 });

              // Find the submit button
              const submitButton = screen.getByRole('button', { name: /Send Command/i });
              
              // Submit the command
              fireEvent.click(submitButton);
              
              // Wait for API to be called
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalled();
              }, { timeout: 2000 });
              
              // Verify API was called with correct arguments
              expect(sendDeviceCommand).toHaveBeenCalledTimes(1);
              const apiCall = sendDeviceCommand.mock.calls[0];
              
              // Verify IMEI (default test IMEI)
              expect(apiCall[0]).toBe('862942074957887');
              
              // Verify command type
              expect(apiCall[1]).toBe('DEVICE_SETTINGS');
              
              // Verify params - only non-empty parameters should be sent
              const sentParams = apiCall[2];
              
              // Build expected params (only non-empty values)
              const expectedParams = {};
              for (const [key, value] of Object.entries(params)) {
                if (value !== '') {
                  expectedParams[key] = value;
                }
              }
              
              // Verify sent params match expected params
              expect(sentParams).toEqual(expectedParams);
              
              // Verify empty parameters are NOT sent
              for (const [key, value] of Object.entries(params)) {
                if (value === '') {
                  expect(sentParams[key]).toBeUndefined();
                }
              }
              
              // Verify that the number of keys in sentParams matches non-empty params
              const nonEmptyCount = Object.values(params).filter(v => v !== '').length;
              expect(Object.keys(sentParams).length).toBe(nonEmptyCount);
              
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
     * Test: API should be called exactly once per submission
     * Verifies that the API is not called multiple times for a single submission
     */
    it('should call API exactly once per valid submission', async () => {
      const allCommands = [
        'STOP_SOS',
        'QUERY_NORMAL',
        'QUERY_DEVICE_SETTINGS',
        'DEVICE_SETTINGS',
        'CALL_ENABLE',
        'CALL_DISABLE',
        'LED_ON',
        'LED_OFF',
        'AMBIENT_ENABLE',
        'AMBIENT_DISABLE',
        'AMBIENT_STOP',
        'AIRPLANE_ENABLE',
        'GPS_DISABLE'
      ];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...allCommands),
          async (command) => {
            // Clear mocks before each iteration
            vi.clearAllMocks();
            
            // Mock successful API response
            sendDeviceCommand.mockResolvedValueOnce({ success: true });
            
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

              // Select command
              const commandSelect = screen.getByRole('combobox');
              fireEvent.change(commandSelect, { target: { value: command } });
              
              await waitFor(() => {
                expect(commandSelect.value).toBe(command);
              });

              // Find the submit button
              const submitButton = screen.getByRole('button', { name: /Send Command/i });
              
              // Submit the command
              fireEvent.click(submitButton);
              
              // Wait for API to be called
              await waitFor(() => {
                expect(sendDeviceCommand).toHaveBeenCalled();
              }, { timeout: 2000 });
              
              // Verify API was called exactly once
              expect(sendDeviceCommand).toHaveBeenCalledTimes(1);
              
              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 5, timeout: 30000 }
      );
    }, 60000);
  });
});
