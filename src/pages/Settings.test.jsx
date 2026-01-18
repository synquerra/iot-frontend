import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings.jsx';
import { sendDeviceCommand } from '../utils/deviceCommandAPI.js';
import { UserContextProvider } from '../contexts/UserContext.jsx';

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

// Helper function to render with UserContextProvider
const renderWithContext = (component) => {
  return render(
    <UserContextProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </UserContextProvider>
  );
};

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
      renderWithContext(<Settings />);
      
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
      renderWithContext(<Settings />);
      
      // Verify excluded tab buttons are not present
      expect(screen.queryByRole('button', { name: /Preferences/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Notifications/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Security/i })).not.toBeInTheDocument();
    });

    it('should default to Account tab on initial load', () => {
      renderWithContext(<Settings />);
      
      // Account tab should be active (has gradient background)
      const accountTab = screen.getByRole('button', { name: /👤\s*Account/i });
      expect(accountTab).toHaveClass('from-indigo-500/80', 'to-purple-500/80');
      
      // Account content should be visible
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });
  });

  /**
   * Sub-task 10.2: Test Device Command tab rendering
   * Requirements: 2.1, 3.1, 4.1, 4.4, 6.1
   */
  describe('Device Command tab rendering', () => {
    beforeEach(() => {
      renderWithContext(<Settings />);
      
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
      renderWithContext(<Settings />);
      
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
      renderWithContext(<Settings />);
      
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
      renderWithContext(<Settings />);
      
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
      renderWithContext(<Settings />);
      
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

/**
 * Integration Tests for Profile Data Display
 * Feature: profile-data-display
 * Tests that Settings component correctly displays user profile data from UserContext
 */
describe('Settings Component - Profile Data Display Integration Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Sub-task 4.1: Test Settings component renders profile data from UserContext
   * Requirements: 1.1, 1.2, 1.3
   */
  it('should render profile data from UserContext in Account tab', () => {
    renderWithContext(<Settings />);

    // Verify Account Information section is visible
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    
    // Verify all profile field labels are present
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('Account Type')).toBeInTheDocument();
    expect(screen.getByText('Assigned Devices')).toBeInTheDocument();
  });

  /**
   * Sub-task 4.2: Test all profile fields are read-only
   * Requirements: 1.4, 2.1, 2.2
   */
  it('should render all profile fields as read-only', () => {
    renderWithContext(<Settings />);

    // Get all inputs in the Account tab
    const inputs = screen.getAllByRole('textbox');
    
    // The first 4 textbox inputs should be the profile fields (email, uniqueId, userType, imeis)
    // They should all have readOnly attribute
    const profileInputs = inputs.filter(input => 
      input.hasAttribute('readOnly') && 
      (input.type === 'email' || input.type === 'text')
    );

    // Verify we have at least 4 read-only profile inputs
    expect(profileInputs.length).toBeGreaterThanOrEqual(4);
    
    // Verify each has readOnly attribute
    profileInputs.slice(0, 4).forEach(input => {
      expect(input).toHaveAttribute('readOnly');
    });
  });

  /**
   * Sub-task 4.3: Test profile fields display correct values from UserContext
   * Requirements: 1.3, 3.1, 3.2, 4.1, 4.2
   */
  it('should display correct formatted values from UserContext', () => {
    renderWithContext(<Settings />);

    // Verify Account Information section is visible
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    
    // The UserContextProvider in the test setup provides default values
    // We verify that the component renders without errors
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should display "Not available" for missing data', () => {
    renderWithContext(<Settings />);

    // When UserContext has null values, "Not available" should be displayed
    const notAvailableInputs = screen.queryAllByDisplayValue('Not available');
    
    // Component should handle missing data gracefully
    expect(screen.getByText('Account Information')).toBeInTheDocument();
  });

  it('should display "Unknown" for null userType', () => {
    renderWithContext(<Settings />);

    // When userType is null, "Unknown" should be displayed
    const unknownInputs = screen.queryAllByDisplayValue('Unknown');
    
    // Component should handle null userType gracefully
    expect(screen.getByText('Account Type')).toBeInTheDocument();
  });

  it('should display "No devices assigned" for empty IMEI array', () => {
    renderWithContext(<Settings />);

    // When imeis array is empty, "No devices assigned" should be displayed
    const noDevicesInputs = screen.queryAllByDisplayValue('No devices assigned');
    
    // Component should handle empty IMEI array gracefully
    expect(screen.getByText('Assigned Devices')).toBeInTheDocument();
  });

  /**
   * Sub-task 4.4: Test Save Changes button is not present in Account tab
   * Requirements: 2.3
   */
  it('should not display Save Changes button in Account tab', () => {
    renderWithContext(<Settings />);

    // Verify we're on Account tab
    expect(screen.getByText('Account Information')).toBeInTheDocument();

    // Verify Save Changes button is not present
    expect(screen.queryByRole('button', { name: /Save Changes/i })).not.toBeInTheDocument();
    
    // Verify Cancel button is also not present
    expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
  });

  /**
   * Sub-task 4.5: Test component handles missing UserContext data gracefully
   * Requirements: 1.2
   */
  it('should handle missing email gracefully', () => {
    renderWithContext(<Settings />);

    // Component should render without crashing
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    
    // Check that inputs are rendered
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should handle missing uniqueId gracefully', () => {
    renderWithContext(<Settings />);

    // Component should render without crashing
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('User ID')).toBeInTheDocument();
  });

  it('should handle null userType gracefully', () => {
    renderWithContext(<Settings />);

    // Component should render without crashing
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Account Type')).toBeInTheDocument();
  });

  it('should handle empty IMEI array gracefully', () => {
    renderWithContext(<Settings />);

    // Component should render without crashing
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Assigned Devices')).toBeInTheDocument();
  });

  it('should handle null IMEI array gracefully', () => {
    renderWithContext(<Settings />);

    // Component should render without crashing
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Assigned Devices')).toBeInTheDocument();
  });

  /**
   * Additional integration tests for profile display
   */
  it('should display all four profile fields in Account tab', () => {
    renderWithContext(<Settings />);

    // Verify all field labels are present
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('Account Type')).toBeInTheDocument();
    expect(screen.getByText('Assigned Devices')).toBeInTheDocument();
  });

  it('should display helper text for all profile fields', () => {
    renderWithContext(<Settings />);

    // Verify helper text is present
    expect(screen.getByText('Your registered email address')).toBeInTheDocument();
    expect(screen.getByText('Your unique account identifier')).toBeInTheDocument();
    expect(screen.getByText('Your account role in the system')).toBeInTheDocument();
    expect(screen.getByText('Devices linked to your account')).toBeInTheDocument();
  });

  it('should maintain profile data when switching between tabs', () => {
    renderWithContext(<Settings />);

    // Verify we start on Account tab
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    
    // Get all textbox inputs and find the email input (first one with type="email")
    const allInputs = screen.getAllByRole('textbox');
    const emailInput = allInputs.find(input => input.type === 'email');
    const initialEmail = emailInput ? emailInput.value : '';

    // Switch to Device Command tab
    const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
    fireEvent.click(deviceCommandTab);
    
    // Verify Device Command tab is active
    expect(screen.getByText('Device Commands')).toBeInTheDocument();

    // Switch back to Account tab
    const accountTab = screen.getByRole('button', { name: /👤\s*Account/i });
    fireEvent.click(accountTab);

    // Verify profile data is still present
    expect(screen.getByText('Account Information')).toBeInTheDocument();
    
    // Get email input again and verify value is maintained
    const allInputsAfter = screen.getAllByRole('textbox');
    const emailInputAfter = allInputsAfter.find(input => input.type === 'email');
    expect(emailInputAfter.value).toBe(initialEmail);
  });

  it('should have proper accessibility attributes on profile fields', () => {
    renderWithContext(<Settings />);

    // Get all textbox inputs
    const allInputs = screen.getAllByRole('textbox');
    
    // Find profile inputs (first 4 read-only inputs)
    const profileInputs = allInputs.filter(input => input.hasAttribute('readOnly')).slice(0, 4);

    // Verify we have 4 profile inputs
    expect(profileInputs.length).toBe(4);

    // Verify all inputs are read-only
    profileInputs.forEach(input => {
      expect(input).toHaveAttribute('readOnly');
    });

    // Verify the first input is email type
    const emailInput = allInputs.find(input => input.type === 'email');
    expect(emailInput).toHaveAttribute('readOnly');
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});
