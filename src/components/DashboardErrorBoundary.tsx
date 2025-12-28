/**
 * Error Boundary for Dashboard Components
 * Requirements: 8.3, 8.4
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';
import type { 
  DashboardErrorBoundaryProps, 
  ErrorFallbackProps,
  ErrorInfo as CustomErrorInfo 
} from '../types/dashboard';

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetError 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="outlined" padding="xl" className="max-w-2xl w-full">
        <Card.Header>
          <Card.Title className="text-status-error flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            Dashboard Error
          </Card.Title>
          <Card.Description>
            Something went wrong while loading the dashboard. This error has been logged for investigation.
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-4">
          <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4">
            <h4 className="font-medium text-status-error mb-2">Error Details:</h4>
            <p className="text-sm text-text-secondary font-mono bg-background-secondary p-2 rounded border">
              {error.message}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="bg-background-secondary border border-border-primary rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-text-primary mb-2">
                Stack Trace (Development Only)
              </summary>
              <pre className="text-xs text-text-secondary overflow-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
              {errorInfo.componentStack && (
                <div className="mt-4">
                  <h5 className="font-medium text-text-primary mb-2">Component Stack:</h5>
                  <pre className="text-xs text-text-secondary overflow-auto whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </details>
          )}
        </Card.Content>

        <Card.Actions>
          <Button 
            variant="primary" 
            onClick={resetError}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Reload Page
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: CustomErrorInfo | null;
}

export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const customErrorInfo: CustomErrorInfo = {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'DashboardErrorBoundary',
    };

    this.setState({
      errorInfo: customErrorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, customErrorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: customErrorInfo });
    }
  }

  componentDidUpdate(prevProps: DashboardErrorBoundaryProps) {
    // Reset error boundary when props change (if enabled)
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallbackComponent || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<DashboardErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <DashboardErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </DashboardErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default DashboardErrorBoundary;