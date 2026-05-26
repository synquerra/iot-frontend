import { Card, Button, Box, Text, Badge, Group } from "@mantine/core";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    { icon: Phone, label: "Call Guardian", color: "blue" },
    { icon: MessageSquare, label: "Send SMS", color: "green" },
    { icon: MapPin, label: "Locate Device", color: "purple" },
    { icon: AlertTriangle, label: "SOS Test", color: "red", destructive: true },
  ];

  const colorStyles: Record<string, string> = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
  };

  return (
    <Card shadow="sm" radius="md" withBorder padding="md" className="relative opacity-60 grayscale-[0.5] pointer-events-none">
      <Box mb="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">Quick Actions</Text>
          <Badge variant="outline" size="xs" radius="sm">Dummy</Badge>
        </Group>
        <Text size="xs" c="dimmed">Remote device controls</Text>
      </Box>
      <Box className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="subtle"
            color={action.destructive ? "red" : "gray"}
            className={cn(
              "w-full h-auto py-3 px-4",
              action.destructive &&
                "text-red-500 hover:text-red-600 hover:bg-red-500/10",
            )}
            leftSection={
              <action.icon
                className={cn(
                  "h-4 w-4",
                  !action.destructive && colorStyles[action.color],
                )}
              />
            }
            rightSection={<ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />}
            styles={{ inner: { justifyContent: "flex-start", flex: 1 }, label: { flex: 1, textAlign: "left" } }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Card>
  );
}
