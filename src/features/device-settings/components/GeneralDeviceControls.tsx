import { Button, Switch, Box, Text, Group, Card } from "@mantine/core";
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
import { Phone, Plane, SunMedium, Mic, StopCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { useEffect, useState } from "react";

type Props = {
  selectedDevice: Device | null;
  latestSettings: LatestDeviceSettingsRecord | null;
};

export function GeneralDeviceControls({ selectedDevice, latestSettings }: Props) {
  const { setIsLoading } = useGlobalLoading();
  const [localLedStatus, setLocalLedStatus] = useState<string | null>(null);
  const [localAirplaneMode, setLocalAirplaneMode] = useState<string | null>(null);
  const [localCallEnabled, setLocalCallEnabled] = useState<boolean | null>(null);
  const [localAmbientStatus, setLocalAmbientStatus] = useState<string | null>(null);

  useEffect(() => {
    setLocalLedStatus(selectedDevice?.ledStatus ?? null);
    setLocalAirplaneMode(selectedDevice?.currentMode ?? null);
  }, [selectedDevice?.ledStatus, selectedDevice?.currentMode]);

  useEffect(() => {
    setLocalCallEnabled(latestSettings?.incoming_call_enabled ?? null);
  }, [latestSettings?.incoming_call_enabled]);

  useEffect(() => {
    setLocalAmbientStatus(null);
  }, [latestSettings?.ambient_listening_status]);

  const isAirplane = localAirplaneMode === "Airplane" || localAirplaneMode === "AirplaneMode";
  const isLedOn = localLedStatus === "SwitchOnLed" || localLedStatus === "on";
  const ambientStatus = localAmbientStatus ?? latestSettings?.ambient_listening_status;
  const isListening = ambientStatus === "Enable";

  const handleCalls = async (on: boolean) => {
    if (!selectedDevice?.imei) return toast.error("Device IMEI missing");
    try {
      setIsLoading(true, `${on ? "Enabling" : "Disabling"} incoming calls...`);
      const res = await toggleIncomingCalls({ imei: selectedDevice.imei, status: on ? "Enable" : "Disable" });
      if (res.status === "success") {
        setLocalCallEnabled(on);
        toast.success(res.message || `Calls ${on ? "enabled" : "disabled"}`);
      } else toast.error(res.message || "Failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setIsLoading(false); }
  };

  const handleAirplane = async () => {
    if (!selectedDevice?.topic) return toast.error("Device topic missing");
    try {
      setIsLoading(true, "Activating flight mode...");
      const res = await updateAirplaneMode({ topic: selectedDevice.topic });
      if (res.status === "success") {
        if (res.data?.mode) setLocalAirplaneMode(res.data.mode);
        toast.success(res.message || "Flight mode enabled");
      } else toast.error(res.message || "Failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setIsLoading(false); }
  };

  const handleLed = async (on: boolean) => {
    if (!selectedDevice?.topic) return toast.error("Device topic missing");
    try {
      setIsLoading(true, "Updating LED...");
      const res = await updateLedStatus({ topic: selectedDevice.topic, LED: on ? "SwitchOnLed" : "SwitchOffLed" });
      if (res.status === "success") {
        if (res.data?.LED) setLocalLedStatus(res.data.LED);
        toast.success(res.message || `LED ${on ? "on" : "off"}`);
      } else toast.error(res.message || "Failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setIsLoading(false); }
  };

  const handleAmbient = async (status: "Enable" | "Disable" | "Stop") => {
    if (!selectedDevice?.imei) return toast.error("Device IMEI missing");
    try {
      setIsLoading(true, `${status === "Stop" ? "Stopping" : status === "Enable" ? "Enabling" : "Disabling"} audio monitor...`);
      const res = await toggleAmbientListening({ imei: selectedDevice.imei, status });
      if (res.status === "success") {
        if (res.data?.status) setLocalAmbientStatus(res.data.status);
        toast.success(res.message || `Audio monitor ${status.toLowerCase()}`);
      } else toast.error(res.message || "Failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setIsLoading(false); }
  };

  const disabled = !selectedDevice;

  const controls = [
    {
      id: "incoming-calls",
      icon: Phone,
      label: "Incoming Calls",
      description: "Allow calls to device",
      isOn: !!localCallEnabled,
      activeColor: "text-emerald-600 dark:text-emerald-400",
      activeBg: "bg-emerald-500/10 border-emerald-500/20",
      control: (
        <Switch
          disabled={disabled}
          checked={!!localCallEnabled}
          onChange={(e) => handleCalls(e.currentTarget.checked)}
        />
      ),
    },
    {
      id: "flight-mode",
      icon: Plane,
      label: "Flight Mode",
      description: isAirplane ? "Radio disabled" : "Cellular active",
      isOn: isAirplane,
      activeColor: "text-indigo-600 dark:text-indigo-400",
      activeBg: "bg-indigo-500/10 border-indigo-500/20",
      control: (
        <Button
          size="compact-xs"
          variant={isAirplane ? "light" : "outline"}
          disabled={disabled || isAirplane}
          onClick={handleAirplane}
          className="font-bold uppercase tracking-wide"
        >
          {isAirplane ? "Active" : "Enable"}
        </Button>
      ),
    },
    {
      id: "led-status",
      icon: SunMedium,
      label: "Status LED",
      description: isLedOn ? "Indicator on" : "Indicator off",
      isOn: isLedOn,
      activeColor: "text-amber-600 dark:text-amber-400",
      activeBg: "bg-amber-500/10 border-amber-500/20",
      control: (
        <Switch
          disabled={disabled}
          checked={isLedOn}
          onChange={(e) => handleLed(e.currentTarget.checked)}
        />
      ),
    },
    {
      id: "audio-monitor",
      icon: Mic,
      label: "Audio Monitor",
      description: isListening ? "Streaming live" : "Standby",
      isOn: isListening,
      activeColor: "text-rose-600 dark:text-rose-400",
      activeBg: "bg-rose-500/10 border-rose-500/20",
      control: (
        <Group gap="xs" align="center">
          <Button
            variant="subtle"
            color="red"
            size="compact-xs"
            px={4}
            onClick={() => handleAmbient("Stop")}
            title="Hard Reset / Stop Monitoring"
            disabled={disabled || ambientStatus === "Stop"}
          >
            <StopCircle className="h-3.5 w-3.5" />
          </Button>
          <Switch
            disabled={disabled}
            checked={isListening}
            onChange={(e) => handleAmbient(e.currentTarget.checked ? "Enable" : "Disable")}
          />
        </Group>
      ),
    },
  ];

  return (
    <Box className={cn(
      "grid grid-cols-2 lg:grid-cols-4 gap-3",
      disabled && "opacity-50 grayscale pointer-events-none"
    )}>
      {controls.map((ctrl) => {
        const Icon = ctrl.icon;
        return (
          <Card
            key={ctrl.id}
            withBorder
            radius="md"
            padding="sm"
            className={cn(
              "bg-card flex flex-col gap-3 transition-all shadow-sm",
              ctrl.isOn ? cn("border", ctrl.activeBg) : "border-border"
            )}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box className={cn(
                "p-1.5 rounded-lg border",
                ctrl.isOn ? cn(ctrl.activeBg) : "bg-muted border-border"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  ctrl.isOn ? ctrl.activeColor : "text-muted-foreground"
                )} />
              </Box>
              {ctrl.control}
            </Group>
            <Box>
              <Text size="xs" fw={700} className="leading-tight">{ctrl.label}</Text>
              <Text size="0.6rem" c="dimmed" className="leading-tight mt-1">{ctrl.description}</Text>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
