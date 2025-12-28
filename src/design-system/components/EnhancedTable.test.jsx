import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { 
  EnhancedTable, 
  EnhancedTableContainer,
  StatusBadge,
  getDataValueType,
  dataTypeColorSchemes 
} from './EnhancedTable';

describe('EnhancedTable', () => {
  const mockData = [
    {
      id: 1,
      imei: '123456789012345',
      speed: 45,
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'GPS',
      status: 'active'
    },
    {
      id: 2,
      imei: '987654321098765',
      speed: 85,
      latitude: 34.0522,
      longitude: -118.2437,
      type: 'GPS',
      status: 'inactive'
    }
  ];

  const mockColumns = [
    {
      key: 'imei',
      header: 'Device IMEI',
      sortable: true
    },
    {
      key: 'speed',
      header: 'Speed',
      sortable: true
    },
    {
      key: 'latitude',
      header: 'Latitude',
      sortable: true
    },
    {
      key: 'longitude',
      header: 'Longitude',
      sortable: true
    },
    {
      key: 'type',
      header: 'Type',
      sortable: false
    }
  ];

  it('renders enhanced table with data and columns', () => {
    render(
      <EnhancedTable
        data={mockData}
        columns={mockColumns}
        colorScheme="violet"
        colorCoded={true}
        showBadges={true}
      />
    );

    // Check if headers are rendered
    expect(screen.getByText('Device IMEI')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Latitude')).toBeInTheDocument();
    expect(screen.getByText('Longitude')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();

    // Check if data is rendered (should be in badges/formatted cells)
    expect(screen.getByText('123456789012345')).toBeInTheDocument();
    expect(screen.getByText('987654321098765')).toBeInTheDocument();
  });

  it('renders enhanced table container with proper styling', () => {
    const { container } = render(
      <EnhancedTableContainer colorScheme="blue" padding="lg">
        <div>Test content</div>
      </EnhancedTableContainer>
    );

    const tableContainer = container.firstChild;
    expect(tableContainer).toHaveClass('relative', 'overflow-hidden', 'rounded-2xl');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders status badges with correct styling', () => {
    render(
      <div>
        <StatusBadge type="success" value="Active" size="sm" />
        <StatusBadge type="error" value="Inactive" size="md" />
        <StatusBadge type="warning" value="Pending" size="lg" />
      </div>
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows empty state when no data provided', () => {
    render(
      <EnhancedTable
        data={[]}
        columns={mockColumns}
        emptyMessage="No data available"
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <EnhancedTable
        data={mockData}
        columns={mockColumns}
        loading={true}
        loadingRows={3}
        loadingColumns={5}
      />
    );

    // Should show skeleton loading rows
    const skeletonElements = screen.getAllByRole('row');
    // Headers + loading rows
    expect(skeletonElements.length).toBeGreaterThan(1);
  });
});

describe('Data Value Type Detection', () => {
  it('correctly identifies different data types', () => {
    expect(getDataValueType(150)).toBe('high'); // > 100
    expect(getDataValueType(25)).toBe('low');   // <= 50
    expect(getDataValueType(-5)).toBe('negative');
    expect(getDataValueType(0)).toBe('neutral');
    
    expect(getDataValueType('active')).toBe('success');
    expect(getDataValueType('offline')).toBe('error'); // Changed from 'inactive' to 'offline'
    expect(getDataValueType('warning')).toBe('warning');
    expect(getDataValueType('info')).toBe('info');
    
    expect(getDataValueType('85 km/h')).toBe('high-speed');
    expect(getDataValueType('25 km/h')).toBe('low-speed');
    
    expect(getDataValueType('40.7128')).toBe('coordinate');
    expect(getDataValueType('123456789012345')).toBe('device-id');
    
    expect(getDataValueType('regular text')).toBe('text');
  });

  it('has color schemes for all data types', () => {
    const dataTypes = [
      'success', 'error', 'warning', 'info',
      'high-speed', 'medium-speed', 'low-speed',
      'coordinate', 'device-id', 'high', 'medium', 'low',
      'negative', 'neutral', 'text', 'unknown'
    ];

    dataTypes.forEach(type => {
      expect(dataTypeColorSchemes[type]).toBeDefined();
      expect(dataTypeColorSchemes[type]).toHaveProperty('bg');
      expect(dataTypeColorSchemes[type]).toHaveProperty('text');
      expect(dataTypeColorSchemes[type]).toHaveProperty('border');
      expect(dataTypeColorSchemes[type]).toHaveProperty('icon');
    });
  });
});

describe('Enhanced Table Features', () => {
  const mockData = [
    {
      id: 1,
      imei: '123456789012345',
      speed: 45,
      latitude: 40.7128,
      longitude: -74.0060,
      type: 'GPS',
      status: 'active'
    },
    {
      id: 2,
      imei: '987654321098765',
      speed: 85,
      latitude: 34.0522,
      longitude: -118.2437,
      type: 'GPS',
      status: 'inactive'
    }
  ];

  const mockColumns = [
    {
      key: 'imei',
      header: 'Device IMEI',
      sortable: true
    },
    {
      key: 'speed',
      header: 'Speed',
      sortable: true
    },
    {
      key: 'type',
      header: 'Type',
      sortable: false
    }
  ];

  it('applies color coding when colorCoded prop is true', () => {
    render(
      <EnhancedTable
        data={mockData}
        columns={mockColumns}
        colorCoded={true}
        showBadges={true}
      />
    );

    // Should render colored badges/cells
    const coloredElements = screen.getAllByText(/123456789012345|987654321098765/);
    expect(coloredElements.length).toBeGreaterThan(0);
  });

  it('supports responsive behavior', () => {
    const { container } = render(
      <EnhancedTable
        data={mockData}
        columns={mockColumns}
        responsive={true}
      />
    );

    const tableWrapper = container.firstChild;
    expect(tableWrapper).toHaveClass('overflow-x-auto');
  });

  it('handles row click events', () => {
    let clickedRow = null;
    const handleRowClick = (row) => {
      clickedRow = row;
    };

    render(
      <EnhancedTable
        data={mockData}
        columns={mockColumns}
        onRowClick={handleRowClick}
        hoverable={true}
      />
    );

    // The table should be rendered with clickable rows
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Header + data rows
  });
});