import { useNavigate } from "react-router-dom";
import { useDeviceTable } from "../context/DeviceTableContext";
import { DeviceCard } from "./DeviceCard";
import { Skeleton, Box, Text } from "@mantine/core";
import { Cpu } from "lucide-react";

export function DeviceGrid() {
  const { filteredDevices, loading, refresh } = useDeviceTable();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} height={144} radius="md" />
        ))}
      </Box>
    );
  }

  if (filteredDevices.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
        <Cpu className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <Text size="md" fw={600} c="dimmed">No devices found</Text>
        <Text size="sm" c="dimmed" mt={4}>Try adjusting your search or add a new device</Text>
      </Box>
    );
  }

  return (
    <Box className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {filteredDevices.map((device) => (
        <DeviceCard
          key={device.imei}
          device={device}
          onClick={() => navigate(`/devices/${device.imei}`)}
          onView={() => navigate(`/devices/${device.imei}`)}
          onGeofencing={() => navigate(`/devices/geofencing/${device.imei}`)}
          onTelemetry={() => navigate(`/devices/telemetry/${device.imei}`)}
          onSettings={() => navigate(`/devices/settings/${device.imei}`)}
          onRemove={() => console.log("Remove clicked")}
          onStatusToggle={refresh}
        />
      ))}
    </Box>
  );
}
