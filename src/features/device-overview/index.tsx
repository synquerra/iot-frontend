import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ActivityBreakdown } from "./components/ActivityBreakdown";

import { DeviceHeader } from "./components/DeviceHeader";
import { DeviceHealthCard } from "./components/DeviceHealthCard";
import { DeviceSettingsSummaryCard } from "./components/DeviceSettingsSummaryCard";
import { GuardiansList } from "./components/GuardiansList";


import { NetworkPerformanceCard } from "./components/NetworkPerformanceCard";


import { MetricsGrid } from "./components/MetricGrid";
import { MetricCardSkeleton } from "./components/SkeletonItems";
import { DeviceAlertsHistory } from "./components/DeviceAlertsHistory";
import useDeviceOverview from "./hooks/useDeviceOverview";

export default function DeviceOverviewPage() {
  const { imei } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const { device, deviceStatus, analyticsHealth, deviceSettings, isLoading, refresh } = useDeviceOverview(imei ?? "");

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
    gpsSignalRaw: deviceStatus?.gps_strength ?? "Unknown",
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
    geoid: device?.geoid ?? null,
    settingsNormalInterval: deviceSettings?.raw_NormalSendingInterval ?? "N/A",
    settingsSosInterval: deviceSettings?.raw_SOSSendingInterval ?? "N/A",
    settingsSpeedLimit: deviceSettings?.raw_SpeedLimit ?? "N/A",
    settingsLowBattery: deviceSettings?.raw_LowbatLimit ?? "N/A",
    settingsTempLimit: deviceSettings?.raw_temperature ?? "N/A",
    settingsAirplaneInterval: deviceSettings?.raw_AirplaneInterval ?? "N/A",
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Show skeleton loading state
  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background transition-colors duration-500 pb-16">
        <DeviceHeader
          name={data.name}
          imei={data.imei}
          status={data.status}
          lastUpdate={data.lastUpdate}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <main className="relative z-20 space-y-6">
          <MetricsGrid
            speed={data.speed}
            latitude={data.latitude}
            longitude={data.longitude}
            battery={data.battery}
            signal={data.signal}
            temperature={data.temperature}
            geoid={data.geoid}
            name={data.name}
            imei={data.imei}
            lastUpdate={data.lastUpdate}
            lowBatLimit={data.settingsLowBattery !== "N/A" ? parseInt(data.settingsLowBattery) : 30}
            tempLimit={data.settingsTempLimit !== "N/A" ? parseInt(data.settingsTempLimit) : 50}
          />

          <div className="grid gap-8 lg:grid-cols-12 items-start">

            {/* Left Column - Tactical Live Map */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <ActivityBreakdown
                crawling={data.crawling}
                stationary={data.stationary}
                overspeeding={data.overspeeding}
              />
              <DeviceAlertsHistory imei={data.imei} deviceName={data.name} />


            </div>

            {/* Right Column - System Controls & Intelligence */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <DeviceSettingsSummaryCard
                normalInterval={data.settingsNormalInterval}
                sosInterval={data.settingsSosInterval}
                speedLimit={data.settingsSpeedLimit}
                lowBattery={data.settingsLowBattery}
                airplaneInterval={data.settingsAirplaneInterval}
                temperatureLimit={data.settingsTempLimit}
              />

              <div className="grid gap-8 sm:grid-cols-1">

                <NetworkPerformanceCard
                  gpsSignal={data.gpsSignal}
                  gpsSignalRaw={data.gpsSignalRaw}
                  signal={data.signal}
                />

                {/* Legacy Maintenance Layer */}
                <div className="opacity-30 pointer-events-none grayscale hover:opacity-100 transition-opacity duration-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">Legacy Performance Matrix</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <DeviceHealthCard
                    performance={data.performance}
                    dataInterval={data.dataInterval}
                  />
                </div>
              </div>

              <GuardiansList
                guardian1Phone={data.guardian1Phone}
                guardian2Phone={data.guardian2Phone}
              />
            </div>
          </div>


        </main>
      </div>
    </TooltipProvider>
  );
}
