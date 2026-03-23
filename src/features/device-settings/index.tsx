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
import { DeviceSettingsTabs } from "./components/DeviceSettingsTabs";

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

  useEffect(() => {
    if (!selectedImei) {
      setLatestSettings(null);
      return;
    }

    let isMounted = true;

    const loadLatestSettings = async () => {
      try {
        setIsLoadingLatestSettings(true);
        const response = await getLatestDeviceSettings(selectedImei);
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
  }, [selectedImei]);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.imei === selectedImei) ?? null,
    [devices, selectedImei],
  );

  return (
    <div className="w-full bg-background">
      <div className="space-y-8">
        <DeviceSettingsHeader />
        <DeviceSettingsTargetDeviceCard
          routeImei={routeImei}
          devices={devices}
          selectedImei={selectedImei}
          selectedDevice={selectedDevice}
          isLoadingDevices={isLoadingDevices}
          onSelectImei={setSelectedImei}
        />
        <DeviceSettingsTabs
          selectedImei={selectedImei}
          latestSettings={latestSettings}
          isLoadingLatestSettings={isLoadingLatestSettings}
        />
      </div>
    </div>
  );
}
