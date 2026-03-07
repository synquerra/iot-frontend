import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    name: string;
    path: string;
    end: string;
    icon: LucideIcon;
  }[];
}) {
  const location = useLocation();
  console.log("current location", location.pathname);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={
                item.path != "/"
                  ? location.pathname.includes(item.path)
                  : location.pathname == item.path
              }
            >
              <NavLink to={item.path}>
                <item.icon />
                <span>{item.name}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
