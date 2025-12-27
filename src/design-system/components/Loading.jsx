import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

/**
 * Enhanced Loading Components
 * 
 * Features:
 * - Multiple loading types: spinner, skeleton, pulse, dots
 * - Size variants: xs, sm, md, lg, xl
 * - Color variants for different contexts
 * - Smooth animations and transitions
 * - Accessibility support with proper ARIA labels
 * - Customizable text and positioning
 */

// Loading container variants
const loadingContainerVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        inline: 'inline-flex',
        block: 'flex',
        overlay: 'absolute inset-0 bg-surface-primary/80 backdrop-blur-sm z-10',
        fullscreen: 'fixed inset-0 bg-surface-primary/90 backdrop-blur-sm z-50',
      },
      size: {
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-3',
        lg: 'gap-4',
        xl: 'gap-6',
      },
    },
    defaultVariants: {
      variant: 'inline',
      size: 'md',
    },
  }
);

// Spinner component with enhanced animations
const Spinner = forwardRef(({
  size = 'md',
  color = 'primary',
  thickness = 'normal',
  className,
  ...props
}, ref) => {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const spinnerColors = {
    primary: 'text-violet-500',
    secondary: 'text-slate-400',
    accent: 'text-teal-400',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    white: 'text-white',
  };

  const strokeWidths = {
    thin: '2',
    normal: '3',
    thick: '4',
  };

  return (
    <svg
      ref={ref}
      className={cn(
        'animate-spin',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidths[thickness]}
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});
Spinner.displayName = 'Spinner';

// Dots loading animation
const Dots = forwardRef(({
  size = 'md',
  color = 'primary',
  className,
  ...props
}, ref) => {
  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const dotColors = {
    primary: 'bg-violet-500',
    secondary: 'bg-slate-400',
    accent: 'bg-teal-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    white: 'bg-white',
  };

  return (
    <div
      ref={ref}
      className={cn('flex items-center space-x-1', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full animate-pulse',
            dotSizes[size],
            dotColors[color]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
});
Dots.displayName = 'Dots';

// Pulse loading animation
const Pulse = forwardRef(({
  size = 'md',
  color = 'primary',
  className,
  children,
  ...props
}, ref) => {
  const pulseColors = {
    primary: 'bg-violet-500/20',
    secondary: 'bg-slate-400/20',
    accent: 'bg-teal-400/20',
    success: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    error: 'bg-red-500/20',
    white: 'bg-white/20',
  };

  const pulseSizes = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'animate-pulse rounded',
        pulseSizes[size],
        pulseColors[color],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {children}
    </div>
  );
});
Pulse.displayName = 'Pulse';

// Skeleton loading component
const Skeleton = forwardRef(({
  variant = 'rectangular',
  width,
  height,
  className,
  animate = true,
  ...props
}, ref) => {
  const skeletonVariants = cva(
    'bg-surface-tertiary',
    {
      variants: {
        variant: {
          rectangular: 'rounded',
          circular: 'rounded-full',
          text: 'rounded h-4',
          button: 'rounded-md h-10',
          card: 'rounded-lg',
        },
        animate: {
          true: 'animate-pulse',
          false: '',
        },
      },
      defaultVariants: {
        variant: 'rectangular',
        animate: true,
      },
    }
  );

  const style = {
    width: width || (variant === 'circular' ? height : undefined),
    height: height || undefined,
  };

  return (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant, animate }), className)}
      style={style}
      role="status"
      aria-label="Loading content"
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';

// Progress bar component
const ProgressBar = forwardRef(({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = false,
  className,
  ...props
}, ref) => {
  const progressSizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  };

  const progressColors = {
    primary: 'bg-violet-500',
    secondary: 'bg-slate-400',
    accent: 'bg-teal-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div className={cn(
        'w-full bg-surface-tertiary rounded-full overflow-hidden',
        progressSizes[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            progressColors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-text-secondary text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
});
ProgressBar.displayName = 'ProgressBar';

// Main Loading component that combines all variants
const Loading = forwardRef(({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  variant = 'inline',
  text,
  textPosition = 'bottom',
  className,
  children,
  ...props
}, ref) => {
  const renderLoadingIndicator = () => {
    switch (type) {
      case 'spinner':
        return <Spinner size={size} color={color} />;
      case 'dots':
        return <Dots size={size} color={color} />;
      case 'pulse':
        return <Pulse size={size} color={color}>{children}</Pulse>;
      case 'skeleton':
        return <Skeleton {...props} />;
      default:
        return <Spinner size={size} color={color} />;
    }
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const isVertical = textPosition === 'top' || textPosition === 'bottom';
  const containerDirection = isVertical ? 'flex-col' : 'flex-row';
  const textOrder = textPosition === 'top' || textPosition === 'left' ? 'order-first' : 'order-last';

  return (
    <div
      ref={ref}
      className={cn(
        loadingContainerVariants({ variant, size }),
        containerDirection,
        className
      )}
      {...props}
    >
      <div className={text ? (textPosition === 'right' ? 'order-first' : '') : ''}>
        {renderLoadingIndicator()}
      </div>
      {text && (
        <span className={cn(
          'text-text-secondary',
          textSizes[size],
          textOrder
        )}>
          {text}
        </span>
      )}
    </div>
  );
});
Loading.displayName = 'Loading';

// Loading overlay for wrapping content
const LoadingOverlay = forwardRef(({
  loading = false,
  type = 'spinner',
  size = 'lg',
  color = 'primary',
  text = 'Loading...',
  children,
  className,
  ...props
}, ref) => {
  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {children}
      {loading && (
        <Loading
          type={type}
          size={size}
          color={color}
          variant="overlay"
          text={text}
        />
      )}
    </div>
  );
});
LoadingOverlay.displayName = 'LoadingOverlay';

// Export all components
export {
  Loading,
  LoadingOverlay,
  Spinner,
  Dots,
  Pulse,
  Skeleton,
  ProgressBar,
};