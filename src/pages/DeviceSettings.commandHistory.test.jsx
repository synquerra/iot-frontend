import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DeviceSettings from './DeviceSettings';
import * as deviceCommandsAPI from '../utils/deviceCommandsAPI';
import * as deviceConfigAPI from '../utils/deviceConfigAPI';

// Mock the API modules
vi.mock('../utils/deviceCommandsAPI');
vi.mock('../utils/deviceConfigAPI');
vi.mock('../utils/deviceCommandAPI');

describe('DeviceSettings - Command History with Contact Parameters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display SET_CONTACTS command with contact parameters in command history', async () => {
    // Mock command history with SET_CONTACTS command and contact parameters
    const mockCommands = [
      {
        id: '1',
        command: 'SET_CONTACTS',
        status: 'PUBLISHED',
        createdAt: '2024-01-15T10:00:00Z',
        payload: {
          phonenum1: '+1234567890',
          phonenum2: '+0987654321',
          controlroomnum: '+1122334455'
        }
      }
    ];

    const mockConfigs = [];

    vi.mocked(deviceCommandsAPI.fetchDeviceCommands).mockResolvedValue(mockCommands);
    vi.mocked(deviceCommandsAPI.parseDeviceCommands).mockReturnValue(mockCommands);
    vi.mocked(deviceConfigAPI.fetchDeviceConfig).mockResolvedValue(mockConfigs);
    vi.mocked(deviceConfigAPI.getConfigAcknowledgments).mockReturnValue(mockConfigs);

    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    // Wait for command history to load
    await waitFor(() => {
      expect(screen.getByText('SET_CONTACTS')).toBeInTheDocument();
    });

    // Verify contact parameters are displayed in the payload
    await waitFor(() => {
      expect(screen.getByText(/phonenum1/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1234567890/)).toBeInTheDocument();
      expect(screen.getByText(/phonenum2/i)).toBeInTheDocument();
      expect(screen.getByText(/\+0987654321/)).toBeInTheDocument();
      expect(screen.getByText(/controlroomnum/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1122334455/)).toBeInTheDocument();
    });
  });

  it('should display contact parameters in command history', async () => {
    // Mock command history with contact parameters
    const mockCommands = [
      {
        id: '1',
        command: 'DEVICE_SETTINGS',
        status: 'PUBLISHED',
        createdAt: '2024-01-15T10:00:00Z',
        payload: {
          phonenum1: '+1234567890',
          phonenum2: '+0987654321',
          controlroomnum: '+1122334455',
          NormalSendingInterval: '60'
        }
      }
    ];

    const mockConfigs = [];

    vi.mocked(deviceCommandsAPI.fetchDeviceCommands).mockResolvedValue(mockCommands);
    vi.mocked(deviceCommandsAPI.parseDeviceCommands).mockReturnValue(mockCommands);
    vi.mocked(deviceConfigAPI.fetchDeviceConfig).mockResolvedValue(mockConfigs);
    vi.mocked(deviceConfigAPI.getConfigAcknowledgments).mockReturnValue(mockConfigs);

    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    // Wait for command history to load
    await waitFor(() => {
      expect(screen.getByText('DEVICE_SETTINGS')).toBeInTheDocument();
    });

    // Verify contact parameters are displayed in the payload
    await waitFor(() => {
      expect(screen.getByText(/phonenum1/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1234567890/)).toBeInTheDocument();
      expect(screen.getByText(/phonenum2/i)).toBeInTheDocument();
      expect(screen.getByText(/\+0987654321/)).toBeInTheDocument();
      expect(screen.getByText(/controlroomnum/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1122334455/)).toBeInTheDocument();
    });
  });

  it('should display command history without contact parameters', async () => {
    // Mock command history without contact parameters
    const mockCommands = [
      {
        id: '2',
        command: 'STOP_SOS',
        status: 'PUBLISHED',
        createdAt: '2024-01-15T11:00:00Z',
        payload: {}
      }
    ];

    const mockConfigs = [];

    vi.mocked(deviceCommandsAPI.fetchDeviceCommands).mockResolvedValue(mockCommands);
    vi.mocked(deviceCommandsAPI.parseDeviceCommands).mockReturnValue(mockCommands);
    vi.mocked(deviceConfigAPI.fetchDeviceConfig).mockResolvedValue(mockConfigs);
    vi.mocked(deviceConfigAPI.getConfigAcknowledgments).mockReturnValue(mockConfigs);

    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    // Wait for command history to load
    await waitFor(() => {
      expect(screen.getByText('STOP_SOS')).toBeInTheDocument();
    });

    // Verify no parameters section is shown for empty payload
    expect(screen.queryByText(/Parameters:/i)).not.toBeInTheDocument();
  });

  it('should display command history section', async () => {
    const mockCommands = [];
    const mockConfigs = [];

    vi.mocked(deviceCommandsAPI.fetchDeviceCommands).mockResolvedValue(mockCommands);
    vi.mocked(deviceCommandsAPI.parseDeviceCommands).mockReturnValue(mockCommands);
    vi.mocked(deviceConfigAPI.fetchDeviceConfig).mockResolvedValue(mockConfigs);
    vi.mocked(deviceConfigAPI.getConfigAcknowledgments).mockReturnValue(mockConfigs);

    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    // Verify command history section is displayed
    await waitFor(() => {
      expect(screen.getByText('Command History')).toBeInTheDocument();
    });
  });

  it('should display device acknowledgments section', async () => {
    const mockCommands = [];
    const mockAcknowledgments = [
      {
        id: '1',
        rawBody: 'CONFIG_ACK',
        deviceTimestamp: '2024-01-15T10:00:00Z',
        topic: 'device/config/ack'
      }
    ];

    vi.mocked(deviceCommandsAPI.fetchDeviceCommands).mockResolvedValue(mockCommands);
    vi.mocked(deviceCommandsAPI.parseDeviceCommands).mockReturnValue(mockCommands);
    vi.mocked(deviceConfigAPI.fetchDeviceConfig).mockResolvedValue(mockAcknowledgments);
    vi.mocked(deviceConfigAPI.getConfigAcknowledgments).mockReturnValue(mockAcknowledgments);

    render(
      <BrowserRouter>
        <DeviceSettings />
      </BrowserRouter>
    );

    // Verify device acknowledgments are displayed
    await waitFor(() => {
      expect(screen.getByText(/Device Acknowledgments/i)).toBeInTheDocument();
      expect(screen.getByText('CONFIG_ACK')).toBeInTheDocument();
    });
  });
});
