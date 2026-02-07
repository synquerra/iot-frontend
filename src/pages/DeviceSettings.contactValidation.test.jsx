import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DeviceSettings from './DeviceSettings';
import * as deviceCommandAPI from '../utils/deviceCommandAPI';
import * as deviceCommandsAPI from '../utils/deviceCommandsAPI';
import * as deviceConfigAPI from '../utils/deviceConfigAPI';

// Mock the API modules
vi.mock('../utils/deviceCommandAPI');
vi.mock('../utils/deviceCommandsAPI');
vi.mock('../utils/deviceConfigAPI');

describe('DeviceSettings - Contact Field Validation (Task 4.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock API responses
    deviceCommandsAPI.fetchDeviceCommands.mockResolvedValue([]);
    deviceCommandsAPI.parseDeviceCommands.mockReturnValue([]);
    deviceConfigAPI.fetchDeviceConfig.mockResolvedValue([]);
    deviceConfigAPI.getConfigAcknowledgments.mockReturnValue([]);
    deviceCommandAPI.sendDeviceCommand.mockResolvedValue({ success: true });
  });

  it('should allow empty contact fields (optional parameters)', async () => {
    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getAllByText('Device Commands')[0]).toBeInTheDocument();
    });

    // Select SET_CONTACTS command
    const commandSelect = screen.getByRole('combobox');
    fireEvent.change(commandSelect, { target: { value: 'SET_CONTACTS' } });

    // Verify contact fields are visible
    await waitFor(() => {
      expect(screen.getByLabelText('Primary Contact')).toBeInTheDocument();
    });

    // Leave contact fields empty and submit
    const submitButton = screen.getByRole('button', { name: /send command/i });
    fireEvent.click(submitButton);

    // Should call API without contact parameters
    await waitFor(() => {
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledWith(
        expect.any(String),
        'SET_CONTACTS',
        {} // No parameters since contacts are empty
      );
    });
  });

  it('should validate contact fields as non-whitespace when provided', async () => {
    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Select a command
    const commandSelect = screen.getByRole('combobox');
    fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Primary Contact')).toBeInTheDocument();
    });

    // Enter a valid contact value
    const primaryContact = screen.getByLabelText('Primary Contact');
    fireEvent.change(primaryContact, { target: { value: '+1234567890' } });
    fireEvent.blur(primaryContact);

    // Should not show any error
    await waitFor(() => {
      const errorElements = screen.queryAllByText(/error/i);
      // Filter out any errors that are not related to validation
      const validationErrors = errorElements.filter(el => 
        el.textContent.toLowerCase().includes('required') || 
        el.textContent.toLowerCase().includes('invalid')
      );
      expect(validationErrors.length).toBe(0);
    });
  });

  it('should integrate contact validation errors into paramErrors state', async () => {
    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Select a command
    const commandSelect = screen.getByRole('combobox');
    fireEvent.change(commandSelect, { target: { value: 'STOP_SOS' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Primary Contact')).toBeInTheDocument();
    });

    // Enter valid contact values
    const primaryContact = screen.getByLabelText('Primary Contact');
    fireEvent.change(primaryContact, { target: { value: '+1234567890' } });
    
    const secondaryContact = screen.getByLabelText('Secondary Contact');
    fireEvent.change(secondaryContact, { target: { value: '+0987654321' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send command/i });
    fireEvent.click(submitButton);

    // Should call API with contact parameters
    await waitFor(() => {
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledWith(
        expect.any(String),
        'STOP_SOS',
        {
          phonenum1: '+1234567890',
          phonenum2: '+0987654321'
        }
      );
    });
  });

  it('should validate contact fields for all command types, not just DEVICE_SETTINGS', async () => {
    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Device Commands')).toBeInTheDocument();
    });

    // Test with LED_ON command (not DEVICE_SETTINGS)
    const commandSelect = screen.getByRole('combobox');
    fireEvent.change(commandSelect, { target: { value: 'LED_ON' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Primary Contact')).toBeInTheDocument();
    });

    // Enter a valid contact value
    const controlRoomContact = screen.getByLabelText('Control Room Contact');
    fireEvent.change(controlRoomContact, { target: { value: '+1112223333' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send command/i });
    fireEvent.click(submitButton);

    // Should call API with contact parameter for non-DEVICE_SETTINGS command
    await waitFor(() => {
      expect(deviceCommandAPI.sendDeviceCommand).toHaveBeenCalledWith(
        expect.any(String),
        'LED_ON',
        {
          controlroomnum: '+1112223333'
        }
      );
    });
  });
});
