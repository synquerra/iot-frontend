import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
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
    <Card className={cn(
      "border-border shadow-sm bg-card",
      !selectedImei && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs font-bold uppercase tracking-wide">Intervals & Limits</CardTitle>
        </div>
        <Button
          onClick={handleSave}
          disabled={!selectedImei}
          size="sm"
          variant={isDirty ? "default" : "outline"}
          className="h-7 px-3 text-[10px] font-bold uppercase tracking-wide gap-1.5"
        >
          <Save className="h-3 w-3" />
          {isDirty ? "Apply" : "Saved"}
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Intervals Section */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Timer className="h-3.5 w-3.5 text-primary/50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Transmission</span>
          </div>
          <div className="space-y-1">
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
          </div>
        </div>

        <div className="mx-4 border-t border-dashed border-border/60" />

        {/* Limits Section */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldAlert className="h-3.5 w-3.5 text-orange-500/60" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600/80">Safety Thresholds</span>
          </div>
          <div className="space-y-1">
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
          </div>
        </div>
      </CardContent>
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
    <div className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-muted/30 transition-colors group">
      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground/90 leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{hint}</p>
      </div>
      <div className="flex items-center gap-1 bg-muted/40 border border-border/60 group-hover:border-primary/30 rounded-lg px-2 py-1 transition-colors w-[90px] shrink-0">
        <Input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 focus-visible:ring-0 h-5 w-full text-xs font-mono font-bold bg-transparent shadow-none text-right p-0"
        />
        <span className="text-[9px] font-bold text-muted-foreground/60 shrink-0">{unit}</span>
      </div>
    </div>
  );
}
