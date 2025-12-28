import React, { forwardRef, useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { spectrumColors, semanticColors } from '../tokens/colors';

/**
 * Enhanced Table Component with Advanced Styling and Data-Driven Formatting
 * 
 * Features:
 * - Color-coded cell rendering based on data values
 * - Enhanced typography and spacing for better readability
 * - Status indicators and badges for different data types
 * - Responsive table behavior with horizontal scroll
 * - Data-driven visual formatting
 * - Advanced glassmorphism effects
 * - Interactive hover states with smooth transitions
 */

// Enhanced table variant styles
const enhancedTableVariants = cva(
  'w-full border-collapse relative',
  {
    variants: {
      variant: {
        default: 'bg-surface-primary/80 backdrop-blur-xl',
        enhanced: [
          'bg-gradient-to-br from-surface-primary/90 via-surface-secondary/80 to-surface-primary/90',
          'backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden',
          'shadow-2xl shadow-black/30'
        ].join(' '),
        glassmorphism: [
          'bg-gradient-to-br from-white/10 via-white/5 to-white/10',
          'backdrop-blur-2xl border border-white/30 rounded-2xl overflow-hidden',
          'shadow-2xl shadow-black/40'
        ].join(' '),
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      colorScheme: {
        violet: 'border-violet-400/40 shadow-violet-500/20',
        blue: 'border-blue-400/40 shadow-blue-500/20',
        teal: 'border-teal-400/40 shadow-teal-500/20',
        green: 'border-green-400/40 shadow-green-500/20',
        amber: 'border-amber-400/40 shadow-amber-500/20',
        red: 'border-red-400/40 shadow-red-500/20',
        purple: 'border-purple-400/40 shadow-purple-500/20',
      },
    },
    defaultVariants: {
      variant: 'enhanced',
      size: 'md',
      colorScheme: 'violet',
    },
  }
);

// Enhanced table header styles with gradient backgrounds
const enhancedHeaderVariants = cva(
  'border-b font-semibold text-left relative overflow-hidden',
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-surface-secondary/80 via-surface-secondary/90 to-surface-secondary/80',
          'border-border-primary text-text-secondary',
          'hover:from-violet-500/15 hover:via-blue-500/15 hover:to-teal-500/15',
        ].join(' '),
        enhanced: [
          'bg-gradient-to-r from-violet-600/20 via-blue-600/15 to-teal-600/20',
          'backdrop-blur-xl border-white/20 text-white',
          'hover:from-violet-500/25 hover:via-blue-500/20 hover:to-teal-500/25',
          'transition-all duration-300 ease-out',
        ].join(' '),
        glassmorphism: [
          'bg-gradient-to-r from-white/15 via-white/10 to-white/15',
          'backdrop-blur-xl border-white/30 text-white',
          'hover:from-white/20 hover:via-white/15 hover:to-white/20',
          'transition-all duration-300 ease-out',
        ].join(' '),
      },
      size: {
        sm: 'px-3 py-2.5 text-xs',
        md: 'px-4 py-3.5 text-sm',
        lg: 'px-5 py-4 text-base',
      },
      colorScheme: {
        violet: 'hover:from-violet-500/25 hover:via-violet-400/20 hover:to-violet-500/25',
        blue: 'hover:from-blue-500/25 hover:via-blue-400/20 hover:to-blue-500/25',
        teal: 'hover:from-teal-500/25 hover:via-teal-400/20 hover:to-teal-500/25',
        green: 'hover:from-green-500/25 hover:via-green-400/20 hover:to-green-500/25',
        amber: 'hover:from-amber-500/25 hover:via-amber-400/20 hover:to-amber-500/25',
        red: 'hover:from-red-500/25 hover:via-red-400/20 hover:to-red-500/25',
        purple: 'hover:from-purple-500/25 hover:via-purple-400/20 hover:to-purple-500/25',
      },
    },
    defaultVariants: {
      variant: 'enhanced',
      size: 'md',
      colorScheme: 'violet',
    },
  }
);

