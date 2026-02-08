// src/components/analytics/TripAnalyticsSection.jsx
import React, { useMemo, useState } from 'react';
import TripHistoryTimeline from './TripHistoryTimeline';
import FuelEfficiencyChart from './FuelEfficiencyChart';
import { detectTrips, getTripStatistics, calculateIdleTime } from '../../utils/tripAnalytics';

export default function TripAnalyticsSection({ 
  analyticsData, 
  selectedDevice, 
  loading = false 
}) {
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Detect trips from analytics data
  const trips = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return [];
    return detectTrips(analyticsData);
  }, [analyticsData]);

  // Calculate trip statistics
  const tripStats = useMemo(() => {
    if (!trips || trips.length === 0) {
      return {
        totalTrips: 0,
        totalDistance: 0,
        totalDuration: 0,
        avgDistance: 0,
        avgDuration: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        totalFuel: 0
      };
    }
    return getTripStatistics(trips);
  }, [trips]);

  // Calculate idle time
  const idleTimeStats = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return null;
    return calculateIdleTime(analyticsData);
  }, [analyticsData]);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
  };

  return (
    <div className="space-y-4">
      {/* Trip Summary Stats - AdminLTE v3 Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Trips */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#007bff] rounded flex items-center justify-center text-white text-2xl">
              🚗
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Total Trips</div>
              <div className="text-xl font-bold text-gray-900">{tripStats.totalTrips}</div>
              <div className="text-xs text-gray-500">Detected</div>
            </div>
          </div>
        </div>

        {/* Total Distance */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#28a745] rounded flex items-center justify-center text-white text-2xl">
              📏
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Distance</div>
              <div className="text-xl font-bold text-gray-900">{tripStats.totalDistance.toFixed(1)}</div>
              <div className="text-xs text-gray-500">km</div>
            </div>
          </div>
        </div>

        {/* Total Duration */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#ffc107] rounded flex items-center justify-center text-white text-2xl">
              ⏱️
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Duration</div>
              <div className="text-xl font-bold text-gray-900">{Math.floor(tripStats.totalDuration / 60)}</div>
              <div className="text-xs text-gray-500">minutes</div>
            </div>
          </div>
        </div>

        {/* Average Speed */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#17a2b8] rounded flex items-center justify-center text-white text-2xl">
              ⚡
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Avg Speed</div>
              <div className="text-xl font-bold text-gray-900">{(tripStats.avgSpeed || 0).toFixed(1)}</div>
              <div className="text-xs text-gray-500">km/h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Idle Time Stats - AdminLTE v3 Small Boxes */}
      {idleTimeStats && idleTimeStats.totalTime > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Moving Time */}
          <div className="relative overflow-hidden rounded shadow bg-gradient-to-br from-[#28a745] to-[#1e7e34] text-white">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-90">Moving Time</div>
                  <div className="text-3xl font-bold mt-1">{Math.floor(idleTimeStats.movingTime / 60)}</div>
                  <div className="text-xs opacity-75 mt-1">minutes ({idleTimeStats.movingPercentage}%)</div>
                </div>
                <div className="text-5xl opacity-30">🚀</div>
              </div>
            </div>
            <div className="bg-black/20 px-4 py-2">
              <div className="w-full bg-white/30 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full"
                  style={{ width: `${idleTimeStats.movingPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Idle Time */}
          <div className="relative overflow-hidden rounded shadow bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-90">Idle Time</div>
                  <div className="text-3xl font-bold mt-1">{Math.floor(idleTimeStats.idleTime / 60)}</div>
                  <div className="text-xs opacity-75 mt-1">minutes ({idleTimeStats.idlePercentage}%)</div>
                </div>
                <div className="text-5xl opacity-30">⏸️</div>
              </div>
            </div>
            <div className="bg-black/20 px-4 py-2">
              <div className="w-full bg-white/30 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full"
                  style={{ width: `${idleTimeStats.idlePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total Time */}
          <div className="relative overflow-hidden rounded shadow bg-gradient-to-br from-[#007bff] to-[#0056b3] text-white">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-90">Total Time</div>
                  <div className="text-3xl font-bold mt-1">{Math.floor(idleTimeStats.totalTime / 60)}</div>
                  <div className="text-xs opacity-75 mt-1">minutes (100%)</div>
                </div>
                <div className="text-5xl opacity-30">⏰</div>
              </div>
            </div>
            <div className="bg-black/20 px-4 py-2">
              <div className="w-full bg-white/30 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip History and Fuel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trip History Timeline */}
        <div className="bg-white rounded shadow">
          <div className="border-b border-gray-200 px-4 py-3">
            <h4 className="text-base font-semibold text-gray-700">
              <i className="fas fa-history mr-2 text-[#007bff]"></i>
              Trip History
            </h4>
          </div>
          <div className="p-4">
            <TripHistoryTimeline 
              trips={trips} 
              onTripSelect={handleTripSelect}
              loading={loading}
            />
          </div>
        </div>

        {/* Fuel Efficiency Chart */}
        <div className="bg-white rounded shadow">
          <div className="border-b border-gray-200 px-4 py-3">
            <h4 className="text-base font-semibold text-gray-700">
              <i className="fas fa-gas-pump mr-2 text-[#28a745]"></i>
              Fuel Efficiency
            </h4>
          </div>
          <div className="p-4">
            <FuelEfficiencyChart trips={trips} loading={loading} />
          </div>
        </div>
      </div>

      {/* Selected Trip Details */}
      {selectedTrip && (
        <div className="bg-white rounded shadow">
          <div className="border-b border-gray-200 px-4 py-3">
            <h4 className="text-base font-semibold text-gray-700">
              <i className="fas fa-info-circle mr-2 text-[#17a2b8]"></i>
              Selected Trip Details
            </h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Start Time</div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date(selectedTrip.startTime).toLocaleTimeString()}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">End Time</div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date(selectedTrip.endTime).toLocaleTimeString()}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Data Points</div>
                <div className="text-sm font-bold text-gray-900">{selectedTrip.points.length}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Device IMEI</div>
                <div className="text-sm font-bold text-gray-900 font-mono">{selectedTrip.deviceImei}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
