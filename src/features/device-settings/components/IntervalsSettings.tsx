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
  AirplaneInterval: "400",
  TemperatureLimit: "30",
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
    description: "Standard GPS and scan update cadence",
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
    description: "Alert threshold for device temperature",
    suffix: "°C",
  },
  {
    key: "SpeedLimit",
    label: "Speed Limit",
    description: "Alert threshold for overspeeding",
    suffix: "km/h",
  },
  {
    key: "LowbatLimit",
    label: "Low Battery Limit",
    description: "Battery percentage threshold for alerts",
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
      toast.error("Required device identifier (topic/imei) missing.");
      return;
    }

    try {
      setIsLoading(true, "Please wait");

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
        toast.success("Success", {
           description: response.message || "Device settings updated successfully",
        });
      } else {
        toast.error(response.message || "Failed to update settings");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update device settings.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="pb-4 border-b border-primary/5 flex flex-row items-center justify-between space-y-0 text-left">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time & Alert Intervals
          </CardTitle>
          <CardDescription>
            Configure operational cadences and safety threshold limits
          </CardDescription>
          {latestSettings?.device_timestamp ? (
            <p className="mt-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
              Snapshot: {new Date(latestSettings.device_timestamp).toLocaleString("en-IN")}
            </p>
          ) : null}
        </div>
        <Button onClick={handleSave} className="gap-2 font-bold shadow-lg shadow-primary/10" size="sm">
          <Save size={14} />
          Update Intervals
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {intervalFields.map((field) => (
            <div key={field.key} className="space-y-3 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80 border border-transparent hover:border-primary/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary/40" />
                  <div>
                    <p className="font-medium text-sm">{field.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background/50 p-2 rounded-md border border-input focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <Input
                  type="number"
                  min="0"
                  value={values[field.key]}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  className="border-0 focus-visible:ring-0 h-8 text-sm"
                />
                <span className="min-w-10 text-[10px] uppercase font-bold text-muted-foreground px-2 py-1 bg-muted rounded border">
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
