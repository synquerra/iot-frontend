import { Badge, Card, Progress, Box, Group, Text } from "@mantine/core";
import { cn } from "@/lib/utils";
import { Clock4, Cpu } from "lucide-react";

interface DeviceHealthCardProps {
  performance: number;
  dataInterval: string;
}

export function DeviceHealthCard({
  performance,
  dataInterval,
}: DeviceHealthCardProps) {
  const items = [
    {
      icon: Cpu,
      label: "Performance",
      value: `${performance}%`,
      progress: performance,
      color: "green",
    },

    {
      icon: Clock4,
      label: "Data Interval",
      value: `${dataInterval}s`,
      color: "orange",
    },
  ];

  return (
    <Card shadow="sm" radius="md" withBorder padding="md">
      <Box mb="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">Device Health</Text>
          <Badge variant="outline" color="gray" size="sm">
            Real-time
          </Badge>
        </Group>
      </Box>
      <Box className="space-y-4">
        {items.map((item, i) => (
          <Box key={i} className="space-y-1.5">
            <Group justify="space-between" align="center">
              <Group gap={8} align="center">
                <item.icon
                  className={cn("h-4 w-4", `text-${item.color}-500`)}
                />
                <Text size="sm">{item.label}</Text>
              </Group>
              <Text size="sm" fw={500}>{item.value}</Text>
            </Group>
            {item.progress !== undefined && (
              <Progress value={item.progress} size="sm" color={item.color} />
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
}
