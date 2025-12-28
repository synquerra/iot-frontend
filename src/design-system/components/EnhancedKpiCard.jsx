/**
 * Enhanced KPI Card Component with Advanced Animations and Trend Indicators
 * Builds upon the existing KpiCard with additional features for dashboard redesign
 * Requirements: 1.1, 1.3, 7.1, 7.2
 */

import React, { useState, useEffect, useRef } from 'react';
import { KpiCard } from './KpiCard';
import { cn } from '../utils/cn';

const EnhancedKpiCard = React.forwardRef(({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  type = 'performance',
  colorScheme,
  size = 'md',
  animated = true,
  showSparkline = false,
  sparklineData = [],
  icon,
  loading = false,
  countAnimation = true,
  hoverEffects = true,
  glowEffect = false,
  className,
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const animationRef = useRef(null);

  // Intersection Observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (!countAnimation || !isVisible || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const endValue = value;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, isVisible, countAnimation, displayValue]);

  // Sparkline component
  const Sparkline = ({ data, width = 60, height = 20 }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const trendColor = data[data.length - 1] > data[0] ? '#10b981' : '#ef4444';

    return (
      <svg width={width} height={height} className="opacity-70">
        <polyline
          points={points}
          fill="none"
          stroke={trendColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(
        'animate-pulse bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-lg p-6',
        className
      )}>
        <div className="space-y-3">
          <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
          <div className="h-8 bg-slate-600/50 rounded w-1/2"></div>
          <div className="h-3 bg-slate-600/50 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'transform transition-all duration-500',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className
      )}
    >
      <KpiCard
        ref={ref}
        title={title}
        value={typeof value === 'number' ? displayValue : value}
        subtitle={subtitle}
        trend={trend}
        trendValue={trendValue}
        type={type}
        colorScheme={colorScheme}
        size={size}
        animated={animated}
        className={cn(
          'relative overflow-hidden',
          hoverEffects && 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
          glowEffect && 'shadow-lg shadow-current/20',
          animated && 'hover:rotate-1 hover:-rotate-1'
        )}
        {...props}
      >
        {/* Enhanced visual effects */}
        {glowEffect && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* Icon display */}
        {icon && (
          <div className="absolute top-4 right-4 text-2xl opacity-20">
            {icon}
          </div>
        )}

        {/* Sparkline display */}
        {showSparkline && sparklineData.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <Sparkline data={sparklineData} />
          </div>
        )}

        {/* Pulse animation for status type */}
        {type === 'status' && animated && (
          <div className="absolute inset-0 bg-current opacity-5 animate-pulse pointer-events-none" />
        )}
      </KpiCard>
    </div>
  );
});

EnhancedKpiCard.displayName = 'EnhancedKpiCard';

// Preset enhanced KPI card variants
export const EnhancedPerformanceKpiCard = (props) => (
  <EnhancedKpiCard 
    type="performance" 
    countAnimation={true}
    hoverEffects={true}
    {...props} 
  />
);

export const EnhancedGrowthKpiCard = (props) => (
  <EnhancedKpiCard 
    type="growth" 
    showSparkline={true}
    glowEffect={true}
    {...props} 
  />
);

export const EnhancedStatusKpiCard = (props) => (
  <EnhancedKpiCard 
    type="status" 
    animated={true}
    hoverEffects={true}
    {...props} 
  />
);

export { EnhancedKpiCard };
export default EnhancedKpiCard;