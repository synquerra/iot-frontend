import { Card, Group, Text, Box } from "@mantine/core";

interface DeviceInfoSummaryProps {
  imei: string;
}

export function DeviceInfoSummary({ imei }: DeviceInfoSummaryProps) {
  return (
    <Card shadow="sm" radius="md" withBorder padding="md">
      <Box mb="md">
        <Text fw={600} size="sm">Device Information</Text>
      </Box>
      <Box className="space-y-2">
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">IMEI</Text>
          <Text ff="monospace" fw={500}>{imei}</Text>
        </Group>
      </Box>
    </Card>
  );
}
