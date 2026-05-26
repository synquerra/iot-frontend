import { Select, Group, Box, Text, ThemeIcon } from "@mantine/core";
import { Smartphone, Battery, Signal } from "lucide-react";
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
    <Box className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 px-3 bg-card border border-border rounded-xl shadow-sm">
      <Group gap="sm" className="flex-1">
        <ThemeIcon variant="light" size="lg" radius="md">
          <Smartphone size="1.2rem" />
        </ThemeIcon>

        <Box className="h-6 w-px bg-border/60 mx-1 hidden md:block" />

        <Box className="flex-1 max-w-[240px]">
          <Select
            value={selectedImei}
            onChange={(val) => val && onSelectImei(val)}
            disabled={isLoading}
            placeholder="Select Device"
            variant="unstyled"
            searchable
            data={devices.map((device) => ({
              value: device.imei,
              label: device.displayName || `ID: ${device.imei.slice(-6)}`,
            }))}
            classNames={{
              input: "font-black uppercase tracking-tight text-xs",
              dropdown: "bg-card border-border shadow-xl rounded-xl",
              option: "text-xs font-bold uppercase",
            }}
          />
        </Box>
      </Group>

      {selectedDevice && (
        <Group justify="space-between" className="border-t md:border-t-0 border-border/50 pt-2 md:pt-0" gap="xl">
          <Group gap="xs">
             <Box className={cn(
               "h-2 w-2 rounded-full",
               selectedDevice.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
             )} />
             <Text size="xs" fw={900} tt="uppercase" className={cn(
               "tracking-widest",
               selectedDevice.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
             )}>
               {selectedDevice.status === "active" ? "Online" : "Offline"}
             </Text>
          </Group>

          <Group gap="md">
            <Group gap={6}>
              <Battery className={cn(
                "h-3.5 w-3.5",
                Number(selectedDevice?.battery || 0) < 20 ? "text-red-500" : "text-muted-foreground/60"
              )} />
              <Text size="xs" fw={700} ff="monospace">{selectedDevice?.battery || 0}%</Text>
            </Group>
            <Group gap={6}>
              <Signal className="h-3.5 w-3.5 text-muted-foreground/60" />
              <Text size="xs" fw={700} ff="monospace">{selectedDevice?.signal || 0}%</Text>
            </Group>
          </Group>
        </Group>
      )}
    </Box>
  );
}
