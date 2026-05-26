import { Card, Select, Text, Box } from "@mantine/core";
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
    <Card className="p-0 border-border">
      <div className="p-4 border-b border-border">
        <Text size="sm" fw={700} className="text-foreground">Target Device</Text>
        <Text size="xs" className="text-muted-foreground mt-1">
          {routeImei
            ? "This page was opened for a specific device."
            : "Pick a device before adding a geofence."}
        </Text>
      </div>
      <Box className="p-4 space-y-4">
        {routeImei ? (
          <Card padding="sm" radius="md" withBorder className="bg-muted/30 border-border">
            <div className="text-sm font-medium">
              {selectedDevice?.displayName ?? "Selected device"}
            </div>
            <div className="mt-1 font-mono text-sm text-muted-foreground">
              {selectedImei}
            </div>
          </Card>
        ) : (
          <Select
            value={selectedImei}
            onChange={(val) => onSelectImei(val || "")}
            disabled={isLoadingDevices}
            placeholder="Select a device"
            data={devices.map((device) => ({
              value: device.imei,
              label: `${device.displayName} (${device.imei})`
            }))}
            styles={{ input: { height: '2.25rem', fontSize: '0.8rem', fontWeight: 700 } }}
          />
        )}

        {selectedDevice && (
          <Card padding="sm" radius="md" withBorder className="text-sm border-border">
            <div className="font-medium">{selectedDevice.displayName}</div>
            <div className="mt-1 text-muted-foreground">
              Student: {selectedDevice.studentName ?? "Unassigned"}
            </div>
            <div className="font-mono text-muted-foreground">
              IMEI: {selectedDevice.imei}
            </div>
          </Card>
        )}
      </Box>
    </Card>
  );
}
