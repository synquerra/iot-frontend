import { Badge, Box, Text, Group } from "@mantine/core";

interface DeviceSettingsHeaderProps {
  title?: string;
  currentMode?: string | null;
}

export function DeviceSettingsHeader({ title = "Device Settings", currentMode }: DeviceSettingsHeaderProps) {
  return (
    <Group justify="space-between" align="center" className="flex-col gap-4 md:flex-row">
      <Box>
        <Text size="lg" fw={700} tt="uppercase" className="tracking-tight text-foreground">
          {title}
        </Text>
        <Text size="0.6rem" fw={700} tt="uppercase" className="tracking-widest" c="dimmed">
          Operational Control Panel
        </Text>
      </Box>
      <Group gap="xs" align="center">
        {currentMode && (
          <Badge variant="light" color="slate" size="lg" className="px-3 py-1 font-mono text-[11px] font-bold tracking-tight uppercase">
            Mode: {currentMode}
          </Badge>
        )}
      </Group>
    </Group>
  );
}
