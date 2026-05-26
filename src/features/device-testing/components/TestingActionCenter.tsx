import { useState, useEffect } from "react";
import { Button, Switch, Card, Badge, Group, Text, Box, ActionIcon } from "@mantine/core";
import {
  Phone,
  Plane,
  SunMedium,
  Square,
  Search,
  FlaskConical,
  Mic,
  StopCircle,
} from "lucide-react";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { toast } from "@/lib/toast";
import {
  updateAirplaneMode,
  updateLedStatus,
  toggleIncomingCalls,
  toggleAmbientListening,
} from "@/features/device-settings/services/deviceSettingsService";
import { cn } from "@/lib/utils";

interface TestingActionCenterProps {
  imei?: string | null;
  topic?: string | null;
  currentMode?: string | null;
  ledStatus?: string | null;
  incomingCallEnabled?: boolean | null;
  ambientListeningStatus?: string | null;
}

export function TestingActionCenter({
  imei,
  topic,
  currentMode,
  ledStatus,
  incomingCallEnabled,
  ambientListeningStatus: propStatus,
}: TestingActionCenterProps) {
  const { setIsLoading } = useGlobalLoading();
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  useEffect(() => {
    setLocalStatus(null);
  }, [propStatus]);

  const ambientListeningStatus = localStatus ?? propStatus;

  const handleToggleIncomingCalls = async (on: boolean) => {
    if (!imei) return toast.error("Device IMEI missing.");
    try {
      const action = on ? "Enable" : "Disable";
      setIsLoading(true, `${on ? "Enabling" : "Disabling"} incoming calls...`);
      const response = await toggleIncomingCalls({ imei, status: action });
      if (response.status === "success") {
        toast.success(response.message || `Incoming calls ${on ? "enabled" : "disabled"}`);
      } else {
        toast.error(response.message || `Failed to ${on ? "enable" : "disable"}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAmbient = async (status: "Enable" | "Disable" | "Stop") => {
    if (!imei) return toast.error("Device IMEI missing.");
    try {
      setIsLoading(true, `Requesting ${status.toLowerCase()} monitor...`);
      const response = await toggleAmbientListening({ imei, status });
      if (response.status === "success") {
        toast.success(response.message || `Monitor ${status.toLowerCase()} requested`);
        if (response.data?.status) setLocalStatus(response.data.status);
      } else {
        toast.error(response.message || `Failed to ${status}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAirplaneEnable = async () => {
    if (!topic) return toast.error("Device topic missing.");
    try {
      setIsLoading(true, "Activating flight mode...");
      const response = await updateAirplaneMode({ topic });
      if (response.status === "success") {
        toast.success(response.message || "Airplane mode enabled");
      } else {
        toast.error(response.message || "Failed to update");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLedToggle = async (on: boolean) => {
    if (!topic) return toast.error("Device topic missing.");
    try {
      setIsLoading(true, `Switching LED ${on ? "ON" : "OFF"}...`);
      const response = await updateLedStatus({
        topic,
        LED: on ? "SwitchOnLed" : "SwitchOffLed",
      });
      if (response.status === "success") {
        toast.success(response.message || `LED ${on ? "on" : "off"}`);
      } else {
        toast.error(response.message || "Failed to update LED");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isAirplaneEnabled = currentMode === "Airplane" || currentMode === "AirplaneMode";
  const isLedOn = ledStatus === "SwitchOnLed" || ledStatus === "on";
  const disabled = !topic && !imei;

  const controls = [
    {
      id: "led-status",
      icon: SunMedium,
      label: "LED Status",
      description: isLedOn ? "Indicator ON" : "Indicator OFF",
      isOn: isLedOn,
      activeColor: "text-amber-600 dark:text-amber-400",
      activeBg: "bg-amber-500/10 border-amber-500/20",
      control: (
        <Switch
          disabled={disabled}
          checked={isLedOn}
          onChange={(e) => handleLedToggle(e.currentTarget.checked)}
        />
      ),
    },
    {
      id: "flight-mode",
      icon: Plane,
      label: "Airplane",
      description: isAirplaneEnabled ? "Radio disabled" : "Cellular active",
      isOn: isAirplaneEnabled,
      activeColor: "text-indigo-600 dark:text-indigo-400",
      activeBg: "bg-indigo-500/10 border-indigo-500/20",
      control: (
        <Button
          size="xs"
          variant={isAirplaneEnabled ? "filled" : "outline"}
          color="indigo"
          disabled={disabled || isAirplaneEnabled}
          onClick={handleAirplaneEnable}
          className="h-6 px-2 text-[10px] font-bold uppercase tracking-wide text-white"
        >
          {isAirplaneEnabled ? "Locked" : "Enable"}
        </Button>
      ),
    },
    {
      id: "incoming-calls",
      icon: Phone,
      label: "Incoming Calls",
      description: incomingCallEnabled ? "System READY" : "System LOCKED",
      isOn: !!incomingCallEnabled,
      activeColor: "text-emerald-600 dark:text-emerald-400",
      activeBg: "bg-emerald-500/10 border-emerald-500/20",
      control: (
        <Switch
          disabled={disabled}
          checked={!!incomingCallEnabled}
          onChange={(e) => handleToggleIncomingCalls(e.currentTarget.checked)}
        />
      ),
    },
    {
      id: "audio-monitor",
      icon: Mic,
      label: "Ambient Monitor",
      description: ambientListeningStatus === "Enable" ? "Streaming Live" : "Standby Mode",
      isOn: ambientListeningStatus === "Enable",
      activeColor: "text-rose-600 dark:text-rose-400",
      activeBg: "bg-rose-500/10 border-rose-500/20",
      control: (
        <div className="flex items-center gap-1.5">
          <ActionIcon
            variant="subtle"
            color="red"
            className="h-6 w-6 text-destructive hover:bg-destructive/10 disabled:opacity-50"
            onClick={() => handleToggleAmbient("Stop")}
            title="Hard Reset / Stop Monitoring"
            disabled={disabled || ambientListeningStatus === "Stop"}
          >
            <StopCircle className="h-3.5 w-3.5" />
          </ActionIcon>
          <Switch
            disabled={disabled}
            checked={ambientListeningStatus === "Enable"}
            onChange={(e) => handleToggleAmbient(e.currentTarget.checked ? "Enable" : "Disable")}
          />
        </div>
      ),
    },
    {
      id: "sos-signal",
      icon: Square,
      label: "SOS Signal",
      description: "Hardware triggered",
      isOn: false,
      activeColor: "",
      activeBg: "",
      control: <Badge variant="outline" className="text-[8px] uppercase tracking-wider text-muted-foreground/50 border-border/50">Disabled</Badge>,
      isDisabled: true,
    },
    {
      id: "data-query",
      icon: Search,
      label: "Data Query",
      description: "Force data push",
      isOn: false,
      activeColor: "",
      activeBg: "",
      control: <Badge variant="outline" className="text-[8px] uppercase tracking-wider text-muted-foreground/50 border-border/50">Disabled</Badge>,
      isDisabled: true,
    },
  ];

  return (
    <Card className="border-border shadow-sm bg-card p-0">
      <Group justify="space-between" align="center" className="py-3 px-4 border-b bg-muted/5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <Text size="xs" fw={700} className="uppercase tracking-wide text-foreground font-bold">System Toggles</Text>
        </div>
        <Badge
          color={topic ? "teal" : "red"}
          variant="light"
          className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0 h-4 border border-teal-200"
        >
          {topic ? "Link Active" : "No Link"}
        </Badge>
      </Group>
      <Box className="p-4 space-y-4">
        <div className={cn(
          "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3",
          disabled && "opacity-50 grayscale pointer-events-none"
        )}>
          {controls.map((ctrl) => {
            const Icon = ctrl.icon;
            return (
              <Card
                key={ctrl.id}
                withBorder
                radius="lg"
                padding="sm"
                className={cn(
                  "bg-card flex flex-col gap-3 transition-all shadow-sm",
                  ctrl.isOn ? cn("border", ctrl.activeBg) : "border-border",
                  ctrl.isDisabled && "opacity-50 grayscale border-dashed shadow-none"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg border flex-shrink-0",
                    ctrl.isOn ? cn(ctrl.activeBg) : "bg-muted border-border"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      ctrl.isOn ? ctrl.activeColor : "text-muted-foreground"
                    )} />
                  </div>
                  {ctrl.control}
                </div>
                <div className="mt-auto pt-1">
                  <p className="text-xs font-semibold leading-tight">{ctrl.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{ctrl.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </Box>
    </Card>
  );
}
