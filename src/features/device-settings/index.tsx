import { listDevices, type Device } from "@/features/devices/services/deviceService";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { DeviceSettingsHeader } from "./components/DeviceSettingsHeader";
import { DeviceSettingsStats } from "./components/DeviceSettingsStats";
import { DeviceSettingsTargetDeviceCard } from "./components/DeviceSettingsTargetDeviceCard";
import { DeviceSettingsTabs } from "./components/DeviceSettingsTabs";

export default function DeviceSettings() {
  const { imei: routeImei } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [selectedImei, setSelectedImei] = useState(routeImei ?? "");

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto space-y-8">
        <DeviceSettingsHeader />
        <DeviceSettingsTargetDeviceCard
          routeImei={routeImei}
          devices={devices}
          selectedImei={selectedImei}
          selectedDevice={selectedDevice}
          isLoadingDevices={isLoadingDevices}
          onSelectImei={setSelectedImei}
        />
        <DeviceSettingsStats />
        <DeviceSettingsTabs selectedImei={selectedImei} />
      </div>
    </div>
  );
}
