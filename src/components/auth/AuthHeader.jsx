import React from 'react';
import { cn } from '../../design-system/utils/cn';

/**
 * AuthHeader Component
 * 
 * Consistent header for authentication pages with:
 * - Consistent titles and descriptions
 * - Proper typography hierarchy
 * - Accessibility support with proper heading structure
 * - Flexible content support
 */

const AuthHeader = ({ 
  title, 
  subtitle, 
  className,
  titleId,
  ...props 
}) => {
  return (
    <div 
      className={cn("text-center mb-8", className)}
      {...props}
    >
      {title && (
        <h1 
          id={titleId || "auth-title"}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-gray-600 text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export { AuthHeader };