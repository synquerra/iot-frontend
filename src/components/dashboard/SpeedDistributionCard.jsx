/**
 * Enhanced Speed Distribution Card
 * 
 * A visually intuitive speed distribution display with:
 * - Large, easy-to-read category cards
 * - Color-coded visual indicators
 * - Prominent statistics
 * - Clear data quality status
 */

import React from 'react';
import { cn } from '../../design-system/utils/cn';

/**
 * Individual Speed Category Card
 */
function SpeedCategoryCard({ category, isHighlighted }) {
  const percentage = category.percentage || 0;
  const count = category.count || 0;
  
  // Determine card size based on percentage
  const getCardSize = () => {
    if (percentage >= 30) return 'large';
    if (percentage >= 15) return 'medium';
    return 'small';
  };
  
  const size = getCardSize();
  
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-500',
        'hover:scale-105 hover:shadow-2xl cursor-pointer',
        'border-2',
        size === 'large' && 'col-span-2 row-span-2',
        size === 'medium' && 'col-span-1 row-span-1',
        size === 'small' && 'col-span-1 row-span-1'
      )}
      style={{
        backgroundColor: `${category.color}20`,
        borderColor: `${category.color}60`,
        boxShadow: `0 8px 32px ${category.color}30`
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${category.gradient[0]} 0%, ${category.gradient[1]} 100%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-4xl mb-2">{category.icon}</div>
            <h3 
              className="text-xl font-bold mb-1"
              style={{ color: category.color }}
            >
              {category.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {category.range}
            </p>
          </div>
          
          {/* Percentage Badge */}
          <div 
            className="px-4 py-2 rounded-xl font-bold text-lg"
            style={{
              backgroundColor: `${category.color}40`,
              color: category.color
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
                backgroundColor: category.color,
                boxShadow: `0 0 10px ${category.color}80`
              }}
            />
          </div>
        </div>
        
        {/* Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {category.description}
          </span>
          <span 
            className="text-2xl font-bold"
            style={{ color: category.color }}
          >
            {count.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white dark:bg-black opacity-0 hover:opacity-10 transition-opacity duration-300" />
    </div>
  );
}

/**
 * Statistics Summary Card
 */
function StatsSummaryCard({ statistics, dataQuality }) {
  const stats = [
    {
      label: 'Average',
      value: `${statistics.average} km/h`,
      icon: '📊',
      color: '#3b82f6'
    },
    {
      label: 'Median',
      value: `${statistics.median} km/h`,
      icon: '📈',
      color: '#8b5cf6'
    },
    {
      label: 'Top 10%',
      value: `${statistics.percentile90}+ km/h`,
      icon: '🎯',
      color: '#f59e0b'
    }
  ];
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Speed Statistics</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Quality:</span>
          <div 
            className={cn(
              'px-3 py-1 rounded-lg font-bold text-sm',
              dataQuality.qualityScore >= 90 && 'bg-green-500/20 text-green-400',
              dataQuality.qualityScore >= 70 && dataQuality.qualityScore < 90 && 'bg-amber-500/20 text-amber-400',
              dataQuality.qualityScore < 70 && 'bg-red-500/20 text-red-400'
            )}
          >
            {dataQuality.qualityScore}%
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
        <div>
          <div className="text-sm text-slate-400 mb-1">Speed Range</div>
          <div className="text-lg font-bold text-white">
            {statistics.min} - {statistics.max} km/h
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-400 mb-1">Valid Data</div>
          <div className="text-lg font-bold text-white">
            {statistics.count.toLocaleString()} records
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Data Quality Alert
 */
function DataQualityAlert({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  
  const criticalWarnings = warnings.filter(w => w.level === 'error' || w.level === 'warning');
  
  if (criticalWarnings.length === 0) return null;
  
  return (
    <div className="mb-6">
      {criticalWarnings.map((warning, idx) => (
        <div
          key={`warning-${warning.level}-${warning.message.substring(0, 20)}-${idx}`}
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border-2 mb-2',
            warning.level === 'error' && 'bg-red-500/10 border-red-500/50 text-red-400',
            warning.level === 'warning' && 'bg-amber-500/10 border-amber-500/50 text-amber-400'
          )}
        >
          <span className="text-2xl">{warning.icon}</span>
          <span className="font-medium">{warning.message}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Speed Distribution Card Component
 */
export default function SpeedDistributionCard({ speedDistributionData }) {
  const { categories, statistics, dataQuality, totalRecords, validRecords } = speedDistributionData;
  
  // Sort categories by percentage for better visual hierarchy
  const sortedCategories = [...categories].sort((a, b) => b.percentage - a.percentage);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Speed Distribution Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visual breakdown of vehicle speeds across {totalRecords.toLocaleString()} data points
          </p>
        </div>
      </div>
      
      {/* Data Quality Alerts */}
      <DataQualityAlert warnings={dataQuality.warnings} />
      
      {/* Statistics Summary */}
      <StatsSummaryCard statistics={statistics} dataQuality={dataQuality} />
      
      {/* Category Cards Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Speed Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
          {sortedCategories.map((category, idx) => (
            <SpeedCategoryCard
              key={category.id}
              category={category}
              isHighlighted={idx === 0}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live data • Updated in real-time</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {validRecords}/{totalRecords} valid records ({totalRecords > 0 ? ((validRecords/totalRecords)*100).toFixed(1) : '0.0'}%)
          </div>
        </div>
      </div>
    </div>
  );
}
