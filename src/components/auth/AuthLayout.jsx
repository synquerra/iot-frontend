import React from 'react';
import { cn } from '../../design-system/utils/cn';

/**
 * AuthLayout Component
 * 
 * Provides consistent layout wrapper for authentication pages with:
 * - Consistent background gradient matching login page
 * - Responsive design with proper mobile scaling
 * - Accessibility landmarks and structure
 * - Optional help text section
 */

const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  showHelp = false,
  helpContent,
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-surface-background px-4",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Main content area */}
        <main role="main" aria-labelledby={title ? "auth-title" : undefined}>
          {children}
        </main>

        {/* Optional help section */}
        {showHelp && helpContent && (
          <div className="mt-6 text-center">
            <div className="text-text-tertiary text-xs">
              {helpContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AuthLayout };