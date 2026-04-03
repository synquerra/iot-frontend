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
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Cpu, Smartphone, AlertCircle } from "lucide-react";
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
    <Card className="overflow-hidden shadow-lg">

      <CardContent className="p-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 md:p-6">
          {/* Left Section - Title & Device Selection */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[10px] md:text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Target Device
                </h3>
                <p className="text-lg md:text-2xl font-bold tracking-tight truncate">
                  Configuration
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-muted-foreground shrink-0">
              <ChevronRight className="h-4 w-4" />
            </div>

            {routeImei ? (
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Badge variant="secondary" className="px-3 py-1 text-xs md:text-sm whitespace-nowrap">
                  <Smartphone className="h-3.5 w-3.5 mr-2" />
                  {selectedDevice?.displayName ?? "Selected device"}
                </Badge>
                <code className="relative rounded bg-muted px-2 py-1 font-mono text-[10px] md:text-xs font-semibold whitespace-nowrap">
                  {selectedImei}
                </code>
              </div>
            ) : (
              <div className="w-full md:max-w-xs shrink-0">
                <Select
                  value={selectedImei}
                  onValueChange={onSelectImei}
                  disabled={isLoadingDevices}
                >
                  <SelectTrigger className="h-10 md:h-11 bg-background/50 backdrop-blur-sm border transition-all duration-200">
                    <SelectValue placeholder={
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Select device</span>
                      </div>
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {devices.length === 0 ? (
                      <div className="flex items-center gap-2 p-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">No devices available</span>
                      </div>
                    ) : (
                      devices.map((device) => (
                        <SelectItem
                          key={device.imei}
                          value={device.imei}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex flex-col items-start min-w-0">
                              <span className="font-medium text-sm truncate w-full">{device.displayName}</span>
                              <code className="text-[10px] text-muted-foreground font-mono">
                                {device.imei}
                              </code>
                            </div>
                            {selectedImei === device.imei && (
                              <Badge variant="outline" className="text-[8px] h-4">
                                Active
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right Section - Device Info (when selected) */}
          {selectedDevice && (
            <div className="flex items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-3 md:p-4 border border-primary/10 w-full xl:w-auto">
              <div className="flex items-center gap-3 shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Active Device
                  </p>
                  <p className="font-semibold text-xs md:text-sm truncate max-w-[120px]">
                    {selectedDevice.displayName}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-border shrink-0" />

              <div className="min-w-0 flex-1 xl:flex-none">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 truncate">
                  IMEI
                </p>
                <code className="font-mono text-xs md:text-sm font-medium bg-background/50 px-2 py-0.5 rounded-md truncate block sm:inline">
                  {selectedDevice.imei}
                </code>
              </div>

              {currentMode && (
                <>
                  <div className="h-8 w-px bg-border shrink-0 hidden md:block" />
                  <div className="min-w-0 flex-1 xl:flex-none">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 truncate">
                      Current Mode
                    </p>
                    <Badge variant="outline" className="text-orange-600 border-orange-500/30 bg-orange-500/5 font-bold px-2 py-0.5">
                       {currentMode}
                    </Badge>
                  </div>
                </>
              )}

              <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-[10px] px-2 py-0 shrink-0 hidden sm:flex">
                Configured
              </Badge>
            </div>
          )}
        </div>

        {/* Loading overlay for device selection */}
        {isLoadingDevices && !routeImei && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading devices...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}