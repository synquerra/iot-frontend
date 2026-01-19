import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeofenceMap from './GeofenceMap';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, eventHandlers, title }) => (
    <div 
      data-testid="marker"
      data-position={JSON.stringify(position)}
      data-title={title}
      onClick={() => eventHandlers?.click?.()}
    />
  ),
  Polygon: ({ positions }) => (
    <div data-testid="polygon" data-positions={JSON.stringify(positions)} />
  ),
  useMapEvents: (handlers) => {
    // Store handlers for testing
    if (typeof window !== 'undefined') {
      window.__mapEventHandlers = handlers;
    }
    return null;
  }
}));

describe('GeofenceMap', () => {
  const mockCoordinates = [
    { latitude: 23.301624, longitude: 85.327065 },
    { latitude: 23.301700, longitude: 85.327100 },
    { latitude: 23.301750, longitude: 85.327150 }
  ];

  const mockOnCoordinatesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      delete window.__mapEventHandlers;
    }
  });

  it('should render map with initial coordinates', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(3);
  });

  it('should render polygon when 3 or more points exist', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    const polygon = screen.getByTestId('polygon');
    expect(polygon).toBeInTheDocument();
    
    const positions = JSON.parse(polygon.getAttribute('data-positions'));
    expect(positions).toHaveLength(3);
  });

  it('should not render polygon with fewer than 3 points', () => {
    const twoPoints = mockCoordinates.slice(0, 2);
    
    render(
      <GeofenceMap
        coordinates={twoPoints}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    expect(screen.queryByTestId('polygon')).not.toBeInTheDocument();
  });

  it('should display point count in info panel', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    expect(screen.getByText('Points: 3')).toBeInTheDocument();
  });

  it('should show "Add at least 3 points" message when fewer than 3 points', () => {
    render(
      <GeofenceMap
        coordinates={[mockCoordinates[0]]}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    expect(screen.getByText('Add at least 3 points')).toBeInTheDocument();
  });

  it('should show "Click point to delete" message when 3 or more points', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    expect(screen.getByText('Click point to delete')).toBeInTheDocument();
  });

  it('should render Clear All button', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toBeInTheDocument();
  });

  it('should disable Clear All button when no points', () => {
    render(
      <GeofenceMap
        coordinates={[]}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toBeDisabled();
  });

  it('should call onCoordinatesChange with empty array when Clear All is confirmed', () => {
    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to clear all points?');
    expect(mockOnCoordinatesChange).toHaveBeenCalledWith([]);

    confirmSpy.mockRestore();
  });

  it('should not clear points when Clear All is cancelled', () => {
    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnCoordinatesChange).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should not render control buttons when not editable', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
        editable={false}
      />
    );

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('should render markers with correct titles', () => {
    render(
      <GeofenceMap
        coordinates={mockCoordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
      />
    );

    const markers = screen.getAllByTestId('marker');
    
    markers.forEach((marker, index) => {
      const title = marker.getAttribute('data-title');
      expect(title).toContain(`Point ${index + 1}`);
      expect(title).toContain(mockCoordinates[index].latitude.toFixed(6));
      expect(title).toContain(mockCoordinates[index].longitude.toFixed(6));
    });
  });

  it('should use custom center and zoom props', () => {
    const customCenter = { lat: 40.7128, lng: -74.0060 };
    const customZoom = 15;

    const { container } = render(
      <GeofenceMap
        coordinates={[]}
        onCoordinatesChange={mockOnCoordinatesChange}
        center={customCenter}
        zoom={customZoom}
      />
    );

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });
});
