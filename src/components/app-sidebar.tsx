"use client";

import {
  BellIcon,
  BrainCogIcon,
  PhoneIcon,
  PieChart,
  PinIcon,
} from "lucide-react";
import * as React from "react";

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
import { NavLink } from "react-router-dom";

const data = {
  topNavItems: [
    {
      name: "Overview",
      path: "/",
      end: "/",
      icon: PieChart,
    },
    {
      name: "Device List",
      path: "/devices/list",
      end: "/devices",
      icon: PhoneIcon,
    },
    {
      name: "Device Settings",
      path: "/devices/settings",
      end: "/devices/settings",
      icon: BrainCogIcon,
    },

    {
      name: "Geofence",
      path: "/devices/geofencing",
      end: "/devices/geofencing",
      icon: PinIcon,
    },
    {
      name: "Alerts",
      path: "/alerts",
      end: "/alerts",
      icon: BellIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.topNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
