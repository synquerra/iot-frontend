import { Select, Badge, Box, Group, Text, Code } from "@mantine/core";
import { ChevronRight, Cpu, Smartphone, Activity, RefreshCw } from "lucide-react";
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
  const selectData = devices.map((device) => ({
    value: device.imei,
    label: device.displayName || `ID: ${device.imei.slice(-6)}`,
  }));

  return (
    <Box className="relative overflow-hidden bg-card border border-border rounded-xl shadow-sm p-2 px-3 animate-in fade-in duration-500">
      <Group justify="space-between" align="center" gap="md" className="flex-col md:flex-row">
        {/* Left Section: Breadcrumb & Selector */}
        <Group gap="xs" className="w-full md:w-auto">
          <Group gap="xs" wrap="nowrap" className="shrink-0">
            <Box className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Cpu className="h-4 w-4 text-primary" />
            </Box>
            <Group gap="xs" wrap="nowrap" className="hidden sm:flex">
              <Text size="0.6rem" fw={900} tt="uppercase" className="tracking-[0.2em]" c="dimmed">
                System
              </Text>
              <ChevronRight className="h-3 w-3 text-muted-foreground/20" />
            </Group>
            <Text size="xs" fw={700} tt="uppercase" className="tracking-wider text-foreground/80">
              Settings
            </Text>
          </Group>

          <Box className="h-6 w-px bg-border/60 mx-1 hidden md:block" />

          {/* Minimal Device Selector */}
          <Box className="flex-1 md:w-[240px]">
            {routeImei ? (
              <Group gap="xs" wrap="nowrap" className="px-3 h-8 bg-muted/30 rounded-md border border-transparent">
                 <Smartphone className="h-3.5 w-3.5 text-muted-foreground/60" />
                 <Text size="xs" fw={900} tt="uppercase" className="tracking-tight truncate">
                   {selectedDevice?.displayName || selectedImei}
                 </Text>
              </Group>
            ) : (
              <Select
                value={selectedImei}
                onChange={(val) => val && onSelectImei(val)}
                disabled={isLoadingDevices}
                data={selectData}
                leftSection={<Smartphone className="h-3.5 w-3.5 text-muted-foreground/60" />}
                variant="unstyled"
                placeholder="Select Device"
                styles={{
                  input: {
                    height: '2rem',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    paddingLeft: '2rem',
                  }
                }}
                className="w-full hover:bg-muted/50 rounded-md transition-colors"
              />
            )}
          </Box>
        </Group>

        {/* Right Section: Status & Mode */}
        {selectedDevice && (
          <Group gap="lg" className="w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/50 pt-2 md:pt-0">
            {/* Online Status */}
            <Group gap="xs" align="center" wrap="nowrap">
               <Box className={cn(
                 "h-1.5 w-1.5 rounded-full",
                 selectedDevice.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
               )} />
               <Text size="0.65rem" fw={900} tt="uppercase" className="tracking-widest" c={selectedDevice.status === "active" ? "emerald.6" : "dimmed"}>
                 {selectedDevice.status === "active" ? "Online" : "Offline"}
               </Text>
            </Group>

            {/* Mode Badge */}
            {currentMode && (
              <Group gap="xs" align="center" wrap="nowrap">
                <Box className="h-4 w-px bg-border/60 hidden md:block" />
                <Group gap="xs" align="center" wrap="nowrap">
                   <Activity className="h-3 w-3 text-orange-500/70" />
                   <Badge variant="outline" color="orange" size="xs" className="font-black uppercase tracking-tighter bg-orange-500/5 px-2 py-0 h-4 leading-none">
                     {currentMode}
                   </Badge>
                </Group>
              </Group>
            )}

            {/* IMEI Tag (Only on desktop) */}
            <Group gap="xs" align="center" className="hidden lg:flex" wrap="nowrap">
               <Box className="h-4 w-px bg-border/60" />
               <Code className="text-[10px] font-mono font-bold text-muted-foreground/60 uppercase">
                 IMEI: {selectedImei}
               </Code>
            </Group>
          </Group>
        )}
      </Group>

      {/* Loading overlay for device selection */}
      {isLoadingDevices && !routeImei && (
        <Box className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-primary/40" />
        </Box>
      )}
    </Box>
  );
}