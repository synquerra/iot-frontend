/**
 * Integration Tests for GeofenceMap Current Location Feature
 * 
 * Feature: geofence-current-location
 * Tests the complete button click flow and error handling integration
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import GeofenceMap from './GeofenceMap';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => <div data-testid="map-container" {...props}>{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, children, icon }) => (
    <div 
      data-testid="marker" 
      data-position={JSON.stringify(position)}
      data-has-custom-icon={!!icon}
    >
      {children}
    </div>
  ),
  Polygon: ({ positions }) => <div data-testid="polygon" data-positions={JSON.stringify(positions)} />,
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  useMapEvents: (handlers) => null,
  useMap: () => ({
    flyTo: vi.fn(),
    setView: vi.fn(),
  }),
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn((options) => ({ ...options, _isCustomIcon: true })),
  },
}));

describe('GeofenceMap - Current Location Integration Tests', () => {
  let mockGeolocation;

  beforeEach(() => {
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Integration Test: Complete button click flow
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4**
   * 
   * Tests the complete flow from button click to location display
   */
  describe('Button Click Flow', () => {
    it('should display current location button', () => {
      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('My Location');
    });

    it('should show loading state when button is clicked', async () => {
      // Mock geolocation to not respond immediately
      let resolveLocation;
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        resolveLocation = () => success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      
      // Click button
      fireEvent.click(button);

      // Should show loading state
      await waitFor(() => {
        expect(button).toHaveTextContent('Loading...');
        expect(button).toBeDisabled();
      });

      // Resolve location
      resolveLocation();

      // Should return to normal state
      await waitFor(() => {
        expect(button).toHaveTextContent('My Location');
        expect(button).not.toBeDisabled();
      });
    });

    it('should fetch and display current location on button click', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      
      // Click button
      fireEvent.click(button);

      // Wait for location to be fetched and marker to appear
      await waitFor(() => {
        const markers = container.querySelectorAll('[data-testid="marker"]');
        // Should have at least one marker (current location)
        expect(markers.length).toBeGreaterThan(0);
        
        // Find the current location marker (has custom icon)
        const currentLocationMarker = Array.from(markers).find(
          marker => marker.getAttribute('data-has-custom-icon') === 'true'
        );
        expect(currentLocationMarker).toBeInTheDocument();
      });
    });

    it('should call geolocation API with correct options', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 51.5074,
            longitude: -0.1278,
          },
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    });

    it('should not affect geofence coordinates when fetching location', async () => {
      const initialCoords = [
        { latitude: 23.3441, longitude: 85.3096 },
        { latitude: 23.3500, longitude: 85.3200 },
        { latitude: 23.3400, longitude: 85.3300 },
      ];

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      const onCoordinatesChange = vi.fn();

      const { container } = render(
        <GeofenceMap
          coordinates={initialCoords}
          onCoordinatesChange={onCoordinatesChange}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const markers = container.querySelectorAll('[data-testid="marker"]');
        expect(markers.length).toBeGreaterThan(initialCoords.length);
      });

      // Verify coordinates were not changed
      expect(onCoordinatesChange).not.toHaveBeenCalled();
    });

    it('should display current location marker with tooltip', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
          },
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const tooltip = container.querySelector('[data-testid="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('Your current location');
      });
    });
  });

  /**
   * Integration Test: Error handling
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   * 
   * Tests error scenarios and error message display
   */
  describe('Error Handling', () => {
    it('should display error message when permission is denied', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Location access denied');
      });
    });

    it('should display error message when position is unavailable', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 2,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Unable to determine your location');
      });
    });

    it('should display error message when request times out', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 3,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Location request timed out');
      });
    });

    it('should allow dismissing error messages', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      // Wait for error to appear
      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
      });

      // Find and click dismiss button
      const dismissButton = container.querySelector('button[aria-label="Dismiss error message"]');
      expect(dismissButton).toBeInTheDocument();
      fireEvent.click(dismissButton);

      // Error should be dismissed
      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).not.toBeInTheDocument();
      });
    });

    it('should enable button after error for retry', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      // Wait for error
      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
      });

      // Button should be enabled for retry
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('My Location');
    });

    it('should handle successful retry after error', async () => {
      // First call fails
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      
      // First attempt - should fail
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
      });

      // Second call succeeds
      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      // Retry - should succeed
      fireEvent.click(button);

      await waitFor(() => {
        // Error should be cleared
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).not.toBeInTheDocument();
        
        // Marker should appear
        const markers = container.querySelectorAll('[data-testid="marker"]');
        expect(markers.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing geolocation API', async () => {
      // Remove geolocation API
      delete global.navigator.geolocation;

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = container.querySelector('[role="alert"]');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Geolocation is not supported by your browser');
      });

      // Restore for other tests
      global.navigator.geolocation = mockGeolocation;
    });
  });

  /**
   * Integration Test: Accessibility
   * 
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
   * 
   * Tests accessibility features
   */
  describe('Accessibility', () => {
    it('should have proper aria-label on button', () => {
      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Go to my current location');
    });

    it('should set aria-busy during loading', async () => {
      let resolveLocation;
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        resolveLocation = () => success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      
      // Click button
      fireEvent.click(button);

      // Should have aria-busy=true during loading
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'true');
      });

      // Resolve location
      resolveLocation();

      // Should have aria-busy=false after completion
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'false');
      });
    });

    it('should announce loading state to screen readers', async () => {
      let resolveLocation;
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        resolveLocation = () => success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      
      // Click button
      fireEvent.click(button);

      // Should announce loading state
      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
        expect(liveRegion).toHaveTextContent('Fetching your current location...');
      });

      // Resolve location
      resolveLocation();

      // Should clear announcement
      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('');
      });
    });

    it('should announce errors with role="alert"', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { container } = render(
        <GeofenceMap
          coordinates={[]}
          onCoordinatesChange={vi.fn()}
          editable={true}
        />
      );

      const button = container.querySelector('button[aria-label="Go to my current location"]');
      fireEvent.click(button);

      await waitFor(() => {
        const errorAlert = container.querySelector('[role="alert"]');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });
});