// Enhanced table cell styles with improved spacing and typography
const enhancedCellVariants = cva(
  'border-b text-text-primary relative transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'border-border-muted bg-transparent',
        enhanced: [
          'border-white/10 bg-transparent',
          'hover:bg-gradient-to-r hover:from-white/5 hover:via-white/3 hover:to-white/5',
        ].join(' '),
        glassmorphism: [
          'border-white/15 bg-transparent',
          'hover:bg-gradient-to-r hover:from-white/8 hover:via-white/5 hover:to-white/8',
        ].join(' '),
      },
      size: {
        sm: 'px-3 py-2.5 text-xs leading-relaxed',
        md: 'px-4 py-3.5 text-sm leading-relaxed',
        lg: 'px-5 py-4 text-base leading-relaxed',
      },
    },
    defaultVariants: {
      variant: 'enhanced',
      size: 'md',
    },
  }
);

// Enhanced table row styles with advanced hover effects
const enhancedRowVariants = cva(
  'transition-all duration-300 ease-out relative group',
  {
    variants: {
      variant: {
        default: '',
        enhanced: '',
        glassmorphism: '',
      },
      hoverable: {
        true: [
          'hover:bg-gradient-to-r hover:from-white/8 hover:via-white/5 hover:to-white/8',
          'hover:backdrop-blur-sm hover:shadow-lg hover:shadow-black/20',
          'hover:border-l-4 hover:border-l-teal-400/80',
          'cursor-pointer transform hover:scale-[1.002]',
          'hover:z-10 relative',
        ].join(' '),
        false: '',
      },
      striped: {
        true: 'even:bg-gradient-to-r even:from-white/3 even:via-white/2 even:to-white/3',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'enhanced',
      hoverable: false,
      striped: false,
    },
  }
);

// Data value type detection and color mapping
const getDataValueType = (value) => {
  if (typeof value === 'number') {
    if (value < 0) return 'negative';
    if (value === 0) return 'neutral';
    if (value > 100) return 'high';
    if (value > 50) return 'medium';
    return 'low';
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    
    // Status indicators
    if (['active', 'online', 'connected', 'success', 'completed'].some(s => lowerValue.includes(s))) {
      return 'success';
    }
    if (['inactive', 'offline', 'disconnected', 'error', 'failed'].some(s => lowerValue.includes(s))) {
      return 'error';
    }
    if (['warning', 'pending', 'processing', 'loading'].some(s => lowerValue.includes(s))) {
      return 'warning';
    }
    if (['info', 'information', 'note'].some(s => lowerValue.includes(s))) {
      return 'info';
    }
    
    // Speed categories
    if (lowerValue.includes('km/h') || lowerValue.includes('mph')) {
      const speed = parseFloat(value);
      if (speed > 80) return 'high-speed';
      if (speed > 40) return 'medium-speed';
      return 'low-speed';
    }
    
    // Coordinate values
    if (value.match(/^-?\d+\.\d+$/)) {
      return 'coordinate';
    }
    
    // IMEI or device identifiers
    if (value.match(/^\d{15}$/) || lowerValue.includes('device')) {
      return 'device-id';
    }
    
    return 'text';
  }
  
  return 'unknown';
};

// Color scheme mapping for different data types
const dataTypeColorSchemes = {
  success: {
    bg: 'bg-green-500/15',
    text: 'text-green-300',
    border: 'border-green-500/30',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/30',
    icon: '✗',
  },
  warning: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    icon: 'ℹ',
  },
  'high-speed': {
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/30',
    icon: '🚀',
  },
  'medium-speed': {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: '🚗',
  },
  'low-speed': {
    bg: 'bg-green-500/15',
    text: 'text-green-300',
    border: 'border-green-500/30',
    icon: '🚶',
  },
  coordinate: {
    bg: 'bg-teal-500/15',
    text: 'text-teal-300',
    border: 'border-teal-500/30',
    icon: '📍',
  },
  'device-id': {
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: '📱',
  },
  high: {
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/30',
    icon: '↗',
  },
  medium: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: '→',
  },
  low: {
    bg: 'bg-green-500/15',
    text: 'text-green-300',
    border: 'border-green-500/30',
    icon: '↘',
  },
  negative: {
    bg: 'bg-red-500/15',
    text: 'text-red-300',
    border: 'border-red-500/30',
    icon: '↓',
  },
  neutral: {
    bg: 'bg-gray-500/15',
    text: 'text-gray-300',
    border: 'border-gray-500/30',
    icon: '—',
  },
  text: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    icon: '',
  },
  unknown: {
    bg: 'bg-gray-500/15',
    text: 'text-gray-300',
    border: 'border-gray-500/30',
    icon: '?',
  },
};

