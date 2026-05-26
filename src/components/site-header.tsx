"use client";

import {
  ChevronRight,
  LayoutDashboard,
  Settings,
  Terminal,
  Map,
  Bell,
  Package,
  Activity,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavUser } from "@/components/nav-user";
import { useLocation } from "react-router-dom";
import {
  Box,
  Burger,
  Divider,
  Group,
  Image,
  Paper,
  Text,
  ThemeIcon,
} from "@mantine/core";

const pathConfigs = [
  { pattern: /^\/devices\/settings(\/.*)?$/, label: "Device Settings", icon: Settings },
  { pattern: /^\/devices\/testing(\/.*)?$/, label: "Device Testing", icon: Terminal },
  { pattern: /^\/devices\/geofencing(\/.*)?$/, label: "Geofencing", icon: Map },
  { pattern: /^\/devices\/telemetry(\/.*)?$/, label: "Telemetry", icon: Activity },
  { pattern: /^\/devices\/fota(\/.*)?$/, label: "FOTA Updates", icon: Package },
  { pattern: /^\/devices\/list(\/.*)?$/, label: "Device Fleet", icon: LayoutDashboard },
  { pattern: /^\/devices\/[^\/]+$/, label: "Device Overview", icon: LayoutDashboard },
  { pattern: /^\/alerts(\/.*)?$/, label: "Alerts & Errors", icon: Bell },
  { pattern: /^\/$/, label: "Dashboard", icon: LayoutDashboard },
];

export function SiteHeader({
  mobileOpened,
  toggleMobile,
  collapsed,
  onCollapseToggle,
}: {
  mobileOpened: boolean;
  toggleMobile: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
}) {
  const pathname = useLocation().pathname;
  const currentPath =
    pathConfigs.find((config) => config.pattern.test(pathname)) ?? {
      label: "Dashboard",
      icon: LayoutDashboard,
    };
  const CurrentIcon = currentPath.icon;

  return (
    <Group h="100%" px="md" gap="sm" wrap="nowrap">
      <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />

      <Paper
        visibleFrom="sm"
        p={6}
        radius="md"
        shadow="xs"
        withBorder
        bg="dark.8"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        <Image src="/images/logo.png" alt="Synquerra" h={28} w="auto" fit="contain" />
      </Paper>

      <Burger opened={!collapsed} onClick={onCollapseToggle} visibleFrom="sm" size="sm" />

      <Divider orientation="vertical" />

      <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        <ThemeIcon variant="light" radius="md" size="lg">
          <CurrentIcon size={16} />
        </ThemeIcon>

        <Box style={{ minWidth: 0 }}>
          <Group gap={6} wrap="nowrap">
            <Text size="10px" fw={700} tt="uppercase" c="dimmed" visibleFrom="xs">
              System
            </Text>
            <ChevronRight size={12} color="var(--mantine-color-dimmed)" />
            <Text size="sm" fw={700} tt="uppercase" truncate>
              {currentPath.label}
            </Text>
          </Group>
        </Box>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <ThemeToggle />
        <NavUser compact />
      </Group>
    </Group>
  );
}
