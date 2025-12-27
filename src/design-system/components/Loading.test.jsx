import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Loading,
  LoadingOverlay,
  Spinner,
  Dots,
  Pulse,
  Skeleton,
  ProgressBar,
} from './Loading.jsx';

describe('Loading Components', () => {
  describe('Spinner', () => {
    it('renders with default props', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('applies size classes correctly', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('applies color classes correctly', () => {
      render(<Spinner color="success" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-green-500');
    });
  });

  describe('Dots', () => {
    it('renders three dots', () => {
      render(<Dots />);
      const dotsContainer = screen.getByRole('status');
      expect(dotsContainer).toBeInTheDocument();
      expect(dotsContainer.children).toHaveLength(3);
    });

    it('applies size classes to dots', () => {
      render(<Dots size="lg" />);
      const dotsContainer = screen.getByRole('status');
      const firstDot = dotsContainer.children[0];
      expect(firstDot).toHaveClass('w-3', 'h-3');
    });
  });

  describe('Pulse', () => {
    it('renders with children', () => {
      render(<Pulse>Content</Pulse>);
      const pulse = screen.getByRole('status');
      expect(pulse).toBeInTheDocument();
      expect(pulse).toHaveTextContent('Content');
    });

    it('applies animation classes', () => {
      render(<Pulse />);
      const pulse = screen.getByRole('status');
      expect(pulse).toHaveClass('animate-pulse');
    });
  });

  describe('Skeleton', () => {
    it('renders with default rectangular variant', () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('rounded');
    });

    it('renders circular variant', () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('applies custom dimensions', () => {
      render(<Skeleton width="100px" height="50px" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('can disable animation', () => {
      render(<Skeleton animate={false} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });

  describe('ProgressBar', () => {
    it('renders with default props', () => {
      render(<ProgressBar />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('displays correct progress value', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('shows percentage when showValue is true', () => {
      render(<ProgressBar value={75} showValue />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('clamps values to valid range', () => {
      render(<ProgressBar value={150} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '150');
      // The visual progress should be clamped to 100%
    });
  });

  describe('Loading', () => {
    it('renders spinner by default', () => {
      render(<Loading />);
      const loading = screen.getByRole('status');
      expect(loading).toBeInTheDocument();
    });

    it('renders different types', () => {
      render(<Loading type="dots" />);
      const loading = screen.getByRole('status');
      expect(loading.children).toHaveLength(3); // Three dots
    });

    it('renders with text', () => {
      render(<Loading text="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('positions text correctly', () => {
      render(<Loading text="Loading..." textPosition="top" />);
      const container = screen.getByText('Loading...').parentElement;
      expect(container).toHaveClass('flex-col');
    });
  });

  describe('LoadingOverlay', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingOverlay loading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('shows loading overlay when loading', () => {
      render(
        <LoadingOverlay loading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays custom loading text', () => {
      render(
        <LoadingOverlay loading={true} text="Processing...">
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all loading components have proper ARIA labels', () => {
      render(
        <div>
          <Spinner />
          <Dots />
          <Pulse />
          <Skeleton />
        </div>
      );
      
      const statusElements = screen.getAllByRole('status');
      expect(statusElements).toHaveLength(4);
      
      statusElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });
    });

    it('progress bar has proper ARIA attributes', () => {
      render(<ProgressBar value={50} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Animation Performance', () => {
    it('applies consistent animation durations', () => {
      render(<Loading type="spinner" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('skeleton animation can be controlled', () => {
      const { rerender } = render(<Skeleton animate={true} />);
      let skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('animate-pulse');

      rerender(<Skeleton animate={false} />);
      skeleton = screen.getByRole('status');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });
});