import { Button, Card, Box, Text, TextInput, Group } from "@mantine/core";
import {
  updateDeviceCoreSettings,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import {
  Save,
  Activity,
  ShieldAlert,
  Timer,
  Zap,
  Gauge,
  Thermometer,
  Battery,
  Plane,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type FormState = {
  NormalSendingInterval: string;
  SOSSendingInterval: string;
  NormalScanningInterval: string;
  AirplaneInterval: string;
  TemperatureLimit: string;
  SpeedLimit: string;
  LowbatLimit: string;
};

const DEFAULTS: FormState = {
  NormalSendingInterval: "600",
  SOSSendingInterval: "60",
  NormalScanningInterval: "300",
  AirplaneInterval: "1800",
  TemperatureLimit: "50",
  SpeedLimit: "60",
  LowbatLimit: "20",
};

function toStr(value: string | number | null | undefined, fallback: string) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

type Props = {
  selectedImei: string;
  latestSettings: LatestDeviceSettingsRecord | null;
};

export function IntervalsSettings({ selectedImei, latestSettings }: Props) {
  const [values, setValues] = useState<FormState>(DEFAULTS);
  const [isDirty, setIsDirty] = useState(false);
  const { setIsLoading } = useGlobalLoading();

  useEffect(() => {
    setValues({
      NormalSendingInterval: toStr(latestSettings?.raw_NormalSendingInterval, DEFAULTS.NormalSendingInterval),
      SOSSendingInterval: toStr(latestSettings?.raw_SOSSendingInterval, DEFAULTS.SOSSendingInterval),
      NormalScanningInterval: toStr(latestSettings?.raw_NormalScanningInterval, DEFAULTS.NormalScanningInterval),
      AirplaneInterval: toStr(latestSettings?.raw_AirplaneInterval, DEFAULTS.AirplaneInterval),
      TemperatureLimit: toStr(latestSettings?.raw_temperature, DEFAULTS.TemperatureLimit),
      SpeedLimit: toStr(latestSettings?.raw_SpeedLimit, DEFAULTS.SpeedLimit),
      LowbatLimit: toStr(latestSettings?.raw_LowbatLimit, DEFAULTS.LowbatLimit),
    });
    setIsDirty(false);
  }, [latestSettings]);

  const handleChange = (key: keyof FormState, v: string) => {
    setValues((c) => ({ ...c, [key]: v }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedImei || !latestSettings?.topic) {
      toast.error("Required device identifier missing.");
      return;
    }
    try {
      setIsLoading(true, "Applying configuration...");
      const response = await updateDeviceCoreSettings({
        topic: latestSettings.topic,
        NormalSendingInterval: Number(values.NormalSendingInterval),
        SOSSendingInterval: Number(values.SOSSendingInterval),
        NormalScanningInterval: Number(values.NormalScanningInterval),
        AirplaneInterval: Number(values.AirplaneInterval),
        SpeedLimit: Number(values.SpeedLimit),
        LowbatLimit: Number(values.LowbatLimit),
        TemperatureLimit: Number(values.TemperatureLimit),
      });
      if (response.status === "success") {
        toast.success(response.message || "Settings applied");
        setIsDirty(false);
      } else {
        toast.error(response.message || "Failed to apply settings");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card shadow="sm" radius="md" withBorder padding={0} className={cn(
      "bg-card",
      !selectedImei && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <Group justify="space-between" align="center" className="py-3 px-4 border-b border-border">
        <Group gap="sm" align="center">
          <Activity className="h-4 w-4 text-primary" />
          <Text size="xs" fw={700} tt="uppercase" className="tracking-wide">Intervals & Limits</Text>
        </Group>
        <Button
          onClick={handleSave}
          disabled={!selectedImei}
          size="xs"
          variant={isDirty ? "filled" : "outline"}
          leftSection={<Save className="h-3 w-3" />}
          className="font-bold uppercase tracking-wide"
        >
          {isDirty ? "Apply" : "Saved"}
        </Button>
      </Group>

      <Box className="p-0">
        {/* Intervals Section */}
        <Box className="px-4 pt-3 pb-2">
          <Group gap="sm" align="center" className="mb-2">
            <Timer className="h-3.5 w-3.5 text-primary/50" />
            <Text size="0.6rem" fw={900} tt="uppercase" c="dimmed" className="tracking-widest">Transmission</Text>
          </Group>
          <Box className="space-y-1">
            <SettingRow
              icon={Activity}
              label="Normal Sending"
              hint="Regular packet rate"
              value={values.NormalSendingInterval}
              unit="s"
              onChange={(v) => handleChange("NormalSendingInterval", v)}
            />
            <SettingRow
              icon={Zap}
              label="SOS Sending"
              hint="Emergency burst rate"
              value={values.SOSSendingInterval}
              unit="s"
              iconColor="text-red-500"
              onChange={(v) => handleChange("SOSSendingInterval", v)}
            />
            <SettingRow
              icon={Activity}
              label="GPS Scanning"
              hint="Location update rate"
              value={values.NormalScanningInterval}
              unit="s"
              onChange={(v) => handleChange("NormalScanningInterval", v)}
            />
            <SettingRow
              icon={Plane}
              label="Flight Mode"
              hint="Airplane interval rate"
              value={values.AirplaneInterval}
              unit="s"
              onChange={(v) => handleChange("AirplaneInterval", v)}
            />
          </Box>
        </Box>

        <Box className="mx-4 border-t border-dashed border-border/60" />

        {/* Limits Section */}
        <Box className="px-4 pt-2 pb-3">
          <Group gap="sm" align="center" className="mb-2">
            <ShieldAlert className="h-3.5 w-3.5 text-orange-500/60" />
            <Text size="0.6rem" fw={900} tt="uppercase" className="tracking-widest text-orange-600/80">Safety Thresholds</Text>
          </Group>
          <Box className="space-y-1">
            <SettingRow
              icon={Thermometer}
              label="Temperature"
              hint="Max hardware temp"
              value={values.TemperatureLimit}
              unit="°C"
              iconColor="text-orange-500"
              onChange={(v) => handleChange("TemperatureLimit", v)}
            />
            <SettingRow
              icon={Gauge}
              label="Speed Limit"
              hint="Overspeed threshold"
              value={values.SpeedLimit}
              unit="km/h"
              iconColor="text-amber-500"
              onChange={(v) => handleChange("SpeedLimit", v)}
            />
            <SettingRow
              icon={Battery}
              label="Low Battery"
              hint="Battery alert level"
              value={values.LowbatLimit}
              unit="%"
              iconColor="text-red-500"
              onChange={(v) => handleChange("LowbatLimit", v)}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  value,
  unit,
  iconColor = "text-primary/60",
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
  value: string;
  unit: string;
  iconColor?: string;
  onChange: (v: string) => void;
}) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" className="py-1.5 px-1 rounded-lg hover:bg-muted/30 transition-colors group">
      <Group gap="md" align="center" wrap="nowrap">
        <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", iconColor)} />
        <Box className="flex-1 min-w-0">
          <Text size="xs" fw={700} className="leading-tight">{label}</Text>
          <Text size="0.65rem" c="dimmed" className="leading-tight">{hint}</Text>
        </Box>
      </Group>
      <Group gap={4} align="center" wrap="nowrap" className="bg-muted/40 border border-border/60 group-hover:border-primary/30 rounded-lg px-2 py-1 transition-colors w-[90px] shrink-0">
        <TextInput
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          variant="unstyled"
          styles={{ input: { height: '1.25rem', padding: 0, textAlign: 'right', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 900 } }}
          className="w-full"
        />
        <Text size="0.6rem" fw={900} c="dimmed" className="shrink-0">{unit}</Text>
      </Group>
    </Group>
  );
}
