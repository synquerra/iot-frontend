import React from "react";
import type { LucideIcon } from "lucide-react";
import { Group, Text, Title, ThemeIcon, Box } from "@mantine/core";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" mb="md">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size="lg" variant="light" radius="md">
          <Icon size="1.2rem" strokeWidth={1.5} />
        </ThemeIcon>
        <Box>
          <Title order={3} size="h4">{title}</Title>
          {description && (
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} className="hidden sm:block">
              {description}
            </Text>
          )}
        </Box>
      </Group>

      {children && (
        <Group gap="xs">
          {children}
        </Group>
      )}
    </Group>
  );
}
