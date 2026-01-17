/**
 * Enhanced Geo Distribution Card
 * 
 * A visually intuitive geographic distribution display with:
 * - Large, easy-to-read region cards
 * - Color-coded visual indicators
 * - Interactive map-style layout
 * - Clear device counts and percentages
 */

import React from 'react';
import { cn } from '../../design-system/utils/cn';

/**
 * Color palette for regions
 */
const REGION_COLORS = [
  { primary: '#3b82f6', secondary: '#2563eb', name: 'blue' },      // Blue
  { primary: '#10b981', secondary: '#059669', name: 'green' },     // Green
  { primary: '#f59e0b', secondary: '#d97706', name: 'amber' },     // Amber
  { primary: '#8b5cf6', secondary: '#7c3aed', name: 'purple' },    // Purple
  { primary: '#ec4899', secondary: '#db2777', name: 'pink' },      // Pink
  { primary: '#06b6d4', secondary: '#0891b2', name: 'cyan' },      // Cyan
  { primary: '#f97316', secondary: '#ea580c', name: 'orange' },    // Orange
  { primary: '#14b8a6', secondary: '#0d9488', name: 'teal' },      // Teal
];

/**
 * Get region icon based on name
 */
function getRegionIcon(regionName) {
  const name = regionName?.toLowerCase() || '';
  
  if (name.includes('north')) return '⬆️';
  if (name.includes('south')) return '⬇️';
  if (name.includes('east')) return '➡️';
  if (name.includes('west')) return '⬅️';
  if (name.includes('central') || name.includes('center')) return '🎯';
  if (name.includes('unknown')) return '❓';
  
  // Default icons based on first letter
  const firstChar = name.charAt(0);
  if (firstChar >= 'a' && firstChar <= 'f') return '📍';
  if (firstChar >= 'g' && firstChar <= 'l') return '🗺️';
  if (firstChar >= 'm' && firstChar <= 'r') return '📌';
  if (firstChar >= 's' && firstChar <= 'z') return '🌍';
  
  return '📍';
}

/**
 * Individual Region Card
 */
function RegionCard({ region, color, totalDevices, rank }) {
  const percentage = totalDevices > 0 ? (region.value / totalDevices) * 100 : 0;
  const icon = getRegionIcon(region.name);
  
  // Determine card size based on percentage
  const getCardSize = () => {
    if (percentage >= 25) return 'large';
    if (percentage >= 15) return 'medium';
    return 'small';
  };
  
  const size = getCardSize();
  
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-500',
        'hover:scale-105 hover:shadow-2xl cursor-pointer group',
        'border-2',
        size === 'large' && 'col-span-2 row-span-2',
        size === 'medium' && 'col-span-1 row-span-1',
        size === 'small' && 'col-span-1 row-span-1'
      )}
      style={{
        backgroundColor: `${color.primary}20`,
        borderColor: `${color.primary}60`,
        boxShadow: `0 8px 32px ${color.primary}30`
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`
        }}
      />
      
      {/* Rank Badge */}
      {rank <= 3 && (
        <div 
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-20"
          style={{
            backgroundColor: `${color.primary}80`,
            color: 'white',
            boxShadow: `0 4px 12px ${color.primary}60`
          }}
        >
          #{rank}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 
              className="text-xl font-bold mb-2 line-clamp-2"
              style={{ color: color.primary }}
            >
              {region.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Region ID: {region.name}
            </p>
          </div>
          
          {/* Percentage Badge */}
          <div 
            className="px-4 py-2 rounded-xl font-bold text-lg ml-2"
            style={{
              backgroundColor: `${color.primary}40`,
              color: color.primary
            }}
          >
            {percentage.toFixed(1)}%
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: color.primary,
                boxShadow: `0 0 10px ${color.primary}80`
              }}
            />
          </div>
        </div>
        
        {/* Device Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Devices
            </span>
            {rank === 1 && (
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold">
                🏆 Top
              </span>
            )}
          </div>
          <span 
            className="text-3xl font-bold"
            style={{ color: color.primary }}
          >
            {region.value.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      {/* Animated border on hover */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 20px ${color.primary}40`
        }}
      />
    </div>
  );
}

