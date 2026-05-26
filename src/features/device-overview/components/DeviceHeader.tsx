import { Badge, Button, Menu, Tooltip, Box, Group, Text, ActionIcon } from "@mantine/core";
import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronDown,
  Clock,
  Layers,
  MapPinned,
  Power,
  RefreshCcw,
  Settings,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { SwitchModeDialog } from "@/features/devices/components/SwitchModeDialog";
import { toggleDeviceStatus } from "@/features/devices/services/deviceService";
import { toast } from "@/lib/toast";

interface DeviceHeaderProps {
  name: string;
  imei?: string;
  status: string;
  lastUpdate: string;
  onRefresh: () => void;
  refreshing: boolean;
  currentModeName?: string | null;
  onModeSwitch?: () => void;
  deviceTopic?: string | null;
}

export function DeviceHeader({
  name,
  imei,
  status,
  lastUpdate,
  onRefresh,
  refreshing,
  currentModeName,
  onModeSwitch,
  deviceTopic,
}: DeviceHeaderProps) {
  const { imei: routeImei } = useParams();
  const navigate = useNavigate();
  const [switchModeOpen, setSwitchModeOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const effectiveImei = imei ?? routeImei ?? "";
  const isOnline = status === "Online";

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch {
      return "Just now";
    }
  };

  const handleToggleStatus = async () => {
    const topic = deviceTopic;
    if (!topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsToggling(true);
      const newStatus = !isOnline;
      await toggleDeviceStatus(topic, newStatus);
      toast.success(`Device ${newStatus ? "activated" : "deactivated"} successfully`);
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update device status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Box component="header" className="relative w-full overflow-hidden border-b bg-background pb-3 border-border">
      <Box className="relative z-10">
        <Group justify="space-between" align="center" className="flex-col md:flex-row gap-4">
          {/* Left: icon + name + status */}
          <Group gap={10} align="center">
            <Box className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-inner shrink-0">
              <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            </Box>
            <Box className="flex flex-col gap-0.5 sm:gap-1 pt-0.5">
              <Group gap="sm" align="center" wrap="wrap">
                <Text size="sm" fw={700} className="tracking-tight leading-none">{name || effectiveImei}</Text>
                <Badge
                  variant={isOnline ? "filled" : "outline"}
                  color={isOnline ? "teal" : "gray"}
                  size="sm"
                  className={cn(
                    "font-semibold tracking-wide uppercase",
                  )}
                  leftSection={isOnline ? (
                    <Box component="span" className="mr-1 h-1.5 w-1.5 rounded-full inline-block bg-white animate-pulse" />
                  ) : null}
                >
                  {status}
                </Badge>
                {currentModeName && (
                  <Badge variant="light" color="blue" size="sm" className="font-black uppercase tracking-widest" leftSection={<Layers size="0.6rem" />}>
                    {currentModeName}
                  </Badge>
                )}
              </Group>
              <Group gap={6} align="center" className="text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <Text size="xs">Updated {formatDateTime(lastUpdate)}</Text>
              </Group>
            </Box>
          </Group>

          {/* Right: Refresh + Actions dropdown */}
          <Group gap="sm" align="center">
            <Tooltip label="Sync Dashboard">
              <ActionIcon
                variant="default"
                size="lg"
                radius="md"
                onClick={onRefresh}
                loading={refreshing}
              >
                <RefreshCcw size="1.1rem" className={cn(refreshing && "animate-spin text-blue-500")} />
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <Button size="sm" radius="md" rightSection={<ChevronDown size="0.9rem" className="opacity-70" />} leftSection={<Settings size="1rem" />}>
                  Actions
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label className="uppercase tracking-wider">Device Actions</Menu.Label>
                <Menu.Divider />

                <Menu.Item
                  leftSection={<Power size="1rem" className={isOnline ? "text-red-500" : "text-emerald-500"} />}
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                >
                  <Box>
                    <Text size="sm">{isOnline ? "Deactivate" : "Activate"}</Text>
                    <Text size="xs" c="dimmed">{isOnline ? "Set to offline" : "Set to online"}</Text>
                  </Box>
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<Settings size="1rem" />}
                  onClick={() => navigate(`/devices/settings/${effectiveImei}`)}
                >
                  Settings
                </Menu.Item>

                <Menu.Item
                  leftSection={<MapPinned size="1rem" />}
                  onClick={() => navigate(`/devices/geofencing/${effectiveImei}`)}
                >
                  Geofencing
                </Menu.Item>

                <Menu.Item
                  leftSection={<Activity size="1rem" />}
                  onClick={() => navigate(`/devices/telemetry/${effectiveImei}`)}
                >
                  Telemetry
                </Menu.Item>

                <Menu.Item
                  leftSection={<Layers size="1rem" className="text-blue-500" />}
                  onClick={() => setSwitchModeOpen(true)}
                >
                  <Box>
                    <Text size="sm">Switch Mode</Text>
                    <Text size="xs" c="dimmed">
                      {currentModeName ? `Current: ${currentModeName}` : "Change active mode"}
                    </Text>
                  </Box>
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<Trash2 size="1rem" />}
                  color="red"
                  disabled
                >
                  <Box>
                    <Text size="sm">Remove Device</Text>
                    <Text size="xs" c="dimmed">Coming soon</Text>
                  </Box>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      <SwitchModeDialog
        open={switchModeOpen}
        onOpenChange={setSwitchModeOpen}
        imei={effectiveImei}
        currentModeName={currentModeName}
        onSwitched={onModeSwitch}
      />
    </Box>
  );
}
