import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ActivityBreakdown } from "./components/ActivityBreakdown";

import { DeviceHeader } from "./components/DeviceHeader";
import { DeviceHealthCard } from "./components/DeviceHealthCard";
import { DeviceInfoSummary } from "./components/DeviceInfoSummary";
import { DeviceSettingsSummaryCard } from "./components/DeviceSettingsSummaryCard";
import { GuardiansList } from "./components/GuardiansList";
import { LiveMap } from "./components/LiveMap";

import { NetworkPerformanceCard } from "./components/NetworkPerformanceCard";
import { QuickActions } from "./components/QuickActions";


import { MetricsGrid } from "./components/MetricGrid";
import { MetricCardSkeleton } from "./components/SkeletonItems";
import useDeviceOverview from "./hooks/useDeviceOverview";

export default function DeviceOverviewPage() {
  const { imei } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const { device, deviceStatus, analyticsHealth, deviceSettings, isLoading } = useDeviceOverview(imei ?? "");

  const getStat = (stats: string[] | undefined, key: string) => {
    if (!stats) return 0;
    const stat = stats.find(s => s.startsWith(key));
    return stat ? parseInt(stat.split(':')[1], 10) : 0;
  };

  const data = {
    name: device?.studentName ?? "",
    imei: deviceStatus?.imei ?? device?.imei ?? "",
    status: (deviceStatus?.timestamp ?? device?.createdAt) ? "Online" : "Unknown",
    temperature: deviceStatus?.rawTemperature
      ? parseFloat(String(deviceStatus.rawTemperature))
      : 0,
    battery: deviceStatus?.battery ? Number(deviceStatus.battery) : 0,
    speed: deviceStatus?.speed != null ? Number(deviceStatus.speed) : 0,
    latitude: deviceStatus?.latitude ? Number(deviceStatus.latitude) : 0,
    longitude: deviceStatus?.longitude ? Number(deviceStatus.longitude) : 0,
    signal: deviceStatus?.signal ? Number(deviceStatus.signal) : 0,
    gpsSignal: analyticsHealth?.gpsScore ?? 0,
    performance: analyticsHealth?.temperatureHealthIndex ?? 0,
    lastUpdate: deviceStatus?.timestamp ?? deviceStatus?.deviceTimestamp ?? device?.createdAt ?? new Date().toISOString(),
    guardian1Phone: String(deviceStatus?.rawPhone1 ?? deviceStatus?.rawControlPhone ?? ""),
    guardian2Phone: String(deviceStatus?.rawPhone2 ?? ""),
    dataInterval: String(deviceStatus?.interval ?? device?.interval ?? ""),
    alert: deviceStatus?.alert ?? "Normal",
    crawling: analyticsHealth ? getStat(analyticsHealth.movementStats, 'crawling') : 0,
    stationary: analyticsHealth ? getStat(analyticsHealth.movementStats, 'stationary') : 0,
    overspeeding: analyticsHealth ? getStat(analyticsHealth.movementStats, 'overspeed') : 0,
    settingsNormalInterval: deviceSettings?.raw_NormalSendingInterval ?? "N/A",
    settingsSosInterval: deviceSettings?.raw_SOSSendingInterval ?? "N/A",
    settingsSpeedLimit: deviceSettings?.raw_SpeedLimit ?? "N/A",
    settingsLowBattery: deviceSettings?.raw_LowbatLimit ?? "N/A",
    settingsAirplaneInterval: deviceSettings?.raw_AirplaneInterval ?? "N/A",
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Show skeleton loading state
  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen pb-12 bg-background">
        <DeviceHeader
          name={data.name}
          status={data.status}
          lastUpdate={data.lastUpdate}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <main className="space-y-6">
          <MetricsGrid
            speed={data.speed}
            latitude={data.latitude}
            longitude={data.longitude}
            battery={data.battery}
            signal={data.signal}
          />

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-1">
                <DeviceHealthCard
                  temperature={data.temperature}
                  performance={data.performance}
                  dataInterval={data.dataInterval}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ActivityBreakdown
                  crawling={data.crawling}
                  stationary={data.stationary}
                  overspeeding={data.overspeeding}
                />
                <NetworkPerformanceCard
                  gpsSignal={data.gpsSignal}
                  signal={data.signal}
                />
              </div>

              <LiveMap
                latitude={data.latitude}
                longitude={data.longitude}
                speed={data.speed}
                name={data.name}
                battery={data.battery}
                lastUpdate={data.lastUpdate}
              />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <QuickActions />
              <DeviceSettingsSummaryCard
                normalInterval={data.settingsNormalInterval}
                sosInterval={data.settingsSosInterval}
                speedLimit={data.settingsSpeedLimit}
                lowBattery={data.settingsLowBattery}
                airplaneInterval={data.settingsAirplaneInterval}
              />
              <GuardiansList
                guardian1Phone={data.guardian1Phone}
                guardian2Phone={data.guardian2Phone}
              />

              <DeviceInfoSummary imei={data.imei} />
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
