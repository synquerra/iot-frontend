"use client";

import {
  BellIcon,
  BrainCogIcon,
  Cpu,
  FlaskConical,
  PhoneIcon,
  PieChart,
  PinIcon,
  Settings2,
  Users,
} from "lucide-react";
import * as React from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Group, Stack, Box, Text, Image } from "@mantine/core";

import { NavMain } from "@/components/nav-main";

const data = {
  topNavItems: [
    {
      name: "Overview",
      path: "/",
      end: "/",
      icon: PieChart,
      roles: ["admin"],
    },
    {
      name: "Device Fleet",
      path: "/devices/list",
      end: "/devices",
      icon: PhoneIcon,
      roles: ["admin"],
    },
    {
      name: "Device Settings",
      path: "/devices/settings",
      end: "/devices/settings",
      icon: BrainCogIcon,
      roles: ["admin", "testing"],
    },
    {
      name: "Geofence",
      path: "/devices/geofencing",
      end: "/devices/geofencing",
      icon: PinIcon,
      roles: ["admin", "testing"],
    },
    {
      name: "Testing",
      path: "/devices/testing",
      end: "/devices/testing",
      icon: FlaskConical,
      roles: ["admin", "testing"],
    },
    {
      name: "Alerts",
      path: "/alerts",
      end: "/alerts",
      icon: BellIcon,
      roles: ["admin"],
    },
    {
      name: "FOTA Updates",
      path: "/devices/fota",
      end: "/devices/fota",
      icon: Cpu,
      roles: ["admin", "fota"],
    },
    {
      name: "User Management",
      path: "/users",
      end: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Modes",
      path: "/modes",
      end: "/modes",
      icon: Settings2,
      roles: ["admin"],
    },
  ],
};

export function AppSidebar({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const { userType } = useUserContext();

  const filteredNavItems = React.useMemo(() => {
    return data.topNavItems.filter((item) => {
      if (!item.roles) return true;
      if (!userType) return false;
      return item.roles.includes(userType);
    });
  }, [userType]);

  return (
    <Stack h="100%" gap="lg">
      <Box>
        {!collapsed && (
          <Box px="xs" mb="lg" visibleFrom="sm">
            <Text size="xs" fw={900} c="dimmed" tt="uppercase">
              Core Fleet
            </Text>
          </Box>
        )}

        <Group hiddenFrom="sm" p="sm" mb="md" justify="space-between" align="center">
          <Group gap="sm" wrap="nowrap">
            <Image src="/images/favicon.png" alt="Synquerra" h={32} w={32} fit="contain" />
            <Box>
              <Text size="sm" fw={600}>
                Synquerra
              </Text>
              <Text size="xs" c="dimmed">
                Management
              </Text>
            </Box>
          </Group>
        </Group>

        <NavMain items={filteredNavItems} collapsed={collapsed} />
      </Box>
    </Stack>
  );
}
