import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

/**
 * Enhanced Table Component
 * 
 * Features:
 * - Improved styling and readability
 * - Support for hover states, striped rows, and loading states
 * - Responsive behavior for mobile devices
 * - Consistent typography and spacing
 * - Sortable columns support
 * - Empty state handling
 * - Flexible column configuration
 */

// Table variant styles using class-variance-authority
const tableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      variant: {
        default: 'bg-surface-primary',
        bordered: 'bg-surface-primary border border-border-primary rounded-lg overflow-hidden',
        minimal: 'bg-transparent',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Table header styles
const tableHeaderVariants = cva(
  'border-b font-medium text-left',
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-surface-secondary via-surface-secondary to-surface-secondary',
          'border-border-primary text-text-secondary',
          'hover:from-violet-500/10 hover:via-blue-500/10 hover:to-teal-500/10',
        ].join(' '),
        bordered: [
          'bg-gradient-to-r from-surface-secondary via-surface-secondary to-surface-secondary',
          'border-border-primary text-text-secondary',
          'hover:from-violet-500/10 hover:via-blue-500/10 hover:to-teal-500/10',
        ].join(' '),
        minimal: 'bg-transparent border-border-muted text-text-tertiary',
      },
      size: {
        sm: 'px-2 py-2 text-xs',
        md: 'px-3 py-3 text-sm',
        lg: 'px-4 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Table cell styles
const tableCellVariants = cva(
  'border-b text-text-primary',
  {
    variants: {
      variant: {
        default: 'border-border-muted',
        bordered: 'border-border-primary',
        minimal: 'border-border-muted',
      },
      size: {
        sm: 'px-2 py-2',
        md: 'px-3 py-3',
        lg: 'px-4 py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Table row styles
const tableRowVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        bordered: '',
        minimal: '',
      },
      hoverable: {
        true: [
          'hover:bg-gradient-to-r hover:from-violet-500/10 hover:via-blue-500/10 hover:to-teal-500/10',
          'hover:border-l-2 hover:border-l-teal-400',
          'hover:shadow-sm hover:shadow-teal-500/20',
          'cursor-pointer transform hover:scale-[1.005]',
        ].join(' '),
        false: '',
      },
      striped: {
        true: 'even:bg-surface-secondary/20',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hoverable: false,
      striped: false,
    },
  }
);

// Loading skeleton component
const LoadingSkeleton = ({ rows = 5, columns = 4, size = 'md' }) => {
  const skeletonRows = Array.from({ length: rows }, (_, i) => i);
  const skeletonCells = Array.from({ length: columns }, (_, i) => i);
  
  return (
    <>
      {skeletonRows.map((row) => (
        <tr key={row}>
          {skeletonCells.map((cell) => (
            <td key={cell} className={cn(tableCellVariants({ size }))}>
              <div className="animate-pulse bg-surface-tertiary rounded h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Sort indicator component
const SortIndicator = ({ direction }) => {
  if (!direction) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="opacity-40"
      >
        <path
          d="M6 2L9 5H3L6 2Z"
          fill="currentColor"
        />
        <path
          d="M6 10L3 7H9L6 10Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={cn(
        'transition-transform duration-200',
        direction === 'desc' && 'rotate-180'
      )}
    >
      <path
        d="M6 2L9 5H3L6 2Z"
        fill="currentColor"
      />
    </svg>
  );
};

// Table header cell component
const TableHeaderCell = forwardRef(
  (
    {
      children,
      className,
      sortable = false,
      sortDirection,
      onSort,
      variant = 'default',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const handleSort = () => {
      if (sortable && onSort) {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(newDirection);
      }
    };

    return (
      <th
        ref={ref}
        className={cn(
          tableHeaderVariants({ variant, size }),
          sortable && 'cursor-pointer select-none hover:bg-surface-tertiary/50',
          className
        )}
        onClick={handleSort}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <span>{children}</span>
          {sortable && <SortIndicator direction={sortDirection} />}
        </div>
      </th>
    );
  }
);
TableHeaderCell.displayName = 'TableHeaderCell';

// Table cell component
const TableCell = forwardRef(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      ...props
    },
    ref
  ) => {
    return (
      <td
        ref={ref}
        className={cn(tableCellVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

// Table row component
const TableRow = forwardRef(
  (
    {
      children,
      className,
      variant = 'default',
      hoverable = false,
      striped = false,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <tr
        ref={ref}
        className={cn(
          tableRowVariants({ variant, hoverable, striped }),
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

// Main Table component
const Table = forwardRef(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      hoverable = false,
      striped = false,
      loading = false,
      loadingRows = 5,
      loadingColumns = 4,
      emptyMessage = 'No data available',
      data = [],
      columns = [],
      onRowClick,
      sortConfig,
      onSort,
      responsive = true,
      ...props
    },
    ref
  ) => {
    // If data and columns are provided, render automatically
    const shouldAutoRender = columns.length > 0;
    
    const renderAutoTable = () => (
      <>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <TableHeaderCell
                key={column.key || index}
                variant={variant}
                size={size}
                sortable={column.sortable}
                sortDirection={sortConfig?.key === column.key ? sortConfig.direction : null}
                onSort={column.sortable ? (direction) => onSort?.(column.key, direction) : undefined}
              >
                {column.header || column.title}
              </TableHeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingSkeleton rows={loadingRows} columns={columns.length} size={size} />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  tableCellVariants({ variant, size }),
                  'text-center text-text-tertiary py-8'
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={row.id || rowIndex}
                variant={variant}
                hoverable={hoverable || !!onRowClick}
                striped={striped}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={column.key || colIndex}
                    variant={variant}
                    size={size}
                  >
                    {column.render 
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </tbody>
      </>
    );

    return (
      <div className={cn(responsive && 'overflow-x-auto')}>
        <table
          ref={ref}
          className={cn(tableVariants({ variant, size }), className)}
          {...props}
        >
          {shouldAutoRender ? renderAutoTable() : children}
        </table>
      </div>
    );
  }
);
Table.displayName = 'Table';

// Table container for responsive behavior
const TableContainer = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-x-auto rounded-lg border border-border-primary',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TableContainer.displayName = 'TableContainer';

// Table header component
const TableHeader = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('bg-surface-secondary', className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);
TableHeader.displayName = 'TableHeader';

// Table body component
const TableBody = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  }
);
TableBody.displayName = 'TableBody';

// Table footer component
const TableFooter = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={cn('bg-surface-secondary border-t border-border-primary', className)}
        {...props}
      >
        {children}
      </tfoot>
    );
  }
);
TableFooter.displayName = 'TableFooter';

export {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableHeaderCell,
  LoadingSkeleton,
  SortIndicator,
};