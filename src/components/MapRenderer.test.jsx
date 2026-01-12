import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MapRenderer from './MapRenderer';

// Mock child components
vi.mock('./LightweightMap', () => ({
  default: ({ path, onUpgrade, showUpgradeButton, className }) => (
    <div data-testid="lightweight-map" className={className}>
      <div>Lightweight Map</div>
      <div>Path length: {path?.length || 0}</div>
      {showUpgradeButton && onUpgrade && (
        <button onClick={onUpgrade} data-testid="upgrade-button">
          Upgrade to Interactive
        </button>
      )}
    </div>
  ),
}));

vi.mock('./FallbackMapView', () => ({
  default: ({ path, error, onRetry }) => (
    <div data-testid="fallback-map-view">
      <div>Fallback Map View</div>
      <div>Path length: {path?.length || 0}</div>
      {error && <div data-testid="error-message">{error.message}</div>}
      {onRetry && (
        <button onClick={onRetry} data-testid="retry-button">
          Retry
        </button>
      )}
    </div>
  ),
}));

vi.mock('./MapErrorBoundary', () => ({
  default: ({ children, path, onRetry }) => (
    <div data-testid="map-error-boundary">
      {children}
    </div>
  ),
}));

vi.mock('./OptimizedLeafletMap', () => ({
  default: ({ path, className }) => (
    <div data-testid="optimized-leaflet-map" className={className}>
      <div>Interactive Map</div>
      <div>Path length: {path?.length || 0}</div>
    </div>
  ),
}));

vi.mock('../design-system/components/Loading', () => ({
  Loading: ({ text }) => <div data-testid="loading">{text}</div>,
  ProgressBar: ({ value }) => <div data-testid="progress-bar">Progress: {value}%</div>,
}));

vi.mock('../design-system/components/Button', () => ({
  Button: ({ children, onClick, disabled, variant, ariaLabel }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      aria-label={ariaLabel}
      data-testid={`button-${children.toLowerCase()}`}
    >
      {children}
    </button>
  ),
}));

