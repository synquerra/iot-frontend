import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  updateAirplaneMode,
  updateLedStatus,
  toggleIncomingCalls,
  toggleAmbientListening,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import type { Device } from "@/features/devices/services/deviceService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { cn } from "@/lib/utils";
import {
  Phone,
  Plane,
  SunMedium,
  Mic,
  StopCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [localIncomingCallEnabled, setLocalIncomingCallEnabled] = useState<boolean | null>(latestSettings?.incoming_call_enabled || null);
  const [localAmbientStatus, setLocalAmbientStatus] = useState<string | null>(null);

  useEffect(() => {
    setLocalAmbientStatus(null);
  }, [latestSettings?.ambient_listening_status]);

  useEffect(() => {
    setLocalLedStatus(selectedDevice?.ledStatus || null);
    setLocalAirplaneMode(selectedDevice?.currentMode || null);
  }, [selectedDevice?.ledStatus, selectedDevice?.currentMode]);

  useEffect(() => {
    setLocalIncomingCallEnabled(latestSettings?.incoming_call_enabled || null);
  }, [latestSettings?.incoming_call_enabled]);

  const handleToggleIncomingCalls = async (on: boolean) => {
    if (!selectedDevice?.imei) {
      toast.error("Device IMEI is missing.");
      return;
    }

    try {
      const action = on ? "Enable" : "Disable";
      setIsLoading(true, `Command sent: ${action} Incoming Calls...`);
      const response = await toggleIncomingCalls({
        imei: selectedDevice.imei,
        status: action,
      });

      if (response.status === "success") {
        setLocalIncomingCallEnabled(on);
        toast.success(response.message || `Incoming calls ${on ? "enabled" : "disabled"} successfully`);
      } else {
        toast.error(response.message || `Failed to ${on ? "enable" : "disable"} incoming calls`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleToggleAmbient = async (status: "Enable" | "Disable" | "Stop") => {
    if (!selectedDevice?.imei) {
      toast.error("Device IMEI is missing.");
      return;
    }
    try {
      setIsLoading(true, `Requesting ambient listening ${status}...`);
      const response = await toggleAmbientListening({ 
        imei: selectedDevice.imei, 
        status 
      });
      if (response.status === "success") {
        toast.success(response.message || `Ambient listening ${status} requested`);
        if (response.data?.status) {
          setLocalAmbientStatus(response.data.status);
        }
      } else {
        toast.error(response.message || `Failed to ${status} ambient listening`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isAirplaneEnabled = localAirplaneMode === "Airplane" || localAirplaneMode === "AirplaneMode" || selectedDevice?.currentMode === "Airplane";
  const isLedOn = localLedStatus === "SwitchOnLed" || localLedStatus === "on";
  const ambientListeningStatus = localAmbientStatus ?? latestSettings?.ambient_listening_status;
  const isListening = ambientListeningStatus === "Enable";

  return (
    <div className={cn(
      "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
      !selectedDevice && "opacity-50 grayscale pointer-events-none"
    )}>
      {/* Incoming Calls Card */}
      <Card className={cn(
        "border transition-all duration-300",
        localIncomingCallEnabled ? "bg-primary/5 border-primary/30" : "bg-card border-border shadow-sm"
      )}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-lg p-2 border",
                localIncomingCallEnabled ? "bg-primary/20 border-primary/30" : "bg-muted border-border"
              )}>
                <Phone className={cn("h-4 w-4", localIncomingCallEnabled ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">Incoming Calls</p>
                <Badge variant={localIncomingCallEnabled ? "default" : "outline"} className="text-[8px] font-black tracking-widest px-1 py-0 h-4">
                  {localIncomingCallEnabled ? "ACTIVE" : "LOCKED"}
                </Badge>
              </div>
            </div>
            <Switch
              disabled={!selectedDevice}
              checked={!!localIncomingCallEnabled}
              onCheckedChange={handleToggleIncomingCalls}
            />
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">Allow or block incoming calls to the device.</p>
        </CardContent>
      </Card>

      {/* Airplane Mode Card */}
      <Card className={cn(
        "border transition-all duration-300",
        isAirplaneEnabled ? "bg-primary/5 border-primary/30" : "bg-card border-border shadow-sm"
      )}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-lg p-2 border",
                isAirplaneEnabled ? "bg-primary/20 border-primary/30" : "bg-muted border-border"
              )}>
                <Plane className={cn("h-4 w-4", isAirplaneEnabled ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">Flight Mode</p>
                <Badge variant={isAirplaneEnabled ? "default" : "outline"} className="text-[8px] font-black tracking-widest px-1 py-0 h-4">
                  {isAirplaneEnabled ? "ACTIVE" : "READY"}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant={isAirplaneEnabled ? "outline" : "default"}
              disabled={!selectedDevice || isAirplaneEnabled}
              onClick={handleAirplaneEnable}
              className="h-7 font-black text-[9px] uppercase px-3"
            >
              {isAirplaneEnabled ? "Locked" : "Enable"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">Deactivate cellular radio for specific transit modes.</p>
        </CardContent>
      </Card>

      {/* LED Card */}
      <Card className={cn(
        "border transition-all duration-300",
        isLedOn ? "bg-primary/5 border-primary/30" : "bg-card border-border shadow-sm"
      )}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-lg p-2 border",
                isLedOn ? "bg-primary/20 border-primary/30" : "bg-muted border-border"
              )}>
                <SunMedium className={cn("h-4 w-4", isLedOn ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">LED</p>
              </div>
            </div>
            <Switch
              disabled={!selectedDevice}
              checked={isLedOn}
              onCheckedChange={handleLedToggle}
            />
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">Control the device status LED for stealth or signaling.</p>
        </CardContent>
      </Card>

      {/* Ambient Listening Card */}
      <Card className={cn(
        "border transition-all duration-300",
        isListening ? "bg-primary/5 border-primary/30" : "bg-card border-border shadow-sm"
      )}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-lg p-2 border",
                isListening ? "bg-primary/20 border-primary/30 text-primary animate-pulse" : "bg-muted border-border"
              )}>
                <Mic className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">Audio Monitor</p>
                <div className="flex items-center gap-1.5">
                   <Badge variant={isListening ? "default" : "outline"} className="text-[8px] font-black tracking-widest px-1 py-0 h-4">
                     {ambientListeningStatus || "READY"}
                   </Badge>
                   {isListening && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
               <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                onClick={() => handleToggleAmbient("Stop")}
                disabled={ambientListeningStatus === "Stop"}
                title="Stop Monitoring"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
              <Switch
                disabled={!selectedDevice}
                checked={isListening}
                onCheckedChange={(on) => handleToggleAmbient(on ? "Enable" : "Disable")}
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">Continuous voice recording & streaming diagnostics.</p>
        </CardContent>
      </Card>
    </div>
  );
}
