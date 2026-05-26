import { Card, Box, Group, Text } from "@mantine/core";
import { Clock, Activity, Zap, Plane, Settings2, Thermometer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeviceSettingsSummaryProps = {
  normalInterval?: string;
  sosInterval?: string;
  speedLimit?: string;
  lowBattery?: string;
  airplaneInterval?: string;
  temperatureLimit?: string;
};

function SettingRow({ 
  icon: Icon, 
  label, 
  value, 
  unit 
}: { 
  icon: any; 
  label: string; 
  value: string;
  unit?: string;
}) {
  const isNA = value === "N/A" || !value;
  
  return (
    <Group justify="space-between" align="center" py="sm" className="border-b last:border-0 border-border/40 group/row">
      <Group gap="sm" align="center">
        <Box className="rounded-lg p-1.5 bg-muted/50 group-hover/row:bg-blue-500/10 transition-colors">
          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover/row:text-blue-500 transition-colors" />
        </Box>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" className="tracking-widest">{label}</Text>
      </Group>
      <Group gap={4} align="baseline">
        <Text
          ff="monospace"
          size="sm"
          fw={900}
          className={cn(
            "tracking-tight",
            isNA ? "text-muted-foreground/40" : "text-foreground"
          )}
        >
          {value}
        </Text>
        {!isNA && unit && (
          <Text size="0.65rem" fw={900} c="dimmed" tt="uppercase" className="opacity-60">
            {unit}
          </Text>
        )}
      </Group>
    </Group>
  );
}

export function DeviceSettingsSummaryCard({
  normalInterval = "N/A",
  sosInterval = "N/A",
  speedLimit = "N/A",
  lowBattery = "N/A",
  airplaneInterval = "N/A",
  temperatureLimit = "N/A",
}: DeviceSettingsSummaryProps) {
  return (
    <Card radius="xl" withBorder padding={0} shadow="sm" className="bg-card hover:shadow-md transition-all duration-300 overflow-hidden border-border">
      <Box className="pb-4 border-b bg-muted/5 p-4">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Box className="rounded-lg bg-blue-500/10 p-2 shrink-0">
              <Settings2 className="h-4 w-4 text-blue-500" />
            </Box>
            <Box>
              <Text size="sm" fw={700} tt="uppercase" className="tracking-wider">Active Configuration</Text>
              <Text size="0.65rem" fw={500} c="dimmed" tt="uppercase" className="tracking-tight">Current hardware state</Text>
            </Box>
          </Group>
          <ShieldCheck className="h-5 w-5 text-emerald-500 opacity-20 shrink-0" />
        </Group>
      </Box>
      <Box className="pt-2 px-5 pb-4">
        <Box className="flex flex-col">
          <SettingRow icon={Clock} label="Ping Interval" value={normalInterval} unit="s" />
          <SettingRow icon={Activity} label="SOS Interval" value={sosInterval} unit="s" />
          <SettingRow icon={Plane} label="Airplane Mode" value={airplaneInterval} unit="s" />
          <SettingRow icon={Zap} label="Low Battery Alert" value={lowBattery} unit="%" />
          <SettingRow icon={Thermometer} label="Thermal Limit" value={temperatureLimit} unit="°C" />
          <SettingRow icon={Activity} label="Velocity Cap" value={speedLimit} unit="km/h" />
        </Box>
      </Box>
    </Card>
  );
}
