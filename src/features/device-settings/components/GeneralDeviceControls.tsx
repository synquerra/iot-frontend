import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateAirplaneMode,
  updateLedStatus,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import type { Device } from "@/features/devices/services/deviceService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { cn } from "@/lib/utils";
import {
  Phone,
  Plane,
  Settings,
  SunMedium,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

type GeneralDeviceControlsProps = {
  selectedDevice: Device | null;
  latestSettings: LatestDeviceSettingsRecord | null;
};

export function GeneralDeviceControls({
  selectedDevice,
  latestSettings,
}: GeneralDeviceControlsProps) {
  const { setIsLoading } = useGlobalLoading();
  const [localLedStatus, setLocalLedStatus] = useState<string | null>(selectedDevice?.ledStatus || null);
  const [localAirplaneMode, setLocalAirplaneMode] = useState<string | null>(selectedDevice?.currentMode || null);

  useEffect(() => {
    setLocalLedStatus(selectedDevice?.ledStatus || null);
    setLocalAirplaneMode(selectedDevice?.currentMode || null);
  }, [selectedDevice?.ledStatus, selectedDevice?.currentMode]);

  const handleAirplaneEnable = async () => {
    if (!selectedDevice?.topic) {
      toast.error("Device topic is missing.");
      return;
    }

    try {
      setIsLoading(true, "Activating flight mode...");
      const response = await updateAirplaneMode({
        topic: selectedDevice.topic,
      });

      if (response.status === "success") {
        if (response.data?.mode) {
          setLocalAirplaneMode(response.data.mode);
        }
        toast.success(response.message || "Airplane mode enabled successfully");
      } else {
        toast.error(response.message || "Failed to enable airplane mode");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLedToggle = async (on: boolean) => {
    if (!selectedDevice?.topic) {
      toast.error("Device topic is missing.");
      return;
    }

    try {
      setIsLoading(true, "Please wait");
      const response = await updateLedStatus({
        topic: selectedDevice.topic,
        LED: on ? "SwitchOnLed" : "SwitchOffLed",
      });

      if (response.status === "success") {
        // Update local state from response data
        if (response.data?.LED) {
          setLocalLedStatus(response.data.LED);
        }
        toast.success(response.message || `LED ${on ? "switched on" : "switched off"} successfully`);
      } else {
        toast.error(response.message || "Failed to update LED status");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isAirplaneEnabled = localAirplaneMode === "Airplane" || localAirplaneMode === "AirplaneMode" || selectedDevice?.currentMode === "Airplane";
  const isLedOn = localLedStatus === "SwitchOnLed" || localLedStatus === "on";

  return (
    <Card className={cn(
      "border-primary/10 shadow-sm h-full flex flex-col transition-opacity duration-300",
      !selectedDevice && "opacity-50 grayscale pointer-events-none"
    )}>
      <CardHeader className="pb-4 border-b border-primary/5 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            General Controls
          </CardTitle>
          <CardDescription>
            {!selectedDevice 
              ? "Select a device to enable controls" 
              : "Always visible primary device toggle commands"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Call Controls (Disabled) */}
          <div className="space-y-4 rounded-lg border p-4 opacity-30 grayscale transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Call Controls</p>
                  <p className="text-xs text-muted-foreground">Allow or block calls</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled>Enable</Button>
              <Button size="sm" variant="outline" disabled>Disable</Button>
            </div>
          </div>

          {/* Airplane Mode */}
          <div className={`space-y-4 rounded-lg border p-4 transition-colors hover:border-primary/30 ${isAirplaneEnabled ? "bg-orange-500/5 border-orange-500/20" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${isAirplaneEnabled ? "bg-orange-500/20" : "bg-primary/10"}`}>
                  <Plane className={`h-4 w-4 ${isAirplaneEnabled ? "text-orange-600" : "text-primary"}`} />
                </div>
                <div>
                  <p className="font-medium">Airplane Mode</p>
                  <div className="flex items-center gap-1">
                    {isAirplaneEnabled ? (
                      <CheckCircle2 className="h-3 w-3 text-orange-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground/50" />
                    )}
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isAirplaneEnabled ? "text-orange-600" : "text-muted-foreground"}`}>
                      {isAirplaneEnabled ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground font-medium italic">Command Status</span>
              <Button
                size="sm"
                variant={isAirplaneEnabled ? "secondary" : "default"}
                disabled={!selectedDevice || isAirplaneEnabled}
                onClick={handleAirplaneEnable}
                className={cn(
                  "font-bold text-[10px] uppercase tracking-wider",
                  isAirplaneEnabled ? "bg-orange-500/20 text-orange-600 hover:bg-orange-500/20" : "bg-orange-500 hover:bg-orange-600"
                )}
              >
                {isAirplaneEnabled ? "Flight Mode Active" : "Enable Flight Mode"}
              </Button>
            </div>
          </div>

          {/* LED Controls */}
          <div className={`space-y-4 rounded-lg border p-4 transition-colors hover:border-primary/30 ${isLedOn ? "bg-blue-500/5 border-blue-500/20" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${isLedOn ? "bg-blue-500/20" : "bg-primary/10"}`}>
                  <SunMedium className={`h-4 w-4 ${isLedOn ? "text-blue-600" : "text-primary"}`} />
                </div>
                <div>
                  <p className="font-medium">LED Status</p>
                  <div className="flex items-center gap-1">
                    {isLedOn ? (
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground/50" />
                    )}
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLedOn ? "text-blue-600" : "text-muted-foreground"}`}>
                      {isLedOn ? "Lit" : "Off"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground font-medium italic">Toggle Status</span>
              <Switch
                disabled={!selectedDevice}
                checked={isLedOn}
                onCheckedChange={handleLedToggle}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
