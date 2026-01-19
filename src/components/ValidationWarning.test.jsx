import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ValidationWarning from './ValidationWarning';

describe('ValidationWarning', () => {
  const mockWarnings = [
    { field: 'coordinates', message: 'Polygon will be automatically closed', code: 'AUTO_CLOSE' },
    { field: 'coordinates', message: 'Polygon edges intersect themselves', code: 'SELF_INTERSECTION' }
  ];

  it('should display multiple warnings', () => {
    render(<ValidationWarning warnings={mockWarnings} />);

    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Polygon will be automatically closed')).toBeInTheDocument();
    expect(screen.getByText('Polygon edges intersect themselves')).toBeInTheDocument();
  });

  it('should not render when warnings array is empty', () => {
    render(<ValidationWarning warnings={[]} />);

    expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
  });

  it('should not render when warnings is null', () => {
    render(<ValidationWarning warnings={null} />);

    expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
  });

  it('should not render when warnings is undefined', () => {
    render(<ValidationWarning warnings={undefined} />);

    expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
  });

  it('should display warning icon', () => {
    const { container } = render(<ValidationWarning warnings={mockWarnings} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have amber color scheme', () => {
    const { container } = render(<ValidationWarning warnings={mockWarnings} />);

    const warningContainer = container.querySelector('.bg-amber-500\\/10');
    expect(warningContainer).toBeInTheDocument();
  });
});
