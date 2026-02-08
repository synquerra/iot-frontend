// src/components/analytics/TripHistoryTimeline.jsx
import React, { useState } from 'react';
import { formatDistance, formatDuration } from '../../utils/tripAnalytics';

export default function TripHistoryTimeline({ trips, onTripSelect, loading = false }) {
  const [selectedTripId, setSelectedTripId] = useState(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-gray-500 font-medium">No trip history available</div>
        <div className="text-gray-400 text-sm mt-1">Trips will appear here once detected</div>
      </div>
    );
  }

  const handleTripClick = (trip) => {
    setSelectedTripId(trip.id);
    if (onTripSelect) {
      onTripSelect(trip);
    }
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {trips.slice(0, 10).map((trip, index) => {
        const isSelected = selectedTripId === trip.id;
        const startTime = new Date(trip.startTime);
        const endTime = new Date(trip.endTime);

        return (
          <div
            key={trip.id}
            className={`border rounded p-3 cursor-pointer transition-all ${
              isSelected 
                ? 'border-[#007bff] bg-[#007bff]/5 shadow-sm' 
                : 'border-gray-200 hover:border-[#007bff]/50 hover:bg-gray-50'
            }`}
            onClick={() => handleTripClick(trip)}
          >
            <div className="flex items-start gap-3">
              {/* Trip Number Badge */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                isSelected ? 'bg-[#007bff] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>

              {/* Trip Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-calendar-alt text-[#007bff] text-xs"></i>
                    <span className="text-sm font-semibold text-gray-700">
                      {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#28a745] text-white rounded text-xs font-semibold">
                    {formatDistance(trip.distance)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Start:</span>
                    <span className="text-gray-900 font-medium ml-1">{startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span>
                    <span className="text-gray-900 font-medium ml-1">{endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-900 font-medium ml-1">{formatDuration(trip.duration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Speed:</span>
                    <span className="text-gray-900 font-medium ml-1">{trip.avgSpeed.toFixed(1)} km/h</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Max Speed</div>
                        <div className="text-sm font-bold text-gray-900">{trip.maxSpeed.toFixed(1)} km/h</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Data Points</div>
                        <div className="text-sm font-bold text-gray-900">{trip.points.length}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Device</div>
                        <div className="text-sm font-bold text-gray-900 font-mono">...{trip.deviceImei.slice(-4)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {trips.length > 10 && (
        <div className="text-center py-2 text-xs text-gray-500">
          Showing 10 of {trips.length} trips
        </div>
      )}
    </div>
  );
}