/**
 * Summary Statistics Card
 */
function SummaryCard({ regions, totalDevices }) {
  const topRegion = regions[0];
  const regionCount = regions.length;
  const avgDevicesPerRegion = totalDevices > 0 ? (totalDevices / regionCount).toFixed(0) : 0;
  
  // Calculate distribution balance (how evenly distributed)
  const maxPercentage = topRegion ? (topRegion.value / totalDevices) * 100 : 0;
  const balance = maxPercentage < 40 ? 'Balanced' : maxPercentage < 60 ? 'Moderate' : 'Concentrated';
  const balanceColor = maxPercentage < 40 ? '#10b981' : maxPercentage < 60 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Geographic Summary</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Distribution:</span>
          <div 
            className="px-3 py-1 rounded-lg font-bold text-sm"
            style={{
              backgroundColor: `${balanceColor}20`,
              color: balanceColor
            }}
          >
            {balance}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Total Regions */}
        <div className="text-center">
          <div className="text-3xl mb-2">🗺️</div>
          <div className="text-2xl font-bold text-white mb-1">
            {regionCount}
          </div>
          <div className="text-sm text-slate-400">Regions</div>
        </div>
        
        {/* Total Devices */}
        <div className="text-center">
          <div className="text-3xl mb-2">📱</div>
          <div className="text-2xl font-bold text-white mb-1">
            {totalDevices.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">Total Devices</div>
        </div>
        
        {/* Average per Region */}
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-white mb-1">
            {avgDevicesPerRegion}
          </div>
          <div className="text-sm text-slate-400">Avg/Region</div>
        </div>
      </div>
      
      {/* Top Region Highlight */}
      {topRegion && (
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">Top Region</div>
              <div className="text-lg font-bold text-white">
                🏆 {topRegion.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Devices</div>
              <div className="text-lg font-bold text-white">
                {topRegion.value.toLocaleString()} ({((topRegion.value / totalDevices) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Region List (for many regions)
 */
function RegionList({ regions, totalDevices, colors }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        All Regions ({regions.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {regions.map((region, idx) => {
          const percentage = (region.value / totalDevices) * 100;
          const color = colors[idx % colors.length];
          const icon = getRegionIcon(region.name);
          
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="text-2xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 dark:text-white truncate">
                  {region.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color.primary
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div 
                className="text-lg font-bold px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: `${color.primary}20`,
                  color: color.primary
                }}
              >
                {region.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main Geo Distribution Card Component
 */
export default function GeoDistributionCard({ geoPie }) {
  // Sort regions by device count (descending)
  const sortedRegions = [...geoPie].sort((a, b) => b.value - a.value);
  
  // Calculate total devices
  const totalDevices = sortedRegions.reduce((sum, region) => sum + region.value, 0);
  
  // Assign colors to regions
  const regionsWithColors = sortedRegions.map((region, idx) => ({
    ...region,
    color: REGION_COLORS[idx % REGION_COLORS.length],
    rank: idx + 1
  }));
  
  // Show cards for top regions, list for the rest
  const topRegions = regionsWithColors.slice(0, 8);
  const remainingRegions = regionsWithColors.slice(8);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Device Geographic Distribution
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visual breakdown of {totalDevices.toLocaleString()} devices across {sortedRegions.length} regions
          </p>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <SummaryCard regions={sortedRegions} totalDevices={totalDevices} />
      
      {/* Region Cards Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Top Regions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
          {topRegions.map((region) => (
            <RegionCard
              key={region.name}
              region={region}
              color={region.color}
              totalDevices={totalDevices}
              rank={region.rank}
            />
          ))}
        </div>
      </div>
      
      {/* Remaining Regions List */}
      {remainingRegions.length > 0 && (
        <RegionList 
          regions={remainingRegions} 
          totalDevices={totalDevices}
          colors={REGION_COLORS}
        />
      )}
      
      {/* Legend */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm flex-wrap gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live data • Updated in real-time</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <span>Top region</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Active regions: {sortedRegions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
