// src/components/analytics/DeviceHealthSection.jsx
import React, { useMemo } from 'react';
import { ContentSection, SectionDivider } from '../../design-system/components/LayoutComponents';
import { Card } from '../../design-system/components/Card';
import { KpiCard } from '../../design-system/components/KpiCard';
import {
  calculateHealthScore,
  getBatteryTrend,
  getSignalStrength,
  calculateUptime,
  getConnectionQuality,
  formatHealthStatus
} from '../../utils/deviceHealth';

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
      <ContentSection variant="accent" colorScheme="green" padding="lg">
        <Card variant="glass" colorScheme="green" padding="lg">
          <Card.Content>
            <div className="h-64 bg-white/10 rounded-lg animate-pulse"></div>
          </Card.Content>
        </Card>
      </ContentSection>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <ContentSection variant="accent" colorScheme="green" padding="lg">
        <Card variant="glass" colorScheme="green" padding="lg">
          <Card.Content>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-green-200 font-medium">No devices to monitor</div>
            </div>
          </Card.Content>
        </Card>
      </ContentSection>
    );
  }

  return (
    <ContentSection variant="accent" colorScheme="green" padding="lg" spacing="md" bordered={true} elevated={true}>
      <Card 
        variant="glass" 
        padding="lg" 
        colorScheme="green" 
        glowEffect={true}
        className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-green-600/25 via-teal-600/20 to-emerald-600/25 border border-green-400/40"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/8 via-transparent to-teal-500/8 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-green-400/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-8 right-6 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card.Header className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex-1">
              <Card.Title className="text-white text-2xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                Device Health Monitoring
              </Card.Title>
              <Card.Description className="text-green-100/80 mt-1">
                Real-time health metrics, connectivity status, and maintenance predictions
              </Card.Description>
            </div>
            
            <div className="px-4 py-2 bg-white/15 backdrop-blur-xl rounded-lg border border-white/30">
              <div className="text-green-200/80 text-xs font-medium">Monitoring</div>
              <div className="text-white text-sm font-bold">{devices.length} Devices</div>
            </div>
          </div>
        </Card.Header>

        <Card.Content className="pt-6 relative z-10 space-y-8">
          {/* Fleet Overview KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Fleet Health"
              value={`${fleetAverages.avgHealth}%`}
              subtitle="Average health score"
              colorScheme="green"
              trend={fleetAverages.avgHealth >= 70 ? "up" : "down"}
              size="md"
            />
            <KpiCard
              title="Healthy Devices"
              value={fleetAverages.healthyDevices}
              subtitle={`${Math.round((fleetAverages.healthyDevices / devices.length) * 100)}% of fleet`}
              colorScheme="teal"
              size="md"
            />
            <KpiCard
              title="Avg Uptime"
              value={`${fleetAverages.avgUptime}%`}
              subtitle="Last 7 days"
              colorScheme="blue"
              size="md"
            />
            <KpiCard
              title="Critical Devices"
              value={fleetAverages.criticalDevices}
              subtitle="Need attention"
              colorScheme={fleetAverages.criticalDevices > 0 ? "red" : "green"}
              size="md"
            />
          </div>

          <SectionDivider variant="gradient" colorScheme="teal" spacing="md" animated={true} />

          {/* Device Health Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Individual Device Health</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {deviceHealthData.map(({ device, healthScore, signalStrength, uptime, connectionQuality }) => {
                const statusInfo = formatHealthStatus(healthScore.status);
                
                return (
                  <Card
                    key={device.imei}
                    variant="glass"
                    colorScheme={statusInfo.color}
                    padding="md"
                    hover={true}
                    className="transition-all duration-200"
                  >
                    <Card.Content>
                      <div className="space-y-4">
                        {/* Device Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full bg-${statusInfo.color}-500/20 flex items-center justify-center`}>
                              <span className="text-2xl">{statusInfo.icon}</span>
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm">Device {device.imei.slice(-4)}</div>
                              <div className="text-white/70 text-xs">{device.topic || 'Unknown'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-2xl font-bold">{healthScore.overall}%</div>
                            <div className={`text-${statusInfo.color}-300 text-xs font-medium`}>
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>

                        {/* Health Breakdown */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-white/5 rounded-lg">
                            <div className="text-white/60 text-xs mb-1">Battery</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                                <div 
                                  className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${healthScore.breakdown.battery}%` }}
                                />
                              </div>
                              <span className="text-white text-xs font-bold">{healthScore.breakdown.battery}%</span>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-white/5 rounded-lg">
                            <div className="text-white/60 text-xs mb-1">Connectivity</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${healthScore.breakdown.connectivity}%` }}
                                />
                              </div>
                              <span className="text-white text-xs font-bold">{healthScore.breakdown.connectivity}%</span>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-white/5 rounded-lg">
                            <div className="text-white/60 text-xs mb-1">Data Quality</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                                <div 
                                  className="bg-purple-400 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${healthScore.breakdown.dataQuality}%` }}
                                />
                              </div>
                              <span className="text-white text-xs font-bold">{healthScore.breakdown.dataQuality}%</span>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-white/5 rounded-lg">
                            <div className="text-white/60 text-xs mb-1">Uptime</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                                <div 
                                  className="bg-teal-400 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${healthScore.breakdown.uptime}%` }}
                                />
                              </div>
                              <span className="text-white text-xs font-bold">{healthScore.breakdown.uptime}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Signal and Connection */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-sm ${
                                    i < signalStrength.bars ? 'bg-green-400' : 'bg-white/20'
                                  }`}
                                  style={{ height: `${(i + 1) * 4}px` }}
                                />
                              ))}
                            </div>
                            <span className="text-white/80 text-xs">{signalStrength.strength}</span>
                          </div>
                          <div className="text-white/80 text-xs">
                            Uptime: {uptime}%
                          </div>
                          <div className="text-white/80 text-xs">
                            Quality: {connectionQuality.status}
                          </div>
                        </div>

                        {/* Alerts */}
                        {healthScore.alerts.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            {healthScore.alerts.map((alert, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-amber-300 mb-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{alert.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card.Content>
      </Card>
    </ContentSection>
  );
}
