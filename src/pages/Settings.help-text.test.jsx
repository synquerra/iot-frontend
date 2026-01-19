import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings.jsx';
import * as UserContext from '../contexts/UserContext.jsx';

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
 * Task 7: Add conditional help text
 * Tests for IMEI field help text in different modes
 */
describe('Settings - IMEI Help Text (Task 7)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Subtask 7.1: Add help text for single device mode
   */
  it('should show help text for single device mode', async () => {
    // Mock UserContext with single device
    vi.spyOn(UserContext, 'useUserContext').mockReturnValue({
      email: 'test@example.com',
      uniqueId: '123',
      userType: 'PARENTS',
      imeis: ['862942074957887'],
      firstName: 'Test',
      middleName: '',
      lastName: 'User',
      mobile: '1234567890',
      clearUserContext: vi.fn()
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Switch to Device Command tab
    const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
    fireEvent.click(deviceCommandTab);

    // Wait for tab content to render
    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Check for help text
    expect(screen.getByText('Your device IMEI (automatically filled)')).toBeInTheDocument();
  });

  /**
   * Subtask 7.2: Add help text for multiple device mode
   */
  it('should show help text for multiple device mode', async () => {
    // Mock UserContext with multiple devices
    vi.spyOn(UserContext, 'useUserContext').mockReturnValue({
      email: 'test@example.com',
      uniqueId: '123',
      userType: 'PARENTS',
      imeis: ['862942074957887', '862942074957888', '862942074957889'],
      firstName: 'Test',
      middleName: '',
      lastName: 'User',
      mobile: '1234567890',
      clearUserContext: vi.fn()
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Switch to Device Command tab
    const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
    fireEvent.click(deviceCommandTab);

    // Wait for tab content to render
    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Check for help text
    expect(screen.getByText('Select the device you want to send commands to')).toBeInTheDocument();
  });

  /**
   * Subtask 7.3: Ensure help text doesn't show when error is present
   */
  it('should not show help text when validation error is present', async () => {
    // Mock UserContext with multiple devices
    vi.spyOn(UserContext, 'useUserContext').mockReturnValue({
      email: 'test@example.com',
      uniqueId: '123',
      userType: 'PARENTS',
      imeis: ['862942074957887', '862942074957888'],
      firstName: 'Test',
      middleName: '',
      lastName: 'User',
      mobile: '1234567890',
      clearUserContext: vi.fn()
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Switch to Device Command tab
    const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
    fireEvent.click(deviceCommandTab);

    // Wait for tab content to render
    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Trigger validation error by blurring without selection
    const imeiSelect = screen.getByLabelText(/Device IMEI/i);
    fireEvent.blur(imeiSelect);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Please select a device from the dropdown')).toBeInTheDocument();
    });

    // Help text should NOT be visible when error is present
    expect(screen.queryByText('Select the device you want to send commands to')).not.toBeInTheDocument();
  });

  /**
   * Subtask 7.3: Help text should not show in no-device mode
   */
  it('should not show help text when no devices are assigned', async () => {
    // Mock UserContext with no devices
    vi.spyOn(UserContext, 'useUserContext').mockReturnValue({
      email: 'test@example.com',
      uniqueId: '123',
      userType: 'PARENTS',
      imeis: [],
      firstName: 'Test',
      middleName: '',
      lastName: 'User',
      mobile: '1234567890',
      clearUserContext: vi.fn()
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Switch to Device Command tab
    const deviceCommandTab = screen.getByRole('button', { name: /📡\s*Device Command/i });
    fireEvent.click(deviceCommandTab);

    // Wait for tab content to render
    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Help text should NOT be visible
    expect(screen.queryByText('Your device IMEI (automatically filled)')).not.toBeInTheDocument();
    expect(screen.queryByText('Select the device you want to send commands to')).not.toBeInTheDocument();
    
    // No devices message should be visible instead
    expect(screen.getByText(/No devices are assigned to your account/i)).toBeInTheDocument();
  });
});
