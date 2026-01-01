/**
 * Property-Based Tests for Telemetry Conditional Styling
 * 
 * Feature: dynamic-telemetry-data, Property 6: Conditional styling application
 * Validates: Requirements 2.4, 2.5
 * 
 * Tests that high temperature (>50°C) and high speed (>100 km/h) values are displayed with appropriate conditional styling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import fc from 'fast-check';
import Telemetry from './Telemetry.jsx';

// Mock the useApiCache hook
vi.mock('../hooks/useApiCache', () => ({
  useApiCache: vi.fn()
}));

// Mock the analytics functions
vi.mock('../utils/analytics', () => ({
  getAnalyticsByImei: vi.fn(),
  getAnalyticsHealth: vi.fn()
}));

import { useApiCache } from '../hooks/useApiCache';
import { getAnalyticsByImei, getAnalyticsHealth } from '../utils/analytics';

describe('Telemetry Conditional Styling - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.search to avoid URL parameter issues
    Object.defineProperty(window, 'location', {
      value: {
        search: '?imei=7984561481678167'
      },
      writable: true
    });
    
    // Reset all mocks to ensure clean state
    useApiCache.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    useApiCache.mockReset();
  });

  /**
   * Property 6: Conditional styling application for high temperature
   * For any temperature value > 50°C, the system should apply warning styling
   * 
   * Feature: dynamic-telemetry-data, Property 6: Conditional styling application
   * Validates: Requirements 2.4
   */
  it('should apply warning styling for high temperature values (>50°C)', () => {
    fc.assert(
      fc.property(
        // Generate temperature values above 50°C
        fc.integer({ min: 51, max: 100 }),
        (temperature) => {
          // Reset mocks before each property test run
          useApiCache.mockReset();
          
          // Mock the analytics data with high temperature
          const mockAnalyticsData = [{
            id: 'test-id-1',
            topic: 'test-topic',
            imei: '7984561481678167',
            packet: 'N',
            latitude: 62.531135,
            longitude: 63.513135,
            speed: 40, // Normal speed to isolate temperature testing
            battery: 75,
            signal: 85,
            alert: '',
            type: 'N',
            timestamp: '2024-01-01T12:00:00Z',
            deviceTimestamp: '2024-01-01T12:00:00Z',
            deviceRawTimestamp: '2024-01-01T12:00:00Z',
            rawTemperature: temperature
          }];

          // Mock useApiCache to return our mock data
          useApiCache.mockImplementation((fn, deps, options) => {
            if (fn === getAnalyticsByImei) {
              return {
                data: mockAnalyticsData,
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            if (fn === getAnalyticsHealth) {
              return {
                data: { status: 'healthy' },
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            return {
              data: null,
              loading: false,
              error: null,
              refresh: vi.fn()
            };
          });

          // Render the component
          const { container, unmount } = render(<Telemetry />);
          
          try {
            // Find the Live Telemetry Data section
            const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
            const liveTelemetryHeading = liveTelemetryHeadings[0];
            const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                     liveTelemetryHeading.closest('div').closest('div');

            // Find the temperature display
            const temperatureText = within(liveTelemetryCard).getByText('Temperature');
            expect(temperatureText).toBeInTheDocument();

            // Find the temperature value - should be displayed with warning styling for high values
            const temperatureValue = `${temperature}°C`;
            const temperatureValueElement = within(liveTelemetryCard).getByText(temperatureValue);
            expect(temperatureValueElement).toBeInTheDocument();

            // For high temperature (>50°C), verify warning styling is applied
            // This should be text-orange-300 class based on the component implementation
            expect(temperatureValueElement).toHaveClass('text-orange-300');

            return true;
          } finally {
            // Clean up after each property test run
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 5, verbose: false } // Reduce runs to prevent timeout
    );
  }, 10000); // Add 10 second timeout

  /**
   * Property 6: Conditional styling application for normal temperature
   * For any temperature value <= 50°C, the system should apply normal styling
   * 
   * Feature: dynamic-telemetry-data, Property 6: Conditional styling application
   * Validates: Requirements 2.4
   */
  it('should apply normal styling for normal temperature values (<=50°C)', () => {
    fc.assert(
      fc.property(
        // Generate temperature values at or below 50°C
        fc.integer({ min: -20, max: 50 }),
        (temperature) => {
          // Reset mocks before each property test run
          useApiCache.mockReset();
          
          // Mock the analytics data with normal temperature
          const mockAnalyticsData = [{
            id: 'test-id-1',
            topic: 'test-topic',
            imei: '7984561481678167',
            packet: 'N',
            latitude: 62.531135,
            longitude: 63.513135,
            speed: 40, // Normal speed to isolate temperature testing
            battery: 75,
            signal: 85,
            alert: '',
            type: 'N',
            timestamp: '2024-01-01T12:00:00Z',
            deviceTimestamp: '2024-01-01T12:00:00Z',
            deviceRawTimestamp: '2024-01-01T12:00:00Z',
            rawTemperature: temperature
          }];

          // Mock useApiCache to return our mock data
          useApiCache.mockImplementation((fn, deps, options) => {
            if (fn === getAnalyticsByImei) {
              return {
                data: mockAnalyticsData,
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            if (fn === getAnalyticsHealth) {
              return {
                data: { status: 'healthy' },
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            return {
              data: null,
              loading: false,
              error: null,
              refresh: vi.fn()
            };
          });

          // Render the component
          const { container, unmount } = render(<Telemetry />);
          
          try {
            // Find the Live Telemetry Data section
            const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
            const liveTelemetryHeading = liveTelemetryHeadings[0];
            const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                     liveTelemetryHeading.closest('div').closest('div');

            // Find the temperature display
            const temperatureText = within(liveTelemetryCard).getByText('Temperature');
            expect(temperatureText).toBeInTheDocument();

            // Find the temperature value - should be displayed with normal styling for normal values
            const temperatureValue = `${temperature}°C`;
            const temperatureValueElement = within(liveTelemetryCard).getByText(temperatureValue);
            expect(temperatureValueElement).toBeInTheDocument();

            // For normal temperature (<=50°C), verify normal styling is applied
            // This should be text-white class (default styling)
            expect(temperatureValueElement).toHaveClass('text-white');

            // Ensure no warning styling is applied
            expect(temperatureValueElement).not.toHaveClass('text-orange-300');

            return true;
          } finally {
            // Clean up after each property test run
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 50, verbose: false }
    );
  });

  /**
   * Property 6: Conditional styling application for high speed
   * For any speed value > 100 km/h, the system should apply warning styling
   * 
   * Feature: dynamic-telemetry-data, Property 6: Conditional styling application
   * Validates: Requirements 2.5
   */
  it('should apply warning styling for high speed values (>100 km/h)', () => {
    fc.assert(
      fc.property(
        // Generate speed values above 100 km/h
        fc.integer({ min: 101, max: 200 }),
        (speed) => {
          // Reset mocks before each property test run
          useApiCache.mockReset();
          
          // Mock the analytics data with high speed
          const mockAnalyticsData = [{
            id: 'test-id-1',
            topic: 'test-topic',
            imei: '7984561481678167',
            packet: 'N',
            latitude: 62.531135,
            longitude: 63.513135,
            speed: speed,
            battery: 75,
            signal: 85,
            alert: '',
            type: 'N',
            timestamp: '2024-01-01T12:00:00Z',
            deviceTimestamp: '2024-01-01T12:00:00Z',
            deviceRawTimestamp: '2024-01-01T12:00:00Z',
            rawTemperature: 25 // Normal temperature to isolate speed testing
          }];

          // Mock useApiCache to return our mock data
          useApiCache.mockImplementation((fn, deps, options) => {
            if (fn === getAnalyticsByImei) {
              return {
                data: mockAnalyticsData,
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            if (fn === getAnalyticsHealth) {
              return {
                data: { status: 'healthy' },
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            return {
              data: null,
              loading: false,
              error: null,
              refresh: vi.fn()
            };
          });

          // Render the component
          const { container, unmount } = render(<Telemetry />);
          
          try {
            // Find the Live Telemetry Data section
            const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
            const liveTelemetryHeading = liveTelemetryHeadings[0];
            const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                     liveTelemetryHeading.closest('div').closest('div');

            // Find the speed display
            const speedText = within(liveTelemetryCard).getByText('Speed');
            expect(speedText).toBeInTheDocument();

            // Find the speed value - should be displayed with warning styling for high values
            // Speed is displayed as separate text nodes, so we need to find by partial text
            const speedContainer = within(liveTelemetryCard).getByText('Speed').closest('div').nextElementSibling;
            expect(speedContainer).toBeInTheDocument();
            
            // Check that the speed value is displayed
            expect(speedContainer).toHaveTextContent(`${speed} km/h`);

            // For high speed (>100 km/h), verify warning styling is applied
            // This should be text-red-300 class based on the component implementation
            expect(speedContainer).toHaveClass('text-red-300');

            return true;
          } finally {
            // Clean up after each property test run
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 50, verbose: false }
    );
  });

  /**
   * Property 6: Conditional styling application for normal speed
   * For any speed value <= 100 km/h, the system should apply normal styling
   * 
   * Feature: dynamic-telemetry-data, Property 6: Conditional styling application
   * Validates: Requirements 2.5
   */
  it('should apply normal styling for normal speed values (<=100 km/h)', () => {
    fc.assert(
      fc.property(
        // Generate speed values at or below 100 km/h
        fc.integer({ min: 0, max: 100 }),
        (speed) => {
          // Reset mocks before each property test run
          useApiCache.mockReset();
          
          // Mock the analytics data with normal speed
          const mockAnalyticsData = [{
            id: 'test-id-1',
            topic: 'test-topic',
            imei: '7984561481678167',
            packet: 'N',
            latitude: 62.531135,
            longitude: 63.513135,
            speed: speed,
            battery: 75,
            signal: 85,
            alert: '',
            type: 'N',
            timestamp: '2024-01-01T12:00:00Z',
            deviceTimestamp: '2024-01-01T12:00:00Z',
            deviceRawTimestamp: '2024-01-01T12:00:00Z',
            rawTemperature: 25 // Normal temperature to isolate speed testing
          }];

          // Mock useApiCache to return our mock data
          useApiCache.mockImplementation((fn, deps, options) => {
            if (fn === getAnalyticsByImei) {
              return {
                data: mockAnalyticsData,
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            if (fn === getAnalyticsHealth) {
              return {
                data: { status: 'healthy' },
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            return {
              data: null,
              loading: false,
              error: null,
              refresh: vi.fn()
            };
          });

          // Render the component
          const { container, unmount } = render(<Telemetry />);
          
          try {
            // Find the Live Telemetry Data section
            const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
            const liveTelemetryHeading = liveTelemetryHeadings[0];
            const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                     liveTelemetryHeading.closest('div').closest('div');

            // Find the speed display
            const speedText = within(liveTelemetryCard).getByText('Speed');
            expect(speedText).toBeInTheDocument();

            // Find the speed value - should be displayed with normal styling for normal values
            // Speed is displayed as separate text nodes, so we need to find by partial text
            const speedContainer = within(liveTelemetryCard).getByText('Speed').closest('div').nextElementSibling;
            expect(speedContainer).toBeInTheDocument();
            
            // Check that the speed value is displayed
            expect(speedContainer).toHaveTextContent(`${speed} km/h`);

            // For normal speed (<=100 km/h), verify normal styling is applied
            // This should be text-white class (default styling)
            expect(speedContainer).toHaveClass('text-white');

            // Ensure no warning styling is applied
            expect(speedContainer).not.toHaveClass('text-red-300');

            return true;
          } finally {
            // Clean up after each property test run
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 50, verbose: false }
    );
  });

  /**
   * Property test for combined conditional styling (both high temperature and high speed)
   */
  it('should apply warning styling when both temperature and speed exceed thresholds', () => {
    fc.assert(
      fc.property(
        // Generate high temperature and high speed values
        fc.integer({ min: 51, max: 100 }), // High temperature
        fc.integer({ min: 101, max: 200 }), // High speed
        (temperature, speed) => {
          // Reset mocks before each property test run
          useApiCache.mockReset();
          
          // Mock the analytics data with both high temperature and high speed
          const mockAnalyticsData = [{
            id: 'test-id-1',
            topic: 'test-topic',
            imei: '7984561481678167',
            packet: 'N',
            latitude: 62.531135,
            longitude: 63.513135,
            speed: speed,
            battery: 75,
            signal: 85,
            alert: '',
            type: 'N',
            timestamp: '2024-01-01T12:00:00Z',
            deviceTimestamp: '2024-01-01T12:00:00Z',
            deviceRawTimestamp: '2024-01-01T12:00:00Z',
            rawTemperature: temperature
          }];

          // Mock useApiCache to return our mock data
          useApiCache.mockImplementation((fn, deps, options) => {
            if (fn === getAnalyticsByImei) {
              return {
                data: mockAnalyticsData,
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            if (fn === getAnalyticsHealth) {
              return {
                data: { status: 'healthy' },
                loading: false,
                error: null,
                refresh: vi.fn()
              };
            }
            return {
              data: null,
              loading: false,
              error: null,
              refresh: vi.fn()
            };
          });

          // Render the component
          const { container, unmount } = render(<Telemetry />);
          
          try {
            // Find the Live Telemetry Data section
            const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
            const liveTelemetryHeading = liveTelemetryHeadings[0];
            const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                     liveTelemetryHeading.closest('div').closest('div');

            // Verify both temperature and speed have warning styling
            const temperatureValue = `${temperature}°C`;
            const temperatureValueElement = within(liveTelemetryCard).getByText(temperatureValue);
            expect(temperatureValueElement).toBeInTheDocument();

            const speedContainer = within(liveTelemetryCard).getByText('Speed').closest('div').nextElementSibling;
            expect(speedContainer).toBeInTheDocument();
            expect(speedContainer).toHaveTextContent(`${speed} km/h`);

            // Check temperature warning styling (text-orange-300)
            expect(temperatureValueElement).toHaveClass('text-orange-300');

            // Check speed warning styling (text-red-300)
            expect(speedContainer).toHaveClass('text-red-300');

            return true;
          } finally {
            // Clean up after each property test run
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 30, verbose: false }
    );
  });
});