import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { spectrumColors, gradients } from '../tokens/colors.js';
import { responsiveTailwindClasses } from '../utils/responsiveColors.js';
import { useAccessibility, useMotionAccessibility, useFocusManagement } from '../hooks/useAccessibility.js';
import { accessibleColorUtils } from '../tokens/accessibleColors.js';

/**
 * Enhanced Button Component with Colorful Design System
 * 
 * Features:
 * - Multiple variants: primary, secondary, ghost, danger, success, warning, gradient, colorful
 * - Color scheme variants: violet, blue, teal, green, amber, red, pink, purple
 * - Size variants: xs, sm, md, lg, xl
 * - Loading states with spinner
 * - Icon support with positioning
 * - Gradient backgrounds with hover effects
 * - Glow effects and smooth color transitions
 * - Proper hover, focus, and active states
 * - Full accessibility support
 */

// Button variant styles using class-variance-authority with responsive color behavior
const buttonVariants = cva(
  // Base styles - common to all buttons with responsive enhancements
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none cursor-pointer',
    'border border-transparent',
    'transform-gpu', // Enable GPU acceleration for smooth animations
    // Responsive touch targets - larger on mobile
    'min-h-[44px] sm:min-h-[40px] md:min-h-[44px]',
    // Responsive text sizing for better readability
    'text-sm sm:text-sm md:text-base',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-violet-600 text-white shadow-sm',
          // Responsive hover effects - more subtle on mobile
          'hover:bg-violet-700 active:bg-violet-800',
          'hover:shadow-md sm:hover:shadow-lg md:hover:shadow-xl',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-violet-500',
        ],
        secondary: [
          'bg-slate-800 text-slate-200 border-slate-700',
          'hover:bg-slate-700 hover:text-white hover:border-slate-600',
          'hover:shadow-sm sm:hover:shadow-md md:hover:shadow-lg',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:bg-slate-600 active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-slate-500',
        ],
        ghost: [
          'text-slate-300 hover:text-white',
          'hover:bg-slate-800/50',
          'hover:scale-[1.01] sm:hover:scale-[1.02]',
          'active:bg-slate-700/50 active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-slate-500',
        ],
        danger: [
          'bg-red-600 text-white shadow-sm',
          'hover:bg-red-700 active:bg-red-800',
          'hover:shadow-md sm:hover:shadow-lg md:hover:shadow-xl',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-red-500',
        ],
        success: [
          'bg-green-600 text-white shadow-sm',
          'hover:bg-green-700 active:bg-green-800',
          'hover:shadow-md sm:hover:shadow-lg md:hover:shadow-xl',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-green-500',
        ],
        warning: [
          'bg-amber-600 text-white shadow-sm',
          'hover:bg-amber-700 active:bg-amber-800',
          'hover:shadow-md sm:hover:shadow-lg md:hover:shadow-xl',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-amber-500',
        ],
        gradient: [
          'text-white shadow-lg',
          // Responsive gradients - simpler on mobile
          'bg-gradient-to-r',
          'hover:shadow-lg sm:hover:shadow-xl md:hover:shadow-2xl',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-violet-500',
        ],
        colorful: [
          'text-white shadow-lg border-2',
          'hover:shadow-lg sm:hover:shadow-xl md:hover:shadow-2xl',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
          'focus:ring-2',
        ],
        outline: [
          'bg-transparent border-2 shadow-sm',
          'hover:shadow-sm sm:hover:shadow-md md:hover:shadow-lg',
          'hover:scale-[1.01] sm:hover:scale-[1.02] md:hover:scale-[1.03]',
          'active:scale-[0.98] sm:active:scale-[0.99]',
        ],
      },
      colorScheme: {
        violet: {},
        blue: {},
        teal: {},
        green: {},
        amber: {},
        red: {},
        pink: {},
        purple: {},
        cyan: {},
        lime: {},
        yellow: {},
        orange: {},
      },
      size: {
        // Responsive sizing - larger touch targets on mobile
        xs: 'h-8 px-2.5 text-xs sm:h-7 sm:px-2 sm:text-xs',
        sm: 'h-10 px-3 text-sm sm:h-8 sm:px-2.5 sm:text-xs',
        md: 'h-12 px-4 text-base sm:h-10 sm:px-3 sm:text-sm',
        lg: 'h-14 px-6 text-lg sm:h-12 sm:px-4 sm:text-base',
        xl: 'h-16 px-8 text-xl sm:h-14 sm:px-6 sm:text-lg',
      },
      glow: {
        // Glow effects disabled on mobile for performance
        true: 'sm:hover:drop-shadow-glow md:hover:drop-shadow-glow',
        false: '',
      },
      responsive: {
        true: '', // Enable responsive behavior
        false: '',
      },
    },
    compoundVariants: [
      // Gradient variant color schemes with responsive gradients
      {
        variant: 'gradient',
        colorScheme: 'violet',
        class: [
          'from-violet-600 to-purple-600',
          'sm:from-violet-600 sm:via-violet-500 sm:to-purple-600',
          'hover:from-violet-700 hover:to-purple-700',
          'sm:hover:from-violet-700 sm:hover:via-violet-600 sm:hover:to-purple-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'blue',
        class: [
          'from-blue-600 to-cyan-600',
          'sm:from-blue-600 sm:via-blue-500 sm:to-cyan-600',
          'hover:from-blue-700 hover:to-cyan-700',
          'sm:hover:from-blue-700 sm:hover:via-blue-600 sm:hover:to-cyan-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'teal',
        class: [
          'from-teal-600 to-green-600',
          'sm:from-teal-600 sm:via-teal-500 sm:to-green-600',
          'hover:from-teal-700 hover:to-green-700',
          'sm:hover:from-teal-700 sm:hover:via-teal-600 sm:hover:to-green-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'green',
        class: [
          'from-green-600 to-lime-600',
          'sm:from-green-600 sm:via-green-500 sm:to-lime-600',
          'hover:from-green-700 hover:to-lime-700',
          'sm:hover:from-green-700 sm:hover:via-green-600 sm:hover:to-lime-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'amber',
        class: [
          'from-amber-600 to-orange-600',
          'sm:from-amber-600 sm:via-amber-500 sm:to-orange-600',
          'hover:from-amber-700 hover:to-orange-700',
          'sm:hover:from-amber-700 sm:hover:via-amber-600 sm:hover:to-orange-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'red',
        class: [
          'from-red-600 to-pink-600',
          'sm:from-red-600 sm:via-red-500 sm:to-pink-600',
          'hover:from-red-700 hover:to-pink-700',
          'sm:hover:from-red-700 sm:hover:via-red-600 sm:hover:to-pink-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'pink',
        class: [
          'from-pink-600 to-purple-600',
          'sm:from-pink-600 sm:via-pink-500 sm:to-purple-600',
          'hover:from-pink-700 hover:to-purple-700',
          'sm:hover:from-pink-700 sm:hover:via-pink-600 sm:hover:to-purple-700',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'purple',
        class: [
          'from-purple-600 to-violet-600',
          'sm:from-purple-600 sm:via-purple-500 sm:to-violet-600',
          'hover:from-purple-700 hover:to-violet-700',
          'sm:hover:from-purple-700 sm:hover:via-purple-600 sm:hover:to-violet-700',
        ].join(' '),
      },
      
      // Colorful variant color schemes with responsive behavior
      {
        variant: 'colorful',
        colorScheme: 'violet',
        class: 'bg-violet-600 border-violet-400 hover:bg-violet-700 hover:border-violet-300 focus:ring-violet-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'blue',
        class: 'bg-blue-600 border-blue-400 hover:bg-blue-700 hover:border-blue-300 focus:ring-blue-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'teal',
        class: 'bg-teal-600 border-teal-400 hover:bg-teal-700 hover:border-teal-300 focus:ring-teal-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'green',
        class: 'bg-green-600 border-green-400 hover:bg-green-700 hover:border-green-300 focus:ring-green-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'amber',
        class: 'bg-amber-600 border-amber-400 hover:bg-amber-700 hover:border-amber-300 focus:ring-amber-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'red',
        class: 'bg-red-600 border-red-400 hover:bg-red-700 hover:border-red-300 focus:ring-red-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'pink',
        class: 'bg-pink-600 border-pink-400 hover:bg-pink-700 hover:border-pink-300 focus:ring-pink-500',
      },
      {
        variant: 'colorful',
        colorScheme: 'purple',
        class: 'bg-purple-600 border-purple-400 hover:bg-purple-700 hover:border-purple-300 focus:ring-purple-500',
      },
      
      // Outline variant color schemes with responsive behavior
      {
        variant: 'outline',
        colorScheme: 'violet',
        class: 'border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white focus:ring-violet-500',
      },
      {
        variant: 'outline',
        colorScheme: 'blue',
        class: 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
      },
      {
        variant: 'outline',
        colorScheme: 'teal',
        class: 'border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white focus:ring-teal-500',
      },
      {
        variant: 'outline',
        colorScheme: 'green',
        class: 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white focus:ring-green-500',
      },
      {
        variant: 'outline',
        colorScheme: 'amber',
        class: 'border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white focus:ring-amber-500',
      },
      {
        variant: 'outline',
        colorScheme: 'red',
        class: 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white focus:ring-red-500',
      },
      {
        variant: 'outline',
        colorScheme: 'pink',
        class: 'border-pink-600 text-pink-400 hover:bg-pink-600 hover:text-white focus:ring-pink-500',
      },
      {
        variant: 'outline',
        colorScheme: 'purple',
        class: 'border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white focus:ring-purple-500',
      },
      
      // Primary variant with color schemes and responsive behavior
      {
        variant: 'primary',
        colorScheme: 'blue',
        class: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
      },
      {
        variant: 'primary',
        colorScheme: 'teal',
        class: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:ring-teal-500',
      },
      {
        variant: 'primary',
        colorScheme: 'green',
        class: 'bg-green-600 hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
      },
      {
        variant: 'primary',
        colorScheme: 'amber',
        class: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 focus:ring-amber-500',
      },
      {
        variant: 'primary',
        colorScheme: 'red',
        class: 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
      },
      {
        variant: 'primary',
        colorScheme: 'pink',
        class: 'bg-pink-600 hover:bg-pink-700 active:bg-pink-800 focus:ring-pink-500',
      },
      {
        variant: 'primary',
        colorScheme: 'purple',
        class: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus:ring-purple-500',
      },

      // Responsive behavior enhancements
      {
        responsive: true,
        class: [
          // Touch feedback on mobile
          'active:bg-opacity-80',
          // Better contrast on mobile
          'sm:text-opacity-90 md:text-opacity-100',
          // Responsive border radius
          'rounded-md sm:rounded-lg md:rounded-xl',
        ].join(' '),
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      colorScheme: 'violet',
      glow: false,
      responsive: true, // Enable responsive behavior by default
    },
  }
);

// Loading spinner component
const Spinner = ({ size = 'md' }) => {
  const spinnerSize = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
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
  colorScheme = 'violet',
  size = 'md',
  glow = false,
  loading = false,
  disabled = false,
  responsive = true, // Enable responsive behavior by default
  icon,
  iconPosition = 'left',
  children,
  onClick,
  type = 'button',
  // Accessibility props
  ariaLabel,
  ariaDescribedBy,
  loadingText = 'Loading...',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;
  
  // Use accessibility hooks
  const { preferences, utils } = useAccessibility();
  const { getTransitionClasses } = useMotionAccessibility();
  const { getFocusClasses } = useFocusManagement();

  // Get accessible color combination for the button
  const accessibleColors = accessibleColorUtils.getAccessibleCombination('interactive', variant, 
    preferences.highContrast ? 'highContrast' : 
    preferences.colorBlindMode !== 'none' ? 'colorBlind' : 'normal'
  );

  // Apply reduced motion preferences
  const transitionClasses = getTransitionClasses('transition-all duration-300');
  
  // Get focus ring classes with proper contrast
  const focusClasses = getFocusClasses(colorScheme);

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Generate accessibility attributes
  const accessibilityAttributes = {
    'aria-label': ariaLabel || (loading ? loadingText : undefined),
    'aria-describedby': ariaDescribedBy,
    'aria-busy': loading,
    'aria-disabled': isDisabled,
  };

  // Apply high contrast styles if needed
  const highContrastStyles = preferences.highContrast ? {
    backgroundColor: accessibleColors.background,
    color: accessibleColors.text,
    border: `2px solid ${accessibleColors.text}`,
  } : {};

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        buttonVariants({ variant, colorScheme, size, glow, responsive }),
        // Override transition classes with accessibility-aware ones
        transitionClasses,
        // Add focus classes that respect high contrast mode
        focusClasses,
        // Add minimum touch target size for accessibility
        'min-h-[44px] min-w-[44px]',
        className
      )}
      style={highContrastStyles}
      disabled={isDisabled}
      onClick={handleClick}
      {...accessibilityAttributes}
      {...props}
    >
      {/* Loading spinner or left icon */}
      {loading ? (
        <>
          <Spinner size={size} />
          <span className="sr-only">{loadingText}</span>
        </>
      ) : (
        icon && iconPosition === 'left' && (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
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
        <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };