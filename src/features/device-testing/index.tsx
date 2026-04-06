import { listDevices, type Device } from "@/features/devices/services/deviceService";
import {
  getLatestDeviceSettings,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { DeviceSettingsHeader } from "@/features/device-settings/components/DeviceSettingsHeader";
import { DeviceSettingsTargetDeviceCard } from "@/features/device-settings/components/DeviceSettingsTargetDeviceCard";
import { CompactIntervals } from "./components/CompactIntervals";
import { CompactContacts } from "./components/CompactContacts";
import { TestingResultsConsole } from "./components/TestingResultsConsole";
import { GeofenceSettings } from "./components/GeofenceSettings";
import { TestingActionCenter } from "./components/TestingActionCenter";
import { FlaskConical } from "lucide-react";

export default function DeviceTesting() {
  const { imei: routeImei } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [selectedImei, setSelectedImei] = useState(routeImei ?? "");
  const [latestSettings, setLatestSettings] =
    useState<LatestDeviceSettingsRecord | null>(null);

  useEffect(() => {
    setSelectedImei(routeImei ?? "");
  }, [routeImei]);

  useEffect(() => {
    let isMounted = true;
    const loadDevices = async () => {
      try {
        setIsLoadingDevices(true);
        const response = await listDevices();
        if (!isMounted) return;
        setDevices(response);
      } catch (error) {
        toast.error("Failed to load devices");
      } finally {
        if (isMounted) setIsLoadingDevices(false);
      }
    };
    loadDevices();
    return () => { isMounted = false; };
  }, []);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.imei === selectedImei) ?? null,
    [devices, selectedImei],
  );

  useEffect(() => {
    if (!selectedDevice?.topic) {
      setLatestSettings(null);
      return;
    }
    let isMounted = true;
    const loadLatestSettings = async () => {
      try {
        const response = await getLatestDeviceSettings(selectedDevice.topic!);
        if (!isMounted) return;
        setLatestSettings(response);
      } catch (error) {
        toast.error("Failed to load device heartbeats");
      }
    };
    loadLatestSettings();
    return () => { isMounted = false; };
  }, [selectedDevice?.topic]);

  return (
    <div className="w-full bg-background pb-10">
      <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6">
        <DeviceSettingsHeader
          title="Device Testing Dashboard"
          currentMode={selectedDevice?.currentMode}
        />

        <DeviceSettingsTargetDeviceCard
          routeImei={routeImei}
          devices={devices}
          selectedImei={selectedImei}
          selectedDevice={selectedDevice}
          isLoadingDevices={isLoadingDevices}
          onSelectImei={setSelectedImei}
          currentMode={selectedDevice?.currentMode}
        />

        {/* Dashboard Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {/* Column 1: Configs */}
           <div className="space-y-5">
              <CompactIntervals selectedImei={selectedImei} latestSettings={latestSettings} />
              <CompactContacts latestSettings={latestSettings} />
           </div>

           {/* Column 2: Spatial */}
           <div className="h-full">
              <GeofenceSettings topic={selectedDevice?.topic} />
           </div>

           {/* Column 3: Control */}
           <div className="h-full">
              <TestingActionCenter 
                topic={selectedDevice?.topic} 
                currentMode={selectedDevice?.currentMode} 
                ledStatus={selectedDevice?.ledStatus}
              />
           </div>
        </div>

        {/* Unified Results Console */}
        <div className="mt-2">
           <TestingResultsConsole topic={selectedDevice?.topic} />
        </div>

        {/* Context Footer */}
        <div className="flex items-center gap-4 text-muted-foreground/60 border-t border-primary/5 pt-6">
           <FlaskConical size={14} />
           <p className="text-[10px] uppercase font-bold tracking-widest">
             Engineering Mode View-Only • Telemetry Monitoring • SYN-SECURE-ID
           </p>
        </div>
      </div>
    </div>
  );
}
