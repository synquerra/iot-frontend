import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GeofenceMap from './GeofenceMap';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

// Mock useCurrentLocation hook
vi.mock('../hooks/useCurrentLocation');

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, icon, children }) => (
    <div 
      data-testid="marker"
      data-position={JSON.stringify(position)}
      data-has-custom-icon={!!icon}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  Polygon: ({ positions }) => (
    <div data-testid="polygon" data-positions={JSON.stringify(positions)} />
  ),
  useMapEvents: () => null,
  useMap: () => ({
    flyTo: vi.fn()
  })
}));

describe('GeofenceMap - Error Handling UI', () => {
  const mockCoordinates = [
    { latitude: 23.301624, longitude: 85.327065 },
    { latitude: 23.301700, longitude: 85.327100 },
    { latitude: 23.301750, longitude: 85.327150 }
  ];

  const mockOnCoordinatesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(useCurrentLocation).mockReturnValue({
      location: null,
      loading: false,
      error: null,
      getCurrentLocation: vi.fn()
    });
  });

  describe('Error Message Display', () => {
    it('should display error message when error exists', () => {
      const errorMessage = 'Location access denied. Please enable location in your browser settings.';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error message when no error', () => {
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: null,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should display permission denied error', () => {
      const errorMessage = 'Location access denied. Please enable location in your browser settings.';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display timeout error', () => {
      const errorMessage = 'Location request timed out. Please try again.';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display position unavailable error', () => {
      const errorMessage = 'Unable to determine your location. Please try again.';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display not supported error', () => {
      const errorMessage = 'Geolocation is not supported by your browser.';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Error Message Styling', () => {
    it('should have red theme styling for error messages', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveClass('bg-red-500/90');
      expect(errorAlert).toHaveClass('border-red-400');
      expect(errorAlert).toHaveClass('text-white');
    });

    it('should have error icon in error message', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const errorAlert = screen.getByRole('alert');
      const svg = errorAlert.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Error Message Dismissal', () => {
    it('should have dismiss button for error messages', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss error message');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should hide error message when dismiss button is clicked', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      const dismissButton = screen.getByLabelText('Dismiss error message');
      fireEvent.click(dismissButton);

      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

    it('should show error message again when a new error occurs after dismissal', () => {
      const errorMessage1 = 'First error message';
      const errorMessage2 = 'Second error message';
      
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage1,
        getCurrentLocation: vi.fn()
      });

      const { rerender } = render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage1)).toBeInTheDocument();

      // Dismiss first error
      const dismissButton = screen.getByLabelText('Dismiss error message');
      fireEvent.click(dismissButton);

      expect(screen.queryByText(errorMessage1)).not.toBeInTheDocument();

      // Second error
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage2,
        getCurrentLocation: vi.fn()
      });

      rerender(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      expect(screen.getByText(errorMessage2)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" on error message', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
    });

    it('should have aria-live="assertive" on error message', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-label on dismiss button', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss error message');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error message');
    });
  });

  describe('Error and Loading State Interaction', () => {
    it('should show error message even when loading', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: true,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      // Error should still be shown even during loading
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should clear loading state when error occurs', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const locationButton = screen.getByLabelText('Go to my current location');
      expect(locationButton).not.toBeDisabled();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Error Message Positioning', () => {
    it('should render error message in control panel area', () => {
      const errorMessage = 'Test error message';
      vi.mocked(useCurrentLocation).mockReturnValue({
        location: null,
        loading: false,
        error: errorMessage,
        getCurrentLocation: vi.fn()
      });

      const { container } = render(
        <GeofenceMap
          coordinates={mockCoordinates}
          onCoordinatesChange={mockOnCoordinatesChange}
        />
      );

      const errorAlert = screen.getByRole('alert');
      const controlPanel = errorAlert.closest('.absolute');
      expect(controlPanel).toBeInTheDocument();
    });
  });
});
