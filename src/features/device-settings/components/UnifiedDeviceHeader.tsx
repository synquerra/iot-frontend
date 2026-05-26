import { Select, Badge, Box, Group, Text } from "@mantine/core";
import { Smartphone, RefreshCw } from "lucide-react";
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
  const selectData = devices.map((device) => ({
    value: device.imei,
    label: device.displayName || `ID: ${device.imei.slice(-6)}`,
  }));

  return (
    <Box className="flex flex-col gap-4">
      {/* Selector Card */}
      <Box className="relative overflow-hidden bg-card border border-border rounded-2xl shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <Group justify="space-between" align="center" gap="md" className="flex-col md:flex-row">
          <Group gap="md" align="center" className="flex-1 w-full">
            <Box className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
               <Smartphone className="h-5 w-5 text-muted-foreground/60" />
            </Box>
            
            <Box className="flex-1 min-w-0">
              <Group gap="xs" align="center" className="mb-1 w-full" wrap="nowrap" justify="space-between">
                <Text size="0.6rem" fw={900} tt="uppercase" className="tracking-widest" c="dimmed">Target Device Selection</Text>
                {selectedDevice && (
                  <Group gap="xs" align="center" className="ml-auto sm:ml-2" wrap="nowrap">
                    <Box className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      selectedDevice.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                    )} />
                    <Text size="0.65rem" fw={900} tt="uppercase" className="tracking-widest" c={selectedDevice.status === "active" ? "emerald.6" : "dimmed"}>
                      {selectedDevice.status === "active" ? "Online" : "Offline"}
                    </Text>
                    {currentMode && (
                      <>
                        <Box className="h-2 w-px bg-border/60" />
                        <Text size="0.65rem" fw={900} tt="uppercase" color="orange" className="tracking-tighter">
                          {currentMode}
                        </Text>
                      </>
                    )}
                  </Group>
                )}
              </Group>
              {routeImei ? (
                <Group gap="xs" align="center" wrap="nowrap">
                  <Text size="md" fw={900} tt="uppercase" className="tracking-tight truncate">
                    {selectedDevice?.displayName || selectedImei}
                  </Text>
                  <Badge variant="light" color="gray" size="xs" className="font-mono text-[10px] font-bold border-transparent">
                    {selectedImei}
                  </Badge>
                </Group>
              ) : (
                <Select
                  value={selectedImei}
                  onChange={(val) => val && onSelectImei(val)}
                  disabled={isLoadingDevices}
                  data={selectData}
                  placeholder="Select Device"
                  className="w-full md:w-[320px]"
                />
              )}
            </Box>
          </Group>

          {selectedDevice && (
            <Group gap="md" align="center" className="md:pl-4 md:border-l border-border/50 w-full md:w-auto justify-end">
              <Box className="flex flex-col items-end">
                <Text size="0.6rem" fw={900} tt="uppercase" className="tracking-widest" c="dimmed" mb={4}>Telemetry Status</Text>
                <Group gap="xs" align="center" wrap="nowrap">
                   <Badge variant="light" color="gray" size="sm" className="font-mono font-bold">
                     {selectedImei}
                   </Badge>
                   <Box className="h-8 w-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                      <RefreshCw className={cn("h-4 w-4 text-emerald-500", selectedDevice.status === "active" && "animate-spin-slow")} />
                   </Box>
                </Group>
              </Box>
            </Group>
          )}
        </Group>

        {isLoadingDevices && !routeImei && (
          <Box className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Group gap="xs" className="px-4 py-2 bg-card border border-border rounded-full shadow-lg" wrap="nowrap">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <Text size="xs" fw={750} tt="uppercase" className="tracking-widest">Updating Node List...</Text>
            </Group>
          </Box>
        )}
      </Box>
    </Box>
  );
}