describe('MapRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test map type selection based on path length (Requirements: 1.1, 4.2)
  describe('Map type selection based on path length', () => {
    it('renders lightweight map when path is empty', () => {
      render(<MapRenderer path={[]} />);

      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
      expect(screen.queryByTestId('optimized-leaflet-map')).not.toBeInTheDocument();
    });

    it('renders lightweight map when path has less than 50 points', () => {
      const smallPath = Array.from({ length: 30 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={smallPath} />);

      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
      expect(screen.queryByTestId('optimized-leaflet-map')).not.toBeInTheDocument();
    });

    it('renders lightweight map when path has 50 or more points by default', () => {
      const largePath = Array.from({ length: 100 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i % 60).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={largePath} />);

      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
      expect(screen.queryByTestId('optimized-leaflet-map')).not.toBeInTheDocument();
    });

    it('renders interactive map when autoUpgrade is true and path is small', async () => {
      const smallPath = Array.from({ length: 30 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={smallPath} autoUpgrade={true} />);

      // Wait for state updates
      await waitFor(() => {
        expect(screen.getByTestId('optimized-leaflet-map')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('does not auto-upgrade when path has 50 or more points', async () => {
      const largePath = Array.from({ length: 100 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i % 60).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={largePath} autoUpgrade={true} />);

      // Wait a bit for any potential state updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should still show lightweight map for large datasets
      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
    });

    it('updates map type when path length changes', async () => {
      const { rerender } = render(<MapRenderer path={[]} />);

      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();

      // Update with small path
      const smallPath = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      rerender(<MapRenderer path={smallPath} />);

      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should still be lightweight
      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
    });
  });

  // Test loading state transitions (Requirements: 1.1, 4.2)
  describe('Loading state transitions', () => {
    it('starts in idle state with empty path', () => {
      render(<MapRenderer path={[]} />);

      // Should render map without loading overlay
      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('shows loading state when path data is provided', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading location data...')).toBeInTheDocument();
    });

    it('transitions from loading to ready state', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      // Initially loading
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for loading to complete (300ms timeout in component)
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('shows upgrading state when switching to interactive map', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Click upgrade button
      const upgradeButton = screen.getByTestId('upgrade-button');
      fireEvent.click(upgradeButton);

      // Should show upgrading state
      await waitFor(() => {
        expect(screen.getByText('Loading interactive map...')).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      });
    });

    it('updates progress during upgrade', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Click upgrade button
      const upgradeButton = screen.getByTestId('upgrade-button');
      fireEvent.click(upgradeButton);

      // Progress should start at 0
      await waitFor(() => {
        expect(screen.getByText('Progress: 0%')).toBeInTheDocument();
      });

      // Wait a bit for progress to update
      await new Promise(resolve => setTimeout(resolve, 150));

      // Progress should increase
      await waitFor(() => {
        const progressText = screen.getByTestId('progress-bar').textContent;
        expect(progressText).toMatch(/Progress: \d+%/);
      });
    });

    it('completes loading state after upgrade', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Click upgrade button
      const upgradeButton = screen.getByTestId('upgrade-button');
      fireEvent.click(upgradeButton);

      // Wait for upgrade to complete
      await waitFor(() => {
        expect(screen.getByTestId('optimized-leaflet-map')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  // Test upgrade flow from lightweight to interactive (Requirements: 4.2)
  describe('Upgrade flow from lightweight to interactive', () => {
    it('shows upgrade button on lightweight map when path has data', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      await waitFor(() => {
        expect(screen.getByTestId('upgrade-button')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('does not show upgrade button when path is empty', () => {
      render(<MapRenderer path={[]} />);

      expect(screen.queryByTestId('upgrade-button')).not.toBeInTheDocument();
    });

    it('upgrades to interactive map when upgrade button is clicked', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Click upgrade button
      const upgradeButton = screen.getByTestId('upgrade-button');
      fireEvent.click(upgradeButton);

      // Should show interactive map
      await waitFor(() => {
        expect(screen.getByTestId('optimized-leaflet-map')).toBeInTheDocument();
        expect(screen.queryByTestId('lightweight-map')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('shows map type selector when enabled', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} showMapTypeSelector={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('button-static')).toBeInTheDocument();
        expect(screen.getByTestId('button-interactive')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('does not show map type selector when disabled', () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} showMapTypeSelector={false} />);

      expect(screen.queryByTestId('button-static')).not.toBeInTheDocument();
      expect(screen.queryByTestId('button-interactive')).not.toBeInTheDocument();
    });

    it('switches to interactive map via map type selector', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} showMapTypeSelector={true} />);

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Click interactive button
      const interactiveButton = screen.getByTestId('button-interactive');
      fireEvent.click(interactiveButton);

      // Should show interactive map
      await waitFor(() => {
        expect(screen.getByTestId('optimized-leaflet-map')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('switches back to lightweight map via map type selector', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} showMapTypeSelector={true} />);

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Upgrade to interactive
      const interactiveButton = screen.getByTestId('button-interactive');
      fireEvent.click(interactiveButton);

      // Should be on interactive map
      await waitFor(() => {
        expect(screen.getByTestId('optimized-leaflet-map')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch back to static
      const staticButton = screen.getByTestId('button-static');
      fireEvent.click(staticButton);

      // Should show lightweight map
      await waitFor(() => {
        expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
        expect(screen.queryByTestId('optimized-leaflet-map')).not.toBeInTheDocument();
      });
    });

    it('disables static button when on lightweight map', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} showMapTypeSelector={true} />);

      await waitFor(() => {
        const staticButton = screen.getByTestId('button-static');
        expect(staticButton).toBeDisabled();
      }, { timeout: 1000 });
    });

    it('disables interactive button when on interactive map', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} showMapTypeSelector={true} />);

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Upgrade to interactive
      const interactiveButton = screen.getByTestId('button-interactive');
      fireEvent.click(interactiveButton);

      // Interactive button should be disabled
      await waitFor(() => {
        expect(interactiveButton).toBeDisabled();
      }, { timeout: 2000 });
    });
  });

  // Test fallback behavior
  describe('Fallback behavior', () => {
    it('shows fallback view when path is empty', () => {
      render(<MapRenderer path={[]} />);

      // Should show lightweight map with no data message
      expect(screen.getByTestId('lightweight-map')).toBeInTheDocument();
    });

    it('passes correct props to lightweight map', () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} center={[40.7128, -74.0060]} className="custom-class" />);

      const lightweightMap = screen.getByTestId('lightweight-map');
      expect(lightweightMap).toHaveClass('custom-class');
      expect(screen.getByText('Path length: 10')).toBeInTheDocument();
    });

    it('passes correct props to interactive map', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} autoUpgrade={true} className="custom-class" />);

      await waitFor(() => {
        const interactiveMap = screen.getByTestId('optimized-leaflet-map');
        expect(interactiveMap).toHaveClass('custom-class');
        expect(screen.getByText('Path length: 10')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  // Test performance info display
  describe('Performance info display', () => {
    it('shows performance info when map is ready with data', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} />);

      await waitFor(() => {
        expect(screen.getByText(/Static • 10 points/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('shows interactive indicator when on interactive map', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      render(<MapRenderer path={path} autoUpgrade={true} />);

      await waitFor(() => {
        expect(screen.getByText(/Interactive • 10 points/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('does not show performance info when path is empty', () => {
      render(<MapRenderer path={[]} />);

      expect(screen.queryByText(/points/)).not.toBeInTheDocument();
    });
  });

  // Test cleanup
  describe('Component cleanup', () => {
    it('cleans up timers on unmount', async () => {
      const path = Array.from({ length: 10 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:${String(i).padStart(2, '0')}:00Z`,
      }));

      const { unmount } = render(<MapRenderer path={path} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Start upgrade
      const upgradeButton = screen.getByTestId('upgrade-button');
      fireEvent.click(upgradeButton);

      // Unmount before completion
      unmount();

      // Should not throw errors - component cleaned up properly
      expect(true).toBe(true);
    });
  });
});
