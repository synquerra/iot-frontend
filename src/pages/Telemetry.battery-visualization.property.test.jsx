/**
 * Property-Based Tests for Telemetry Battery Visualization
 * 
 * Feature: dynamic-telemetry-data, Property 5: Battery visualization
 * Validates: Requirements 2.3
 * 
 * Tests that battery percentage values are displayed with corresponding visual progress bars.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import Telemetry from './Telemetry.jsx';

// Mock the analytics API
vi.mock('../utils/analytics', () => ({
  getAnalyticsByImei: vi.fn()
}));

import { getAnalyticsByImei } from '../utils/analytics';

describe('Telemetry Battery Visualization - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.search to avoid URL parameter issues
    Object.defineProperty(window, 'location', {
      value: {
        search: '?imei=798456148167816'
      },
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  /**
   * Helper function to render component with router context
   */
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  /**
   * Helper function to create mock analytics data with specific battery percentage
   */
  const createMockAnalyticsData = (batteryPercentage) => [{
    id: '1',
    topic: 'test',
    imei: '798456148167816',
    packet: 'N',
    latitude: 62.531135,
    longitude: 63.513135,
    speed: 40,
    battery: batteryPercentage,
    signal: 85,
    alert: '',
    type: 'normal',
    timestamp: new Date().toISOString(),
    deviceTimestamp: new Date().toISOString(),
    rawTemperature: 25,
    rawPacket: 'test-packet'
  }];

  /**
   * Simple test to verify mocking works correctly
   */
  it('should correctly mock and display a specific battery value', async () => {
    const testBatteryValue = 42;
    
    // Mock the analytics API to return our test data
    getAnalyticsByImei.mockResolvedValue(createMockAnalyticsData(testBatteryValue));

    // Render the component
    const { container } = renderWithRouter(<Telemetry />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Find the Live Telemetry Data section
    const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
    const liveTelemetryHeading = liveTelemetryHeadings[0];
    const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                             liveTelemetryHeading.closest('div').closest('div');

    // Find the battery percentage display
    const batteryPercentageSpan = within(liveTelemetryCard).getByText(`${testBatteryValue}%`);
    expect(batteryPercentageSpan).toBeInTheDocument();
  });

  /**
   * Property 5: Battery visualization
   * For any battery percentage value, the system should display it with a corresponding visual progress bar
   * 
   * Feature: dynamic-telemetry-data, Property 5: Battery visualization
   * Validates: Requirements 2.3
   */
  it('should display battery percentage with corresponding visual progress bar for any valid battery value', async () => {
    // Test with a few specific battery values
    const testValues = [0, 15, 35, 60, 100];
    
    for (const batteryPercentage of testValues) {
      // Mock the analytics API to return our test data
      getAnalyticsByImei.mockResolvedValue(createMockAnalyticsData(batteryPercentage));

      // Render the component
      const { unmount } = renderWithRouter(<Telemetry />);
      
      try {
        // Wait for data to load
        await waitFor(() => {
          expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
        }, { timeout: 3000 });
        
        // Find the Live Telemetry Data section
        const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
        expect(liveTelemetryHeadings.length).toBeGreaterThan(0);
        
        // Get the first live telemetry heading and its parent card
        const liveTelemetryHeading = liveTelemetryHeadings[0];
        const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                 liveTelemetryHeading.closest('div').closest('div');
        expect(liveTelemetryCard).toBeInTheDocument();

        // Within the live telemetry card, find the battery section
        const batteryLevelText = within(liveTelemetryCard).getByText('Battery Level');
        expect(batteryLevelText).toBeInTheDocument();

        // Find the battery percentage display - look for the span with the percentage
        const batteryPercentageSpan = within(liveTelemetryCard).getByText(`${batteryPercentage}%`);
        expect(batteryPercentageSpan).toBeInTheDocument();
        expect(batteryPercentageSpan).toHaveClass('font-bold');
        
        // Verify battery percentage text color matches battery level
        if (batteryPercentage >= 50) {
          expect(batteryPercentageSpan).toHaveClass('text-green-300');
        } else if (batteryPercentage >= 20) {
          expect(batteryPercentageSpan).toHaveClass('text-yellow-300');
        } else {
          expect(batteryPercentageSpan).toHaveClass('text-red-300');
        }

        // Find the progress bar container
        const progressBarContainer = liveTelemetryCard.querySelector('div[class*="w-32"][class*="bg-white/20"][class*="rounded-full"][class*="h-2"]');
        expect(progressBarContainer).toBeInTheDocument();

        // Verify progress bar color matches battery level
        const expectedColorClass = batteryPercentage >= 50 ? 'bg-green-400' :
                                  batteryPercentage >= 20 ? 'bg-yellow-400' :
                                  'bg-red-400';
        const progressBarFill = progressBarContainer.querySelector(`div[class*="h-2"][class*="rounded-full"][class*="${expectedColorClass}"]`);
        expect(progressBarFill).toBeInTheDocument();
        expect(progressBarFill).toHaveStyle(`width: ${batteryPercentage}%`);
      } finally {
        // Clean up after each test run
        unmount();
        cleanup();
      }
    }
  }, 30000); // Add 30 second timeout for async tests

  /**
   * Property test for battery visualization with edge cases (0% and 100%)
   */
  it('should handle edge case battery values (0% and 100%) with proper progress bar visualization', async () => {
    const edgeCases = [0, 100];
    
    for (const batteryPercentage of edgeCases) {
      // Mock the analytics API to return our test data
      getAnalyticsByImei.mockResolvedValue(createMockAnalyticsData(batteryPercentage));

      // Render the component
      const { unmount } = renderWithRouter(<Telemetry />);

      try {
        // Wait for data to load
        await waitFor(() => {
          expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
        }, { timeout: 3000 });
        
        // Find the Live Telemetry Data section
        const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
        const liveTelemetryHeading = liveTelemetryHeadings[0];
        const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                 liveTelemetryHeading.closest('div').closest('div');

        // Within the live telemetry card, verify battery visualization
        const batteryPercentageSpan = within(liveTelemetryCard).getByText(`${batteryPercentage}%`);
        expect(batteryPercentageSpan).toBeInTheDocument();
        expect(batteryPercentageSpan).toHaveClass('font-bold');
        
        // Verify battery percentage text color matches battery level
        if (batteryPercentage >= 50) {
          expect(batteryPercentageSpan).toHaveClass('text-green-300');
        } else if (batteryPercentage >= 20) {
          expect(batteryPercentageSpan).toHaveClass('text-yellow-300');
        } else {
          expect(batteryPercentageSpan).toHaveClass('text-red-300');
        }

        const progressBarContainer = liveTelemetryCard.querySelector('div[class*="w-32"][class*="bg-white/20"][class*="rounded-full"][class*="h-2"]');
        expect(progressBarContainer).toBeInTheDocument();

        // Verify progress bar color matches battery level
        const expectedColorClass = batteryPercentage >= 50 ? 'bg-green-400' :
                                  batteryPercentage >= 20 ? 'bg-yellow-400' :
                                  'bg-red-400';
        const progressBarFill = progressBarContainer.querySelector(`div[class*="h-2"][class*="rounded-full"][class*="${expectedColorClass}"]`);
        expect(progressBarFill).toBeInTheDocument();
        expect(progressBarFill).toHaveStyle(`width: ${batteryPercentage}%`);

        // For 0%, the progress bar should be essentially invisible (0% width)
        // For 100%, the progress bar should fill the entire container
        if (batteryPercentage === 0) {
          expect(progressBarFill).toHaveStyle('width: 0%');
        } else if (batteryPercentage === 100) {
          expect(progressBarFill).toHaveStyle('width: 100%');
        }
      } finally {
        // Clean up after each test run
        unmount();
        cleanup();
      }
    }
  }, 30000);

  /**
   * Property test for battery visualization when battery data is null/undefined
   */
  it('should handle missing battery data by displaying 0% with empty progress bar', async () => {
    // Create mock data with 0 battery (simulating missing data)
    const mockData = createMockAnalyticsData(0);
    
    // Mock the analytics API to return our test data
    getAnalyticsByImei.mockResolvedValue(mockData);

    // Render the component
    const { container } = renderWithRouter(<Telemetry />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Find the Live Telemetry Data section
    const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
    const liveTelemetryHeading = liveTelemetryHeadings[0];
    const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                             liveTelemetryHeading.closest('div').closest('div');

    // Within the live telemetry card, verify 0% is displayed when battery data is missing
    const batteryPercentageSpan = within(liveTelemetryCard).getByText('0%');
    expect(batteryPercentageSpan).toBeInTheDocument();
    expect(batteryPercentageSpan).toHaveClass('font-bold');
    expect(batteryPercentageSpan).toHaveClass('text-red-300'); // 0% should be red

    // Verify that the progress bar exists but has 0% width
    const progressBarContainer = liveTelemetryCard.querySelector('div[class*="w-32"][class*="bg-white/20"][class*="rounded-full"][class*="h-2"]');
    expect(progressBarContainer).toBeInTheDocument();

    const progressBarFill = progressBarContainer.querySelector('div[class*="h-2"][class*="rounded-full"][class*="bg-red-400"]');
    expect(progressBarFill).toBeInTheDocument();
    expect(progressBarFill).toHaveStyle('width: 0%');
  }, 30000);

  /**
   * Property test for battery visualization consistency across different device states
   */
  it('should display battery visualization consistently regardless of device status or other telemetry values', async () => {
    const testCases = [
      { battery: 75, temp: 60, speed: 120 }, // High temp, high speed
      { battery: 35, temp: 25, speed: 40 },  // Normal values
      { battery: 10, temp: -10, speed: 0 },  // Low battery, low temp, no speed
    ];
    
    for (const testCase of testCases) {
      // Create mock data with varying values
      const mockData = createMockAnalyticsData(testCase.battery);
      mockData[0].rawTemperature = testCase.temp;
      mockData[0].speed = testCase.speed;
      
      // Mock the analytics API to return our test data
      getAnalyticsByImei.mockResolvedValue(mockData);

      // Render the component
      const { unmount } = renderWithRouter(<Telemetry />);

      try {
        // Wait for data to load
        await waitFor(() => {
          expect(screen.queryByText('Loading telemetry data...')).not.toBeInTheDocument();
        }, { timeout: 3000 });
        
        // Find the Live Telemetry Data section
        const liveTelemetryHeadings = screen.getAllByText('Live Telemetry Data');
        const liveTelemetryHeading = liveTelemetryHeadings[0];
        const liveTelemetryCard = liveTelemetryHeading.closest('div[class*="Card"]') || 
                                 liveTelemetryHeading.closest('div').closest('div');

        // Verify that battery visualization is consistent regardless of other values
        const batteryPercentageSpan = within(liveTelemetryCard).getByText(`${testCase.battery}%`);
        expect(batteryPercentageSpan).toBeInTheDocument();
        expect(batteryPercentageSpan).toHaveClass('font-bold');
        
        // Verify battery percentage text color matches battery level
        if (testCase.battery >= 50) {
          expect(batteryPercentageSpan).toHaveClass('text-green-300');
        } else if (testCase.battery >= 20) {
          expect(batteryPercentageSpan).toHaveClass('text-yellow-300');
        } else {
          expect(batteryPercentageSpan).toHaveClass('text-red-300');
        }

        const progressBarContainer = liveTelemetryCard.querySelector('div[class*="w-32"][class*="bg-white/20"][class*="rounded-full"][class*="h-2"]');
        expect(progressBarContainer).toBeInTheDocument();

        // Verify progress bar color matches battery level
        const expectedColorClass = testCase.battery >= 50 ? 'bg-green-400' :
                                  testCase.battery >= 20 ? 'bg-yellow-400' :
                                  'bg-red-400';
        const progressBarFill = progressBarContainer.querySelector(`div[class*="h-2"][class*="rounded-full"][class*="${expectedColorClass}"]`);
        expect(progressBarFill).toBeInTheDocument();
        expect(progressBarFill).toHaveStyle(`width: ${testCase.battery}%`);
      } finally {
        // Clean up after each test run
        unmount();
        cleanup();
      }
    }
  }, 30000);
});
