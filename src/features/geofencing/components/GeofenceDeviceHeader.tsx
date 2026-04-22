import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Smartphone, Activity, Battery, Signal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/features/devices/services/deviceService";

interface GeofenceDeviceHeaderProps {
  devices: Device[];
  selectedImei: string;
  selectedDevice: Device | null;
  onSelectImei: (imei: string) => void;
  isLoading?: boolean;
}

export function GeofenceDeviceHeader({
  devices,
  selectedImei,
  selectedDevice,
  onSelectImei,
  isLoading,
}: GeofenceDeviceHeaderProps) {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm rounded-xl">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 md:p-5 bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight text-foreground truncate">
                  Device Configuration
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Select and manage your hardware
                </p>
              </div>
            </div>

            <div className="w-full sm:w-[280px]">
              <Select
                value={selectedImei}
                onValueChange={onSelectImei}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-muted/30 border-border h-10 text-sm font-medium focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="Select a device..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {devices.map((device) => (
                    <SelectItem
                      key={device.imei}
                      value={device.imei}
                      className="text-sm font-medium"
                    >
                      {device.displayName || `IMEI: ${device.imei}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDevice && (
            <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/50">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                  Status:
                </span>
                <span className={cn(
                  "text-xs font-bold uppercase",
                  selectedDevice.status === "active" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                )}>
                  {selectedDevice.status === "active" ? "Online" : "Offline"}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40">
                <Battery className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-bold text-foreground">
                  {selectedDevice.battery}%
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/40">
                <Signal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-bold text-foreground">
                  {selectedDevice.signal}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
