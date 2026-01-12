import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FallbackMapView from './FallbackMapView';

describe('FallbackMapView', () => {
  const mockPath = [
    { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z', speed: 30 },
    { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z', speed: 35 },
    { lat: 40.7148, lng: -74.0080, time: '2024-01-01T10:10:00Z', speed: 40 },
  ];

  it('renders fallback view with error message', () => {
    const error = new Error('Map failed to load');
    render(<FallbackMapView path={mockPath} error={error} />);

    expect(screen.getByText('Map Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/Unable to load interactive map: Map failed to load/)).toBeInTheDocument();
  });

  it('renders fallback view without error message', () => {
    render(<FallbackMapView path={mockPath} />);

    expect(screen.getByText('Map Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/The interactive map could not be loaded/)).toBeInTheDocument();
  });

  it('displays statistics summary', () => {
    render(<FallbackMapView path={mockPath} />);

    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('Start Location')).toBeInTheDocument();
    expect(screen.getByText('End Location')).toBeInTheDocument();
  });

  it('renders location data table', () => {
    render(<FallbackMapView path={mockPath} />);

    // Check table headers
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Latitude')).toBeInTheDocument();
    expect(screen.getByText('Longitude')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('40.712800')).toBeInTheDocument();
    expect(screen.getByText('-74.006000')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<FallbackMapView path={mockPath} onRetry={onRetry} />);

    const retryButton = screen.getByText('Retry Loading Map');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<FallbackMapView path={mockPath} />);

    expect(screen.queryByText('Retry Loading Map')).not.toBeInTheDocument();
  });

  it('handles empty path gracefully', () => {
    render(<FallbackMapView path={[]} />);

    expect(screen.getByText('Map Unavailable')).toBeInTheDocument();
    expect(screen.getByText('No location data available')).toBeInTheDocument();
  });

  it('sorts path by time', () => {
    const unsortedPath = [
      { lat: 40.7148, lng: -74.0080, time: '2024-01-01T10:10:00Z' },
      { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
      { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z' },
    ];

    render(<FallbackMapView path={unsortedPath} />);

    const rows = screen.getAllByRole('row');
    // First row is header, second row should be earliest time
    expect(rows[1]).toHaveTextContent('40.712800');
  });

  it('handles missing optional fields', () => {
    const pathWithoutSpeed = [
      { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
      { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z' },
    ];

    render(<FallbackMapView path={pathWithoutSpeed} />);

    // Speed column should not be present
    expect(screen.queryByText('Speed')).not.toBeInTheDocument();
  });

  it('displays accuracy column when present', () => {
    const pathWithAccuracy = [
      { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z', accuracy: 10 },
      { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z', accuracy: 15 },
    ];

    render(<FallbackMapView path={pathWithAccuracy} />);

    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('10m')).toBeInTheDocument();
    expect(screen.getByText('15m')).toBeInTheDocument();
  });

  // Additional fallback to table view tests - Requirements: 5.4
  describe('Comprehensive fallback to table view', () => {
    it('displays all location points in table format', () => {
      const largePath = Array.from({ length: 50 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T${String(10 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
      }));

      render(<FallbackMapView path={largePath} />);

      // Should show all 50 rows (plus header)
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(51); // 50 data rows + 1 header row
    });

    it('formats coordinates with 6 decimal places', () => {
      const path = [
        { lat: 40.712345678, lng: -74.006012345, time: '2024-01-01T10:00:00Z' },
      ];

      render(<FallbackMapView path={path} />);

      expect(screen.getByText('40.712346')).toBeInTheDocument();
      expect(screen.getByText('-74.006012')).toBeInTheDocument();
    });

    it('displays row numbers starting from 1', () => {
      render(<FallbackMapView path={mockPath} />);

      const rows = screen.getAllByRole('row');
      // Check first data row has number 1
      expect(rows[1]).toHaveTextContent('1');
      expect(rows[2]).toHaveTextContent('2');
      expect(rows[3]).toHaveTextContent('3');
    });

    it('formats timestamps in locale format', () => {
      const path = [
        { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
      ];

      render(<FallbackMapView path={path} />);

      // Should contain formatted date/time (exact format depends on locale)
      // Use getAllByText since timestamp appears in multiple places
      const timeCells = screen.getAllByText(/2024|1\/1\/2024|01\/01\/2024/);
      expect(timeCells.length).toBeGreaterThan(0);
    });

    it('handles missing time field gracefully', () => {
      const pathWithoutTime = [
        { lat: 40.7128, lng: -74.0060 },
        { lat: 40.7138, lng: -74.0070 },
      ];

      render(<FallbackMapView path={pathWithoutTime} />);

      // Should display dash for missing time
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('-');
    });

    it('displays speed values with units', () => {
      const pathWithSpeed = [
        { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z', speed: 45.5 },
      ];

      render(<FallbackMapView path={pathWithSpeed} />);

      expect(screen.getByText('45.5 km/h')).toBeInTheDocument();
    });

    it('handles missing speed values with dash', () => {
      const pathWithPartialSpeed = [
        { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z', speed: 30 },
        { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z' },
      ];

      render(<FallbackMapView path={pathWithPartialSpeed} />);

      const rows = screen.getAllByRole('row');
      // Second data row should have dash for missing speed
      expect(rows[2]).toHaveTextContent('-');
    });

    it('handles missing accuracy values with dash', () => {
      const pathWithPartialAccuracy = [
        { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z', accuracy: 10 },
        { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z' },
      ];

      render(<FallbackMapView path={pathWithPartialAccuracy} />);

      const rows = screen.getAllByRole('row');
      // Second data row should have dash for missing accuracy
      expect(rows[2]).toHaveTextContent('-');
    });

    it('displays start and end coordinates in statistics', () => {
      render(<FallbackMapView path={mockPath} />);

      // Start location
      expect(screen.getByText('40.712800, -74.006000')).toBeInTheDocument();
      
      // End location
      expect(screen.getByText('40.714800, -74.008000')).toBeInTheDocument();
    });

    it('displays timestamps in statistics summary', () => {
      render(<FallbackMapView path={mockPath} />);

      // Should show timestamps for start and end points
      const timestamps = screen.getAllByText(/2024|1\/1\/2024|01\/01\/2024/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('makes table scrollable for large datasets', () => {
      const largePath = Array.from({ length: 100 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:00:00Z`,
      }));

      const { container } = render(<FallbackMapView path={largePath} />);

      // Check for overflow-auto class
      const scrollableDiv = container.querySelector('.overflow-auto');
      expect(scrollableDiv).toBeInTheDocument();
      expect(scrollableDiv).toHaveClass('max-h-[500px]');
    });

    it('applies hover effect to table rows', () => {
      const { container } = render(<FallbackMapView path={mockPath} />);

      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows.length).toBeGreaterThan(0);
      
      // Check for hover class
      tableRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-surface-secondary/50');
      });
    });

    it('displays warning icon in error header', () => {
      const { container } = render(<FallbackMapView path={mockPath} />);

      // Check for SVG warning icon
      const warningIcon = container.querySelector('svg');
      expect(warningIcon).toBeInTheDocument();
    });

    it('shows different message for error vs no error', () => {
      const { rerender } = render(<FallbackMapView path={mockPath} />);

      expect(screen.getByText(/The interactive map could not be loaded/)).toBeInTheDocument();

      rerender(<FallbackMapView path={mockPath} error={new Error('Test error')} />);

      expect(screen.getByText(/Unable to load interactive map: Test error/)).toBeInTheDocument();
    });

    it('handles very large datasets efficiently', () => {
      const veryLargePath = Array.from({ length: 1000 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: `2024-01-01T10:00:00Z`,
      }));

      render(<FallbackMapView path={veryLargePath} />);

      expect(screen.getByText('Total Points')).toBeInTheDocument();
      // Use getAllByText since "1000" appears in both stats and table
      const elements = screen.getAllByText('1000');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('maintains table structure with mixed optional fields', () => {
      const mixedPath = [
        { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z', speed: 30 },
        { lat: 40.7138, lng: -74.0070, time: '2024-01-01T10:05:00Z', accuracy: 10 },
        { lat: 40.7148, lng: -74.0080, time: '2024-01-01T10:10:00Z', speed: 35, accuracy: 15 },
      ];

      render(<FallbackMapView path={mixedPath} />);

      // Both speed and accuracy columns should be present
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();

      // Check for dashes where values are missing
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // 3 data rows + 1 header
    });

    it('provides accessible table structure', () => {
      render(<FallbackMapView path={mockPath} />);

      // Check for proper table structure
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // At least header + 1 data row
    });
  });
});
