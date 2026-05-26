import { type LucideIcon } from "lucide-react";
import { NavLink as MantineNavLink, Stack } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

export function NavMain({
  items,
  collapsed,
}: {
  items: {
    name: string;
    path: string;
    end: string;
    icon: LucideIcon;
  }[];
  collapsed?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Stack gap="xs">
      {items.map((item) => {
        const isActive = (() => {
          if (item.path === "/") {
            return location.pathname === "/";
          }
          
          if (location.pathname.startsWith(item.path)) {
            return true;
          }

          if (item.name === "Device Fleet") {
            const isUnderDevices = location.pathname.startsWith("/devices");
            const isUnderSpecificFeature = 
              location.pathname.startsWith("/devices/settings") ||
              location.pathname.startsWith("/devices/geofencing") ||
              location.pathname.startsWith("/devices/testing") ||
              location.pathname.startsWith("/devices/fota");
            
            if (isUnderDevices && !isUnderSpecificFeature) {
              return true;
            }
          }

          return false;
        })();

        return (
          <MantineNavLink
            key={item.name}
            active={isActive}
            label={item.name}
            leftSection={<item.icon size="1.2rem" strokeWidth={1.5} />}
            onClick={() => navigate(item.path)}
            variant="filled"
            styles={{
              root: {
                borderRadius: "var(--mantine-radius-md)",
                fontWeight: 600,
              },
              body: {
                display: collapsed ? "none" : undefined,
              },
              section: {
                marginInlineEnd: collapsed ? 0 : undefined,
                justifyContent: "center",
              },
              label: {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        );
      })}
    </Stack>
  );
}
