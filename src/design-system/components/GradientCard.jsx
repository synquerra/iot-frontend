import React from 'react';
import { cn } from '../utils/cn.js';
import { gradients, spectrumColors } from '../tokens/colors.js';

/**
 * GradientCard component with glassmorphism effects and customizable color schemes
 * Provides modern visual design with gradient backgrounds and glass-like transparency
 */
export const GradientCard = React.forwardRef(({
  children,
  className,
  colorScheme = 'primary',
  variant = 'default',
  size = 'md',
  glassmorphism = true,
  animated = false,
  ...props
}, ref) => {
  // Color scheme mapping to gradients and background colors
  const colorSchemeMap = {
    primary: {
      gradient: gradients.primary,
      background: 'rgba(124, 58, 237, 0.1)',
      border: 'rgba(124, 58, 237, 0.2)',
    },
    secondary: {
      gradient: gradients.secondary,
      background: 'rgba(26, 35, 50, 0.8)',
      border: 'rgba(71, 85, 105, 0.3)',
    },
    success: {
      gradient: gradients.success,
      background: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.2)',
    },
    warning: {
      gradient: gradients.warning,
      background: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    error: {
      gradient: gradients.error,
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
    },
    info: {
      gradient: gradients.info,
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
    },
    rainbow: {
      gradient: gradients.rainbow,
      background: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.2)',
    },
    sunset: {
      gradient: gradients.sunset,
      background: 'rgba(249, 115, 22, 0.1)',
      border: 'rgba(249, 115, 22, 0.2)',
    },
    ocean: {
      gradient: gradients.ocean,
      background: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.2)',
    },
    forest: {
      gradient: gradients.forest,
      background: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.2)',
    },
    aurora: {
      gradient: gradients.aurora,
      background: 'rgba(34, 211, 238, 0.1)',
      border: 'rgba(34, 211, 238, 0.2)',
    },
    cosmic: {
      gradient: gradients.cosmic,
      background: 'rgba(124, 58, 237, 0.1)',
      border: 'rgba(124, 58, 237, 0.2)',
    },
  };

  // Size variants
  const sizeVariants = {
    sm: 'p-3 rounded-lg',
    md: 'p-4 rounded-xl',
    lg: 'p-6 rounded-2xl',
    xl: 'p-8 rounded-3xl',
  };

  // Variant styles
  const variantStyles = {
    default: 'relative overflow-hidden',
    filled: 'relative overflow-hidden',
    outlined: 'relative overflow-hidden border-2',
    ghost: 'relative overflow-hidden bg-transparent',
  };

  const scheme = colorSchemeMap[colorScheme] || colorSchemeMap.primary;

  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        'relative overflow-hidden transition-all duration-300 ease-out',
        
        // Size variants
        sizeVariants[size],
        
        // Variant styles
        variantStyles[variant],
        
        // Glassmorphism effects
        glassmorphism && [
          'backdrop-blur-xl backdrop-saturate-150',
          'border border-white/10',
          'shadow-xl shadow-black/20',
        ],
        
        // Animation effects
        animated && [
          'transform-gpu hover:scale-[1.02]',
          'hover:shadow-2xl hover:shadow-black/30',
          'transition-transform duration-300 ease-out',
        ],
        
        className
      )}
      style={{
        background: variant === 'filled' 
          ? scheme.gradient 
          : glassmorphism 
            ? scheme.background 
            : 'transparent',
        borderColor: variant === 'outlined' ? scheme.border : undefined,
      }}
      {...props}
    >
      {/* Gradient overlay for subtle background effect */}
      {variant === 'default' && glassmorphism && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: scheme.gradient,
          }}
        />
      )}
      
      {/* Animated gradient border effect */}
      {animated && (
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(45deg, ${scheme.border}, transparent, ${scheme.border})`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
          }}
        />
      )}
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

GradientCard.displayName = 'GradientCard';

/**
 * Specialized gradient card variants for common use cases
 */

// KPI Card variant with enhanced styling
export const GradientKpiCard = React.forwardRef(({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'primary',
  ...props
}, ref) => {
  return (
    <GradientCard
      ref={ref}
      colorScheme={colorScheme}
      glassmorphism={true}
      animated={true}
      size="md"
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium text-white/80 mb-1">
              {title}
            </h3>
          )}
          {value && (
            <div className="text-2xl font-bold text-white mb-1">
              {value}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-white/60">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="ml-4 p-2 rounded-lg bg-white/10">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center text-xs text-white/70">
            {trend}
          </div>
        </div>
      )}
    </GradientCard>
  );
});

GradientKpiCard.displayName = 'GradientKpiCard';

// Chart container variant
export const GradientChartCard = React.forwardRef(({
  title,
  children,
  colorScheme = 'secondary',
  ...props
}, ref) => {
  return (
    <GradientCard
      ref={ref}
      colorScheme={colorScheme}
      glassmorphism={true}
      size="lg"
      {...props}
    >
      {title && (
        <div className="mb-4 pb-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </GradientCard>
  );
});

GradientChartCard.displayName = 'GradientChartCard';

// Hero section variant
export const GradientHeroCard = React.forwardRef(({
  children,
  colorScheme = 'rainbow',
  ...props
}, ref) => {
  return (
    <GradientCard
      ref={ref}
      colorScheme={colorScheme}
      variant="filled"
      glassmorphism={false}
      animated={true}
      size="xl"
      className="text-center"
      {...props}
    >
      {children}
    </GradientCard>
  );
});

GradientHeroCard.displayName = 'GradientHeroCard';