// Enhanced cell renderer with color coding and badges
const EnhancedCellRenderer = ({ value, column, row, colorCoded = true, showBadges = true }) => {
  const dataType = useMemo(() => getDataValueType(value), [value]);
  const colorScheme = dataTypeColorSchemes[dataType] || dataTypeColorSchemes.text;
  
  // Custom render function takes precedence
  if (column.render) {
    return column.render(value, row);
  }
  
  // Format different data types
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (column.key === 'speed') {
        return `${val} km/h`;
      }
      if (column.key === 'latitude' || column.key === 'longitude') {
        return val.toFixed(4);
      }
      return val.toLocaleString();
    }
    return val;
  };
  
  const formattedValue = formatValue(value);
  
  if (!colorCoded && !showBadges) {
    return <span className="font-medium">{formattedValue}</span>;
  }
  
  return (
    <div className="flex items-center gap-2">
      {showBadges && colorScheme.icon && (
        <span className="text-xs opacity-70">{colorScheme.icon}</span>
      )}
      <span
        className={cn(
          'px-2.5 py-1.5 rounded-lg border font-medium text-xs',
          'backdrop-blur-sm transition-all duration-200',
          'hover:scale-105 hover:shadow-lg',
          colorCoded ? [
            colorScheme.bg,
            colorScheme.text,
            colorScheme.border,
          ] : [
            'bg-slate-500/15',
            'text-slate-300',
            'border-slate-500/30',
          ]
        )}
      >
        {formattedValue}
      </span>
    </div>
  );
};

// Status badge component for different data types
const StatusBadge = ({ type, value, size = 'sm' }) => {
  const colorScheme = dataTypeColorSchemes[type] || dataTypeColorSchemes.text;
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        'backdrop-blur-sm transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        sizeClasses[size],
        colorScheme.bg,
        colorScheme.text,
        colorScheme.border,
      )}
    >
      {colorScheme.icon && <span className="text-xs">{colorScheme.icon}</span>}
      {value}
    </span>
  );
};

