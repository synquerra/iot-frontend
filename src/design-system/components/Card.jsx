import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { responsiveTailwindClasses } from '../utils/responsiveColors.js';

/**
 * Enhanced Card Component
 * 
 * Features:
 * - Header, content, and footer sections with proper composition
 * - Variant support: default, elevated, outlined, gradient, glass, colorful
 * - Color scheme support for all spectrum colors
 * - Glassmorphism effects with backdrop blur
 * - Colorful accent borders and highlights
 * - Enhanced shadows, rounded corners, and hover effects
 * - Glow effects and smooth color transitions
 * - Consistent spacing and visual hierarchy
 * - Proper semantic structure
 * - Flexible padding options
 * - Interactive hover states
 */

// Card variant styles using class-variance-authority with responsive color behavior
const cardVariants = cva(
  // Base styles - common to all cards with responsive enhancements
  [
    'rounded-xl transition-all duration-200',
    'overflow-hidden', // Ensures content doesn't overflow rounded corners
    // Responsive touch targets and spacing
    'min-h-[44px] sm:min-h-[40px] md:min-h-[44px]', // Minimum touch target heights
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface-primary border border-border-primary',
          // Responsive shadows - lighter on mobile, stronger on desktop
          'shadow-sm sm:shadow-md md:shadow-lg',
        ],
        elevated: [
          'bg-surface-secondary border border-border-secondary',
          // Enhanced responsive shadows for elevation
          'shadow-md sm:shadow-lg md:shadow-xl',
        ],
        outlined: [
          'bg-transparent border-2 border-border-accent',
          'shadow-none sm:shadow-sm', // Subtle shadow on larger screens
        ],
        gradient: [
          // Simplified gradients on mobile, full complexity on desktop
          'border border-border-primary/50',
          'shadow-lg shadow-violet-500/20',
          'backdrop-blur-sm',
          // Responsive gradient backgrounds
          'bg-gradient-to-r from-violet-600 to-purple-600',
          'sm:bg-gradient-to-br sm:from-violet-600 sm:via-violet-500 sm:to-purple-600',
          'md:bg-gradient-primary', // Full gradient on desktop
        ],
        glass: [
          'bg-surface-primary/80 border border-border-primary/50',
          // Responsive backdrop blur - minimal on mobile, full on desktop
          'backdrop-blur-sm sm:backdrop-blur-md md:backdrop-blur-lg',
          'shadow-lg sm:shadow-xl md:shadow-2xl',
          'bg-gradient-to-br from-surface-secondary/60 to-surface-primary/40',
        ],
        colorful: [
          'border-2',
          // Responsive shadows with color-specific glow
          'shadow-md sm:shadow-lg md:shadow-xl',
          'bg-gradient-to-br from-surface-secondary to-surface-primary',
        ],
      },
      colorScheme: {
        violet: '',
        blue: '',
        cyan: '',
        teal: '',
        green: '',
        lime: '',
        yellow: '',
        amber: '',
        orange: '',
        red: '',
        pink: '',
        purple: '',
      },
      padding: {
        // Responsive padding - more generous on larger screens
        sm: 'p-3 sm:p-4 md:p-4',     // 12px -> 16px -> 16px
        md: 'p-4 sm:p-5 md:p-6',     // 16px -> 20px -> 24px
        lg: 'p-6 sm:p-7 md:p-8',     // 24px -> 28px -> 32px
      },
      hover: {
        // Responsive hover effects - more subtle on mobile
        true: 'hover:shadow-md sm:hover:shadow-lg md:hover:shadow-xl hover:scale-[1.005] sm:hover:scale-[1.01] md:hover:scale-[1.02] cursor-pointer',
        false: '',
      },
      glowEffect: {
        true: '',
        false: '',
      },
      borderAccent: {
        true: '',
        false: '',
      },
      responsive: {
        true: '', // Enable responsive color behavior
        false: '',
      },
    },
    compoundVariants: [
      // Gradient variant with color schemes - responsive gradients
      {
        variant: 'gradient',
        colorScheme: 'violet',
        class: [
          'bg-gradient-to-r from-violet-600 to-purple-600',
          'sm:bg-gradient-to-br sm:from-violet-600 sm:via-violet-500 sm:to-purple-600',
          'md:bg-gradient-primary',
          'shadow-violet-500/20 sm:shadow-violet-500/25 md:shadow-violet-500/30',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'blue',
        class: [
          'bg-gradient-to-r from-blue-600 to-cyan-600',
          'sm:bg-gradient-to-br sm:from-blue-600 sm:via-blue-500 sm:to-cyan-600',
          'md:bg-gradient-info',
          'shadow-blue-500/20 sm:shadow-blue-500/25 md:shadow-blue-500/30',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'teal',
        class: [
          'bg-gradient-to-r from-teal-600 to-green-600',
          'sm:bg-gradient-to-br sm:from-teal-600 sm:via-teal-500 sm:to-green-600',
          'md:bg-gradient-forest',
          'shadow-teal-500/20 sm:shadow-teal-500/25 md:shadow-teal-500/30',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'green',
        class: [
          'bg-gradient-to-r from-green-600 to-lime-600',
          'sm:bg-gradient-to-br sm:from-green-600 sm:via-green-500 sm:to-lime-600',
          'md:bg-gradient-success',
          'shadow-green-500/20 sm:shadow-green-500/25 md:shadow-green-500/30',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'amber',
        class: [
          'bg-gradient-to-r from-amber-600 to-orange-600',
          'sm:bg-gradient-to-br sm:from-amber-600 sm:via-amber-500 sm:to-orange-600',
          'md:bg-gradient-warning',
          'shadow-amber-500/20 sm:shadow-amber-500/25 md:shadow-amber-500/30',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'red',
        class: [
          'bg-gradient-to-r from-red-600 to-pink-600',
          'sm:bg-gradient-to-br sm:from-red-600 sm:via-red-500 sm:to-pink-600',
          'md:bg-gradient-error',
          'shadow-red-500/20 sm:shadow-red-500/25 md:shadow-red-500/30',
        ].join(' '),
      },
      {
        variant: 'gradient',
        colorScheme: 'pink',
        class: [
          'bg-gradient-to-r from-pink-600 to-purple-600',
          'sm:bg-gradient-to-br sm:from-pink-600 sm:via-pink-500 sm:to-purple-600',
          'md:bg-gradient-sunset',
          'shadow-pink-500/20 sm:shadow-pink-500/25 md:shadow-pink-500/30',
        ].join(' '),
      },
      
      // Colorful variant with responsive accent borders
      {
        variant: 'colorful',
        colorScheme: 'violet',
        class: 'border-violet-400 shadow-violet-500/20 sm:shadow-violet-500/25 md:shadow-violet-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'blue',
        class: 'border-blue-400 shadow-blue-500/20 sm:shadow-blue-500/25 md:shadow-blue-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'cyan',
        class: 'border-cyan-400 shadow-cyan-500/20 sm:shadow-cyan-500/25 md:shadow-cyan-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'teal',
        class: 'border-teal-400 shadow-teal-500/20 sm:shadow-teal-500/25 md:shadow-teal-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'green',
        class: 'border-green-400 shadow-green-500/20 sm:shadow-green-500/25 md:shadow-green-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'lime',
        class: 'border-lime-400 shadow-lime-500/20 sm:shadow-lime-500/25 md:shadow-lime-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'yellow',
        class: 'border-yellow-400 shadow-yellow-500/20 sm:shadow-yellow-500/25 md:shadow-yellow-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'amber',
        class: 'border-amber-400 shadow-amber-500/20 sm:shadow-amber-500/25 md:shadow-amber-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'orange',
        class: 'border-orange-400 shadow-orange-500/20 sm:shadow-orange-500/25 md:shadow-orange-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'red',
        class: 'border-red-400 shadow-red-500/20 sm:shadow-red-500/25 md:shadow-red-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'pink',
        class: 'border-pink-400 shadow-pink-500/20 sm:shadow-pink-500/25 md:shadow-pink-500/30',
      },
      {
        variant: 'colorful',
        colorScheme: 'purple',
        class: 'border-purple-400 shadow-purple-500/20 sm:shadow-purple-500/25 md:shadow-purple-500/30',
      },
      
      // Border accent effects with responsive behavior
      {
        borderAccent: true,
        colorScheme: 'violet',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-violet-400',
      },
      {
        borderAccent: true,
        colorScheme: 'blue',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-blue-400',
      },
      {
        borderAccent: true,
        colorScheme: 'teal',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-teal-400',
      },
      {
        borderAccent: true,
        colorScheme: 'green',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-green-400',
      },
      {
        borderAccent: true,
        colorScheme: 'amber',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-amber-400',
      },
      {
        borderAccent: true,
        colorScheme: 'red',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-red-400',
      },
      {
        borderAccent: true,
        colorScheme: 'pink',
        class: 'border-l-2 sm:border-l-3 md:border-l-4 border-l-pink-400',
      },
      
      // Responsive glow effects - disabled on mobile, enabled on larger screens
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'violet',
        class: 'sm:hover:shadow-violet-500/30 md:hover:shadow-violet-500/40',
      },
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'blue',
        class: 'sm:hover:shadow-blue-500/30 md:hover:shadow-blue-500/40',
      },
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'teal',
        class: 'sm:hover:shadow-teal-500/30 md:hover:shadow-teal-500/40',
      },
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'green',
        class: 'sm:hover:shadow-green-500/30 md:hover:shadow-green-500/40',
      },
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'amber',
        class: 'sm:hover:shadow-amber-500/30 md:hover:shadow-amber-500/40',
      },
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'red',
        class: 'sm:hover:shadow-red-500/30 md:hover:shadow-red-500/40',
      },
      {
        glowEffect: true,
        hover: true,
        colorScheme: 'pink',
        class: 'sm:hover:shadow-pink-500/30 md:hover:shadow-pink-500/40',
      },
      
      // Enhanced responsive hover effects for glass variant
      {
        variant: 'glass',
        hover: true,
        class: 'hover:bg-surface-primary/85 sm:hover:bg-surface-primary/90 md:hover:bg-surface-primary/95 hover:backdrop-blur-md sm:hover:backdrop-blur-lg md:hover:backdrop-blur-xl',
      },
      
      // Enhanced responsive hover effects for gradient variant
      {
        variant: 'gradient',
        hover: true,
        class: 'hover:shadow-lg sm:hover:shadow-xl md:hover:shadow-2xl hover:scale-[1.005] sm:hover:scale-[1.01] md:hover:scale-[1.02]',
      },
      
      // Enhanced responsive hover effects for colorful variant
      {
        variant: 'colorful',
        hover: true,
        class: 'hover:shadow-lg sm:hover:shadow-xl md:hover:shadow-2xl hover:scale-[1.005] sm:hover:scale-[1.01] md:hover:scale-[1.02] hover:border-opacity-80',
      },

      // Responsive behavior enhancements
      {
        responsive: true,
        class: [
          // Touch feedback on mobile
          'active:bg-surface-secondary/50 sm:active:bg-surface-secondary/30',
          // Improved contrast on mobile
          'text-text-primary sm:text-text-primary md:text-text-secondary',
          // Responsive border radius
          'rounded-lg sm:rounded-xl md:rounded-2xl',
        ].join(' '),
      },
    ],
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
      glowEffect: false,
      borderAccent: false,
      responsive: true, // Enable responsive behavior by default
    },
  }
);

// Card Header Component
const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 pb-4 border-b border-border-primary/50',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

// Card Title Component
const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-text-primary',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

// Card Description Component
const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

// Card Actions Component (for header actions)
const CardActions = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center space-x-2 ml-auto', className)}
    {...props}
  >
    {children}
  </div>
));
CardActions.displayName = 'CardActions';

// Card Content Component
const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('py-4', className)}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

// Card Footer Component
const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center pt-4 border-t border-border-primary/50',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

// Main Card Component with responsive color behavior
const Card = forwardRef(({
  className,
  variant = 'default',
  colorScheme,
  padding = 'md',
  hover = false,
  glowEffect = false,
  borderAccent = false,
  responsive = true, // Enable responsive behavior by default
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ 
        variant, 
        colorScheme, 
        padding, 
        hover, 
        glowEffect, 
        borderAccent,
        responsive
      }), className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Attach sub-components to main Card component for dot notation access
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Actions = CardActions;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardActions, 
  CardContent, 
  CardFooter,
  cardVariants 
};