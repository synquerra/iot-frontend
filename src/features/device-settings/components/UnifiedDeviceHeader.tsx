import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/features/devices/services/deviceService";

type UnifiedDeviceHeaderProps = {
  routeImei?: string;
  devices: Device[];
  selectedImei: string;
  selectedDevice: Device | null;
  isLoadingDevices: boolean;
  onSelectImei: (imei: string) => void;
  currentMode?: string | null;
};

export function UnifiedDeviceHeader({
  routeImei,
  devices,
  selectedImei,
  selectedDevice,
  isLoadingDevices,
  onSelectImei,
  currentMode,
}: UnifiedDeviceHeaderProps) {

  return (
    <div className="flex flex-col gap-4">
      {/* Selector Card */}
      <div className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
               <Smartphone className="h-5 w-5 text-muted-foreground/60" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Target Device Selection</p>
                {selectedDevice && (
                  <div className="flex items-center gap-2 ml-auto sm:ml-2">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      selectedDevice.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                    )} />
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest",
                      selectedDevice.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}>
                      {selectedDevice.status === "active" ? "Online" : "Offline"}
                    </span>
                    {currentMode && (
                      <>
                        <div className="h-2 w-px bg-border/60" />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-orange-600">
                          {currentMode}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              {routeImei ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black uppercase tracking-tight truncate">
                    {selectedDevice?.displayName || selectedImei}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px] font-bold bg-muted text-muted-foreground border-transparent">
                    {selectedImei}
                  </Badge>
                </div>
              ) : (
                <Select
                  value={selectedImei}
                  onValueChange={onSelectImei}
                  disabled={isLoadingDevices}
                >
                  <SelectTrigger className="w-full md:w-[320px] bg-muted/30 border-border/50 h-10 text-sm font-black uppercase tracking-tight hover:bg-muted/50 transition-all focus:ring-primary/20">
                    <SelectValue placeholder="Select Device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem
                        key={device.imei}
                        value={device.imei}
                        className="text-xs font-bold uppercase py-2.5"
                      >
                        <div className="flex flex-col">
                          <span>{device.displayName || `ID: ${device.imei.slice(-6)}`}</span>
                          <span className="text-[9px] opacity-40 font-mono">{device.imei}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {selectedDevice && (
            <div className="flex items-center gap-4 md:pl-4 md:border-l border-border/50">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Telemetry Status</p>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="text-[10px] font-mono font-bold text-muted-foreground/80 bg-muted/20">
                     {selectedImei}
                   </Badge>
                   <div className="h-8 w-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                      <RefreshCw className={cn("h-4 w-4 text-emerald-500", selectedDevice.status === "active" && "animate-spin-slow")} />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoadingDevices && !routeImei && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-full shadow-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Updating Node List...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
