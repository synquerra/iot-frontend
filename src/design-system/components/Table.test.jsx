import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableHeaderCell,
} from './Table';

describe('Table Component', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  ];

  const mockColumns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', sortable: true },
  ];

  it('renders with default props', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Test Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByText('Test Cell')).toBeInTheDocument();
  });

  it('renders with data and columns automatically', () => {
    render(<Table data={mockData} columns={mockColumns} />);
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    
    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        loading={true}
        loadingRows={3}
      />
    );
    
    // Should show skeleton loading
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders empty state', () => {
    render(
      <Table 
        data={[]} 
        columns={mockColumns} 
        emptyMessage="No users found"
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('handles row clicks', () => {
    const onRowClick = vi.fn();
    
    render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        onRowClick={onRowClick}
      />
    );
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow);
    
    expect(onRowClick).toHaveBeenCalledWith(mockData[0], 0);
  });

  it('handles sorting', () => {
    const onSort = vi.fn();
    
    render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        onSort={onSort}
      />
    );
    
    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader);
    
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Table variant="bordered" data-testid="table" />);
    expect(screen.getByTestId('table')).toHaveClass('bg-surface-primary');

    rerender(<Table variant="minimal" data-testid="table" />);
    expect(screen.getByTestId('table')).toHaveClass('bg-transparent');
  });

  it('renders with different sizes', () => {
    render(
      <Table size="sm" data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Small cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByTestId('table')).toHaveClass('text-xs');
  });

  it('renders with hover and striped styles', () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const mockColumns = [{ key: 'name', header: 'Name' }];
    
    render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        hoverable 
        striped 
      />
    );
    
    const row = screen.getByText('Test').closest('tr');
    expect(row).toHaveClass('hover:bg-gradient-to-r');
    expect(row).toHaveClass('even:bg-surface-secondary/20');
  });

  it('renders custom cell content with render function', () => {
    const columnsWithRender = [
      {
        key: 'name',
        header: 'Name',
        render: (value, row) => <strong>{value}</strong>
      },
      { key: 'email', header: 'Email' },
    ];

    render(<Table data={mockData} columns={columnsWithRender} />);
    
    const strongElement = screen.getByText('John Doe');
    expect(strongElement.tagName).toBe('STRONG');
  });
});

describe('TableContainer Component', () => {
  it('renders with responsive wrapper', () => {
    render(
      <TableContainer data-testid="container">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Container test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('overflow-x-auto');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('border');
  });
});

describe('TableHeaderCell Component', () => {
  it('renders sortable header with indicators', () => {
    const onSort = vi.fn();
    
    render(
      <table>
        <thead>
          <tr>
            <TableHeaderCell sortable onSort={onSort}>
              Sortable Header
            </TableHeaderCell>
          </tr>
        </thead>
      </table>
    );
    
    const header = screen.getByText('Sortable Header').closest('th');
    expect(header).toHaveClass('cursor-pointer');
    
    fireEvent.click(header);
    expect(onSort).toHaveBeenCalledWith('asc');
  });

  it('renders non-sortable header', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeaderCell>
              Regular Header
            </TableHeaderCell>
          </tr>
        </thead>
      </table>
    );
    
    const header = screen.getByText('Regular Header').closest('th');
    expect(header).not.toHaveClass('cursor-pointer');
  });
});

describe('TableRow Component', () => {
  it('renders with click handler', () => {
    const onClick = vi.fn();
    
    render(
      <table>
        <tbody>
          <TableRow onClick={onClick}>
            <TableCell>Clickable row</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    
    const row = screen.getByText('Clickable row').closest('tr');
    fireEvent.click(row);
    
    expect(onClick).toHaveBeenCalled();
    expect(row).toHaveClass('cursor-pointer');
  });
});

describe('TableCell Component', () => {
  it('renders with different sizes', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell size="sm">Small cell</TableCell>
            <TableCell size="lg">Large cell</TableCell>
          </tr>
        </tbody>
      </table>
    );
    
    const smallCell = screen.getByText('Small cell');
    const largeCell = screen.getByText('Large cell');
    
    expect(smallCell).toHaveClass('px-2', 'py-2');
    expect(largeCell).toHaveClass('px-4', 'py-4');
  });
});