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
    <Card className="overflow-hidden shadow-lg">

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6">
          {/* Left Section - Title & Device Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Device
                </h3>
                <p className="text-2xl font-bold tracking-tight">
                  Device Configuration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronRight className="h-4 w-4 hidden sm:block" />
              <span className="text-sm hidden sm:block">Select or change device</span>
            </div>

            {routeImei ? (
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                  <Smartphone className="h-3.5 w-3.5 mr-2" />
                  {selectedDevice?.displayName ?? "Selected device"}
                </Badge>
                <code className="relative rounded bg-muted px-[0.5rem] py-[0.25rem] font-mono text-xs font-semibold">
                  {selectedImei}
                </code>
              </div>
            ) : (
              <div className="sm:min-w-[320px] flex-1 sm:flex-none">
                <Select
                  value={selectedImei}
                  onValueChange={onSelectImei}
                  disabled={isLoadingDevices}
                >
                  <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm border-2 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder={
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span>Select a device</span>
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
                          className="cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{device.displayName}</span>
                              <code className="text-xs text-muted-foreground font-mono">
                                {device.imei}
                              </code>
                            </div>
                            {selectedImei === device.imei && (
                              <Badge variant="outline" className="text-[10px]">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Active Device
                  </p>
                  <p className="font-semibold text-sm">
                    {selectedDevice.displayName}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-border hidden sm:block" />

              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  IMEI Number
                </p>
                <code className="font-mono text-sm font-medium bg-background/50 px-2 py-1 rounded-md">
                  {selectedDevice.imei}
                </code>
              </div>

              <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
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