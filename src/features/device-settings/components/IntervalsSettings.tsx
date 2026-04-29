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
import { Clock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const intervalFields: Array<{
  key: keyof DeviceSettingsFormState;
  label: string;
  description: string;
  suffix: string;
}> = [
    {
      key: "NormalSendingInterval",
      label: "Normal Sending Interval",
      description: "Standard data transmission cadence",
      suffix: "sec",
    },
    {
      key: "SOSSendingInterval",
      label: "SOS Sending Interval",
      description: "Emergency transmission cadence",
      suffix: "sec",
    },
    {
      key: "NormalScanningInterval",
      label: "Normal Scanning Interval",
      description: "Standard GPS update cadence",
      suffix: "sec",
    },
    {
      key: "AirplaneInterval",
      label: "Airplane Interval",
      description: "Flight mode scanning cadence",
      suffix: "sec",
    },
    {
      key: "TemperatureLimit",
      label: "Temperature Limit",
      description: "Thermal alert threshold",
      suffix: "°C",
    },
    {
      key: "SpeedLimit",
      label: "Speed Limit",
      description: "Overspeeding alert threshold",
      suffix: "km/h",
    },
    {
      key: "LowbatLimit",
      label: "Low Battery Limit",
      description: "Battery alert threshold",
      suffix: "%",
    },
  ];

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
      setIsLoading(true, "Updating settings...");
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
      <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/5">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Clock className="h-5 w-5 text-primary" />
            Reporting Intervals & Limits
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            {!selectedImei 
              ? "Select a device to configure intervals" 
              : "Manage operational timing and safety limits"}
          </CardDescription>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!selectedImei}
          size="sm"
          className="h-9 px-4 font-semibold shadow-sm"
        >
          <Save className="h-4 w-4 mr-2" />
          Apply Settings
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {intervalFields.map((field) => (
            <div key={field.key} className="space-y-3 p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <div>
                  <p className="font-semibold text-sm">{field.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                    {field.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <Input
                  disabled={!selectedImei}
                  type="number"
                  min="0"
                  value={values[field.key]}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  className="border-0 focus-visible:ring-0 h-9 text-sm font-medium bg-transparent shadow-none"
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 bg-muted/50 rounded-md border border-border/50">
                  {field.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
