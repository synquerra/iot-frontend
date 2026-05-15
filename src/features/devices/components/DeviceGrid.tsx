import { useNavigate } from "react-router-dom";
import { useDeviceTable } from "../context/DeviceTableContext";
import { DeviceCard } from "./DeviceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu } from "lucide-react";

export function DeviceGrid() {
  const { filteredDevices, loading, refresh } = useDeviceTable();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (filteredDevices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
        <Cpu className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <p className="text-base font-semibold text-muted-foreground">No devices found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or add a new device</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    </div>
  );
}
