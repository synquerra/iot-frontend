import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

/**
 * Enhanced Button Component
 * 
 * Features:
 * - Multiple variants: primary, secondary, ghost, danger
 * - Size variants: sm, md, lg
 * - Loading states with spinner
 * - Icon support with positioning
 * - Proper hover, focus, and active states
 * - Full accessibility support
 */

// Button variant styles using class-variance-authority
const buttonVariants = cva(
  // Base styles - common to all buttons
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none cursor-pointer',
    'border border-transparent',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-violet-600 text-white shadow-sm',
          'hover:bg-violet-700 hover:shadow-md',
          'active:bg-violet-800 active:scale-[0.98]',
          'focus:ring-violet-500',
        ],
        secondary: [
          'bg-slate-800 text-slate-200 border-slate-700',
          'hover:bg-slate-700 hover:text-white hover:border-slate-600',
          'active:bg-slate-600 active:scale-[0.98]',
          'focus:ring-slate-500',
        ],
        ghost: [
          'text-slate-300 hover:text-white',
          'hover:bg-slate-800/50',
          'active:bg-slate-700/50 active:scale-[0.98]',
          'focus:ring-slate-500',
        ],
        danger: [
          'bg-red-600 text-white shadow-sm',
          'hover:bg-red-700 hover:shadow-md',
          'active:bg-red-800 active:scale-[0.98]',
          'focus:ring-red-500',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Loading spinner component
const Spinner = ({ size = 'sm' }) => {
  const spinnerSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={cn('animate-spin', spinnerSize[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {/* Loading spinner or left icon */}
      {loading ? (
        <Spinner size={size} />
      ) : (
        icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )
      )}
      
      {/* Button text */}
      {children && (
        <span className={loading ? 'opacity-70' : ''}>
          {children}
        </span>
      )}
      
      {/* Right icon (only if not loading) */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };