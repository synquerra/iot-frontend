/**
 * AdminLTE v3 Style Speed Distribution Card
 */

import React from 'react';

/**
 * Main Speed Distribution Card Component
 */
export default function SpeedDistributionCard({ speedDistributionData }) {
  const { categories, statistics, dataQuality, totalRecords, validRecords } = speedDistributionData;
  
  // Sort categories by percentage
  const sortedCategories = [...categories].sort((a, b) => b.percentage - a.percentage);
  
  return (
    <div className="space-y-4">
      {/* Speed Categories - Vertical List for Sidebar */}
      <div className="space-y-3">
        {sortedCategories.map((category) => {
          const percentage = category.percentage || 0;
          const count = category.count || 0;
          
          return (
            <div key={category.id} className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-600 uppercase">{category.label}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Cards - Stacked */}
      <div className="space-y-3">
        {/* Average Speed */}
        <div className="bg-gradient-to-br from-[#007bff] to-[#0056b3] rounded shadow text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium opacity-90">Average Speed</div>
              <div className="text-2xl font-bold mt-1">{statistics.average}</div>
              <div className="text-xs opacity-75">km/h</div>
            </div>
            <div className="text-4xl opacity-30">📊</div>
          </div>
        </div>

        {/* Median Speed */}
        <div className="bg-gradient-to-br from-[#28a745] to-[#1e7e34] rounded shadow text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium opacity-90">Median Speed</div>
              <div className="text-2xl font-bold mt-1">{statistics.median}</div>
              <div className="text-xs opacity-75">km/h</div>
            </div>
            <div className="text-4xl opacity-30">📈</div>
          </div>
        </div>

        {/* Top 10% Speed */}
        <div className="bg-gradient-to-br from-[#ffc107] to-[#e0a800] rounded shadow text-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium opacity-90">Top 10%</div>
              <div className="text-2xl font-bold mt-1">{statistics.percentile90}+</div>
              <div className="text-xs opacity-75">km/h</div>
            </div>
            <div className="text-4xl opacity-30">🎯</div>
          </div>
        </div>
      </div>

      {/* Data Quality Info */}
      <div className="bg-white rounded border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">Live Data</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            dataQuality.qualityScore >= 90 ? 'bg-green-500 text-white' :
            dataQuality.qualityScore >= 70 ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {dataQuality.qualityScore}%
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {validRecords.toLocaleString()}/{totalRecords.toLocaleString()} valid records
        </div>
      </div>
    </div>
  );
}
