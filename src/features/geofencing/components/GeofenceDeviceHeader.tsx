import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Smartphone, Activity, Battery, Signal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/features/devices/services/deviceService";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 px-3 bg-card border border-border rounded-xl shadow-sm">
      <div className="flex items-center gap-2">
        {/* Navigation Breadcrumb Style */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 hidden sm:block">
            Fleet
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/30 hidden sm:block" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
            Geofencing
          </span>
        </div>

        <div className="h-6 w-px bg-border/60 mx-1 hidden md:block" />

        {/* Minimal Selector */}
        <div className="flex-1 md:w-[220px]">
          <Select
            value={selectedImei}
            onValueChange={onSelectImei}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-transparent border-none shadow-none h-8 text-xs font-black uppercase tracking-tight hover:bg-muted/50 transition-colors focus:ring-0">
              <SelectValue placeholder="Select Device" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {devices.map((device) => (
                <SelectItem
                  key={device.imei}
                  value={device.imei}
                  className="text-xs font-bold uppercase"
                >
                  {device.displayName || `ID: ${device.imei.slice(-6)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedDevice && (
        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-border/50 pt-2 md:pt-0">
          {/* Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className={cn(
                 "h-1.5 w-1.5 rounded-full",
                 selectedDevice.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
               )} />
               <span className={cn(
                 "text-[10px] font-black uppercase tracking-widest",
                 selectedDevice.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
               )}>
                 {selectedDevice.status === "active" ? "Online" : "Offline"}
               </span>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Battery className={cn(
                  "h-3 w-3",
                  selectedDevice.battery < 20 ? "text-red-500" : "text-muted-foreground/60"
                )} />
                <span className="text-[10px] font-mono font-bold">{selectedDevice.battery}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Signal className="h-3 w-3 text-muted-foreground/60" />
                <span className="text-[10px] font-mono font-bold">{selectedDevice.signal}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
