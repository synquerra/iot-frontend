// src/components/analytics/DeviceHealthSection.jsx
import React, { useMemo } from 'react';
import {
  calculateHealthScore,
  getBatteryTrend,
  getSignalStrength,
  calculateUptime,
  getConnectionQuality,
  formatHealthStatus
} from '../../utils/deviceHealth';
import { getDeviceDisplayNameWithMaskedImei } from '../../utils/deviceDisplay';

export default function DeviceHealthSection({ 
  devices, 
  analyticsData, 
  loading = false 
}) {
  // Calculate health scores for all devices
  const deviceHealthData = useMemo(() => {
    if (!devices || devices.length === 0 || !analyticsData) return [];

    return devices.map(device => {
      const deviceAnalytics = analyticsData.filter(a => 
        a.imei === device.imei
      );
      
      const healthScore = calculateHealthScore(device, deviceAnalytics);
      const signalStrength = getSignalStrength(device, deviceAnalytics);
      const uptime = calculateUptime(device, deviceAnalytics);
      const connectionQuality = getConnectionQuality(deviceAnalytics);

      return {
        device,
        healthScore,
        signalStrength,
        uptime,
        connectionQuality,
        analyticsCount: deviceAnalytics.length
      };
    });
  }, [devices, analyticsData]);

  // Calculate fleet-wide averages
  const fleetAverages = useMemo(() => {
    if (deviceHealthData.length === 0) {
      return {
        avgHealth: 0,
        avgUptime: 0,
        healthyDevices: 0,
        criticalDevices: 0
      };
    }

    const avgHealth = deviceHealthData.reduce((sum, d) => sum + d.healthScore.overall, 0) / deviceHealthData.length;
    const avgUptime = deviceHealthData.reduce((sum, d) => sum + d.uptime, 0) / deviceHealthData.length;
    const healthyDevices = deviceHealthData.filter(d => d.healthScore.overall >= 70).length;
    const criticalDevices = deviceHealthData.filter(d => d.healthScore.overall < 40).length;

    return {
      avgHealth: Math.round(avgHealth),
      avgUptime: Math.round(avgUptime),
      healthyDevices,
      criticalDevices
    };
  }, [deviceHealthData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-gray-500 font-medium">No devices to monitor</div>
        <div className="text-gray-400 text-sm mt-1">Device health data will appear here</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Fleet Overview Stats - Compact for Sidebar */}
      <div className="space-y-2">
        {/* Fleet Health */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded p-3 border-l-4 border-[#28a745]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 font-medium">Fleet Health</div>
              <div className="text-2xl font-bold text-gray-900">{fleetAverages.avgHealth}%</div>
            </div>
            <div className="text-3xl">💚</div>
          </div>
        </div>

        {/* Healthy Devices */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded p-3 border-l-4 border-[#17a2b8]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 font-medium">Healthy Devices</div>
              <div className="text-2xl font-bold text-gray-900">{fleetAverages.healthyDevices}</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        {/* Average Uptime */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded p-3 border-l-4 border-[#6f42c1]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 font-medium">Avg Uptime</div>
              <div className="text-2xl font-bold text-gray-900">{fleetAverages.avgUptime}%</div>
            </div>
            <div className="text-3xl">⏰</div>
          </div>
        </div>

        {/* Critical Devices */}
        <div className={`bg-gradient-to-r rounded p-3 border-l-4 ${
          fleetAverages.criticalDevices > 0 
            ? 'from-red-50 to-red-100 border-[#dc3545]' 
            : 'from-green-50 to-green-100 border-[#28a745]'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 font-medium">Critical</div>
              <div className="text-2xl font-bold text-gray-900">{fleetAverages.criticalDevices}</div>
            </div>
            <div className="text-3xl">{fleetAverages.criticalDevices > 0 ? '⚠️' : '🛡️'}</div>
          </div>
        </div>
      </div>

      {/* Device List - Compact */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Device Status</div>
        {deviceHealthData.slice(0, 5).map(({ device, healthScore }) => {
          const statusInfo = formatHealthStatus(healthScore.status);
          
          return (
            <div key={device.imei} className="bg-white border border-gray-200 rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    healthScore.overall >= 70 ? 'bg-green-100' :
                    healthScore.overall >= 40 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {statusInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{getDeviceDisplayNameWithMaskedImei(device)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{healthScore.overall}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    healthScore.overall >= 70 ? 'bg-[#28a745]' :
                    healthScore.overall >= 40 ? 'bg-[#ffc107]' : 'bg-[#dc3545]'
                  }`}
                  style={{ width: `${healthScore.overall}%` }}
                />
              </div>
            </div>
          );
        })}
        {deviceHealthData.length > 5 && (
          <div className="text-center text-xs text-gray-500 py-2">
            +{deviceHealthData.length - 5} more devices
          </div>
        )}
      </div>
    </div>
  );
}
