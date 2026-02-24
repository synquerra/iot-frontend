/**
 * Bug Condition Exploration Test - Ambient Listen Toggle Status
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * BUG: The Listening Mode toggle in DeviceDetails.jsx Settings tab is hardcoded
 * with `defaultChecked` and does not fetch from the API to determine its state.
 * 
 * EXPECTED BEHAVIOR: Toggle status should be based on the latest AMBIENT_STOP 
 * command from the API endpoint http://127.0.0.1:8020/{imei}?limit=1000
 * 
 * Property 1: Fault Condition - Toggle Status Not Based on API Data
 * - When API returns AMBIENT_STOP with payload {"AmbientListen": "Stop"}, toggle should be OFF
 * - When API returns AMBIENT_STOP with payload {"AmbientListen": "Start"}, toggle should be ON
 * - When no AMBIENT_STOP command exists, toggle should default to OFF
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import DeviceDetails from './DeviceDetails';
import * as deviceCommandsAPI from '../utils/deviceCommandsAPI';
import * as analytics from '../utils/analytics';
import * as device from '../utils/device';
import * as auth from '../utils/auth';

// Mock the router params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ imei: '123456789012345' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock UserContext
vi.mock('../contexts/UserContext', () => ({
  useUserContext: () => ({
    user: { role: 'admin' },
  }),
}));

describe('Bug Condition Exploration: Ambient Listen Toggle Status', () => {
  beforeEach(() => {
    // Mock analytics API calls
    vi.spyOn(analytics, 'getAnalyticsByImei').mockResolvedValue([
      {
        topic: 'test/device',
        deviceTimestamp: new Date().toISOString(),
        deviceRawTimestamp: new Date().toISOString(),
        latitude: 12.34,
        longitude: 56.78,
        speed: 0,
        battery: 80,
        packetType: 'N',
      },
    ]);
    
    vi.spyOn(analytics, 'getAnalyticsHealth').mockResolvedValue({});
    vi.spyOn(analytics, 'getAnalyticsUptime').mockResolvedValue({});
    vi.spyOn(analytics, 'getAnalyticsByFilter').mockResolvedValue([]);
    
    vi.spyOn(device, 'getDeviceByTopic').mockResolvedValue({
      imei: '123456789012345',
      studentName: 'Test Device',
    });
    
    vi.spyOn(auth, 'getUserByIMEI').mockResolvedValue({
      name: 'Test User',
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Fault Condition - Toggle Status Not Based on API Data
   * 
   * This test explores the bug by checking if the toggle status reflects
   * the API data. On unfixed code, this test WILL FAIL because the toggle
   * is hardcoded with defaultChecked.
   */
  test('Property 1.1: Toggle is OFF when latest AMBIENT_STOP command has payload {"AmbientListen": "Stop"}', async () => {
    // Mock API to return AMBIENT_STOP command with "Stop" payload
    vi.spyOn(deviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([
      {
        id: 1,
        imei: '123456789012345',
        command: 'AMBIENT_STOP',
        payload: { AmbientListen: 'Stop' },
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <BrowserRouter>
        <DeviceDetails />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading device details/i)).not.toBeInTheDocument();
    });

    // Navigate to Settings tab
    const settingsTab = await screen.findByText('Settings');
    settingsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Ambient Listen')).toBeInTheDocument();
    });

    // Find the Listening Mode toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggle = listeningModeSection.querySelector('input[type="checkbox"]');

    // EXPECTED: Toggle should be OFF (unchecked) because API says "Stop"
    // ACTUAL (UNFIXED CODE): Toggle is ON (checked) because it's hardcoded with defaultChecked
    expect(toggle.checked).toBe(false);
  });

  test('Property 1.2: Toggle is ON when latest AMBIENT_STOP command has payload {"AmbientListen": "Start"}', async () => {
    // Mock API to return AMBIENT_STOP command with "Start" payload
    vi.spyOn(deviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([
      {
        id: 2,
        imei: '123456789012345',
        command: 'AMBIENT_STOP',
        payload: { AmbientListen: 'Start' },
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <BrowserRouter>
        <DeviceDetails />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading device details/i)).not.toBeInTheDocument();
    });

    // Navigate to Settings tab
    const settingsTab = await screen.findByText('Settings');
    settingsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Ambient Listen')).toBeInTheDocument();
    });

    // Find the Listening Mode toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggle = listeningModeSection.querySelector('input[type="checkbox"]');

    // EXPECTED: Toggle should be ON (checked) because API says "Start"
    expect(toggle.checked).toBe(true);
  });

  test('Property 1.3: Toggle defaults to OFF when no AMBIENT_STOP command exists', async () => {
    // Mock API to return empty array (no commands)
    vi.spyOn(deviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DeviceDetails />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading device details/i)).not.toBeInTheDocument();
    });

    // Navigate to Settings tab
    const settingsTab = await screen.findByText('Settings');
    settingsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Ambient Listen')).toBeInTheDocument();
    });

    // Find the Listening Mode toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggle = listeningModeSection.querySelector('input[type="checkbox"]');

    // EXPECTED: Toggle should be OFF (unchecked) by default when no command exists
    // ACTUAL (UNFIXED CODE): Toggle is ON (checked) because it's hardcoded with defaultChecked
    expect(toggle.checked).toBe(false);
  });

  test('Property 1.4: Toggle defaults to OFF when API returns commands but no AMBIENT_STOP', async () => {
    // Mock API to return other commands but no AMBIENT_STOP
    vi.spyOn(deviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([
      {
        id: 3,
        imei: '123456789012345',
        command: 'QUERY_NORMAL',
        payload: {},
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        imei: '123456789012345',
        command: 'LED_ON',
        payload: {},
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    render(
      <BrowserRouter>
        <DeviceDetails />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading device details/i)).not.toBeInTheDocument();
    });

    // Navigate to Settings tab
    const settingsTab = await screen.findByText('Settings');
    settingsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Ambient Listen')).toBeInTheDocument();
    });

    // Find the Listening Mode toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggle = listeningModeSection.querySelector('input[type="checkbox"]');

    // EXPECTED: Toggle should be OFF (unchecked) when no AMBIENT_STOP exists
    // ACTUAL (UNFIXED CODE): Toggle is ON (checked) because it's hardcoded with defaultChecked
    expect(toggle.checked).toBe(false);
  });

  /**
   * Property-Based Test: Toggle status reflects API data across various scenarios
   * 
   * This property test generates multiple scenarios with different command payloads
   * and verifies the toggle status matches the expected behavior.
   */
  test('Property 1.5: Toggle status correctly reflects AMBIENT_STOP payload across various scenarios', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Start', 'Stop'),
        fc.array(
          fc.record({
            command: fc.constantFrom('QUERY_NORMAL', 'LED_ON', 'LED_OFF', 'STOP_SOS'),
            payload: fc.constant({}),
          }),
          { maxLength: 5 }
        ),
        async (ambientListenValue, otherCommands) => {
          // Create AMBIENT_STOP command with the generated payload
          const ambientStopCommand = {
            id: 100,
            imei: '123456789012345',
            command: 'AMBIENT_STOP',
            payload: { AmbientListen: ambientListenValue },
            status: 'sent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Create other commands
          const commands = otherCommands.map((cmd, idx) => ({
            id: idx + 1,
            imei: '123456789012345',
            command: cmd.command,
            payload: cmd.payload,
            status: 'sent',
            created_at: new Date(Date.now() - (idx + 1) * 1000).toISOString(),
            updated_at: new Date(Date.now() - (idx + 1) * 1000).toISOString(),
          }));

          // Place AMBIENT_STOP as the latest command
          const allCommands = [ambientStopCommand, ...commands];

          vi.spyOn(deviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue(allCommands);

          const { unmount } = render(
            <BrowserRouter>
              <DeviceDetails />
            </BrowserRouter>
          );

          // Wait for component to load
          await waitFor(() => {
            expect(screen.queryByText(/Loading device details/i)).not.toBeInTheDocument();
          });

          // Navigate to Settings tab
          const settingsTab = await screen.findByText('Settings');
          settingsTab.click();

          await waitFor(() => {
            expect(screen.getByText('Ambient Listen')).toBeInTheDocument();
          });

          // Find the Listening Mode toggle
          const listeningModeSection = screen.getByText('Listening Mode').closest('div');
          const toggle = listeningModeSection.querySelector('input[type="checkbox"]');

          // Expected behavior based on payload
          const expectedChecked = ambientListenValue === 'Start';

          // EXPECTED: Toggle checked state should match the payload value
          // ACTUAL (UNFIXED CODE): Toggle is always ON because it's hardcoded
          expect(toggle.checked).toBe(expectedChecked);

          unmount();
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });
});
