import { ChevronsUpDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import {
  Avatar,
  Box,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useUserContext } from "@/contexts/UserContext";
import { logoutUser } from "@/Pages/Auth/authService";

export function NavUser({
  collapsed,
  compact = false,
}: {
  collapsed?: boolean;
  compact?: boolean;
}) {
  const { email, firstName, lastName, userType, clearUserContext } = useUserContext();
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email?.split("@")[0] || "User";

  const handleLogout = () => {
    try {
      logoutUser();
      clearUserContext();
      toast.success("Logged out successfully");
      navigate("/auth/login");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      console.error("Logout error:", error);
    }
  };

  return (
    <Menu shadow="md" width={260} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            width: compact ? "auto" : "100%",
            padding: compact ? 6 : 10,
            borderRadius: "var(--mantine-radius-md)",
            backgroundColor: "transparent",
          }}
        >
          <Group wrap="nowrap" gap="sm" justify={collapsed ? "center" : "flex-start"}>
            <Avatar color="indigo" radius="md">
              {displayName.slice(0, 2).toUpperCase()}
            </Avatar>

            {!collapsed && (
              <>
                <Box style={{ flex: 1, overflow: "hidden" }}>
                  <Text size="sm" fw={600} truncate>
                    {displayName}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {userType ? userType.toUpperCase() : email}
                  </Text>
                </Box>
                <ChevronsUpDown
                  size={16}
                  color={
                    colorScheme === "dark"
                      ? "var(--mantine-color-dark-2)"
                      : "var(--mantine-color-gray-6)"
                  }
                />
              </>
            )}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{displayName}</Menu.Label>
        {email && <Menu.Label>{email}</Menu.Label>}
        <Menu.Divider />
        <Menu.Item leftSection={<LogOut size={16} />} color="red" onClick={handleLogout}>
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
