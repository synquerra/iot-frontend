import { Card, Box, Text, Group, Progress } from "@mantine/core";
import { Signal } from "lucide-react";

interface NetworkPerformanceCardProps {
  gpsSignal: number;
  gpsSignalRaw?: string;
  signal: number;
}

export function NetworkPerformanceCard({
  gpsSignal,
  gpsSignalRaw,
  signal,
}: NetworkPerformanceCardProps) {
  return (
    <Card shadow="sm" radius="md" withBorder padding="md">
      <Box mb="md">
        <Text fw={600} size="sm">GPS Performance</Text>
        <Text size="xs" c="dimmed">GPS signal quality</Text>
      </Box>
      <Box className="space-y-6">
        <Box className="space-y-3">
          <Group justify="space-between" align="center" className="text-sm">
            <Group gap={8} align="center">
              <Signal className="h-4 w-4 text-green-500" />
              <Text size="sm">GPS Strength</Text>
            </Group>
            <Text fw={500} size="sm">{gpsSignalRaw || `${gpsSignal}%`}</Text>
          </Group>
          <Progress value={gpsSignal} size="sm" color="green" />
        </Box>
      </Box>
    </Card>
  );
}
