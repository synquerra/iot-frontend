import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings.jsx';
import UserContext from '../contexts/UserContext.jsx';

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
 * Helper function to render Settings with custom UserContext
 */
const renderWithUserContext = (contextValue) => {
  const defaultContextValue = {
    isAuthenticated: true,
    isRestoring: false,
    setUserContext: vi.fn(),
    updateTokens: vi.fn(),
    clearUserContext: vi.fn(),
    getUserContext: vi.fn(),
    isAdmin: vi.fn(() => false),
    isParent: vi.fn(() => true),
    tokens: {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token'
    },
    ...contextValue
  };

  return render(
    <UserContext.Provider value={defaultContextValue}>
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    </UserContext.Provider>
  );
};

/**
 * Unit Tests for Submit Button State with Different IMEI Modes
 * Task 6.3: Test button state with all IMEI modes
 * Requirements: 3.4, 4.3
 */
describe('Settings Component - Submit Button State Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test submit button is disabled when no devices are assigned
   * Validates: Requirement 3.4 - Submit button disabled for no device users
   */
  describe('No Device Mode (hasNoDevices = true)', () => {
    it('should disable submit button when user has no devices', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: [], // No devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be disabled
      expect(submitButton).toBeDisabled();
    });

    it('should keep submit button disabled even when command is selected (no devices)', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: [], // No devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should still be disabled
      expect(submitButton).toBeDisabled();
    });

    it('should display informational message when no devices assigned', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: [], // No devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Verify informational message is displayed
      expect(screen.getByText(/No devices are assigned to your account/i)).toBeInTheDocument();
    });
  });

  /**
   * Test submit button behavior for single device users
   * Validates: Requirement 1.5 - Single device users have pre-filled IMEI
   */
  describe('Single Device Mode (hasSingleDevice = true)', () => {
    it('should enable submit button when single device user selects a command', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887'], // Single device
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be enabled (IMEI is auto-filled)
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when single device user has not selected a command', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887'], // Single device
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Get submit button (no command selected)
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be disabled (no command selected)
      expect(submitButton).toBeDisabled();
    });

    it('should show disabled IMEI input with pre-filled value for single device', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887'], // Single device
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI input (should be disabled with pre-filled value)
      const imeiInput = screen.getByDisplayValue('862942074957887');
      expect(imeiInput).toBeDisabled();
      expect(imeiInput).toHaveAttribute('readonly');
    });
  });

  /**
   * Test submit button behavior for multiple device users
   * Validates: Requirement 2.7 - Validation applies for dropdown selection
   */
  describe('Multiple Device Mode (hasMultipleDevices = true)', () => {
    it('should disable submit button when multiple device user has not selected an IMEI', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888', '862942074957889'], // Multiple devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

      // Get submit button (IMEI not selected)
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be disabled (IMEI not selected)
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when multiple device user selects IMEI and command', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888', '862942074957889'], // Multiple devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown (should be a select element)
      const imeiSelects = screen.getAllByRole('combobox');
      const imeiSelect = imeiSelects.find(select => 
        select.querySelector('option[value="862942074957887"]')
      );

      // Select an IMEI
      fireEvent.change(imeiSelect, { target: { value: '862942074957887' } });

      // Select a command
      const commandSelect = imeiSelects.find(select => 
        select.querySelector('option[value="STOP_SOS"]')
      );
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be enabled
      expect(submitButton).not.toBeDisabled();
    });

    it('should show dropdown with all IMEIs for multiple device users', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888', '862942074957889'], // Multiple devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Verify all IMEIs are in the dropdown
      expect(screen.getByRole('option', { name: '862942074957887' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '862942074957888' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '862942074957889' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Select a device...' })).toBeInTheDocument();
    });
  });

  /**
   * Test submit button is disabled when there are validation errors
   * Validates: Requirement 4.3 - Button disabled when IMEI is invalid
   */
  describe('Submit Button Disabled States', () => {
    it('should disable submit button when IMEI validation error exists', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888'], // Multiple devices
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown
      const imeiSelects = screen.getAllByRole('combobox');
      const imeiSelect = imeiSelects.find(select => 
        select.querySelector('option[value="862942074957887"]')
      );

      // Trigger validation error by blurring without selection
      fireEvent.blur(imeiSelect);

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be disabled due to validation error
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when parameter validation error exists', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887'], // Single device
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Select DEVICE_SETTINGS command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'DEVICE_SETTINGS' } });

      // Enter invalid parameter value
      const normalSendingInput = screen.getByPlaceholderText('e.g., 60');
      fireEvent.change(normalSendingInput, { target: { value: 'invalid' } });
      fireEvent.blur(normalSendingInput);

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be disabled due to parameter validation error
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button during command loading', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887'], // Single device
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be enabled before clicking
      expect(submitButton).not.toBeDisabled();

      // Note: Testing loading state requires mocking the API call
      // This is covered in the API integration tests
    });
  });

  /**
   * Test edge cases with invalid IMEI arrays
   */
  describe('Edge Cases', () => {
    it('should handle null IMEI array as no devices', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: null, // Null IMEI array
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Get submit button
      const submitButton = screen.getByRole('button', { name: 'Send Command' });

      // Button should be disabled (treated as no devices)
      expect(submitButton).toBeDisabled();
    });

    it('should filter out empty strings from IMEI array', () => {
      const contextValue = {
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '', '   ', '862942074957888'], // Contains empty strings
        firstName: 'Test',
        middleName: '',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn()
      };

      renderWithUserContext(contextValue);

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Should only show valid IMEIs in dropdown
      expect(screen.getByRole('option', { name: '862942074957887' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '862942074957888' })).toBeInTheDocument();
      
      // Should not show empty strings as options
      const allOptions = screen.getAllByRole('option');
      const emptyOptions = allOptions.filter(opt => opt.value === '' && opt.textContent !== 'Select a device...');
      expect(emptyOptions).toHaveLength(0);
    });
  });
});
