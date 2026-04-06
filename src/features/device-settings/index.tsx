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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        
        <Tabs defaultValue="intervals" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 h-auto p-1 gap-1">
            <TabsTrigger value="intervals" className="py-2.5 font-bold data-[state=active]:shadow-md">Time & Alerts</TabsTrigger>
            <TabsTrigger value="communication" className="py-2.5 font-bold data-[state=active]:shadow-md">Contacts</TabsTrigger>
            <TabsTrigger value="ambient" className="py-2.5 font-bold data-[state=active]:shadow-md">Ambient Listening</TabsTrigger>
            <TabsTrigger value="advanced" className="py-2.5 font-bold data-[state=active]:shadow-md">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="communication" className="mt-6">
            <CommunicationSettings
              selectedImei={selectedImei}
              latestSettings={latestSettings}
              isLoadingLatestSettings={isLoadingLatestSettings}
            />
          </TabsContent>
          
          <TabsContent value="intervals" className="mt-6">
            <IntervalsSettings
              selectedImei={selectedImei}
              latestSettings={latestSettings}
            />
          </TabsContent>

          <TabsContent value="ambient" className="mt-6">
            <AmbientListeningCard />
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <AdvancedSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
