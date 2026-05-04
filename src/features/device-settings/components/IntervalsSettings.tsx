import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  updateDeviceCoreSettings,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { Clock, Save, ShieldAlert, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type DeviceSettingsFormState = {
  NormalSendingInterval: string;
  SOSSendingInterval: string;
  NormalScanningInterval: string;
  AirplaneInterval: string;
  TemperatureLimit: string;
  SpeedLimit: string;
  LowbatLimit: string;
};

const DEFAULT_VALUES: DeviceSettingsFormState = {
  NormalSendingInterval: "600",
  SOSSendingInterval: "60",
  NormalScanningInterval: "300",
  AirplaneInterval: "1800",
  TemperatureLimit: "50",
  SpeedLimit: "60",
  LowbatLimit: "20",
};

function toStringValue(value: string | number | undefined, fallback: string) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value);
}

type IntervalsSettingsProps = {
  selectedImei: string;
  latestSettings: LatestDeviceSettingsRecord | null;
};

export function IntervalsSettings({
  selectedImei,
  latestSettings,
}: IntervalsSettingsProps) {
  const [values, setValues] = useState<DeviceSettingsFormState>(DEFAULT_VALUES);
  const { setIsLoading } = useGlobalLoading();

  useEffect(() => {
    setValues({
      NormalSendingInterval: toStringValue(
        latestSettings?.raw_NormalSendingInterval ?? undefined,
        DEFAULT_VALUES.NormalSendingInterval,
      ),
      SOSSendingInterval: toStringValue(
        latestSettings?.raw_SOSSendingInterval ?? undefined,
        DEFAULT_VALUES.SOSSendingInterval,
      ),
      NormalScanningInterval: toStringValue(
        latestSettings?.raw_NormalScanningInterval ?? undefined,
        DEFAULT_VALUES.NormalScanningInterval,
      ),
      AirplaneInterval: toStringValue(
        latestSettings?.raw_AirplaneInterval ?? undefined,
        DEFAULT_VALUES.AirplaneInterval,
      ),
      TemperatureLimit: toStringValue(
        latestSettings?.raw_temperature ?? undefined,
        DEFAULT_VALUES.TemperatureLimit,
      ),
      SpeedLimit: toStringValue(
        latestSettings?.raw_SpeedLimit ?? undefined,
        DEFAULT_VALUES.SpeedLimit,
      ),
      LowbatLimit: toStringValue(
        latestSettings?.raw_LowbatLimit ?? undefined,
        DEFAULT_VALUES.LowbatLimit,
      ),
    });
  }, [latestSettings]);

  const handleChange = (
    key: keyof DeviceSettingsFormState,
    nextValue: string,
  ) => {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

  const handleSave = async () => {
    if (!selectedImei || !latestSettings?.topic) {
      toast.error("Required device identifier missing.");
      return;
    }

    try {
      setIsLoading(true, "Updating hardware settings...");
      const payload = {
        topic: latestSettings.topic,
        NormalSendingInterval: Number(values.NormalSendingInterval),
        SOSSendingInterval: Number(values.SOSSendingInterval),
        NormalScanningInterval: Number(values.NormalScanningInterval),
        AirplaneInterval: Number(values.AirplaneInterval),
        SpeedLimit: Number(values.SpeedLimit),
        LowbatLimit: Number(values.LowbatLimit),
        TemperatureLimit: Number(values.TemperatureLimit),
      };

      const response = await updateDeviceCoreSettings(payload);

      if (response.status === "success") {
        toast.success(response.message || "Settings updated successfully");
      } else {
        toast.error(response.message || "Failed to update settings");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(
      "border-border shadow-sm transition-opacity duration-300 bg-card rounded-xl",
      !selectedImei && "opacity-50 grayscale pointer-events-none select-none"
    )}>
      <CardHeader className="py-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0 bg-muted/5 rounded-t-xl border-b border-border">
        <div>
          <CardTitle className="text-sm font-black uppercase tracking-tight">
            Intervals & Limits
          </CardTitle>
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Telemetry timing and threshold controls
          </CardDescription>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!selectedImei}
          size="sm"
          className="h-10 px-6 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <Save className="h-4 w-4 mr-2" />
          Apply Configuration
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Section 1: Intervals */}
          <div className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary/60" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Transmission Intervals</h4>
            </div>
            
            <div className="grid gap-4">
              <SettingRow 
                label="Normal Sending"
                description="Regular packet transmission frequency"
                value={values.NormalSendingInterval}
                unit="SEC"
                onChange={(v) => handleChange("NormalSendingInterval", v)}
              />
              <SettingRow 
                label="SOS Sending"
                description="Emergency transmission frequency"
                value={values.SOSSendingInterval}
                unit="SEC"
                onChange={(v) => handleChange("SOSSendingInterval", v)}
              />
              <SettingRow 
                label="Normal Scanning"
                description="GPS location update frequency"
                value={values.NormalScanningInterval}
                unit="SEC"
                onChange={(v) => handleChange("NormalScanningInterval", v)}
              />
              <SettingRow 
                label="Airplane Interval"
                description="Flight mode telemetry frequency"
                value={values.AirplaneInterval}
                unit="SEC"
                onChange={(v) => handleChange("AirplaneInterval", v)}
              />
            </div>
          </div>

          {/* Section 2: Limits */}
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-orange-500/60" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600">Safety Thresholds</h4>
            </div>

            <div className="grid gap-4">
              <SettingRow 
                label="Thermal Limit"
                description="Maximum operating temperature threshold"
                value={values.TemperatureLimit}
                unit="°C"
                onChange={(v) => handleChange("TemperatureLimit", v)}
              />
              <SettingRow 
                label="Speed Limit"
                description="Movement velocity alert threshold"
                value={values.SpeedLimit}
                unit="KM/H"
                onChange={(v) => handleChange("SpeedLimit", v)}
              />
              <SettingRow 
                label="Critical Battery"
                description="Power level alert threshold"
                value={values.LowbatLimit}
                unit="%"
                onChange={(v) => handleChange("LowbatLimit", v)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingRow({ 
  label, 
  description, 
  value, 
  unit, 
  onChange 
}: { 
  label: string; 
  description: string; 
  value: string; 
  unit: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 group">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground/60 leading-tight truncate">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg p-1 hover:border-primary/30 transition-all w-[120px] shrink-0">
        <Input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 focus-visible:ring-0 h-7 text-xs font-mono font-bold bg-transparent shadow-none text-right"
        />
        <span className="text-[9px] font-black text-muted-foreground/50 pr-2 shrink-0">
          {unit}
        </span>
      </div>
    </div>
  );
}
