/**
 * Enhanced Dashboard Header Component
 * Provides gradient backgrounds, responsive typography, mini statistics, and smooth animations
 * Requirements: 1.1, 1.2, 4.3
 */

import React from 'react';
import { GradientHeader } from '../../design-system/components/LayoutComponents';

/**
 * Mini Statistics Display Component
 * Shows key metrics in a compact, responsive format
 */
const MiniStat = React.memo(function MiniStat({ label, value, trend, trendValue, colorScheme = 'violet' }) {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-1 group">
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide transition-colors duration-200 group-hover:text-slate-300">
        {label}
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-sm text-white font-semibold transition-all duration-200 group-hover:scale-105">
          {value}
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(trend)}
            {trendValue && (
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-400' : 
                trend === 'down' ? 'text-red-400' : 
                'text-amber-400'
              }`}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Refresh Button Component
 * Animated refresh button with hover effects and loading state
 */
const RefreshButton = React.memo(function RefreshButton({ 
  onRefresh, 
  loading = false, 
  colorScheme = 'violet' 
}) {
  return (
    <button
      className={`
        group relative px-4 py-2 
        bg-gradient-to-r from-${colorScheme}-600 to-purple-600 
        hover:from-${colorScheme}-700 hover:to-purple-700 
        border border-${colorScheme}-500/30 
        rounded-lg text-white font-medium 
        transition-all duration-300 ease-out
        shadow-lg shadow-${colorScheme}-500/20 
        hover:shadow-${colorScheme}-500/40 
        hover:scale-105 hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-${colorScheme}-400/50 focus:ring-offset-2 focus:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${loading ? 'animate-pulse' : ''}
      `}
      onClick={onRefresh}
      disabled={loading}
    >
      {/* Background glow effect */}
      <div className={`
        absolute inset-0 rounded-lg 
        bg-gradient-to-r from-${colorScheme}-400/20 to-purple-400/20 
        blur-sm opacity-0 group-hover:opacity-100 
        transition-opacity duration-300 -z-10
      `} />
      
      <div className="flex items-center gap-2">
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${
            loading ? 'animate-spin' : 'group-hover:rotate-180'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        <span className="transition-all duration-200 group-hover:tracking-wide">
          {loading ? 'Refreshing...' : 'Refresh'}
        </span>
      </div>
    </button>
  );
});

/**
 * Enhanced Dashboard Header Component
 * Main header component with gradient background, statistics, and actions
 */
export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Real-time analytics and monitoring",
  stats = {},
  onRefresh,
  loading = false,
  colorScheme = 'violet',
  size = 'lg',
  showStats = true,
  showFilterIndicator = false,
  className = ''
}) {
  const {
    devicesCount = 0,
    recentCount = 0,
    totalAnalytics = 0,
    // Additional stats with trends
    devicesTrend,
    devicesTrendValue,
    recentTrend,
    recentTrendValue,
    totalTrend,
    totalTrendValue
  } = stats;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Header with Gradient Background */}
      <GradientHeader
        title={
          <div className="flex items-center gap-3">
            <span>{title}</span>
            {showFilterIndicator && (
              <span 
                className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-blue-200 text-xs font-medium cursor-help"
                title="You are viewing only devices assigned to your account"
              >
                Filtered View
              </span>
            )}
          </div>
        }
        subtitle={subtitle}
        variant="gradient"
        colorScheme={colorScheme}
        size={size}
        className="relative overflow-hidden"
      >
        {/* Enhanced decorative elements with animations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/3 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-white/20 rounded-full animate-pulse`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            />
          ))}
        </div>
      </GradientHeader>

      {/* Actions and Statistics Section */}
      {(showStats || onRefresh) && (
        <div className={`
          relative p-6 rounded-xl border border-${colorScheme}-500/20 
          bg-gradient-to-r from-${colorScheme}-900/10 via-slate-900/20 to-${colorScheme}-900/10
          backdrop-blur-sm
        `}>
          {/* Background effects */}
          <div className={`absolute inset-0 bg-gradient-to-br from-${colorScheme}-500/5 to-transparent rounded-xl`} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative z-10 flex items-center justify-between">
            {/* Left side - Description */}
            <div className="space-y-1">
              <p className="text-slate-300 font-medium">
                Real-time system monitoring and analytics
              </p>
              <p className="text-xs text-slate-400">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Right side - Stats and Actions */}
            <div className="flex items-center gap-8">
              {/* Mini Statistics - Hidden on mobile, visible on tablet+ */}
              {showStats && (
                <div className="hidden md:flex gap-8">
                  <MiniStat 
                    label="Devices" 
                    value={devicesCount} 
                    trend={devicesTrend}
                    trendValue={devicesTrendValue}
                    colorScheme={colorScheme}
                  />
                  <MiniStat 
                    label="Recent" 
                    value={recentCount}
                    trend={recentTrend}
                    trendValue={recentTrendValue}
                    colorScheme={colorScheme}
                  />
                  <MiniStat 
                    label="Total" 
                    value={totalAnalytics}
                    trend={totalTrend}
                    trendValue={totalTrendValue}
                    colorScheme={colorScheme}
                  />
                </div>
              )}

              {/* Refresh Button */}
              {onRefresh && (
                <RefreshButton 
                  onRefresh={onRefresh} 
                  loading={loading}
                  colorScheme={colorScheme}
                />
              )}
            </div>
          </div>

          {/* Mobile Stats - Visible only on mobile */}
          {showStats && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700/30">
              <div className="grid grid-cols-3 gap-4">
                <MiniStat 
                  label="Devices" 
                  value={devicesCount} 
                  trend={devicesTrend}
                  trendValue={devicesTrendValue}
                  colorScheme={colorScheme}
                />
                <MiniStat 
                  label="Recent" 
                  value={recentCount}
                  trend={recentTrend}
                  trendValue={recentTrendValue}
                  colorScheme={colorScheme}
                />
                <MiniStat 
                  label="Total" 
                  value={totalAnalytics}
                  trend={totalTrend}
                  trendValue={totalTrendValue}
                  colorScheme={colorScheme}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Filtering Info Box for PARENTS users */}
      {showFilterIndicator && (
        <div className={`
          relative p-4 rounded-xl border border-blue-500/30 
          bg-gradient-to-r from-blue-900/20 via-slate-900/20 to-blue-900/20
          backdrop-blur-sm
        `}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-blue-200 font-medium text-sm mb-1">
                Viewing Assigned Devices Only
              </div>
              <div className="text-blue-200/70 text-sm leading-relaxed">
                You are viewing data for {devicesCount} device{devicesCount !== 1 ? 's' : ''} assigned to your account. 
                Contact your administrator to modify device assignments or view additional devices.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHeader;