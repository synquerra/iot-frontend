/**
 * Enhanced Layout Components for Colorful UI Redesign with Responsive Color Behavior
 * Provides colorful section dividers, gradient headers, hero sections, and background variations
 * Optimized for all screen sizes with responsive color adjustments
 */

import React from 'react';
import { spectrumColors, gradients } from '../tokens/colors';
import { responsiveTailwindClasses } from '../utils/responsiveColors.js';

/**
 * Colorful Section Divider Component with Responsive Behavior
 * Creates visually appealing dividers with gradient effects that adapt to screen size
 */
export function SectionDivider({ 
  variant = 'gradient', 
  colorScheme = 'violet', 
  thickness = 'thin',
  spacing = 'md',
  animated = false,
  responsive = true,
  className = '' 
}) {
  const spacingClasses = {
    sm: 'my-3 sm:my-4 md:my-4',
    md: 'my-4 sm:my-6 md:my-6',
    lg: 'my-6 sm:my-8 md:my-8',
    xl: 'my-8 sm:my-12 md:my-12'
  };

  const thicknessClasses = {
    thin: 'h-px sm:h-px md:h-0.5',
    medium: 'h-0.5 sm:h-0.5 md:h-1',
    thick: 'h-1 sm:h-1 md:h-1.5'
  };

  const baseClasses = `relative ${spacingClasses[spacing]} ${className}`;

  if (variant === 'gradient') {
    return (
      <div className={baseClasses}>
        <div className={`${thicknessClasses[thickness]} bg-gradient-to-r from-transparent via-${colorScheme}-500/40 sm:via-${colorScheme}-500/50 md:via-${colorScheme}-500/60 to-transparent`} />
        {animated && (
          <div className={`absolute inset-0 ${thicknessClasses[thickness]} bg-gradient-to-r from-${colorScheme}-400/20 sm:from-${colorScheme}-400/30 md:from-${colorScheme}-400/40 via-${colorScheme}-300/20 sm:via-${colorScheme}-300/30 md:via-${colorScheme}-300/40 to-${colorScheme}-400/20 sm:to-${colorScheme}-400/30 md:to-${colorScheme}-400/40 blur-sm animate-pulse`} />
        )}
      </div>
    );
  }

  if (variant === 'rainbow') {
    return (
      <div className={baseClasses}>
        {/* Simplified rainbow on mobile, full rainbow on desktop */}
        <div className={`${thicknessClasses[thickness]} bg-gradient-to-r from-violet-500 to-pink-500 opacity-50 sm:from-violet-500 sm:via-blue-500 sm:via-teal-500 sm:to-pink-500 sm:opacity-60 md:from-violet-500 md:via-blue-500 md:via-teal-500 md:via-green-500 md:via-amber-500 md:to-pink-500 md:opacity-70`} />
        {animated && (
          <div className={`absolute inset-0 ${thicknessClasses[thickness]} bg-gradient-to-r from-violet-400 to-pink-400 blur-sm animate-pulse sm:from-violet-400 sm:via-blue-400 sm:via-teal-400 sm:to-pink-400 md:from-violet-400 md:via-blue-400 md:via-teal-400 md:via-green-400 md:via-amber-400 md:to-pink-400`} />
        )}
      </div>
    );
  }

  if (variant === 'dotted') {
    return (
      <div className={baseClasses}>
        <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-${colorScheme}-400 ${animated ? 'animate-pulse' : ''}`}
              style={{ animationDelay: animated ? `${i * 0.2}s` : '0s' }}
            />
          ))}
          {/* Additional dots on larger screens */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-2 md:gap-2">
            {[...Array(2)].map((_, i) => (
              <div 
                key={i + 3}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-${colorScheme}-400 ${animated ? 'animate-pulse' : ''}`}
                style={{ animationDelay: animated ? `${(i + 3) * 0.2}s` : '0s' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default solid variant with responsive opacity
  return (
    <div className={baseClasses}>
      <div className={`${thicknessClasses[thickness]} bg-${colorScheme}-500/20 sm:bg-${colorScheme}-500/30 md:bg-${colorScheme}-500/40`} />
    </div>
  );
}

/**
 * Gradient Header Component with Responsive Color Behavior
 * Creates colorful headers with gradient backgrounds and visual effects that adapt to screen size
 */
export function GradientHeader({ 
  title, 
  subtitle, 
  colorScheme = 'violet',
  variant = 'default',
  size = 'lg',
  centered = false,
  responsive = true,
  children,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'py-3 px-4 sm:py-4 sm:px-6 md:py-4 md:px-6',
    md: 'py-4 px-6 sm:py-6 sm:px-8 md:py-6 md:px-8',
    lg: 'py-6 px-8 sm:py-8 sm:px-10 md:py-8 md:px-10',
    xl: 'py-8 px-10 sm:py-12 sm:px-12 md:py-12 md:px-12'
  };

  const titleSizes = {
    sm: 'text-lg sm:text-xl md:text-xl',
    md: 'text-xl sm:text-2xl md:text-2xl',
    lg: 'text-2xl sm:text-3xl md:text-3xl',
    xl: 'text-3xl sm:text-4xl md:text-4xl'
  };

  const subtitleSizes = {
    sm: 'text-xs sm:text-sm md:text-sm',
    md: 'text-sm sm:text-base md:text-base',
    lg: 'text-base sm:text-lg md:text-lg',
    xl: 'text-lg sm:text-xl md:text-xl'
  };

  const alignmentClasses = centered ? 'text-center' : 'text-left';
  const baseClasses = `relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl ${sizeClasses[size]} ${alignmentClasses} ${className}`;

  if (variant === 'gradient') {
    return (
      <div className={baseClasses}>
        {/* Responsive gradient background - simpler on mobile */}
        <div className={`absolute inset-0 bg-gradient-to-r from-${colorScheme}-600/15 to-${colorScheme}-400/15 sm:from-${colorScheme}-600/20 sm:via-${colorScheme}-500/10 sm:to-${colorScheme}-400/20 md:from-${colorScheme}-600/25 md:via-${colorScheme}-500/15 md:to-${colorScheme}-400/25`} />
        <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme}-900/5 via-transparent to-${colorScheme}-800/5 sm:from-${colorScheme}-900/10 sm:to-${colorScheme}-800/10 md:from-${colorScheme}-900/15 md:to-${colorScheme}-800/15`} />
        
        {/* Content */}
        <div className="relative z-10">
          {title && (
            <h1 className={`${titleSizes[size]} font-bold text-white mb-2 tracking-tight`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`${subtitleSizes[size]} text-slate-300 opacity-90`}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
        
        {/* Responsive decorative elements - smaller on mobile */}
        <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-${colorScheme}-400/5 sm:from-${colorScheme}-400/10 md:from-${colorScheme}-400/15 to-transparent rounded-full blur-xl sm:blur-2xl md:blur-3xl`} />
        <div className={`absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-gradient-to-tr from-${colorScheme}-500/5 sm:from-${colorScheme}-500/10 md:from-${colorScheme}-500/15 to-transparent rounded-full blur-lg sm:blur-xl md:blur-2xl`} />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`${baseClasses} min-h-[200px] sm:min-h-[250px] md:min-h-[300px] flex items-center justify-center`}>
        {/* Responsive hero gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-blue-900/5 to-teal-900/10 sm:from-violet-900/15 sm:via-blue-900/8 sm:to-teal-900/15 md:from-violet-900/20 md:via-blue-900/10 md:to-teal-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/30 to-transparent sm:from-bg/40 md:from-bg/50" />
        
        {/* Responsive animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-30 sm:-right-30 sm:w-60 sm:h-60 md:-top-40 md:-right-40 md:w-80 md:h-80 bg-gradient-to-br from-violet-500/5 sm:from-violet-500/8 md:from-violet-500/10 to-transparent rounded-full blur-2xl sm:blur-3xl md:blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-30 sm:-left-30 sm:w-60 sm:h-60 md:-bottom-40 md:-left-40 md:w-80 md:h-80 bg-gradient-to-tr from-teal-500/5 sm:from-teal-500/8 md:from-teal-500/10 to-transparent rounded-full blur-2xl sm:blur-3xl md:blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Content with responsive sizing */}
        <div className="relative z-10 max-w-sm sm:max-w-2xl md:max-w-4xl mx-auto px-4">
          {title && (
            <h1 className={`${titleSizes[size]} font-bold text-white mb-3 sm:mb-4 md:mb-4 tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`${subtitleSizes[size]} text-slate-300 opacity-90 max-w-xs sm:max-w-lg md:max-w-2xl ${centered ? 'mx-auto' : ''}`}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    );
  }

  // Default variant with responsive enhancements
  return (
    <div className={baseClasses}>
      <div className="relative z-10">
        {title && (
          <h1 className={`${titleSizes[size]} font-bold text-white mb-2 tracking-tight`}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className={`${subtitleSizes[size]} text-slate-300 opacity-90`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Content Section Component
 * Provides subtle background variations and visual hierarchy for content sections
 */
export function ContentSection({ 
  children, 
  variant = 'default',
  colorScheme = 'slate',
  padding = 'md',
  spacing = 'md',
  bordered = false,
  elevated = false,
  className = '' 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const spacingClasses = {
    none: '',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
    xl: 'space-y-12'
  };

  const baseClasses = `relative ${paddingClasses[padding]} ${spacingClasses[spacing]} ${className}`;
  const borderClasses = bordered ? 'border border-slate-700/30 rounded-lg' : '';
  const elevationClasses = elevated ? 'shadow-lg shadow-black/10' : '';

  if (variant === 'subtle') {
    return (
      <section className={`${baseClasses} ${borderClasses} ${elevationClasses}`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme}-900/5 to-transparent rounded-lg`} />
        <div className="relative z-10">
          {children}
        </div>
      </section>
    );
  }

  if (variant === 'accent') {
    return (
      <section className={`${baseClasses} ${borderClasses} ${elevationClasses}`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-${colorScheme}-500/5 via-transparent to-${colorScheme}-400/5 rounded-lg`} />
        <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme}-900/10 via-transparent to-transparent rounded-lg`} />
        <div className="relative z-10">
          {children}
        </div>
      </section>
    );
  }

  if (variant === 'highlighted') {
    return (
      <section className={`${baseClasses} ${borderClasses} ${elevationClasses} border-${colorScheme}-500/20`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme}-500/10 via-${colorScheme}-400/5 to-transparent rounded-lg`} />
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${colorScheme}-400/50 to-transparent`} />
        <div className="relative z-10">
          {children}
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={`${baseClasses} ${borderClasses} ${elevationClasses}`}>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}

/**
 * Page Container Component
 * Provides consistent page layout with colorful backgrounds and visual hierarchy
 */
export function PageContainer({ 
  children, 
  title, 
  subtitle,
  headerVariant = 'default',
  headerColorScheme = 'violet',
  backgroundVariant = 'default',
  maxWidth = '7xl',
  className = '' 
}) {
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  const baseClasses = `min-h-screen ${className}`;

  return (
    <div className={baseClasses}>
      {/* Background variations */}
      {backgroundVariant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/5 via-transparent to-teal-900/5 pointer-events-none" />
      )}
      {backgroundVariant === 'subtle' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/10 pointer-events-none" />
      )}
      
      <div className={`relative z-10 mx-auto ${maxWidthClasses[maxWidth]} px-4 sm:px-6 lg:px-8`}>
        {/* Header section */}
        {(title || subtitle) && (
          <GradientHeader
            title={title}
            subtitle={subtitle}
            variant={headerVariant}
            colorScheme={headerColorScheme}
            className="mb-8"
          />
        )}
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
}

/**
 * Visual Hierarchy Helper Component
 * Enhances visual hierarchy through strategic color use
 */
export function HierarchySection({ 
  level = 1, 
  children, 
  colorScheme = 'violet',
  spacing = 'md',
  className = '' 
}) {
  const levelStyles = {
    1: {
      background: `from-${colorScheme}-500/10 to-transparent`,
      border: `border-${colorScheme}-500/20`,
      padding: 'p-6',
      spacing: 'space-y-6'
    },
    2: {
      background: `from-${colorScheme}-500/5 to-transparent`,
      border: `border-${colorScheme}-500/10`,
      padding: 'p-4',
      spacing: 'space-y-4'
    },
    3: {
      background: `from-${colorScheme}-500/3 to-transparent`,
      border: `border-${colorScheme}-500/5`,
      padding: 'p-3',
      spacing: 'space-y-3'
    }
  };

  const style = levelStyles[level] || levelStyles[1];
  const spacingClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };

  return (
    <div className={`relative ${style.padding} ${spacingClasses[spacing]} border ${style.border} rounded-lg ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${style.background} rounded-lg`} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default {
  SectionDivider,
  GradientHeader,
  ContentSection,
  PageContainer,
  HierarchySection
};