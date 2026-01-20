/**
 * Property-Based Tests for GeofenceMap Component
 * 
 * Feature: geofence-current-location
 * Tests Property 3: Map State Preservation
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import GeofenceMap from './GeofenceMap';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => <div data-testid="map-container" {...props}>{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, children }) => <div data-testid="marker" data-position={JSON.stringify(position)}>{children}</div>,
  Polygon: ({ positions }) => <div data-testid="polygon" data-positions={JSON.stringify(positions)} />,
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  useMapEvents: (handlers) => {
    // Store handlers for testing
    return null;
  },
  useMap: () => ({
    flyTo: vi.fn(),
    setView: vi.fn(),
  }),
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn(() => ({ options: {} })),
  },
}));

describe('GeofenceMap - Property 3: Map State Preservation', () => {
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
   * Property 3: Map State Preservation
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
   * 
   * Formal Specification:
   * ∀ geofenceState ∈ GeofenceStates:
   *   getCurrentLocation() → geofenceState_before = geofenceState_after
   * 
   * Description: Using the current location feature should not affect existing 
   * geofence markers or polygon state. The coordinates should remain unchanged.
   */
  it('Property 3: Geofence coordinates should remain unchanged after using current location', () => {
    fc.assert(
      fc.property(
        // Generate random geofence coordinates (3-10 points)
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          { minLength: 3, maxLength: 10 }
        ),
        // Generate current location
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (geofenceCoords, currentLocation) => {
          // Track coordinate changes
          let coordinatesBeforeLocation = null;
          let coordinatesAfterLocation = null;
          let callCount = 0;

          const handleCoordinatesChange = (newCoords) => {
            callCount++;
            if (callCount === 1) {
              coordinatesBeforeLocation = JSON.parse(JSON.stringify(newCoords));
            }
            coordinatesAfterLocation = JSON.parse(JSON.stringify(newCoords));
          };

          // Mock successful geolocation
          mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
              coords: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              },
            });
          });

          // Render component with initial coordinates
          const { container, unmount } = render(
            <GeofenceMap
              coordinates={geofenceCoords}
              onCoordinatesChange={handleCoordinatesChange}
              editable={true}
            />
          );

          try {
            // Find and click the "My Location" button
            const locationButton = container.querySelector('button[aria-label="Go to my current location"]');
            expect(locationButton).toBeInTheDocument();

            // Click the button to trigger location fetch
            fireEvent.click(locationButton);

            // Verify that coordinates were not changed by the location fetch
            // The onCoordinatesChange should not have been called
            expect(callCount).toBe(0);

            // Verify geofence markers are still rendered with original coordinates
            const markers = container.querySelectorAll('[data-testid="marker"]');
            expect(markers.length).toBe(geofenceCoords.length);

            // Verify each marker has the correct position
            markers.forEach((marker, index) => {
              const position = JSON.parse(marker.getAttribute('data-position'));
              expect(position[0]).toBe(geofenceCoords[index].latitude);
              expect(position[1]).toBe(geofenceCoords[index].longitude);
            });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 3 (continued): Polygon should remain unchanged
   * 
   * Tests that the geofence polygon is not affected by current location
   */
  it('Property 3: Geofence polygon should remain unchanged after using current location', () => {
    fc.assert(
      fc.property(
        // Generate geofence coordinates (at least 3 for polygon)
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          { minLength: 3, maxLength: 8 }
        ),
        // Generate current location
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (geofenceCoords, currentLocation) => {
          // Mock successful geolocation
          mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
              coords: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              },
            });
          });

          const { container, unmount } = render(
            <GeofenceMap
              coordinates={geofenceCoords}
              onCoordinatesChange={vi.fn()}
              editable={true}
            />
          );

          try {
            // Get polygon before location fetch
            const polygonBefore = container.querySelector('[data-testid="polygon"]');
            expect(polygonBefore).toBeInTheDocument();
            const positionsBefore = JSON.parse(polygonBefore.getAttribute('data-positions'));

            // Click location button
            const locationButton = container.querySelector('button[aria-label="Go to my current location"]');
            fireEvent.click(locationButton);

            // Get polygon after location fetch
            const polygonAfter = container.querySelector('[data-testid="polygon"]');
            expect(polygonAfter).toBeInTheDocument();
            const positionsAfter = JSON.parse(polygonAfter.getAttribute('data-positions'));

            // Verify polygon positions are unchanged
            expect(positionsAfter).toEqual(positionsBefore);

            // Verify positions match original coordinates
            expect(positionsAfter.length).toBe(geofenceCoords.length);
            positionsAfter.forEach((position, index) => {
              expect(position[0]).toBe(geofenceCoords[index].latitude);
              expect(position[1]).toBe(geofenceCoords[index].longitude);
            });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 3 (continued): Number of markers should remain constant
   * 
   * Tests that using current location doesn't add/remove geofence markers
   */
  it('Property 3: Number of geofence markers should remain constant after using current location', () => {
    fc.assert(
      fc.property(
        // Generate geofence coordinates
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        // Generate current location
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        (geofenceCoords, currentLocation) => {
          // Mock successful geolocation
          mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
              coords: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              },
            });
          });

          const { container, unmount } = render(
            <GeofenceMap
              coordinates={geofenceCoords}
              onCoordinatesChange={vi.fn()}
              editable={true}
            />
          );

          try {
            // Count markers before location fetch
            const markersBefore = container.querySelectorAll('[data-testid="marker"]');
            const countBefore = markersBefore.length;

            // Click location button
            const locationButton = container.querySelector('button[aria-label="Go to my current location"]');
            fireEvent.click(locationButton);

            // Count markers after location fetch
            const markersAfter = container.querySelectorAll('[data-testid="marker"]');
            const countAfter = markersAfter.length;

            // The count should increase by 1 (current location marker added)
            // But geofence markers should remain the same
            expect(countAfter).toBe(countBefore + 1);

            // Verify the first N markers are still geofence markers
            for (let i = 0; i < geofenceCoords.length; i++) {
              const position = JSON.parse(markersAfter[i].getAttribute('data-position'));
              expect(position[0]).toBe(geofenceCoords[i].latitude);
              expect(position[1]).toBe(geofenceCoords[i].longitude);
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 3 (continued): Error scenarios should not affect geofence state
   * 
   * Tests that location errors don't modify geofence coordinates
   */
  it('Property 3: Geofence state should remain unchanged even when location fetch fails', () => {
    fc.assert(
      fc.property(
        // Generate geofence coordinates
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          { minLength: 3, maxLength: 8 }
        ),
        // Generate error code
        fc.constantFrom(1, 2, 3),
        (geofenceCoords, errorCode) => {
          // Mock error response
          mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({
              code: errorCode,
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            });
          });

          let coordinateChangeCalled = false;
          const handleCoordinatesChange = () => {
            coordinateChangeCalled = true;
          };

          const { container, unmount } = render(
            <GeofenceMap
              coordinates={geofenceCoords}
              onCoordinatesChange={handleCoordinatesChange}
              editable={true}
            />
          );

          try {
            // Get initial state
            const markersBefore = container.querySelectorAll('[data-testid="marker"]');
            const countBefore = markersBefore.length;

            // Click location button (will fail)
            const locationButton = container.querySelector('button[aria-label="Go to my current location"]');
            fireEvent.click(locationButton);

            // Verify coordinates were not changed
            expect(coordinateChangeCalled).toBe(false);

            // Verify markers are unchanged
            const markersAfter = container.querySelectorAll('[data-testid="marker"]');
            expect(markersAfter.length).toBe(countBefore);

            // Verify each marker still has original position
            markersAfter.forEach((marker, index) => {
              const position = JSON.parse(marker.getAttribute('data-position'));
              expect(position[0]).toBe(geofenceCoords[index].latitude);
              expect(position[1]).toBe(geofenceCoords[index].longitude);
            });

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 3 (continued): Multiple location fetches should not accumulate changes
   * 
   * Tests that multiple location button clicks don't corrupt geofence state
   */
  it('Property 3: Multiple location fetches should not affect geofence coordinates', () => {
    fc.assert(
      fc.property(
        // Generate geofence coordinates
        fc.array(
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
          }),
          { minLength: 3, maxLength: 6 }
        ),
        // Generate number of clicks
        fc.integer({ min: 2, max: 5 }),
        (geofenceCoords, numClicks) => {
          // Mock successful geolocation with different locations each time
          let clickCount = 0;
          mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            clickCount++;
            success({
              coords: {
                latitude: 40.0 + clickCount,
                longitude: -74.0 + clickCount,
              },
            });
          });

          let coordinateChangeCount = 0;
          const handleCoordinatesChange = () => {
            coordinateChangeCount++;
          };

          const { container, unmount } = render(
            <GeofenceMap
              coordinates={geofenceCoords}
              onCoordinatesChange={handleCoordinatesChange}
              editable={true}
            />
          );

          try {
            const locationButton = container.querySelector('button[aria-label="Go to my current location"]');

            // Click multiple times
            for (let i = 0; i < numClicks; i++) {
              fireEvent.click(locationButton);
            }

            // Verify coordinates were never changed
            expect(coordinateChangeCount).toBe(0);

            // Verify geofence markers still have original positions
            const markers = container.querySelectorAll('[data-testid="marker"]');
            
            // Should have geofence markers + 1 current location marker
            expect(markers.length).toBeGreaterThanOrEqual(geofenceCoords.length);

            // Check first N markers are geofence markers with original positions
            for (let i = 0; i < geofenceCoords.length; i++) {
              const position = JSON.parse(markers[i].getAttribute('data-position'));
              expect(position[0]).toBe(geofenceCoords[i].latitude);
              expect(position[1]).toBe(geofenceCoords[i].longitude);
            }

            return true;
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
