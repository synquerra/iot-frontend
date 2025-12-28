import React from 'react';
import { cn } from '../../design-system/utils/cn';

/**
 * AuthCard Component
 * 
 * Consistent card container for authentication forms with:
 * - Styling matching the login page design
 * - Proper shadow and border radius
 * - Responsive padding and sizing
 * - Smooth entrance animations
 */

const AuthCard = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "bg-surface-primary border border-border-primary rounded-2xl p-8 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { AuthCard };