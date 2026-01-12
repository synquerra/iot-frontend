import React from 'react';
import FallbackMapView from './FallbackMapView';

/**
 * MapErrorBoundary Component
 * 
 * Error boundary specifically designed for map components.
 * Catches errors during map initialization, rendering, or tile loading
 * and provides a graceful fallback to table view.
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Map Error Boundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Log to external error tracking service if available
    if (window.errorTracker) {
      window.errorTracker.logError('MapComponent', error, errorInfo);
    }
  }

  handleRetry = () => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    // Limit retry attempts to prevent infinite loops
    if (retryCount >= 3) {
      console.warn('Maximum retry attempts reached for map component');
      return;
    }

    console.log(`Retrying map load (attempt ${retryCount + 1}/3)`);

    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    });

    // Call parent retry handler if provided
    if (onRetry) {
      onRetry();
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, path = [], fallbackComponent } = this.props;

    if (hasError) {
      // Use custom fallback component if provided
      if (fallbackComponent) {
        return fallbackComponent({ error, onRetry: this.handleRetry, path });
      }

      // Default fallback to FallbackMapView
      return (
        <FallbackMapView
          path={path}
          error={error}
          onRetry={retryCount < 3 ? this.handleRetry : null}
        />
      );
    }

    return children;
  }
}

export default MapErrorBoundary;
