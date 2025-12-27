import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

/**
 * Enhanced Input Component
 * 
 * Features:
 * - Proper focus states and validation styling
 * - Support for error and success states
 * - Consistent typography and spacing
 * - Multiple size variants
 * - Icon support
 * - Label and helper text integration
 * - Full accessibility support
 */

// Input variant styles using class-variance-authority
const inputVariants = cva(
  // Base styles - common to all inputs
  [
    'flex w-full rounded-md border transition-all duration-200',
    'bg-surface-primary text-text-primary placeholder:text-text-tertiary',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-border-primary',
          'focus:border-border-accent focus:ring-border-accent/20',
        ],
        error: [
          'border-status-error',
          'focus:border-status-error focus:ring-status-error/20',
          'text-text-primary',
        ],
        success: [
          'border-status-success',
          'focus:border-status-success focus:ring-status-success/20',
          'text-text-primary',
        ],
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Label styles
const labelVariants = cva(
  'block font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs mb-1.5',
        md: 'text-sm mb-2',
        lg: 'text-base mb-2.5',
      },
      variant: {
        default: 'text-text-secondary',
        error: 'text-status-error',
        success: 'text-status-success',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Helper text styles
const helperTextVariants = cva(
  'leading-none',
  {
    variants: {
      size: {
        sm: 'text-xs mt-1',
        md: 'text-sm mt-1.5',
        lg: 'text-base mt-2',
      },
      variant: {
        default: 'text-text-tertiary',
        error: 'text-status-error',
        success: 'text-status-success',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Input wrapper for icon support
const InputWrapper = forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('relative', className)} {...props}>
    {children}
  </div>
));
InputWrapper.displayName = 'InputWrapper';

// Main Input component
const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      size = 'md',
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    // Determine the actual variant based on error/success states
    const actualVariant = error ? 'error' : success ? 'success' : variant;
    
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine helper text content and variant
    const helperContent = error || success || helperText;
    const helperVariant = error ? 'error' : success ? 'success' : 'default';

    return (
      <div className="space-y-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ size, variant: actualVariant }))}
          >
            {label}
          </label>
        )}
        
        <InputWrapper className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant: actualVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </InputWrapper>
        
        {helperContent && (
          <p className={cn(helperTextVariants({ size, variant: helperVariant }))}>
            {helperContent}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Textarea component with similar styling
const Textarea = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      error,
      success,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    // Determine the actual variant based on error/success states
    const actualVariant = error ? 'error' : success ? 'success' : variant;
    
    // Generate unique ID if not provided
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine helper text content and variant
    const helperContent = error || success || helperText;
    const helperVariant = error ? 'error' : success ? 'success' : 'default';

    return (
      <div className="space-y-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ size, variant: actualVariant }))}
          >
            {label}
          </label>
        )}
        
        <textarea
          id={inputId}
          rows={rows}
          className={cn(
            inputVariants({ variant: actualVariant, size }),
            'min-h-[80px] resize-y',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {helperContent && (
          <p className={cn(helperTextVariants({ size, variant: helperVariant }))}>
            {helperContent}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Select component with similar styling
const Select = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      error,
      success,
      id,
      children,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Determine the actual variant based on error/success states
    const actualVariant = error ? 'error' : success ? 'success' : variant;
    
    // Generate unique ID if not provided
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine helper text content and variant
    const helperContent = error || success || helperText;
    const helperVariant = error ? 'error' : success ? 'success' : 'default';

    return (
      <div className="space-y-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ size, variant: actualVariant }))}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            id={inputId}
            className={cn(
              inputVariants({ variant: actualVariant, size }),
              'pr-8 appearance-none cursor-pointer',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        {helperContent && (
          <p className={cn(helperTextVariants({ size, variant: helperVariant }))}>
            {helperContent}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Input, Textarea, Select, InputWrapper };