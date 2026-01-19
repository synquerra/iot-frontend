import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings.jsx';
import * as UserContextModule from '../contexts/UserContext.jsx';

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
 * Unit Tests for IMEI Validation Logic
 * 
 * Task 5: Update validation logic
 * Tests validation behavior for different IMEI input modes
 */
describe('Settings - IMEI Validation Logic', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Sub-task 5.1 & 5.2: Test validation for multiple device mode (dropdown)
   * Requirements: 2.7, 4.1, 4.2
   */
  describe('Multiple device mode validation', () => {
    beforeEach(() => {
      // Mock useUserContext to return multiple devices
      vi.spyOn(UserContextModule, 'useUserContext').mockReturnValue({
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888', '862942074957889'],
        firstName: 'Test',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn(),
        isAuthenticated: true,
        tokens: { accessToken: 'token', refreshToken: 'refresh' }
      });
    });

    it('should show dropdown-specific error message when no device is selected', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown by looking for the one with IMEI options
      const comboboxes = screen.getAllByRole('combobox');
      const imeiSelect = comboboxes.find(select => {
        const options = Array.from(select.options || []);
        return options.some(opt => opt.value.includes('862942074957'));
      });
      
      expect(imeiSelect).toBeDefined();
      
      // Trigger blur without selecting a device
      fireEvent.blur(imeiSelect);

      // Should show dropdown-specific error message
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();
    });

    it('should clear error when user selects a device from dropdown', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown
      const comboboxes = screen.getAllByRole('combobox');
      const imeiSelect = comboboxes.find(select => {
        const options = Array.from(select.options || []);
        return options.some(opt => opt.value.includes('862942074957'));
      });
      
      expect(imeiSelect).toBeDefined();
      
      // Trigger error first
      fireEvent.blur(imeiSelect);
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();

      // Select a device
      fireEvent.change(imeiSelect, { target: { value: '862942074957887' } });

      // Error should be cleared
      expect(screen.queryByText(/Please select a device from the dropdown/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Sub-task 5.1 & 5.2: Test validation for text input mode
   * Requirements: 4.1, 4.2
   */
  describe('Text input mode validation', () => {
    beforeEach(() => {
      // Mock useUserContext to return no devices
      vi.spyOn(UserContextModule, 'useUserContext').mockReturnValue({
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: [], // No devices
        firstName: 'Test',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn(),
        isAuthenticated: true,
        tokens: { accessToken: 'token', refreshToken: 'refresh' }
      });
    });

    it('should show disabled input with informational message when no devices assigned', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the disabled input
      const imeiInput = screen.getByPlaceholderText(/No devices assigned/i);
      
      // Input should be disabled
      expect(imeiInput).toBeDisabled();
      
      // Should show informational message
      expect(screen.getByText(/No devices are assigned to your account/i)).toBeInTheDocument();
      
      // Submit button should be disabled
      const submitButton = screen.getByRole('button', { name: /Send Command/i });
      expect(submitButton).toBeDisabled();
    });
  });

  /**
   * Sub-task 5.3: Test validation works for dropdown selection
   * Requirements: 2.7, 4.3
   */
  describe('Dropdown selection validation', () => {
    beforeEach(() => {
      // Mock useUserContext to return two devices
      vi.spyOn(UserContextModule, 'useUserContext').mockReturnValue({
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888'],
        firstName: 'Test',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn(),
        isAuthenticated: true,
        tokens: { accessToken: 'token', refreshToken: 'refresh' }
      });
    });

    it('should validate on blur event for dropdown', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown
      const comboboxes = screen.getAllByRole('combobox');
      const imeiSelect = comboboxes.find(select => {
        const options = Array.from(select.options || []);
        return options.some(opt => opt.value.includes('862942074957'));
      });
      
      expect(imeiSelect).toBeDefined();
      
      // Initially no error
      expect(screen.queryByText(/Please select a device from the dropdown/i)).not.toBeInTheDocument();

      // Trigger blur without selection
      fireEvent.blur(imeiSelect);

      // Error should appear
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();
    });

    it('should validate on change event for dropdown', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown
      const comboboxes = screen.getAllByRole('combobox');
      const imeiSelect = comboboxes.find(select => {
        const options = Array.from(select.options || []);
        return options.some(opt => opt.value.includes('862942074957'));
      });
      
      expect(imeiSelect).toBeDefined();
      
      // Trigger error first
      fireEvent.blur(imeiSelect);
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();

      // Change selection
      fireEvent.change(imeiSelect, { target: { value: '862942074957887' } });

      // Error should be cleared immediately
      expect(screen.queryByText(/Please select a device from the dropdown/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Test validation consistency across modes
   * Requirements: 4.1, 4.2
   */
  describe('Validation consistency', () => {
    beforeEach(() => {
      // Mock useUserContext to return two devices
      vi.spyOn(UserContextModule, 'useUserContext').mockReturnValue({
        email: 'test@example.com',
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['862942074957887', '862942074957888'],
        firstName: 'Test',
        lastName: 'User',
        mobile: '1234567890',
        clearUserContext: vi.fn(),
        isAuthenticated: true,
        tokens: { accessToken: 'token', refreshToken: 'refresh' }
      });
    });

    it('should handle null/undefined IMEI gracefully', () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );

      // Switch to Device Command tab
      const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
      fireEvent.click(deviceCommandTab);

      // Find the IMEI dropdown
      const comboboxes = screen.getAllByRole('combobox');
      const imeiSelect = comboboxes.find(select => {
        const options = Array.from(select.options || []);
        return options.some(opt => opt.value.includes('862942074957'));
      });
      
      expect(imeiSelect).toBeDefined();
      
      // Trigger validation with empty value
      fireEvent.blur(imeiSelect);

      // Should show error without crashing
      expect(screen.getByText(/Please select a device from the dropdown/i)).toBeInTheDocument();
    });
  });
});
