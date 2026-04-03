import { listDevices, type Device } from "@/features/devices/services/deviceService";
import {
  getLatestDeviceSettings,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { DeviceSettingsHeader } from "./components/DeviceSettingsHeader";
import { DeviceSettingsTargetDeviceCard } from "./components/DeviceSettingsTargetDeviceCard";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { CommunicationSettings } from "./components/CommunicationSettings";
import { AmbientListeningCard } from "./components/AmbientListeningCard";
import { IntervalsSettings } from "./components/IntervalsSettings";
import { GeneralDeviceControls } from "./components/GeneralDeviceControls";

export default function DeviceSettings() {
  const { imei: routeImei } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [selectedImei, setSelectedImei] = useState(routeImei ?? "");
  const [latestSettings, setLatestSettings] =
    useState<LatestDeviceSettingsRecord | null>(null);
  const [isLoadingLatestSettings, setIsLoadingLatestSettings] = useState(false);

  useEffect(() => {
    setSelectedImei(routeImei ?? "");
  }, [routeImei]);

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      try {
        setIsLoadingDevices(true);
        const response = await listDevices();
        if (!isMounted) {
          return;
        }
        setDevices(response);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load devices";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingDevices(false);
        }
      }
    };

    loadDevices();

    return () => {
      isMounted = false;
    };
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
        setIsLoadingLatestSettings(true);
        const response = await getLatestDeviceSettings(selectedDevice.topic!);
        if (!isMounted) {
          return;
        }
        setLatestSettings(response);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load latest device settings";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingLatestSettings(false);
        }
      }
    };

    loadLatestSettings();

    return () => {
      isMounted = false;
    };
  }, [selectedDevice?.topic]);

  return (
    <div className="w-full bg-background">
      <div className="space-y-6">
        <DeviceSettingsHeader 
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
        
        <GeneralDeviceControls 
           selectedDevice={selectedDevice} 
           latestSettings={latestSettings} 
        />
        
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <CommunicationSettings
            selectedImei={selectedImei}
            latestSettings={latestSettings}
            isLoadingLatestSettings={isLoadingLatestSettings}
          />
          <IntervalsSettings
            selectedImei={selectedImei}
            latestSettings={latestSettings}
          />
        </div>

        <AdvancedSettings />

        <div className="pb-6">
          <AmbientListeningCard />
        </div>
      </div>
    </div>
  );
}
