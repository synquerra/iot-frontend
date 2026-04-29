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
      "border-border shadow-sm h-full flex flex-col transition-opacity duration-300 bg-card rounded-xl",
      !selectedDevice && "opacity-50 grayscale pointer-events-none"
    )}>
      <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/5">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Settings className="h-5 w-5 text-primary" />
            Hardware Diagnostics
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            {!selectedDevice 
              ? "Select a device to enable controls" 
              : "Direct hardware command center"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Call Controls (Placeholder/Future) */}
          <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20 opacity-40">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-background p-2 border border-border">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">Call Controls</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Restricted</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs font-bold" disabled>Enable</Button>
            </div>
          </div>

          {/* Airplane Mode */}
          <div className={cn(
            "space-y-4 rounded-xl border p-4 transition-all",
            isAirplaneEnabled ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/20"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-lg p-2 border",
                  isAirplaneEnabled ? "bg-primary/20 border-primary/30" : "bg-muted border-border"
                )}>
                  <Plane className={cn("h-4 w-4", isAirplaneEnabled ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Airplane Mode</p>
                  <div className="flex items-center gap-1">
                    {isAirplaneEnabled ? (
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground/40" />
                    )}
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", isAirplaneEnabled ? "text-primary" : "text-muted-foreground")}>
                      {isAirplaneEnabled ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Status</span>
              <Button
                size="sm"
                variant={isAirplaneEnabled ? "outline" : "default"}
                disabled={!selectedDevice || isAirplaneEnabled}
                onClick={handleAirplaneEnable}
                className="h-8 font-bold text-[10px] uppercase tracking-wider px-4"
              >
                {isAirplaneEnabled ? "Active" : "Enable"}
              </Button>
            </div>
          </div>

          {/* LED Controls */}
          <div className={cn(
            "space-y-4 rounded-xl border p-4 transition-all",
            isLedOn ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/20"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-lg p-2 border",
                  isLedOn ? "bg-primary/20 border-primary/30" : "bg-muted border-border"
                )}>
                  <SunMedium className={cn("h-4 w-4", isLedOn ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-semibold text-sm">LED Indicator</p>
                  <div className="flex items-center gap-1">
                    {isLedOn ? (
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground/40" />
                    )}
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", isLedOn ? "text-primary" : "text-muted-foreground")}>
                      {isLedOn ? "Active" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Toggle</span>
              <Switch
                disabled={!selectedDevice}
                checked={isLedOn}
                onCheckedChange={handleLedToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
