import { AppShell, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: collapsed ? 84 : 272,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: "var(--mantine-color-body)",
          minHeight: "100vh",
        },
      }}
    >
      <AppShell.Header
        style={{
          backgroundColor: "var(--mantine-color-body)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <SiteHeader
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed(!collapsed)}
        />
      </AppShell.Header>

      <AppShell.Navbar
        p="sm"
        style={{
          borderRight: "1px solid var(--mantine-color-default-border)",
          backgroundColor: "var(--mantine-color-body)",
          overflow: "hidden",
          transition: "width 300ms ease",
        }}
      >
        <AppSidebar collapsed={collapsed} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box w="100%" h="100%">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
