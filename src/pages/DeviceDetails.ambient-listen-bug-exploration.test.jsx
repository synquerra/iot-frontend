/**
 * Bug Condition Exploration Test for Ambient Listen Toggle Status
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * This test MUST FAIL on unfixed code to confirm the bug exists.
 * The bug: Listening Mode toggle is hardcoded with defaultChecked and doesn't fetch from API.
 * 
 * Expected behavior (what this test validates):
 * - When API returns AMBIENT_STOP command with payload {"AmbientListen": "Stop"}, toggle should be OFF
 * - When API returns AMBIENT_STOP command with payload {"AmbientListen": "Start"}, toggle should be ON
 * - When no AMBIENT_STOP command exists, toggle should default to OFF
 * 
 * CRITICAL: This test encodes the expected behavior. When it passes after the fix,
 * it confirms the bug is resolved.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import DeviceDetails from './DeviceDetails';

// Mock the router params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ imei: '123456789012345' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the UserContext
vi.mock('../contexts/UserContext', () => ({
  useUserContext: () => ({
    user: { role: 'admin' },
  }),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Bug Condition Exploration: Ambient Listen Toggle Status', () => {
  let mockAnalytics;
  let mockDeviceCommandsAPI;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import and mock analytics
    mockAnalytics = await import('../utils/analytics');
    vi.spyOn(mockAnalytics, 'getAnalyticsByImei').mockResolvedValue([{
      topic: 'device/test',
      packetType: 'N',
      latitude: 12.9716,
      longitude: 77.5946,
      speed: 45,
      battery: '85%',
      deviceRawTimestamp: new Date().toISOString(),
    }]);
    vi.spyOn(mockAnalytics, 'getAnalyticsHealth').mockResolvedValue({ status: 'healthy' });
    vi.spyOn(mockAnalytics, 'getAnalyticsUptime').mockResolvedValue({ uptime: 99.9 });
    vi.spyOn(mockAnalytics, 'getAnalyticsByFilter').mockResolvedValue([]);
    
    // Import and mock device API
    const mockDevice = await import('../utils/device');
    vi.spyOn(mockDevice, 'getDeviceByTopic').mockResolvedValue({
      imei: '123456789012345',
      studentName: 'Test Device',
    });
    
    // Import and mock auth
    const mockAuth = await import('../utils/auth');
    vi.spyOn(mockAuth, 'getUserByIMEI').mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
    });
    
    // Import and mock device commands API
    mockDeviceCommandsAPI = await import('../utils/deviceCommandsAPI');
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Fault Condition - Toggle Status Not Based on API Data
   * 
   * This property tests that the toggle status correctly reflects the API data.
   * On UNFIXED code, this test will FAIL because the toggle is hardcoded.
   */
  it('Property 1: Toggle status should reflect latest AMBIENT_STOP command from API (EXPECTED TO FAIL on unfixed code)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test cases for different API responses
        fc.constantFrom(
          // Case 1: API returns AMBIENT_STOP with "Stop" payload
          {
            commands: [{
              id: 1,
              imei: '123456789012345',
              command: 'AMBIENT_STOP',
              payload: { AmbientListen: 'Stop' },
              created_at: new Date().toISOString(),
            }],
            expectedChecked: false,
            description: 'Stop payload should set toggle to OFF'
          },
          // Case 2: API returns AMBIENT_STOP with "Start" payload
          {
            commands: [{
              id: 2,
              imei: '123456789012345',
              command: 'AMBIENT_STOP',
              payload: { AmbientListen: 'Start' },
              created_at: new Date().toISOString(),
            }],
            expectedChecked: true,
            description: 'Start payload should set toggle to ON'
          },
          // Case 3: No AMBIENT_STOP command exists
          {
            commands: [],
            expectedChecked: false,
            description: 'No command should default toggle to OFF'
          },
          // Case 4: Multiple commands, latest is "Stop"
          {
            commands: [
              {
                id: 4,
                imei: '123456789012345',
                command: 'AMBIENT_STOP',
                payload: { AmbientListen: 'Stop' },
                created_at: new Date(Date.now() - 1000).toISOString(),
              },
              {
                id: 3,
                imei: '123456789012345',
                command: 'AMBIENT_STOP',
                payload: { AmbientListen: 'Start' },
                created_at: new Date(Date.now() - 2000).toISOString(),
              }
            ],
            expectedChecked: false,
            description: 'Latest Stop command should set toggle to OFF'
          },
          // Case 5: Multiple commands, latest is "Start"
          {
            commands: [
              {
                id: 6,
                imei: '123456789012345',
                command: 'AMBIENT_STOP',
                payload: { AmbientListen: 'Start' },
                created_at: new Date(Date.now() - 1000).toISOString(),
              },
              {
                id: 5,
                imei: '123456789012345',
                command: 'AMBIENT_STOP',
                payload: { AmbientListen: 'Stop' },
                created_at: new Date(Date.now() - 2000).toISOString(),
              }
            ],
            expectedChecked: true,
            description: 'Latest Start command should set toggle to ON'
          }
        ),
        async (testCase) => {
          // Mock the device commands API to return the test case data
          vi.spyOn(mockDeviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue(testCase.commands);
          
          // Render the component
          const { container } = renderWithRouter(<DeviceDetails />);
          
          // Wait for component to load
          await waitFor(() => {
            expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
          }, { timeout: 5000 });
          
          // Navigate to Settings tab
          const settingsTab = screen.getByText('Settings');
          settingsTab.click();
          
          await waitFor(() => {
            expect(screen.getByText('Listening Mode')).toBeInTheDocument();
          }, { timeout: 2000 });
          
          // Find the Listening Mode toggle
          const listeningModeSection = screen.getByText('Listening Mode').closest('div');
          const toggleInput = listeningModeSection.querySelector('input[type="checkbox"]');
          
          // Assert: The toggle should reflect the expected state based on API data
          // On UNFIXED code, this will FAIL because the toggle is hardcoded with defaultChecked
          expect(toggleInput.checked).toBe(testCase.expectedChecked);
          
          // Log the test case for debugging
          console.log(`Test case: ${testCase.description}`);
          console.log(`Expected: ${testCase.expectedChecked}, Actual: ${toggleInput.checked}`);
        }
      ),
      {
        numRuns: 5, // Run all 5 test cases
        verbose: true,
      }
    );
  });

  /**
   * Concrete test case 1: API returns "Stop" payload
   * Validates: Requirements 1.2
   */
  it('should set toggle to OFF when API returns AMBIENT_STOP with "Stop" payload', async () => {
    // Mock API to return Stop command
    vi.spyOn(mockDeviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([{
      id: 1,
      imei: '123456789012345',
      command: 'AMBIENT_STOP',
      payload: { AmbientListen: 'Stop' },
      created_at: new Date().toISOString(),
    }]);
    
    const { container } = renderWithRouter(<DeviceDetails />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Navigate to Settings tab
    const settingsTab = screen.getByText('Settings');
    settingsTab.click();
    
    await waitFor(() => {
      expect(screen.getByText('Listening Mode')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Find the toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggleInput = listeningModeSection.querySelector('input[type="checkbox"]');
    
    // EXPECTED TO FAIL: Toggle is hardcoded to checked, but should be unchecked
    expect(toggleInput.checked).toBe(false);
  });

  /**
   * Concrete test case 2: API returns "Start" payload
   * Validates: Requirements 1.3
   */
  it('should set toggle to ON when API returns AMBIENT_STOP with "Start" payload', async () => {
    // Mock API to return Start command
    vi.spyOn(mockDeviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([{
      id: 2,
      imei: '123456789012345',
      command: 'AMBIENT_STOP',
      payload: { AmbientListen: 'Start' },
      created_at: new Date().toISOString(),
    }]);
    
    const { container } = renderWithRouter(<DeviceDetails />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Navigate to Settings tab
    const settingsTab = screen.getByText('Settings');
    settingsTab.click();
    
    await waitFor(() => {
      expect(screen.getByText('Listening Mode')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Find the toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggleInput = listeningModeSection.querySelector('input[type="checkbox"]');
    
    // This might pass by coincidence since toggle is hardcoded to checked
    expect(toggleInput.checked).toBe(true);
  });

  /**
   * Concrete test case 3: No AMBIENT_STOP command exists
   * Validates: Requirements 1.4
   */
  it('should default toggle to OFF when no AMBIENT_STOP command exists', async () => {
    // Mock API to return empty array
    vi.spyOn(mockDeviceCommandsAPI, 'fetchDeviceCommands').mockResolvedValue([]);
    
    const { container } = renderWithRouter(<DeviceDetails />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading device details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Navigate to Settings tab
    const settingsTab = screen.getByText('Settings');
    settingsTab.click();
    
    await waitFor(() => {
      expect(screen.getByText('Listening Mode')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Find the toggle
    const listeningModeSection = screen.getByText('Listening Mode').closest('div');
    const toggleInput = listeningModeSection.querySelector('input[type="checkbox"]');
    
    // EXPECTED TO FAIL: Toggle is hardcoded to checked, but should be unchecked
    expect(toggleInput.checked).toBe(false);
  });
});
