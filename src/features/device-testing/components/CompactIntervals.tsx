import { Card, Button, Box, Group, Text } from "@mantine/core";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import type { LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";
import { updateDeviceCoreSettings } from "@/features/device-settings/services/deviceSettingsService";

export function CompactIntervals({ selectedImei, latestSettings }: { selectedImei: string; latestSettings: LatestDeviceSettingsRecord | null }) {
  const { setIsLoading } = useGlobalLoading();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (latestSettings) {
      setValues({
        NormalSendingInterval: String(latestSettings.raw_NormalSendingInterval ?? ""),
        SOSSendingInterval: String(latestSettings.raw_SOSSendingInterval ?? ""),
        NormalScanningInterval: String(latestSettings.raw_NormalScanningInterval ?? ""),
        AirplaneInterval: String(latestSettings.raw_AirplaneInterval ?? ""),
        TemperatureLimit: String(latestSettings.raw_temperature ?? ""),
        SpeedLimit: String(latestSettings.raw_SpeedLimit ?? ""),
        LowbatLimit: String(latestSettings.raw_LowbatLimit ?? ""),
      });
    }
  }, [latestSettings]);

  const handleSend = async () => {
    if (!latestSettings?.topic) return;
    try {
      setIsLoading(true, "Updating device config...");
      await updateDeviceCoreSettings({
        topic: latestSettings.topic,
        NormalSendingInterval: Number(values.NormalSendingInterval),
        SOSSendingInterval: Number(values.SOSSendingInterval),
        NormalScanningInterval: Number(values.NormalScanningInterval),
        AirplaneInterval: Number(values.AirplaneInterval || 1800),
        SpeedLimit: Number(values.SpeedLimit || 60),
        LowbatLimit: Number(values.LowbatLimit || 20),
        TemperatureLimit: Number(values.TemperatureLimit || 50),
      });
      toast.success("Operational parameters updated");
    } catch (error) {
      toast.error("Failed to update intervals");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: "Normal Msg", key: "NormalSendingInterval", suffix: "s" },
    { label: "SOS Msg", key: "SOSSendingInterval", suffix: "s" },
    { label: "Scanning", key: "NormalScanningInterval", suffix: "s" },
    { label: "Airplane", key: "AirplaneInterval", suffix: "s" },
    { label: "Temp Limit", key: "TemperatureLimit", suffix: "°C" },
    { label: "Speed Limit", key: "SpeedLimit", suffix: "km/h" },
    { label: "Low Bat", key: "LowbatLimit", suffix: "%" },
  ];

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden p-0">
      <Group justify="space-between" align="center" className="py-2.5 px-4 bg-muted/30 border-b border-primary/5">
        <Text size="xs" fw={700} className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          Intervals & Limits
        </Text>
      </Group>
      <Box className="p-3 space-y-3">
        <div className="space-y-1.5">
          {fields.map(f => (
            <div key={f.key} className="flex items-center justify-between gap-4">
              <Text size="0.6rem" fw={900} tt="uppercase" className="text-muted-foreground">{f.label}</Text>
              <div className="flex items-center gap-2">
                <input 
                  value={values[f.key] || ""} 
                  onChange={(e) => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="h-7 w-24 text-[10px] font-mono bg-muted/50 text-right px-2 rounded border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Text size="0.55rem" fw={700} className="text-muted-foreground w-6 uppercase">{f.suffix}</Text>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleSend} color="blue" size="sm" className="w-full h-8 text-[10px] font-bold">
          Update Configuration
        </Button>
      </Box>
    </Card>
  );
}
