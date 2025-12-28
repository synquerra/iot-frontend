/**
 * Enhanced KPI Card Component with Color-Coded Backgrounds
 * Provides colorful metric display with gradient backgrounds and accent elements
 */

import React from 'react';
import { Card } from './Card';
import { getKpiColorScheme } from '../utils/chartColors';
import { cn } from '../utils/cn';

const KpiCard = React.forwardRef(({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  type = 'performance', // 'performance', 'growth', 'status'
  colorScheme,
  size = 'md',
  animated = true,
  className,
  style,
  ...props
}, ref) => {
  // Determine color scheme based on value and type
  const resolvedColorScheme = colorScheme || getKpiColorScheme(type, value, {
    excellent: 90,
    good: 70,
    warning: 50,
  });

  // Size variants with enhanced responsive scaling
  const sizeClasses = {
    sm: {
      container: 'p-4',
      title: 'text-xs font-medium',
      value: 'text-xl font-bold',
      subtitle: 'text-xs',
      trend: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'p-6',
      title: 'text-sm font-semibold',
      value: 'text-3xl font-bold',
      subtitle: 'text-sm',
      trend: 'text-sm font-medium',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'p-8',
      title: 'text-base font-semibold',
      value: 'text-4xl font-bold',
      subtitle: 'text-base',
      trend: 'text-base font-medium',
      icon: 'w-5 h-5',
    },
  };

  const sizes = sizeClasses[size];

  // Enhanced trend indicators with animations
  const getTrendIcon = (trend) => {
    const iconClass = cn(sizes.icon, 'transition-transform duration-300 group-hover:scale-110');
    
    switch (trend) {
      case 'up':
        return (
          <svg className={cn(iconClass, 'animate-bounce')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className={cn(iconClass, 'animate-pulse')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className={cn(iconClass, 'animate-pulse')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'down':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'stable':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-text-tertiary bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <Card
      ref={ref}
      variant="elevated"
      className={cn(
        'relative overflow-hidden transition-all duration-500 group',
        'border-2 backdrop-blur-sm',
        animated && 'hover:shadow-2xl hover:shadow-current/20',
        className
      )}
      style={{
        ...style,
        // Enhanced gradient background with glassmorphism
        background: style?.background || resolvedColorScheme.background,
        borderColor: style?.borderColor || resolvedColorScheme.border,
      }}
      {...props}
    >
      {/* Enhanced accent border with gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
        style={{ 
          background: `linear-gradient(90deg, ${resolvedColorScheme.accent}, ${resolvedColorScheme.text})` 
        }}
      />
      
      {/* Multiple layered glow effects */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-3xl transition-opacity duration-300 group-hover:opacity-15"
        style={{ background: resolvedColorScheme.accent }}
      />
      <div 
        className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-5 blur-2xl transition-opacity duration-300 group-hover:opacity-10"
        style={{ background: resolvedColorScheme.text }}
      />

      <Card.Content className={sizes.container}>
        <div className="flex flex-col space-y-4">
          {/* Enhanced title with better typography */}
          <div className={cn(
            'font-semibold tracking-wide text-text-secondary uppercase transition-colors duration-300',
            'group-hover:text-text-primary',
            sizes.title
          )}>
            {title}
          </div>

          {/* Enhanced value display with trend */}
          <div className="flex items-end justify-between">
            <div 
              className={cn('font-bold leading-none transition-all duration-300', sizes.value)}
              style={{ color: resolvedColorScheme.text }}
            >
              {value}
            </div>
            
            {/* Enhanced trend indicator with badge styling */}
            {trend && (
              <div className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-full border transition-all duration-300',
                'group-hover:scale-110 group-hover:shadow-lg',
                getTrendColor(trend),
                sizes.trend
              )}>
                {getTrendIcon(trend)}
                {trendValue && <span className="font-semibold">{trendValue}</span>}
              </div>
            )}
          </div>

          {/* Enhanced subtitle with better spacing */}
          {subtitle && (
            <div className={cn(
              'text-text-tertiary transition-colors duration-300 group-hover:text-text-secondary',
              sizes.subtitle
            )}>
              {subtitle}
            </div>
          )}
        </div>
      </Card.Content>

      {/* Enhanced animated background effects */}
      {animated && (
        <>
          {/* Pulse effect for status cards */}
          {type === 'status' && (
            <div 
              className="absolute inset-0 opacity-5 animate-pulse"
              style={{ background: resolvedColorScheme.accent }}
            />
          )}
          
          {/* Shimmer effect for performance cards */}
          {type === 'performance' && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
              <div 
                className="absolute inset-0 animate-pulse"
                style={{ 
                  background: `linear-gradient(45deg, transparent 30%, ${resolvedColorScheme.accent}20 50%, transparent 70%)`,
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          )}
          
          {/* Growth animation for growth cards */}
          {type === 'growth' && trend === 'up' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <div 
                className="h-full animate-pulse"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${resolvedColorScheme.accent}, transparent)`,
                  animation: 'growth-pulse 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
});

KpiCard.displayName = 'KpiCard';

// Preset KPI card variants for common use cases
export const PerformanceKpiCard = (props) => (
  <KpiCard type="performance" {...props} />
);

export const GrowthKpiCard = (props) => (
  <KpiCard type="growth" {...props} />
);

export const StatusKpiCard = (props) => (
  <KpiCard type="status" {...props} />
);

export { KpiCard };
export default KpiCard;