import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ValidationError from './ValidationError';

describe('ValidationError', () => {
  const mockErrors = [
    { field: 'coordinates', message: 'Geofence must have at least 3 points', code: 'MIN_POINTS' },
    { field: 'coordinates[0]', message: 'Point 1: Latitude must be between -90 and 90', code: 'INVALID_COORDINATE' }
  ];

  it('should display multiple errors', () => {
    render(<ValidationError errors={mockErrors} />);

    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText('Geofence must have at least 3 points')).toBeInTheDocument();
    expect(screen.getByText('Point 1: Latitude must be between -90 and 90')).toBeInTheDocument();
  });

  it('should not render when errors array is empty', () => {
    render(<ValidationError errors={[]} />);

    expect(screen.queryByText('Validation Errors')).not.toBeInTheDocument();
  });

  it('should not render when errors is null', () => {
    render(<ValidationError errors={null} />);

    expect(screen.queryByText('Validation Errors')).not.toBeInTheDocument();
  });

  it('should not render when errors is undefined', () => {
    render(<ValidationError errors={undefined} />);

    expect(screen.queryByText('Validation Errors')).not.toBeInTheDocument();
  });

  it('should display error icon', () => {
    const { container } = render(<ValidationError errors={mockErrors} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have red color scheme', () => {
    const { container } = render(<ValidationError errors={mockErrors} />);

    const errorContainer = container.querySelector('.bg-red-500\\/10');
    expect(errorContainer).toBeInTheDocument();
  });
});
