import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import type { LatestDeviceSettingsRecord } from "@/features/device-settings/services/deviceSettingsService";

import { updateDeviceCoreSettings } from "@/features/device-settings/services/deviceSettingsService";

export function CompactIntervals({ selectedImei, latestSettings }: { selectedImei: string; latestSettings: LatestDeviceSettingsRecord | null }) {
  const { setIsLoading } = useGlobalLoading();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (latestSettings) {
      setValues({
        raw_NormalSendingInterval: String(latestSettings.raw_NormalSendingInterval ?? ""),
        raw_SOSSendingInterval: String(latestSettings.raw_SOSSendingInterval ?? ""),
        raw_NormalScanningInterval: String(latestSettings.raw_NormalScanningInterval ?? ""),
      });
    }
  }, [latestSettings]);

  const handleSend = async () => {
    if (!latestSettings?.topic) return;
    try {
      setIsLoading(true, "Updating intervals...");
      await updateDeviceCoreSettings({
        topic: latestSettings.topic,
        NormalSendingInterval: Number(values.raw_NormalSendingInterval),
        SOSSendingInterval: Number(values.raw_SOSSendingInterval),
        NormalScanningInterval: Number(values.raw_NormalScanningInterval),
        AirplaneInterval: Number(latestSettings.raw_AirplaneInterval || 10),
        SpeedLimit: Number(latestSettings.raw_SpeedLimit || 60),
        LowbatLimit: Number(latestSettings.raw_LowbatLimit || 30),
        TemperatureLimit: Number(latestSettings.raw_temperature || 50),
      });
      toast.success("Intervals updated successfully");
    } catch (error) {
      toast.error("Failed to update intervals");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: "Reporting", key: "raw_NormalSendingInterval" },
    { label: "SOS Mode", key: "raw_SOSSendingInterval" },
    { label: "Scanning", key: "raw_NormalScanningInterval" },
  ];

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-primary/5">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          Reporting Intervals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          {fields.map(f => (
            <div key={f.key} className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{f.label}</span>
              <div className="flex items-center gap-2">
                <Input 
                  value={values[f.key] || ""} 
                  onChange={(e) => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="h-7 w-20 text-[10px] font-mono bg-muted/50 text-right"
                  disabled
                />
                <span className="text-[9px] font-bold text-muted-foreground w-4">s</span>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleSend} size="sm" className="w-full h-7 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none" disabled>
          Update Intervals
        </Button>
      </CardContent>
    </Card>
  );
}
