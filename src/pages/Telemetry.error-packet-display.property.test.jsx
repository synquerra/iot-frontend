/**
 * Property-Based Tests for Error Packet Display
 * 
 * Feature: dynamic-telemetry-data, Property 8: Error packet display
 * Validates: Requirements 3.3
 * 
 * Tests that when error packet data is available, the system displays error codes and timestamps
 * in the UI. This property verifies that the error packet section shows the correct information
 * when error data is present.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, waitFor, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import Telemetry from './Telemetry.jsx';

// Mock the useTelemetryData hook directly
vi.mock('../hooks/useTelemetryData', () => ({
  useTelemetryData: vi.fn()
}));

import { useTelemetryData } from '../hooks/useTelemetryData';

describe('Error Packet Display - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location.search to avoid URL parameter issues
    Object.defineProperty(window, 'location', {
      value: {
        search: '?imei=7984561481678167'
      },
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Helper function to create mock telemetry data with error packet
   */
  const createMockTelemetryDataWithError = (errorCode, errorTimestamp) => ({
    deviceInfo: {
      imei: '7984561481678167',
      firmware: '516v151',
      status: 'Online',
      lastSeen: '31-12-2024 10:30:45',
      isRecent: true
    },
    liveData: {
      latitude: 40.7128,
      longitude: -74.0060,
      speed: 65,
      temperature: 25,
      battery: 85,
      hasHighTemp: false,
      hasHighSpeed: false
    },
    packetData: {
      normalPacket: {
        lat: 40.7128,
        lng: -74.0060,
        speed: 65,
        temp: 25,
        battery: 85
      },
      errorPacket: {
        code: errorCode,
        timestamp: errorTimestamp
      }
    }
  });

  /**
   * Helper function to create mock telemetry data without error packet
   */
  const createMockTelemetryDataWithoutError = () => ({
    deviceInfo: {
      imei: '7984561481678167',
      firmware: '516v151',
      status: 'Online',
      lastSeen: '31-12-2024 10:30:45',
      isRecent: true
    },
    liveData: {
      latitude: 40.7128,
      longitude: -74.0060,
      speed: 65,
      temperature: 25,
      battery: 85,
      hasHighTemp: false,
      hasHighSpeed: false
    },
    packetData: {
      normalPacket: {
        lat: 40.7128,
        lng: -74.0060,
        speed: 65,
        temp: 25,
        battery: 85
      },
      errorPacket: null
    }
  });

  /**
   * Property 8: Error packet display
   * For any error packet data available, the system should display error codes and timestamps
   * 
   * Feature: dynamic-telemetry-data, Property 8: Error packet display
   * Validates: Requirements 3.3
   */
  it('should display error codes and timestamps when error packet data is available', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate error codes (non-empty strings)
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== ''),
        // Generate timestamps in DD-MM-YYYY HH:MM:SS format
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(date => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
        }),
        async (errorCode, errorTimestamp) => {
          // Mock the useTelemetryData hook to return error packet data
          useTelemetryData.mockReturnValue({
            data: createMockTelemetryDataWithError(errorCode, errorTimestamp),
            loading: false,
            error: null,
            hasData: true,
            isRefreshing: false,
            refreshData: vi.fn()
          });

          // Render the component
          const { unmount } = render(<Telemetry />);

          try {
            // Navigate to packets tab by clicking on it
            const packetsTab = screen.getByRole('button', { name: /📦 Packets/i });
            expect(packetsTab).toBeInTheDocument();
            
            // Click the tab and wait for content to render
            fireEvent.click(packetsTab);

            // Wait for the Error Packet section to appear
            const errorPacketHeading = await waitFor(() => 
              screen.getByText('Error Packet (E)'), 
              { timeout: 3000 }
            );
            expect(errorPacketHeading).toBeInTheDocument();

            // Get the error packet card container - use a more flexible approach
            const errorPacketCard = errorPacketHeading.parentElement.parentElement;
            expect(errorPacketCard).toBeInTheDocument();

            // Wait for and verify that error code is displayed
            const errorCodeElement = await waitFor(() => 
              within(errorPacketCard).getByText(errorCode),
              { timeout: 2000 }
            );
            expect(errorCodeElement).toBeInTheDocument();

            // Wait for and verify that timestamp is displayed
            const timestampElement = await waitFor(() => 
              within(errorPacketCard).getByText(errorTimestamp),
              { timeout: 2000 }
            );
            expect(timestampElement).toBeInTheDocument();

            // Verify that "Error Code" label is present
            const errorCodeLabel = within(errorPacketCard).getByText('Error Code');
            expect(errorCodeLabel).toBeInTheDocument();

            // Verify that "Timestamp" label is present
            const timestampLabel = within(errorPacketCard).getByText('Timestamp');
            expect(timestampLabel).toBeInTheDocument();

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 5 } // Reduced for performance
    );
  }, 10000); // 10 second timeout

  /**
   * Property test for "No Errors" message display when no error packet is available
   */
  it('should display "No Errors" message when no error packet data is available', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate any valid device data (the error packet will be null)
        fc.constant(null),
        async () => {
          // Mock the useTelemetryData hook to return no error packet data
          useTelemetryData.mockReturnValue({
            data: createMockTelemetryDataWithoutError(),
            loading: false,
            error: null,
            hasData: true,
            isRefreshing: false,
            refreshData: vi.fn()
          });

          // Render the component
          const { unmount } = render(<Telemetry />);

          try {
            // Navigate to packets tab by clicking on it
            const packetsTab = screen.getByRole('button', { name: /📦 Packets/i });
            expect(packetsTab).toBeInTheDocument();
            
            // Click the tab and wait for content to render
            fireEvent.click(packetsTab);

            // Wait for the Error Packet section to appear
            const errorPacketHeading = await waitFor(() => 
              screen.getByText('Error Packet (E)'), 
              { timeout: 3000 }
            );
            expect(errorPacketHeading).toBeInTheDocument();

            // Get the error packet card container - use a more flexible approach
            const errorPacketCard = errorPacketHeading.parentElement.parentElement;
            expect(errorPacketCard).toBeInTheDocument();

            // Wait for and verify that "No Errors" message is displayed
            const noErrorsMessage = await waitFor(() => 
              within(errorPacketCard).getByText('No Errors'),
              { timeout: 2000 }
            );
            expect(noErrorsMessage).toBeInTheDocument();

            // Verify that the descriptive message is displayed
            const descriptiveMessage = within(errorPacketCard).getByText('No error packets found for this device');
            expect(descriptiveMessage).toBeInTheDocument();

            // Verify that no error code or timestamp is displayed
            expect(within(errorPacketCard).queryByText('Error Code')).not.toBeInTheDocument();
            expect(within(errorPacketCard).queryByText('Timestamp')).not.toBeInTheDocument();

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 5 } // Reduced for performance
    );
  }, 10000); // 10 second timeout
});