// Loading skeleton with enhanced styling
const EnhancedLoadingSkeleton = ({ rows = 5, columns = 4, size = 'md', colorScheme = 'violet' }) => {
  const skeletonRows = Array.from({ length: rows }, (_, i) => i);
  const skeletonCells = Array.from({ length: columns }, (_, i) => i);
  
  return (
    <>
      {skeletonRows.map((row) => (
        <tr key={row} className="animate-pulse">
          {skeletonCells.map((cell) => (
            <td key={cell} className={cn(enhancedCellVariants({ size }))}>
              <div className={cn(
                'h-6 rounded-lg bg-gradient-to-r opacity-30',
                colorScheme === 'violet' && 'from-violet-500/20 to-purple-500/20',
                colorScheme === 'blue' && 'from-blue-500/20 to-cyan-500/20',
                colorScheme === 'teal' && 'from-teal-500/20 to-green-500/20',
                colorScheme === 'green' && 'from-green-500/20 to-lime-500/20',
                colorScheme === 'amber' && 'from-amber-500/20 to-orange-500/20',
                colorScheme === 'red' && 'from-red-500/20 to-pink-500/20',
                colorScheme === 'purple' && 'from-purple-500/20 to-violet-500/20',
              )} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Enhanced table header cell component
const EnhancedTableHeaderCell = forwardRef(
  (
    {
      children,
      className,
      sortable = false,
      sortDirection,
      onSort,
      variant = 'enhanced',
      size = 'md',
      colorScheme = 'violet',
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
          enhancedHeaderVariants({ variant, size, colorScheme }),
          sortable && 'cursor-pointer select-none group',
          className
        )}
        onClick={handleSort}
        {...props}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            'bg-gradient-to-r from-white/5 via-white/10 to-white/5'
          )} />
        </div>
        
        <div className="flex items-center justify-between gap-3 relative z-10">
          <span className="font-semibold tracking-wide">{children}</span>
          {sortable && (
            <div className="flex items-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={cn(
                  'transition-all duration-200 opacity-60 group-hover:opacity-100',
                  sortDirection === 'desc' && 'rotate-180',
                  sortDirection && 'opacity-100 text-white'
                )}
              >
                <path
                  d="M7 3L10 6H4L7 3Z"
                  fill="currentColor"
                />
                {!sortDirection && (
                  <path
                    d="M7 11L4 8H10L7 11Z"
                    fill="currentColor"
                    opacity="0.4"
                  />
                )}
              </svg>
            </div>
          )}
        </div>
      </th>
    );
  }
);
EnhancedTableHeaderCell.displayName = 'EnhancedTableHeaderCell';

// Enhanced table cell component
const EnhancedTableCell = forwardRef(
  (
    {
      children,
      className,
      variant = 'enhanced',
      size = 'md',
      value,
      column,
      row,
      colorCoded = true,
      showBadges = true,
      ...props
    },
    ref
  ) => {
    return (
      <td
        ref={ref}
        className={cn(enhancedCellVariants({ variant, size }), className)}
        {...props}
      >
        {value !== undefined && column ? (
          <EnhancedCellRenderer
            value={value}
            column={column}
            row={row}
            colorCoded={colorCoded}
            showBadges={showBadges}
          />
        ) : (
          children
        )}
      </td>
    );
  }
);
EnhancedTableCell.displayName = 'EnhancedTableCell';

// Enhanced table row component
const EnhancedTableRow = forwardRef(
  (
    {
      children,
      className,
      variant = 'enhanced',
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
          enhancedRowVariants({ variant, hoverable, striped }),
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
EnhancedTableRow.displayName = 'EnhancedTableRow';

// Main Enhanced Table component
const EnhancedTable = forwardRef(
  (
    {
      children,
      className,
      variant = 'enhanced',
      size = 'md',
      colorScheme = 'violet',
      hoverable = true,
      striped = true,
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
      colorCoded = true,
      showBadges = true,
      enhanced = true,
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
              <EnhancedTableHeaderCell
                key={column.key || index}
                variant={variant}
                size={size}
                colorScheme={colorScheme}
                sortable={column.sortable}
                sortDirection={sortConfig?.key === column.key ? sortConfig.direction : null}
                onSort={column.sortable ? (direction) => onSort?.(column.key, direction) : undefined}
              >
                {column.header || column.title}
              </EnhancedTableHeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <EnhancedLoadingSkeleton 
              rows={loadingRows} 
              columns={columns.length} 
              size={size}
              colorScheme={colorScheme}
            />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  enhancedCellVariants({ variant, size }),
                  'text-center text-text-tertiary py-12'
                )}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center backdrop-blur-sm border border-gray-500/30">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-gray-300">{emptyMessage}</div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <EnhancedTableRow
                key={row.id || rowIndex}
                variant={variant}
                hoverable={hoverable || !!onRowClick}
                striped={striped}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <EnhancedTableCell
                    key={column.key || colIndex}
                    variant={variant}
                    size={size}
                    value={row[column.key]}
                    column={column}
                    row={row}
                    colorCoded={colorCoded}
                    showBadges={showBadges}
                  />
                ))}
              </EnhancedTableRow>
            ))
          )}
        </tbody>
      </>
    );

    return (
      <div className={cn(
        'relative overflow-hidden',
        responsive && 'overflow-x-auto'
      )}>
        {/* Enhanced background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute inset-0 opacity-30',
            colorScheme === 'violet' && 'bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10',
            colorScheme === 'blue' && 'bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10',
            colorScheme === 'teal' && 'bg-gradient-to-br from-teal-500/10 via-transparent to-green-500/10',
            colorScheme === 'green' && 'bg-gradient-to-br from-green-500/10 via-transparent to-lime-500/10',
            colorScheme === 'amber' && 'bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10',
            colorScheme === 'red' && 'bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/10',
            colorScheme === 'purple' && 'bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/10',
          )} />
        </div>
        
        <table
          ref={ref}
          className={cn(
            enhancedTableVariants({ variant, size, colorScheme }),
            'relative z-10',
            className
          )}
          {...props}
        >
          {shouldAutoRender ? renderAutoTable() : children}
        </table>
      </div>
    );
  }
);
EnhancedTable.displayName = 'EnhancedTable';

// Enhanced table container for responsive behavior
const EnhancedTableContainer = forwardRef(
  ({ 
    children, 
    className, 
    variant = 'enhanced',
    colorScheme = 'violet',
    padding = 'lg',
    ...props 
  }, ref) => {
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-surface-primary/90 via-surface-secondary/80 to-surface-primary/90',
          'backdrop-blur-2xl border border-white/20',
          'shadow-2xl shadow-black/30',
          colorScheme === 'violet' && 'border-violet-400/40 shadow-violet-500/20',
          colorScheme === 'blue' && 'border-blue-400/40 shadow-blue-500/20',
          colorScheme === 'teal' && 'border-teal-400/40 shadow-teal-500/20',
          colorScheme === 'green' && 'border-green-400/40 shadow-green-500/20',
          colorScheme === 'amber' && 'border-amber-400/40 shadow-amber-500/20',
          colorScheme === 'red' && 'border-red-400/40 shadow-red-500/20',
          colorScheme === 'purple' && 'border-purple-400/40 shadow-purple-500/20',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {/* Enhanced background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute inset-0 opacity-20',
            colorScheme === 'violet' && 'bg-gradient-to-br from-violet-500/15 via-transparent to-purple-500/15',
            colorScheme === 'blue' && 'bg-gradient-to-br from-blue-500/15 via-transparent to-cyan-500/15',
            colorScheme === 'teal' && 'bg-gradient-to-br from-teal-500/15 via-transparent to-green-500/15',
            colorScheme === 'green' && 'bg-gradient-to-br from-green-500/15 via-transparent to-lime-500/15',
            colorScheme === 'amber' && 'bg-gradient-to-br from-amber-500/15 via-transparent to-orange-500/15',
            colorScheme === 'red' && 'bg-gradient-to-br from-red-500/15 via-transparent to-pink-500/15',
            colorScheme === 'purple' && 'bg-gradient-to-br from-purple-500/15 via-transparent to-violet-500/15',
          )} />
          
          {/* Floating glow effects */}
          <div className={cn(
            'absolute top-6 left-6 w-32 h-32 rounded-full blur-3xl opacity-30',
            colorScheme === 'violet' && 'bg-violet-400/20',
            colorScheme === 'blue' && 'bg-blue-400/20',
            colorScheme === 'teal' && 'bg-teal-400/20',
            colorScheme === 'green' && 'bg-green-400/20',
            colorScheme === 'amber' && 'bg-amber-400/20',
            colorScheme === 'red' && 'bg-red-400/20',
            colorScheme === 'purple' && 'bg-purple-400/20',
          )} />
          <div className={cn(
            'absolute bottom-6 right-6 w-40 h-40 rounded-full blur-3xl opacity-20',
            colorScheme === 'violet' && 'bg-purple-400/15',
            colorScheme === 'blue' && 'bg-cyan-400/15',
            colorScheme === 'teal' && 'bg-green-400/15',
            colorScheme === 'green' && 'bg-lime-400/15',
            colorScheme === 'amber' && 'bg-orange-400/15',
            colorScheme === 'red' && 'bg-pink-400/15',
            colorScheme === 'purple' && 'bg-violet-400/15',
          )} />
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);
EnhancedTableContainer.displayName = 'EnhancedTableContainer';

export {
  EnhancedTable,
  EnhancedTableContainer,
  EnhancedTableHeaderCell,
  EnhancedTableCell,
  EnhancedTableRow,
  EnhancedCellRenderer,
  StatusBadge,
  EnhancedLoadingSkeleton,
  getDataValueType,
  dataTypeColorSchemes,
};