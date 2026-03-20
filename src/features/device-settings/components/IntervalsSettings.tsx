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
  COMMANDS,
  type PublishedDeviceCommandResult,
} from "@/helpers/deviceCommandConstants";
import {
  getDeviceCommandToastContent,
  sendDeviceCommand,
} from "@/helpers/deviceCommandHelper";
import useDeviceTelemetry from "@/features/device-telemetry/hooks/useDeviceTelemetry";
import { Clock, RotateCcw, Save } from "lucide-react";
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
};

export function IntervalsSettings({ selectedImei }: IntervalsSettingsProps) {
  const { deviceStatus } = useDeviceTelemetry(selectedImei);
  const [values, setValues] = useState<DeviceSettingsFormState>(DEFAULT_VALUES);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!deviceStatus) {
      return;
    }

    setValues({
      NormalSendingInterval: toStringValue(
        deviceStatus.rawNormalSendingInterval,
        DEFAULT_VALUES.NormalSendingInterval,
      ),
      SOSSendingInterval: toStringValue(
        deviceStatus.rawSOSSendingInterval,
        DEFAULT_VALUES.SOSSendingInterval,
      ),
      NormalScanningInterval: toStringValue(
        deviceStatus.rawNormalScanningInterval,
        DEFAULT_VALUES.NormalScanningInterval,
      ),
      AirplaneInterval: toStringValue(
        deviceStatus.rawAirplaneInterval,
        DEFAULT_VALUES.AirplaneInterval,
      ),
      TemperatureLimit: toStringValue(
        deviceStatus.rawTemperature,
        DEFAULT_VALUES.TemperatureLimit,
      ),
      SpeedLimit: toStringValue(
        deviceStatus.rawSpeedLimit,
        DEFAULT_VALUES.SpeedLimit,
      ),
      LowbatLimit: toStringValue(
        deviceStatus.rawLowbatLimit,
        DEFAULT_VALUES.LowbatLimit,
      ),
    });
  }, [deviceStatus]);

  const handleChange = (
    key: keyof DeviceSettingsFormState,
    nextValue: string,
  ) => {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
  };

  const handleSave = async () => {
    if (!selectedImei) {
      toast.error("Select a device before updating interval settings.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await sendDeviceCommand<PublishedDeviceCommandResult>(
        selectedImei,
        COMMANDS.DEVICE_SETTINGS,
        values,
      );

      const toastContent = getDeviceCommandToastContent(response);
      toast.success(toastContent.title, {
        description: toastContent.description,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update device settings.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Time Intervals
        </CardTitle>
        <CardDescription>
          Update interval and threshold values pushed through the device command
          API
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {intervalFields.map((field) => (
            <div key={field.key} className="space-y-3 rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium">{field.label}</p>
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  value={values[field.key]}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                />
                <span className="min-w-12 text-sm text-muted-foreground">
                  {field.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            className="gap-2 text-primary"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw size={16} />
            Set to Default Values
          </Button>

          <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
            <Save size={16} />
            {isSaving ? "Updating..." : "Update Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
