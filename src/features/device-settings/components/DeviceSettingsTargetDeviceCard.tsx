import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Cpu, Smartphone, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/features/devices/services/deviceService";

type DeviceSettingsTargetDeviceCardProps = {
  routeImei?: string;
  devices: Device[];
  selectedImei: string;
  selectedDevice: Device | null;
  isLoadingDevices: boolean;
  onSelectImei: (imei: string) => void;
  currentMode?: string | null;
};

export function DeviceSettingsTargetDeviceCard({
  routeImei,
  devices,
  selectedImei,
  selectedDevice,
  isLoadingDevices,
  onSelectImei,
  currentMode,
}: DeviceSettingsTargetDeviceCardProps) {
  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-xl shadow-sm p-2 px-3 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left Section: Breadcrumb & Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                System
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
              Settings
            </span>
          </div>

          <div className="h-6 w-px bg-border/60 mx-1 hidden md:block" />

          {/* Minimal Device Selector */}
          <div className="flex-1 md:w-[240px]">
            {routeImei ? (
              <div className="flex items-center gap-2 px-3 h-8 bg-muted/30 rounded-md border border-transparent">
                 <Smartphone className="h-3.5 w-3.5 text-muted-foreground/60" />
                 <span className="text-xs font-black uppercase tracking-tight truncate">
                   {selectedDevice?.displayName || selectedImei}
                 </span>
              </div>
            ) : (
              <Select
                value={selectedImei}
                onValueChange={onSelectImei}
                disabled={isLoadingDevices}
              >
                <SelectTrigger className="w-full bg-transparent border-none shadow-none h-8 text-xs font-black uppercase tracking-tight hover:bg-muted/50 transition-colors focus:ring-0">
                  <div className="flex items-center gap-2 truncate">
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <SelectValue placeholder="Select Device" />
                  </div>
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
            )}
          </div>
        </div>

        {/* Right Section: Status & Mode */}
        {selectedDevice && (
          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border/50 pt-2 md:pt-0">
            {/* Online Status */}
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

            {/* Mode Badge */}
            {currentMode && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-px bg-border/60 hidden md:block" />
                <div className="flex items-center gap-1.5">
                   <Activity className="h-3 w-3 text-orange-500/70" />
                   <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter text-orange-600 border-orange-500/30 bg-orange-500/5 px-2 py-0 h-4 leading-none">
                     {currentMode}
                   </Badge>
                </div>
              </div>
            )}

            {/* IMEI Tag (Only on desktop) */}
            <div className="hidden lg:flex items-center gap-2">
               <div className="h-4 w-px bg-border/60" />
               <code className="text-[10px] font-mono font-bold text-muted-foreground/60 uppercase">
                 IMEI: {selectedImei}
               </code>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay for device selection */}
      {isLoadingDevices && !routeImei && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-primary/40" />
        </div>
      )}
    </div>
  );
}

import { RefreshCw } from "lucide-react";