import { Avatar, Card, Tooltip, ActionIcon, Group, Text, Box } from "@mantine/core";
import { Phone } from "lucide-react";

interface GuardiansListProps {
  guardian1Phone: string;
  guardian2Phone: string;
}

export function GuardiansList({
  guardian1Phone,
  guardian2Phone,
}: GuardiansListProps) {
  const guardians = [
    ...(guardian1Phone ? [{ name: "Emergency Contact 1", phone: guardian1Phone, initials: "C1" }] : []),
    ...(guardian2Phone ? [{ name: "Emergency Contact 2", phone: guardian2Phone, initials: "C2" }] : []),
  ];

  if (guardians.length === 0) return null;

  return (
    <Card shadow="sm" radius="md" withBorder padding="md">
      <Box mb="md">
        <Text fw={600} size="sm">Guardians</Text>
        <Text size="xs" c="dimmed">Emergency contacts</Text>
      </Box>
      <Box className="space-y-4">
        {guardians.map((guardian, i) => (
          <Group
            key={i}
            wrap="nowrap"
            className="p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar size="md" color="blue" radius="xl">
              {guardian.initials}
            </Avatar>
            <Box className="flex-1 min-w-0">
              <Text size="sm" fw={500} className="truncate">{guardian.name}</Text>
              <Text size="xs" c="dimmed">{guardian.phone}</Text>
            </Box>
            <Tooltip label="Call now">
              <ActionIcon variant="subtle" color="gray" size="lg" radius="md">
                <Phone size="1.1rem" />
              </ActionIcon>
            </Tooltip>
          </Group>
        ))}
      </Box>
    </Card>
  );
}
