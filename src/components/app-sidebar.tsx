"use client";

import {
  BellIcon,
  BrainCogIcon,
  Cpu,
  FlaskConical,
  PhoneIcon,
  PieChart,
  PinIcon,
  Users,
} from "lucide-react";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { useUserContext } from "@/contexts/UserContext";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
      name: "Device List",
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userType } = useUserContext();

  const filteredNavItems = React.useMemo(() => {
    return data.topNavItems.filter((item) => {
      if (!item.roles) return true;
      if (!userType) return false;
      return item.roles.includes(userType);
    });
  }, [userType]);

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader className="sm:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <img src="/images/favicon.png" className="size-8" />

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Synquerra</span>
                  <span className="truncate text-xs">Management</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
