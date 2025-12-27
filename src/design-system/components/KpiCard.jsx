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
  ...props
}, ref) => {
  // Determine color scheme based on value and type
  const resolvedColorScheme = colorScheme || getKpiColorScheme(type, value, {
    excellent: 90,
    good: 70,
    warning: 50,
  });

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'p-4',
      title: 'text-xs',
      value: 'text-xl',
      subtitle: 'text-xs',
      trend: 'text-xs',
    },
    md: {
      container: 'p-6',
      title: 'text-sm',
      value: 'text-3xl',
      subtitle: 'text-sm',
      trend: 'text-sm',
    },
    lg: {
      container: 'p-8',
      title: 'text-base',
      value: 'text-4xl',
      subtitle: 'text-base',
      trend: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  // Trend indicators
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'stable':
        return 'text-blue-400';
      default:
        return 'text-text-tertiary';
    }
  };

  return (
    <Card
      ref={ref}
      variant="elevated"
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        animated && 'hover:scale-105 hover:shadow-xl',
        className
      )}
      style={{
        background: resolvedColorScheme.background,
        borderColor: resolvedColorScheme.border,
      }}
      {...props}
    >
      {/* Accent border */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: resolvedColorScheme.accent }}
      />
      
      {/* Subtle accent glow */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: resolvedColorScheme.accent }}
      />

      <Card.Content className={sizes.container}>
        <div className="flex flex-col space-y-3">
          {/* Title */}
          <div className={cn(
            'font-medium tracking-wide text-text-secondary uppercase',
            sizes.title
          )}>
            {title}
          </div>

          {/* Value */}
          <div className="flex items-baseline space-x-2">
            <div 
              className={cn('font-bold leading-none', sizes.value)}
              style={{ color: resolvedColorScheme.text }}
            >
              {value}
            </div>
            
            {/* Trend indicator */}
            {trend && (
              <div className={cn(
                'flex items-center space-x-1',
                getTrendColor(trend),
                sizes.trend
              )}>
                {getTrendIcon(trend)}
                {trendValue && <span className="font-medium">{trendValue}</span>}
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className={cn('text-text-tertiary', sizes.subtitle)}>
              {subtitle}
            </div>
          )}
        </div>
      </Card.Content>

      {/* Animated background pulse for active states */}
      {animated && type === 'status' && (
        <div 
          className="absolute inset-0 opacity-5 animate-pulse"
          style={{ background: resolvedColorScheme.accent }}
        />
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