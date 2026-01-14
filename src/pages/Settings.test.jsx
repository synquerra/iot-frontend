import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
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

/**
 * Unit Tests for Settings Component
 * 
 * Feature: settings-device-command-tab
 * Tests specific examples and edge cases for the Device Command tab functionality
 */

describe('Settings Component - Unit Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  /**
   * Sub-task 10.1: Test tab structure
   * Requirements: 1.1, 1.2, 1.3
   */
  describe('Tab structure', () => {
    it('should render Settings with exactly 2 tabs', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Check for Account tab
      expect(screen.getByRole('button', { name: /👤\s*Account/i })).toBeInTheDocument();
      
      // Check for Device Command tab
      expect(screen.getByRole('button', { name: /📡\s*Device Command/i })).toBeInTheDocument();
      
      // Verify only 2 tabs exist
      const tabButtons = screen.getAllByRole('button').filter(button => 
        button.textContent.includes('Account') || button.textContent.includes('Device Command')
      );
      expect(tabButtons).toHaveLength(2);
    });

    it('should not render excluded tabs (Preferences, Notifications, Security)', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Verify excluded tab buttons are not present
      expect(screen.queryByRole('button', { name: /Preferences/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Notifications/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Security/i })).not.toBeInTheDocument();
    });

    it('should default to Account tab on initial load', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Account tab should be active (has gradient background)
      const accountTab = screen.getByRole('button', { name: /👤\s*Account/i });
      expect(accountTab).toHaveClass('from-indigo-500/80', 'to-purple-500/80');
      
      // Account content should be visible
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    });
  });

  /**
   * Sub-task 10.2: Test Device Command tab rendering
   * Requirements: 2.1, 3.1, 4.1, 4.4, 6.1
   */
  describe('Device Command tab rendering', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
    });

    it('should render IMEI input field', () => {
      expect(screen.getByText('Device IMEI')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter 15-digit IMEI')).toBeInTheDocument();
    });

    it('should render command selector dropdown', () => {
      expect(screen.getByText('Command Type')).toBeInTheDocument();
      
      const commandSelect = screen.getByRole('combobox');
      expect(commandSelect.tagName).toBe('SELECT');
      
      // Verify default option
      expect(screen.getByRole('option', { name: 'Select a command...' })).toBeInTheDocument();
    });

    it('should render submit button', () => {
      expect(screen.getByRole('button', { name: 'Send Command' })).toBeInTheDocument();
    });

    it('should show parameter inputs when DEVICE_SETTINGS is selected', () => {
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      
      // Verify parameter section header
      expect(screen.getByText('Optional Parameters')).toBeInTheDocument();
      
      // Verify all 7 parameter labels
      expect(screen.getByText('Normal Sending Interval')).toBeInTheDocument();
      expect(screen.getByText('SOS Sending Interval')).toBeInTheDocument();
      expect(screen.getByText('Normal Scanning Interval')).toBeInTheDocument();
      expect(screen.getByText('Airplane Interval')).toBeInTheDocument();
      expect(screen.getByText('Temperature Limit')).toBeInTheDocument();
      expect(screen.getByText('Speed Limit')).toBeInTheDocument();
      expect(screen.getByText('Low Battery Limit')).toBeInTheDocument();
    });

    it('should not show parameter inputs for simple commands', () => {
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      // Verify parameter section is not present
      expect(screen.queryByText('Optional Parameters')).not.toBeInTheDocument();
      expect(screen.queryByText('Normal Sending Interval')).not.toBeInTheDocument();
    });
  });

  /**
   * Sub-task 10.3: Test form interactions
   * Requirements: 2.1
   */
  describe('Form interactions', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
    });

    it('should update IMEI input state when user types', () => {
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      
      expect(imeiInput.value).toBe('123456789012345');
    });

    it('should update command selector state when user selects a command', () => {
      const commandSelect = screen.getByRole('combobox');
      
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      expect(commandSelect.value).toBe('STOP_SOS');
    });

    it('should update parameter inputs state when user types', () => {
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      
      const normalSendingInput = screen.getByPlaceholderText('e.g., 60');
      fireEvent.change(normalSendingInput, { target: { value: '60' } });
      
      expect(normalSendingInput.value).toBe('60');
    });

    it('should reset params when command type changes', () => {
      const commandSelect = screen.getByRole('combobox');
      
      // Select DEVICE_SETTINGS and fill a parameter
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      const normalSendingInput = screen.getByPlaceholderText('e.g., 60');
      fireEvent.change(normalSendingInput, { target: { value: '60' } });
      expect(normalSendingInput.value).toBe('60');
      
      // Change to a different command
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      // Change back to DEVICE_SETTINGS
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      
      // Parameter should be cleared
      const normalSendingInputAfter = screen.getByPlaceholderText('e.g., 60');
      expect(normalSendingInputAfter.value).toBe('');
    });

    it('should call handleSubmit when submit button is clicked', async () => {
      vi.useRealTimers(); // Use real timers for async operations
      sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(sendDeviceCommand).toHaveBeenCalledTimes(1);
      });
      
      vi.useFakeTimers(); // Restore fake timers
    });
  });

  /**
   * Sub-task 10.4: Test API integration
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
   */
  describe('API integration', () => {
    beforeEach(() => {
      vi.useRealTimers(); // Use real timers for async API tests
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
    });

    afterEach(() => {
      vi.useFakeTimers(); // Restore fake timers after each test
    });

    it('should call sendDeviceCommand with correct arguments for simple command', async () => {
      sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(sendDeviceCommand).toHaveBeenCalledWith('123456789012345', 'STOP_SOS', {});
      });
    });

    it('should call sendDeviceCommand with parameters for DEVICE_SETTINGS', async () => {
      sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      
      const normalSendingInput = screen.getByPlaceholderText('e.g., 60');
      const sosIntervalInput = screen.getByPlaceholderText('e.g., 10');
      
      fireEvent.change(normalSendingInput, { target: { value: '60' } });
      fireEvent.change(sosIntervalInput, { target: { value: '10' } });
      
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(sendDeviceCommand).toHaveBeenCalledWith('123456789012345', 'DEVICE_SETTINGS', {
          NormalSendingInterval: '60',
          SOSSendingInterval: '10'
        });
      });
    });

    it('should show loading state during API call', async () => {
      sendDeviceCommand.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      // Button should show loading text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sending...' })).toBeInTheDocument();
      });
      
      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Send Command' })).toBeInTheDocument();
      });
    });

    it('should clear form on successful submission', async () => {
      sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(imeiInput.value).toBe('');
        expect(commandSelect.value).toBe('');
      });
    });

    it('should display success notification on successful submission', async () => {
      sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent successfully' });
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Command sent successfully/i)).toBeInTheDocument();
      });
    });

    it('should display validation error notification', async () => {
      const validationError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid IMEI format'
      };
      sendDeviceCommand.mockRejectedValue(validationError);
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Validation Error: Invalid IMEI format/i)).toBeInTheDocument();
      });
    });

    it('should display network error notification', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Connection timeout'
      };
      sendDeviceCommand.mockRejectedValue(networkError);
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Network Error: Please check your connection/i)).toBeInTheDocument();
      });
    });

    it('should display API error notification with status code', async () => {
      const apiError = {
        code: 'API_ERROR',
        message: 'Internal server error',
        details: { statusCode: 500 }
      };
      sendDeviceCommand.mockRejectedValue(apiError);
      
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '123456789012345' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/API Error: Internal server error/i)).toBeInTheDocument();
        expect(screen.getByText(/Status: 500/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Sub-task 10.5: Test validation
   * Requirements: 3.2, 3.3
   */
  describe('Validation', () => {
    beforeEach(() => {
      vi.useRealTimers(); // Use real timers for async validation tests
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
    });

    afterEach(() => {
      vi.useFakeTimers(); // Restore fake timers after each test
    });

    it('should prevent submission when IMEI is empty', async () => {
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
        const errorMessages = screen.getAllByText(/IMEI is required/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
      
      expect(sendDeviceCommand).not.toHaveBeenCalled();
    });

    it('should prevent submission when IMEI contains only whitespace', async () => {
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      const commandSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Send Command' });
      
      fireEvent.change(imeiInput, { target: { value: '   ' } });
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
        const errorMessages = screen.getAllByText(/IMEI is required/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
      
      expect(sendDeviceCommand).not.toHaveBeenCalled();
    });

    it('should display inline validation error message for empty IMEI on blur', () => {
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      
      fireEvent.blur(imeiInput);
      
      expect(screen.getByText(/IMEI is required/i)).toBeInTheDocument();
    });

    it('should clear IMEI error when user starts typing', () => {
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      
      // Trigger error
      fireEvent.blur(imeiInput);
      expect(screen.getByText(/IMEI is required/i)).toBeInTheDocument();
      
      // Start typing
      fireEvent.change(imeiInput, { target: { value: '1' } });
      
      // Error should be cleared
      expect(screen.queryByText(/IMEI is required/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Sub-task 10.6: Test accessibility
   * Requirements: 8.2, 8.3, 8.4
   */
  describe('Accessibility', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
    });

    it('should have labels for all inputs', () => {
      expect(screen.getByText('Device IMEI')).toBeInTheDocument();
      expect(screen.getByText('Command Type')).toBeInTheDocument();
    });

    it('should have placeholders for all text inputs', () => {
      expect(screen.getByPlaceholderText('Enter 15-digit IMEI')).toBeInTheDocument();
    });

    it('should have helper text for parameter fields', () => {
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      
      expect(screen.getByText(/Interval in seconds for normal data transmission/i)).toBeInTheDocument();
      expect(screen.getByText(/Interval in seconds for SOS mode data transmission/i)).toBeInTheDocument();
      expect(screen.getByText(/Interval in seconds for GPS scanning in normal mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Interval in seconds for airplane mode operations/i)).toBeInTheDocument();
      expect(screen.getByText(/Temperature threshold in degrees Celsius/i)).toBeInTheDocument();
      expect(screen.getByText(/Speed threshold in km\/h/i)).toBeInTheDocument();
      expect(screen.getByText(/Battery percentage threshold \(0-100\)/i)).toBeInTheDocument();
    });

    it('should have aria-invalid attribute when IMEI has error', () => {
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      
      fireEvent.blur(imeiInput);
      
      expect(imeiInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby linking to error message', () => {
      const imeiInput = screen.getByPlaceholderText('Enter 15-digit IMEI');
      
      fireEvent.blur(imeiInput);
      
      expect(imeiInput).toHaveAttribute('aria-describedby', 'imei-error');
      const errorElement = screen.getByText(/IMEI is required/i);
      expect(errorElement).toHaveAttribute('id', 'imei-error');
    });

    it('should have aria-describedby linking to helper text for parameters', () => {
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });
      
      const normalSendingInput = screen.getByPlaceholderText('e.g., 60');
      expect(normalSendingInput).toHaveAttribute('aria-describedby', 'normal-sending-interval-help');
    });
  });
});
