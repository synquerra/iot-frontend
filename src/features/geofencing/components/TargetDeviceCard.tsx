import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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

type TargetDeviceCardProps = {
  routeImei?: string;
  devices: Device[];
  selectedImei: string;
  selectedDevice: Device | null;
  isLoadingDevices: boolean;
  onSelectImei: (imei: string) => void;
};

export function TargetDeviceCard({
  routeImei,
  devices,
  selectedImei,
  selectedDevice,
  isLoadingDevices,
  onSelectImei,
}: TargetDeviceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Device</CardTitle>
        <CardDescription>
          {routeImei
            ? "This page was opened for a specific device."
            : "Pick a device before adding a geofence."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
