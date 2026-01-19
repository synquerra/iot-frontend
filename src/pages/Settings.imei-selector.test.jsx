import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  const defaultContext = {
    isAuthenticated: true,
    userType: 'PARENTS',
    imeis: [],
    uniqueId: 'test-user-123',
    email: 'test@example.com',
    firstName: 'Test',
    middleName: null,
    lastName: 'User',
    mobile: '1234567890',
    tokens: {
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token'
    },
    isRestoring: false,
    setUserContext: vi.fn(),
    updateTokens: vi.fn(),
    clearUserContext: vi.fn(),
    getUserContext: vi.fn(),
    isAdmin: vi.fn(() => false),
    isParent: vi.fn(() => true),
    ...contextValue
  };

  return render(
    <UserContext.Provider value={defaultContext}>
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    </UserContext.Provider>
  );
};

/**
 * Unit Tests for IMEI Selector Feature
 * Tests the dynamic IMEI input field that changes based on device count
 */
describe('Settings - IMEI Selector Unit Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Task 9.1: Test IMEI field renders correctly for 0 devices
   * Requirements: 3.1, 3.2, 3.3, 3.4
   */
  describe('No devices mode (0 devices)', () => {
    it('should render disabled input when user has no devices', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI input field
      const imeiInput = screen.getByLabelText(/Device IMEI \(no devices assigned\)/i);
      
      // Verify it's disabled
      expect(imeiInput).toBeDisabled();
      expect(imeiInput).toHaveAttribute('readonly');
      expect(imeiInput.value).toBe('');
    });

    it('should show placeholder message for no devices', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify placeholder text
      const imeiInput = screen.getByPlaceholderText('No devices assigned');
      expect(imeiInput).toBeInTheDocument();
    });

    it('should display informational message for no devices', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify informational message
      expect(screen.getByText(/No devices are assigned to your account/i)).toBeInTheDocument();
      expect(screen.getByText(/Please contact your administrator to assign devices/i)).toBeInTheDocument();
    });

    it('should have disabled styling for no devices input', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(no devices assigned\)/i);
      
      // Verify disabled styling classes
      expect(imeiInput).toHaveClass('cursor-not-allowed');
      expect(imeiInput).toHaveClass('opacity-70');
    });

    it('should disable submit button when no devices assigned', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).toBeDisabled();
    });

    it('should not show help text in no devices mode', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Help text should not be present
      expect(screen.queryByText(/Your device IMEI \(automatically filled\)/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Select the device you want to send commands to/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Task 9.2: Test IMEI field renders correctly for 1 device
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
   */
  describe('Single device mode (1 device)', () => {
    const singleImei = '862942074957887';

    it('should render disabled input when user has one device', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI input field
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      
      // Verify it's disabled
      expect(imeiInput).toBeDisabled();
      expect(imeiInput).toHaveAttribute('readonly');
    });

    it('should pre-populate IMEI field with single device IMEI', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      
      // Verify IMEI is pre-filled
      expect(imeiInput.value).toBe(singleImei);
    });

    it('should have disabled styling for single device input', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      
      // Verify disabled styling classes
      expect(imeiInput).toHaveClass('cursor-not-allowed');
      expect(imeiInput).toHaveClass('opacity-70');
    });

    it('should not allow editing of pre-filled IMEI', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      
      // Try to change the value
      fireEvent.change(imeiInput, { target: { value: '999999999999999' } });
      
      // Value should remain unchanged
      expect(imeiInput.value).toBe(singleImei);
    });

    it('should show help text for single device mode', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify help text
      expect(screen.getByText(/Your device IMEI \(automatically filled\)/i)).toBeInTheDocument();
    });

    it('should not show dropdown for single device', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify no select element is present for IMEI
      const selects = screen.getAllByRole('combobox');
      // Only the command selector should be present, not an IMEI selector
      expect(selects).toHaveLength(1);
    });

    it('should enable submit button for single device when command is selected', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should have proper ARIA attributes for single device input', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      
      // Verify ARIA attributes
      expect(imeiInput).toHaveAttribute('aria-label', 'Device IMEI (auto-filled)');
      expect(imeiInput).toHaveAttribute('aria-describedby', 'imei-help');
    });
  });

  /**
   * Task 9.3: Test IMEI field renders correctly for multiple devices
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  describe('Multiple devices mode (2+ devices)', () => {
    const multipleImeis = ['862942074957887', '862942074957888', '862942074957889'];

    it('should render dropdown when user has multiple devices', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find all comboboxes (should have 2: IMEI selector and command selector)
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should show default "Select a device..." option', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify default option
      expect(screen.getByRole('option', { name: 'Select a device...' })).toBeInTheDocument();
    });

    it('should display all IMEIs as dropdown options', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify all IMEIs are present as options
      multipleImeis.forEach(imei => {
        expect(screen.getByRole('option', { name: imei })).toBeInTheDocument();
      });
    });

    it('should have correct number of options (IMEIs + default)', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Get all options for the IMEI dropdown
      const options = screen.getAllByRole('option').filter(option => 
        option.textContent === 'Select a device...' || multipleImeis.includes(option.textContent)
      );
      
      // Should have 1 default + number of IMEIs
      expect(options.length).toBe(multipleImeis.length + 1);
    });

    it('should not be disabled for multiple devices', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector (first combobox)
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      expect(imeiSelect).not.toBeDisabled();
    });

    it('should show help text for multiple devices mode', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify help text
      expect(screen.getByText(/Select the device you want to send commands to/i)).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for multiple devices dropdown', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Verify ARIA attributes
      expect(imeiSelect).toHaveAttribute('aria-describedby', 'imei-help');
    });

    it('should not show disabled input for multiple devices', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Should not have disabled IMEI input
      expect(screen.queryByLabelText(/Device IMEI \(auto-filled\)/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Device IMEI \(no devices assigned\)/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Task 9.4: Test auto-population for single device
   * Requirements: 1.3
   */
  describe('Auto-population behavior', () => {
    const singleImei = '862942074957887';

    it('should auto-populate IMEI when switching to Device Command tab with single device', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Initially on Account tab
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // IMEI should be auto-populated
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      expect(imeiInput.value).toBe(singleImei);
    });

    it('should auto-populate IMEI on initial render if Device Command tab is active', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // IMEI should be immediately populated
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      expect(imeiInput.value).toBe(singleImei);
    });

    it('should maintain auto-populated IMEI when switching tabs', () => {
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Verify IMEI is populated
      let imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      expect(imeiInput.value).toBe(singleImei);
      
      // Switch to Account tab
      const accountTab = screen.getByRole('button', { name: /👤\s*Account/i });
      fireEvent.click(accountTab);
      
      // Switch back to Device Command tab
      fireEvent.click(deviceCommandTab);
      
      // IMEI should still be populated
      imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      expect(imeiInput.value).toBe(singleImei);
    });

    it('should not auto-populate for multiple devices', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Should be empty (default option selected)
      expect(imeiSelect.value).toBe('');
    });

    it('should not auto-populate for no devices', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(no devices assigned\)/i);
      expect(imeiInput.value).toBe('');
    });
  });

  /**
   * Task 9.5: Test dropdown selection updates state
   * Requirements: 2.6
   */
  describe('Dropdown selection behavior', () => {
    const multipleImeis = ['862942074957887', '862942074957888', '862942074957889'];

    it('should update state when selecting an IMEI from dropdown', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Select an IMEI
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[0] } });
      
      // Verify selection
      expect(imeiSelect.value).toBe(multipleImeis[0]);
    });

    it('should allow changing selection between different IMEIs', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Select first IMEI
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[0] } });
      expect(imeiSelect.value).toBe(multipleImeis[0]);
      
      // Change to second IMEI
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[1] } });
      expect(imeiSelect.value).toBe(multipleImeis[1]);
      
      // Change to third IMEI
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[2] } });
      expect(imeiSelect.value).toBe(multipleImeis[2]);
    });

    it('should clear error when selecting an IMEI', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Trigger validation error by blurring without selection
      fireEvent.blur(imeiSelect);
      
      // Verify error is shown
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();
      
      // Select an IMEI
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[0] } });
      
      // Error should be cleared
      expect(screen.queryByText(/Please select a device from the dropdown/i)).not.toBeInTheDocument();
    });

    it('should maintain selection when switching tabs', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find and select an IMEI
      let selects = screen.getAllByRole('combobox');
      let imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[1] } });
      
      // Switch to Account tab
      const accountTab = screen.getByRole('button', { name: /👤\s*Account/i });
      fireEvent.click(accountTab);
      
      // Switch back to Device Command tab
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector again
      selects = screen.getAllByRole('combobox');
      imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Selection should be maintained
      expect(imeiSelect.value).toBe(multipleImeis[1]);
    });

    it('should allow deselecting by choosing default option', () => {
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Select an IMEI
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[0] } });
      expect(imeiSelect.value).toBe(multipleImeis[0]);
      
      // Deselect by choosing default option
      fireEvent.change(imeiSelect, { target: { value: '' } });
      expect(imeiSelect.value).toBe('');
    });
  });

  /**
   * Task 9.6: Test validation messages for each mode
   * Requirements: 4.1, 4.2
   */
  describe('Validation messages', () => {
    it('should show dropdown-specific error message for multiple devices', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Trigger validation by blurring without selection
      fireEvent.blur(imeiSelect);
      
      // Should show dropdown-specific error
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();
    });

    it('should not show validation error for single device mode', () => {
      const singleImei = '862942074957887';
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(auto-filled\)/i);
      
      // Try to blur (should not trigger error since it's auto-filled)
      fireEvent.blur(imeiInput);
      
      // Should not show error
      expect(screen.queryByText(/IMEI is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Please select a device/i)).not.toBeInTheDocument();
    });

    it('should not show validation error for no devices mode', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const imeiInput = screen.getByLabelText(/Device IMEI \(no devices assigned\)/i);
      
      // Try to blur
      fireEvent.blur(imeiInput);
      
      // Should not show validation error (informational message is different)
      expect(screen.queryByText(/IMEI is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Please select a device/i)).not.toBeInTheDocument();
    });

    it('should show error with aria-invalid for multiple devices', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Trigger validation
      fireEvent.blur(imeiSelect);
      
      // Should have aria-invalid
      expect(imeiSelect).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error message with aria-describedby for multiple devices', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Trigger validation
      fireEvent.blur(imeiSelect);
      
      // Should link to error message
      expect(imeiSelect).toHaveAttribute('aria-describedby', 'imei-error');
      
      const errorElement = screen.getByText(/Please select a device from the dropdown/i);
      expect(errorElement).toHaveAttribute('id', 'imei-error');
    });

    it('should clear validation error when valid selection is made', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Find the IMEI selector
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      
      // Trigger validation error
      fireEvent.blur(imeiSelect);
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();
      
      // Make valid selection
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[0] } });
      
      // Error should be cleared
      expect(screen.queryByText(/Please select a device from the dropdown/i)).not.toBeInTheDocument();
      expect(imeiSelect).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  /**
   * Task 9.7: Test submit button disabled states
   * Requirements: 3.4, 4.3
   */
  describe('Submit button disabled states', () => {
    it('should disable submit button when no devices assigned', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button for single device when command selected', () => {
      const singleImei = '862942074957887';
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button for multiple devices when no IMEI selected', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command but not an IMEI
      const commandSelect = screen.getAllByRole('combobox').find(select =>
        select.querySelector('option')?.textContent === 'Select a command...'
      );
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button for multiple devices when IMEI and command selected', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select an IMEI
      const selects = screen.getAllByRole('combobox');
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      fireEvent.change(imeiSelect, { target: { value: multipleImeis[0] } });
      
      // Select a command
      const commandSelect = selects.find(select =>
        select.querySelector('option')?.textContent === 'Select a command...'
      );
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when IMEI validation error exists', () => {
      const multipleImeis = ['862942074957887', '862942074957888'];
      renderWithUserContext({ imeis: multipleImeis });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command
      const selects = screen.getAllByRole('combobox');
      const commandSelect = selects.find(select =>
        select.querySelector('option')?.textContent === 'Select a command...'
      );
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      // Trigger IMEI validation error
      const imeiSelect = selects.find(select => 
        select.querySelector('option[value=""]')?.textContent === 'Select a device...'
      );
      fireEvent.blur(imeiSelect);
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).toBeDisabled();
    });

    it('should remain disabled for no devices even with command selected', () => {
      renderWithUserContext({ imeis: [] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button during loading state', async () => {
      const singleImei = '862942074957887';
      const { sendDeviceCommand } = await import('../utils/deviceCommandAPI.js');
      
      // Mock a delayed response
      sendDeviceCommand.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      
      // Click submit
      fireEvent.click(submitButton);
      
      // Button should be disabled during loading
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /Sending.../i });
        expect(loadingButton).toBeDisabled();
      });
    });

    it('should re-enable submit button after successful submission', async () => {
      const singleImei = '862942074957887';
      const { sendDeviceCommand } = await import('../utils/deviceCommandAPI.js');
      
      sendDeviceCommand.mockResolvedValue({ success: true, message: 'Command sent' });
      
      renderWithUserContext({ imeis: [singleImei] });
      
      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);
      
      // Select a command
      const commandSelect = screen.getByRole('combobox');
      fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      
      // Click submit
      fireEvent.click(submitButton);
      
      // Wait for submission to complete
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Send Command/i });
        expect(button).not.toBeDisabled();
      });
    });
  });
});
