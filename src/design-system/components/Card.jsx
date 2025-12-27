import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn';

/**
 * Enhanced Card Component
 * 
 * Features:
 * - Header, content, and footer sections with proper composition
 * - Variant support: default, elevated, outlined
 * - Consistent spacing and visual hierarchy
 * - Proper semantic structure
 * - Flexible padding options
 * - Hover states for interactive cards
 */

// Card variant styles using class-variance-authority
const cardVariants = cva(
  // Base styles - common to all cards
  [
    'rounded-xl transition-all duration-200',
    'overflow-hidden', // Ensures content doesn't overflow rounded corners
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface-primary border border-border-primary',
          'shadow-sm',
        ],
        elevated: [
          'bg-surface-secondary border border-border-secondary',
          'shadow-lg',
        ],
        outlined: [
          'bg-transparent border-2 border-border-accent',
          'shadow-none',
        ],
      },
      padding: {
        sm: 'p-4',   // 16px
        md: 'p-6',   // 24px
        lg: 'p-8',   // 32px
      },
      hover: {
        true: 'hover:shadow-md hover:scale-[1.01] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
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

// Main Card Component
const Card = forwardRef(({
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover }), className)}
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