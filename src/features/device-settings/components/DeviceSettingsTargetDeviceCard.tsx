import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Device } from "@/features/devices/services/deviceService";

type DeviceSettingsTargetDeviceCardProps = {
  routeImei?: string;
  devices: Device[];
  selectedImei: string;
  selectedDevice: Device | null;
  isLoadingDevices: boolean;
  onSelectImei: (imei: string) => void;
};

export function DeviceSettingsTargetDeviceCard({
  routeImei,
  devices,
  selectedImei,
  selectedDevice,
  isLoadingDevices,
  onSelectImei,
}: DeviceSettingsTargetDeviceCardProps) {
  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between p-6 gap-6">
        <div className="space-y-1.5 flex-1">
          <CardTitle className="text-xl">Target Device</CardTitle>
          <CardDescription>
            {routeImei
              ? "This page was opened for a specific device."
              : "Pick a device before updating settings."}
          </CardDescription>
        </div>
        <div className="w-full md:w-[350px] space-y-4">
        {routeImei ? (
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-sm font-medium">
              {selectedDevice?.displayName ?? "Selected device"}
            </div>
            <div className="mt-1 font-mono text-sm text-muted-foreground">
              {selectedImei}
            </div>
          </div>
        ) : (
          <Select
            value={selectedImei}
            onValueChange={onSelectImei}
            disabled={isLoadingDevices}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.imei} value={device.imei}>
                  {device.displayName} ({device.imei})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedDevice && (
          <div className="rounded-lg border p-3 text-sm">
            <div className="font-medium">{selectedDevice.displayName}</div>
            <div className="mt-1 text-muted-foreground">
              Student: {selectedDevice.studentName ?? "Unassigned"}
            </div>
            <div className="font-mono text-muted-foreground">
              IMEI: {selectedDevice.imei}
            </div>
          </div>
        )}
        </div>
      </div>
    </Card>
  );
}
