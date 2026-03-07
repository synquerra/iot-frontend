import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ActivityBreakdown } from "./components/ActivityBreakdown";
import { AlertBanner } from "./components/AlertBanner";
import { DeviceHeader } from "./components/DeviceHeader";
import { DeviceHealthCard } from "./components/DeviceHealthCard";
import { DeviceInfoSummary } from "./components/DeviceInfoSummary";
import { DeviceSettings } from "./components/DeviceSettings";
import { GuardiansList } from "./components/GuardiansList";
import { LiveMap } from "./components/LiveMap";

import { NetworkPerformanceCard } from "./components/NetworkPerformanceCard";
import { QuickActions } from "./components/QuickActions";
import { SafetyStatusCard } from "./components/SafetyStatusCard";

import type { DeviceData } from "@/types";
import { MetricsGrid } from "./components/MetricGrid";
import { MetricCardSkeleton } from "./components/SkeletonItems";
import useDeviceTelemetry from "./hooks/useDeviceTelemetry";

export default function DeviceTelemetryPage() {
  const { imei } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const { device, deviceStatus, isLoading } = useDeviceTelemetry(imei ?? "");

  // Dummy data as fallback
  const dummyData: DeviceData = {
    name: "Leela",
    imei: "8948613516161515",
    status: "Online",
    temperature: 23,
    battery: 66,
    speed: 3,
    latitude: 23.6516,
    longitude: 51.6125,
    signal: 80,
    gpsSignal: 92,
    satellites: 3,
    distance: "6",
    steps: 8554,
    performance: 86,
    lastUpdate: "2024-12-08T14:21:54",
    guardian1: "Rajesh Kumar",
    guardian1Phone: "8641651566",
    guardian2: "Aravind Shukla",
    guardian2Phone: "7915131351",
    dataInterval: "600",
    audioRecording: true,
    aeroplaneMode: false,
    ble: false,
    ledStatus: true,
    currentMode: "Incognito",
    alert: "Normal",
    safetyEvents: 9,
    crawling: 5,
    stationary: 5,
    overspeeding: 5,
    firmware: "v2.1.4",
    storage: 68,
    ram: 42,
  };

  // Safely extract primitive values
  const data: DeviceData = {
    name: device?.studentName ?? dummyData.name + "*",
    imei: device?.imei ?? dummyData.imei + "*",
    status: dummyData.status + "*",
    temperature: Number(
      deviceStatus?.rawTemperature ?? dummyData.temperature + "*",
    ),
    battery: Number(deviceStatus?.battery ?? dummyData.battery + "*"),
    speed: Number(deviceStatus?.speed ?? dummyData.speed + "*"),
    latitude: Number(deviceStatus?.latitude ?? dummyData.latitude + "*"),
    longitude: Number(deviceStatus?.longitude ?? dummyData.longitude + "*"),
    signal: Number(deviceStatus?.signal ?? dummyData.signal + "*"),
    gpsSignal: Number(dummyData.gpsSignal + "*"),
    satellites: Number(dummyData.satellites + "*"),
    distance: String(dummyData.distance + "*"),
    steps: Number(dummyData.steps + "*"),
    performance: Number(dummyData.performance + "*"),
    lastUpdate: device?.createdAt ?? dummyData.lastUpdate + "*",
    guardian1: String(dummyData.guardian1 + "*"),
    guardian1Phone: String(dummyData.guardian1Phone + "*"),
    guardian2: String(dummyData.guardian2 + "*"),
    guardian2Phone: String(dummyData.guardian2Phone + "*"),
    dataInterval: String(device?.interval ?? dummyData.dataInterval + "*"),
    audioRecording: Boolean(dummyData.audioRecording + "*"),
    aeroplaneMode: Boolean(dummyData.aeroplaneMode + "*"),
    ble: Boolean(dummyData.ble + "*"),
    ledStatus: Boolean(dummyData.ledStatus + "*"),
    currentMode: String(dummyData.currentMode + "*"),
    alert: deviceStatus?.alert ?? dummyData.alert + "*",
    safetyEvents: Number(dummyData.safetyEvents + "*"),
    crawling: Number(dummyData.crawling + "*"),
    stationary: Number(dummyData.stationary + "*"),
    overspeeding: Number(dummyData.overspeeding + "*"),
    firmware: String(dummyData.firmware + "*"),
    storage: Number(dummyData.storage + "*"),
    ram: Number(dummyData.ram + "*"),
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
        <DeviceHeader
          name={data.name}
          status={data.status}
          currentMode={data.currentMode}
          lastUpdate={data.lastUpdate}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          <AlertBanner alert={data.alert} />

          <MetricsGrid
            speed={data.speed}
            latitude={data.latitude}
            longitude={data.longitude}
            battery={data.battery}
            signal={data.signal}
            satellites={data.satellites}
            steps={data.steps}
            distance={data.distance}
          />

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 dark:bg-slate-800 p-1">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="network"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                  >
                    Network
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <DeviceHealthCard
                      temperature={data.temperature}
                      performance={data.performance}
                      storage={data.storage}
                      dataInterval={data.dataInterval}
                    />
                    <SafetyStatusCard
                      alert={data.alert}
                      currentMode={data.currentMode}
                      firmware={data.firmware}
                      ram={data.ram}
                      safetyEvents={data.safetyEvents}
                    />
                  </div>

                  <ActivityBreakdown
                    crawling={data.crawling}
                    stationary={data.stationary}
                    overspeeding={data.overspeeding}
                  />
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <LiveMap
                    latitude={data.latitude}
                    longitude={data.longitude}
                    speed={data.speed}
                    satellites={data.satellites}
                    name={data.name}
                    battery={data.battery}
                    lastUpdate={data.lastUpdate}
                  />
                </TabsContent>

                <TabsContent value="network" className="space-y-4">
                  <NetworkPerformanceCard
                    gpsSignal={data.gpsSignal}
                    signal={data.signal}
                    satellites={data.satellites}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <QuickActions />
              <GuardiansList
                guardian1={data.guardian1}
                guardian1Phone={data.guardian1Phone}
                guardian2={data.guardian2}
                guardian2Phone={data.guardian2Phone}
              />
              <DeviceSettings
                audioRecording={data.audioRecording}
                aeroplaneMode={data.aeroplaneMode}
                ble={data.ble}
                ledStatus={data.ledStatus}
              />
              <DeviceInfoSummary imei={data.imei} firmware={data.firmware} />
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
