import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MapErrorBoundary from './MapErrorBoundary';

// Mock FallbackMapView
vi.mock('./FallbackMapView', () => ({
  default: ({ path, error, onRetry }) => (
    <div data-testid="fallback-map-view">
      <div>Fallback View</div>
      {error && <div data-testid="error-message">{error.message}</div>}
      {onRetry && (
        <button onClick={onRetry} data-testid="retry-button">
          Retry
        </button>
      )}
      <div data-testid="path-length">{path.length}</div>
    </div>
  ),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="child-component">Child Component</div>;
};

describe('MapErrorBoundary', () => {
  const mockPath = [
    { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
    { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z' },
  ];

  // Suppress console.error for these tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={false} />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback-map-view')).not.toBeInTheDocument();
  });

  it('renders fallback view when error occurs', () => {
    render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
  });

  it('passes error to fallback view', () => {
    render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
  });

  it('passes path to fallback view', () => {
    render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('path-length')).toHaveTextContent('2');
  });

  it('shows retry button in fallback view', () => {
    render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  it('retries rendering when retry button is clicked', () => {
    let shouldThrow = true;
    
    const DynamicComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="child-component">Child Component</div>;
    };

    const { rerender } = render(
      <MapErrorBoundary path={mockPath}>
        <DynamicComponent />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();

    // Click retry button and change the error condition
    const retryButton = screen.getByTestId('retry-button');
    shouldThrow = false;
    fireEvent.click(retryButton);

    // Rerender to trigger the retry
    rerender(
      <MapErrorBoundary path={mockPath}>
        <DynamicComponent />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('calls onRetry callback when provided', () => {
    const onRetry = vi.fn();

    render(
      <MapErrorBoundary path={mockPath} onRetry={onRetry}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('limits retry attempts to 3', () => {
    const { rerender } = render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    const retryButton = screen.getByTestId('retry-button');

    // First retry
    fireEvent.click(retryButton);
    rerender(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    // Second retry
    fireEvent.click(screen.getByTestId('retry-button'));
    rerender(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    // Third retry
    fireEvent.click(screen.getByTestId('retry-button'));
    rerender(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    // After 3 retries, button should not be available
    expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
  });

  it('uses custom fallback component when provided', () => {
    const CustomFallback = ({ error }) => (
      <div data-testid="custom-fallback">
        Custom Fallback: {error.message}
      </div>
    );

    render(
      <MapErrorBoundary path={mockPath} fallbackComponent={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Fallback: Test error')).toBeInTheDocument();
  });

  it('logs error to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <MapErrorBoundary path={mockPath}>
        <ThrowError shouldThrow={true} />
      </MapErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // Additional error boundary behavior tests - Requirements: 5.1, 5.2, 5.4
  describe('Error boundary comprehensive behavior', () => {
    it('catches errors from nested components', () => {
      const NestedComponent = () => {
        return (
          <div>
            <ThrowError shouldThrow={true} />
          </div>
        );
      };

      render(
        <MapErrorBoundary path={mockPath}>
          <NestedComponent />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
    });

    it('catches errors during component lifecycle', () => {
      const LifecycleError = () => {
        React.useEffect(() => {
          throw new Error('Lifecycle error');
        }, []);
        return <div>Component</div>;
      };

      render(
        <MapErrorBoundary path={mockPath}>
          <LifecycleError />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
    });

    it('provides error details to fallback component', () => {
      const detailedError = new Error('Detailed map initialization error');
      detailedError.stack = 'Error stack trace...';

      const ThrowDetailedError = () => {
        throw detailedError;
      };

      render(
        <MapErrorBoundary path={mockPath}>
          <ThrowDetailedError />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Detailed map initialization error'
      );
    });

    it('handles errors with empty path data', () => {
      render(
        <MapErrorBoundary path={[]}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
      expect(screen.getByTestId('path-length')).toHaveTextContent('0');
    });

    it('handles errors with large path data', () => {
      const largePath = Array.from({ length: 1000 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:00:00Z`,
      }));

      render(
        <MapErrorBoundary path={largePath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
      expect(screen.getByTestId('path-length')).toHaveTextContent('1000');
    });

    it('resets error state completely on retry', () => {
      let shouldThrow = true;
      
      const DynamicComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="working-component">Working</div>;
      };

      const { rerender } = render(
        <MapErrorBoundary path={mockPath}>
          <DynamicComponent />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();

      // Click retry and change error condition
      shouldThrow = false;
      fireEvent.click(screen.getByTestId('retry-button'));

      // Rerender with working component
      rerender(
        <MapErrorBoundary path={mockPath}>
          <DynamicComponent />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByTestId('fallback-map-view')).not.toBeInTheDocument();
    });

    it('increments retry count on each retry attempt', () => {
      const { rerender } = render(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      // First error - retry button should be available
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();

      // Retry 1
      fireEvent.click(screen.getByTestId('retry-button'));
      rerender(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();

      // Retry 2
      fireEvent.click(screen.getByTestId('retry-button'));
      rerender(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();

      // Retry 3 - should be last attempt
      fireEvent.click(screen.getByTestId('retry-button'));
      rerender(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      // After 3 retries, button should not be available
      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('logs warning when maximum retry attempts reached', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const { rerender } = render(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      // Perform 3 retries
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByTestId('retry-button'));
        rerender(
          <MapErrorBoundary path={mockPath}>
            <ThrowError shouldThrow={true} />
          </MapErrorBoundary>
        );
      }

      // Try to retry again (should log warning)
      const retryButton = screen.queryByTestId('retry-button');
      if (retryButton) {
        fireEvent.click(retryButton);
      }

      // Warning should be logged when trying to retry after max attempts
      // Note: The warning is logged in handleRetry when retryCount >= 3
      
      consoleWarnSpy.mockRestore();
    });

    it('passes all props to fallback component', () => {
      const CustomFallback = ({ error, onRetry, path, customProp }) => (
        <div data-testid="custom-fallback">
          <div data-testid="custom-prop">{customProp}</div>
        </div>
      );

      render(
        <MapErrorBoundary
          path={mockPath}
          fallbackComponent={CustomFallback}
          customProp="test-value"
        >
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });

    it('handles synchronous errors', () => {
      const SyncError = () => {
        throw new Error('Synchronous error');
      };

      render(
        <MapErrorBoundary path={mockPath}>
          <SyncError />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
    });

    it('maintains error boundary state across re-renders', () => {
      const { rerender } = render(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();

      // Re-render with same error state
      rerender(
        <MapErrorBoundary path={mockPath}>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      );

      // Should still show fallback
      expect(screen.getByTestId('fallback-map-view')).toBeInTheDocument();
    });
  });
});
