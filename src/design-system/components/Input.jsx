import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

/**
 * Enhanced Input Component with Colorful Design
 * 
 * Features:
 * - Colorful focus states and validation feedback
 * - Gradient backgrounds for form elements
 * - Color-coded validation states
 * - Smooth transitions for state changes
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
  // Base styles - common to all inputs with enhanced transitions
  [
    'flex w-full rounded-md border transition-all duration-300 ease-in-out',
    'bg-surface-primary text-text-primary placeholder:text-text-tertiary',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    // Enhanced hover states
    'hover:border-border-secondary hover:shadow-sm',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-border-primary',
          'focus:border-border-accent focus:ring-border-accent/20',
          'focus:shadow-lg focus:shadow-teal-500/10',
        ],
        colorful: [
          'border-violet-400/50 bg-gradient-to-r from-surface-primary to-violet-950/20',
          'focus:border-violet-400 focus:ring-violet-400/30',
          'focus:shadow-lg focus:shadow-violet-500/20',
          'hover:border-violet-400/70 hover:shadow-md hover:shadow-violet-500/10',
        ],
        gradient: [
          'border-transparent bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-teal-500/10',
          'focus:border-violet-400 focus:ring-violet-400/30',
          'focus:shadow-lg focus:shadow-violet-500/20',
          'hover:from-violet-500/15 hover:via-blue-500/15 hover:to-teal-500/15',
        ],
        glass: [
          'border-white/20 bg-white/5 backdrop-blur-sm',
          'focus:border-white/40 focus:ring-white/20',
          'focus:shadow-lg focus:shadow-white/10',
          'hover:border-white/30 hover:bg-white/10',
        ],
        error: [
          'border-status-error bg-gradient-to-r from-surface-primary to-red-950/20',
          'focus:border-status-error focus:ring-status-error/30',
          'focus:shadow-lg focus:shadow-red-500/20',
          'text-text-primary',
        ],
        success: [
          'border-status-success bg-gradient-to-r from-surface-primary to-green-950/20',
          'focus:border-status-success focus:ring-status-success/30',
          'focus:shadow-lg focus:shadow-green-500/20',
          'text-text-primary',
        ],
        warning: [
          'border-status-warning bg-gradient-to-r from-surface-primary to-amber-950/20',
          'focus:border-status-warning focus:ring-status-warning/30',
          'focus:shadow-lg focus:shadow-amber-500/20',
          'text-text-primary',
        ],
        info: [
          'border-status-info bg-gradient-to-r from-surface-primary to-blue-950/20',
          'focus:border-status-info focus:ring-status-info/30',
          'focus:shadow-lg focus:shadow-blue-500/20',
          'text-text-primary',
        ],
      },
      size: {
        sm: 'h-8 px-3 py-1 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
      colorScheme: {
        violet: '',
        blue: '',
        teal: '',
        green: '',
        amber: '',
        red: '',
        pink: '',
        purple: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Label styles with colorful variants
const labelVariants = cva(
  'block font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-200',
  {
    variants: {
      size: {
        sm: 'text-xs mb-1.5',
        md: 'text-sm mb-2',
        lg: 'text-base mb-2.5',
      },
      variant: {
        default: 'text-text-secondary',
        colorful: 'text-violet-300',
        gradient: 'text-transparent bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text',
        glass: 'text-white/90',
        error: 'text-status-error',
        success: 'text-status-success',
        warning: 'text-status-warning',
        info: 'text-status-info',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Helper text styles with colorful variants
const helperTextVariants = cva(
  'leading-none transition-colors duration-200',
  {
    variants: {
      size: {
        sm: 'text-xs mt-1',
        md: 'text-sm mt-1.5',
        lg: 'text-base mt-2',
      },
      variant: {
        default: 'text-text-tertiary',
        colorful: 'text-violet-400/80',
        gradient: 'text-transparent bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text',
        glass: 'text-white/70',
        error: 'text-status-error',
        success: 'text-status-success',
        warning: 'text-status-warning',
        info: 'text-status-info',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Color scheme mapping for dynamic colorful variants
const getColorSchemeClasses = (colorScheme, variant) => {
  if (variant !== 'colorful' || !colorScheme) return '';
  
  const colorMap = {
    violet: {
      border: 'border-violet-400/50 focus:border-violet-400 hover:border-violet-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-violet-950/20',
      ring: 'focus:ring-violet-400/30',
      shadow: 'focus:shadow-violet-500/20 hover:shadow-violet-500/10',
      label: 'text-violet-300',
      helper: 'text-violet-400/80',
    },
    blue: {
      border: 'border-blue-400/50 focus:border-blue-400 hover:border-blue-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-blue-950/20',
      ring: 'focus:ring-blue-400/30',
      shadow: 'focus:shadow-blue-500/20 hover:shadow-blue-500/10',
      label: 'text-blue-300',
      helper: 'text-blue-400/80',
    },
    teal: {
      border: 'border-teal-400/50 focus:border-teal-400 hover:border-teal-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-teal-950/20',
      ring: 'focus:ring-teal-400/30',
      shadow: 'focus:shadow-teal-500/20 hover:shadow-teal-500/10',
      label: 'text-teal-300',
      helper: 'text-teal-400/80',
    },
    green: {
      border: 'border-green-400/50 focus:border-green-400 hover:border-green-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-green-950/20',
      ring: 'focus:ring-green-400/30',
      shadow: 'focus:shadow-green-500/20 hover:shadow-green-500/10',
      label: 'text-green-300',
      helper: 'text-green-400/80',
    },
    amber: {
      border: 'border-amber-400/50 focus:border-amber-400 hover:border-amber-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-amber-950/20',
      ring: 'focus:ring-amber-400/30',
      shadow: 'focus:shadow-amber-500/20 hover:shadow-amber-500/10',
      label: 'text-amber-300',
      helper: 'text-amber-400/80',
    },
    red: {
      border: 'border-red-400/50 focus:border-red-400 hover:border-red-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-red-950/20',
      ring: 'focus:ring-red-400/30',
      shadow: 'focus:shadow-red-500/20 hover:shadow-red-500/10',
      label: 'text-red-300',
      helper: 'text-red-400/80',
    },
    pink: {
      border: 'border-pink-400/50 focus:border-pink-400 hover:border-pink-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-pink-950/20',
      ring: 'focus:ring-pink-400/30',
      shadow: 'focus:shadow-pink-500/20 hover:shadow-pink-500/10',
      label: 'text-pink-300',
      helper: 'text-pink-400/80',
    },
    purple: {
      border: 'border-purple-400/50 focus:border-purple-400 hover:border-purple-400/70',
      bg: 'bg-gradient-to-r from-surface-primary to-purple-950/20',
      ring: 'focus:ring-purple-400/30',
      shadow: 'focus:shadow-purple-500/20 hover:shadow-purple-500/10',
      label: 'text-purple-300',
      helper: 'text-purple-400/80',
    },
  };
  
  return colorMap[colorScheme] || colorMap.violet;
};

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
      colorScheme,
      label,
      helperText,
      error,
      success,
      warning,
      info,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    // Determine the actual variant based on validation states
    const actualVariant = error ? 'error' 
      : success ? 'success' 
      : warning ? 'warning'
      : info ? 'info'
      : variant;
    
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine helper text content and variant
    const helperContent = error || success || warning || info || helperText;
    const helperVariant = error ? 'error' 
      : success ? 'success' 
      : warning ? 'warning'
      : info ? 'info'
      : actualVariant;

    // Get color scheme classes for colorful variant
    const colorSchemeClasses = getColorSchemeClasses(colorScheme, actualVariant);

    return (
      <div className="space-y-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              labelVariants({ size, variant: actualVariant }),
              colorScheme && actualVariant === 'colorful' && colorSchemeClasses.label
            )}
          >
            {label}
          </label>
        )}
        
        <InputWrapper className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors duration-200">
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
              // Apply color scheme classes for colorful variant
              colorScheme && actualVariant === 'colorful' && [
                colorSchemeClasses.border,
                colorSchemeClasses.bg,
                colorSchemeClasses.ring,
                'focus:shadow-lg',
                colorSchemeClasses.shadow,
              ],
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors duration-200">
              {rightIcon}
            </div>
          )}
        </InputWrapper>
        
        {helperContent && (
          <p className={cn(
            helperTextVariants({ size, variant: helperVariant }),
            colorScheme && actualVariant === 'colorful' && colorSchemeClasses.helper
          )}>
            {helperContent}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Textarea component with colorful styling
const Textarea = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      colorScheme,
      label,
      helperText,
      error,
      success,
      warning,
      info,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    // Determine the actual variant based on validation states
    const actualVariant = error ? 'error' 
      : success ? 'success' 
      : warning ? 'warning'
      : info ? 'info'
      : variant;
    
    // Generate unique ID if not provided
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine helper text content and variant
    const helperContent = error || success || warning || info || helperText;
    const helperVariant = error ? 'error' 
      : success ? 'success' 
      : warning ? 'warning'
      : info ? 'info'
      : actualVariant;

    // Get color scheme classes for colorful variant
    const colorSchemeClasses = getColorSchemeClasses(colorScheme, actualVariant);

    return (
      <div className="space-y-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              labelVariants({ size, variant: actualVariant }),
              colorScheme && actualVariant === 'colorful' && colorSchemeClasses.label
            )}
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
            // Apply color scheme classes for colorful variant
            colorScheme && actualVariant === 'colorful' && [
              colorSchemeClasses.border,
              colorSchemeClasses.bg,
              colorSchemeClasses.ring,
              'focus:shadow-lg',
              colorSchemeClasses.shadow,
            ],
            className
          )}
          ref={ref}
          {...props}
        />
        
        {helperContent && (
          <p className={cn(
            helperTextVariants({ size, variant: helperVariant }),
            colorScheme && actualVariant === 'colorful' && colorSchemeClasses.helper
          )}>
            {helperContent}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Select component with colorful styling
const Select = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      colorScheme,
      label,
      helperText,
      error,
      success,
      warning,
      info,
      id,
      children,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Determine the actual variant based on validation states
    const actualVariant = error ? 'error' 
      : success ? 'success' 
      : warning ? 'warning'
      : info ? 'info'
      : variant;
    
    // Generate unique ID if not provided
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine helper text content and variant
    const helperContent = error || success || warning || info || helperText;
    const helperVariant = error ? 'error' 
      : success ? 'success' 
      : warning ? 'warning'
      : info ? 'info'
      : actualVariant;

    // Get color scheme classes for colorful variant
    const colorSchemeClasses = getColorSchemeClasses(colorScheme, actualVariant);

    return (
      <div className="space-y-0">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              labelVariants({ size, variant: actualVariant }),
              colorScheme && actualVariant === 'colorful' && colorSchemeClasses.label
            )}
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
              // Apply color scheme classes for colorful variant
              colorScheme && actualVariant === 'colorful' && [
                colorSchemeClasses.border,
                colorSchemeClasses.bg,
                colorSchemeClasses.ring,
                'focus:shadow-lg',
                colorSchemeClasses.shadow,
              ],
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
          
          {/* Custom dropdown arrow with colorful styling */}
          <div className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200",
            colorScheme && actualVariant === 'colorful' 
              ? colorSchemeClasses.helper.replace('text-', '').split('/')[0] 
              : "text-text-tertiary"
          )}>
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
          <p className={cn(
            helperTextVariants({ size, variant: helperVariant }),
            colorScheme && actualVariant === 'colorful' && colorSchemeClasses.helper
          )}>
            {helperContent}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Input, Textarea, Select, InputWrapper };