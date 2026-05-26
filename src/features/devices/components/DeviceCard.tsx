import { Card, Badge, Button, Menu, ActionIcon, Group, Box, Text } from "@mantine/core";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Eye,
  MapPinned,
  MoreVertical,
  Settings,
  Trash2,
  Battery,
  Wifi,
  Signal,
  Thermometer,
  Copy,
  Activity,
  Power,
  Layers,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { useState } from "react";
import { toggleDeviceStatus } from "../services/deviceService";
import { SwitchModeDialog } from "./SwitchModeDialog";

type Props = {
  device: {
    imei: string;
    displayName: string;
    studentName?: string | null;
    status: "active" | "inactive";
    studentId: string | null;
    geoid?: string | null;
    createdAt?: string | null;
    topic?: string | null;
    battery?: string | null;
    signal?: string | null;
    gps_strength?: string | null;
    temperature?: string | null;
    currentMode?: string | null;
  };
  onClick?: () => void;
  onView?: () => void;
  onGeofencing?: () => void;
  onTelemetry?: () => void;
  onSettings?: () => void;
  onRemove?: () => void;
  onStatusToggle?: () => void;
  onSwitchMode?: () => void;
};

export function DeviceCard({
  device,
  onClick,
  onView,
  onGeofencing,
  onTelemetry,
  onSettings,
  onRemove,
  onStatusToggle,
  onSwitchMode,
}: Props) {
  const [isToggling, setIsToggling] = useState(false);
  const [switchModeOpen, setSwitchModeOpen] = useState(false);

  const formattedDate = device.createdAt
    ? new Date(device.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    : null;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".dropdown-trigger") || (e.target as HTMLElement).closest(".action-button")) {
      return;
    }
    onClick?.();
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!device.topic) {
      toast.error("Device topic is missing.");
      return;
    }
    try {
      setIsToggling(true);
      const newStatus = device.status === "inactive";
      await toggleDeviceStatus(device.topic, newStatus);
      toast.success(`Device ${newStatus ? "activated" : "deactivated"} successfully`);
      onStatusToggle?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update device status");
    } finally {
      setIsToggling(false);
    }
  };

  const isActive = device.status === "active";

  return (
    <>
      <Card
        shadow="sm"
        radius="md"
        withBorder
        onClick={handleCardClick}
        className={cn(
          "cursor-pointer transition-all duration-200 relative group hover:shadow-md border-border p-3",
          !isActive && "opacity-75"
        )}
      >
        {/* Dropdown Menu */}
        <Box className="absolute top-3 right-3 z-10 dropdown-trigger">
          <Menu position="bottom-end" shadow="md" width={220} radius="md">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size="1rem" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Device Actions</Menu.Label>

              <Menu.Item
                leftSection={<Power size="1rem" className={isActive ? "text-red-500" : "text-emerald-500"} />}
                onClick={handleToggleStatus}
                disabled={isToggling}
              >
                <Box>
                  <Text size="sm">{isActive ? "Deactivate" : "Activate"}</Text>
                  <Text size="xs" c="dimmed">{isActive ? "Set to offline" : "Set to online"}</Text>
                </Box>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item leftSection={<Eye size="1rem" />} onClick={(e) => { e.stopPropagation(); onView?.(); }}>
                View Overview
              </Menu.Item>

              <Menu.Item leftSection={<Settings size="1rem" />} onClick={(e) => { e.stopPropagation(); onSettings?.(); }}>
                Settings
              </Menu.Item>

              <Menu.Item leftSection={<MapPinned size="1rem" />} onClick={(e) => { e.stopPropagation(); onGeofencing?.(); }}>
                Geofencing
              </Menu.Item>

              <Menu.Item leftSection={<Activity size="1rem" />} onClick={(e) => { e.stopPropagation(); onTelemetry?.(); }}>
                Telemetry
              </Menu.Item>

              <Menu.Item
                leftSection={<Layers size="1rem" className="text-primary" />}
                onClick={(e) => { e.stopPropagation(); setSwitchModeOpen(true); }}
              >
                <Box>
                  <Text size="sm">Switch Mode</Text>
                  <Text size="xs" c="dimmed">
                    {device.currentMode ? `Current: ${device.currentMode}` : "Change active mode"}
                  </Text>
                </Box>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                leftSection={<Trash2 size="1rem" />}
                color="red"
                onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                disabled
              >
                <Box>
                  <Text size="sm">Remove Device</Text>
                  <Text size="xs" c="dimmed">Coming soon</Text>
                </Box>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>

        {/* Status indicator line */}
        <Box className={cn(
          "absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all",
          isActive ? "bg-emerald-500" : "bg-muted-foreground/20"
        )} />

        {/* Header */}
        <Box className="pl-4 pr-7 mb-2">
          <Group gap={6} mb={2}>
            <Badge
              size="xs"
              variant={isActive ? "light" : "outline"}
              color={isActive ? "teal" : "gray"}
              className="tracking-widest uppercase"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            {device.geoid && device.geoid !== "10" && (
              <Badge size="xs" variant="outline" color="blue" className="tracking-widest uppercase font-mono">
                {device.geoid === "11" ? "GPS Off" : `Zone: ${device.geoid}`}
              </Badge>
            )}
          </Group>
          <Text size="sm" fw={900} className="tracking-tight truncate leading-none mt-1">
            {device.displayName}
          </Text>
        </Box>

        {/* Info Grid */}
        <Box className="pl-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <Box className="min-w-0">
            <Text size="0.6rem" fw={700} tt="uppercase" c="dimmed" mb={2}>IMEI</Text>
            <Group
              gap={4}
              className="cursor-pointer hover:text-primary transition-colors group/imei"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(device.imei);
                toast.success("IMEI copied");
              }}
              title="Click to copy"
              wrap="nowrap"
            >
              <Text size="xs" ff="monospace" className="truncate">{device.imei}</Text>
              <Copy className="h-3 w-3 opacity-0 group-hover/imei:opacity-60 transition-opacity flex-shrink-0" />
            </Group>
          </Box>

          {device.topic && (
            <Box className="min-w-0">
              <Text size="0.6rem" fw={700} tt="uppercase" c="dimmed" mb={2}>Topic</Text>
              <Group
                gap={4}
                className="cursor-pointer hover:text-primary transition-colors group/topic"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(device.topic!);
                  toast.success("Topic copied");
                }}
                title="Click to copy"
                wrap="nowrap"
              >
                <Text size="xs" ff="monospace" className="truncate">{device.topic.length > 18 ? `${device.topic.substring(0, 16)}…` : device.topic}</Text>
                <Copy className="h-3 w-3 opacity-0 group-hover/topic:opacity-60 transition-opacity flex-shrink-0" />
              </Group>
            </Box>
          )}
        </Box>

        {/* Telemetry Row */}
        {(device.battery || device.signal || device.gps_strength || device.temperature) && (
          <Group gap="sm" className="pl-4 mt-3 pt-3 border-t border-border/50">
            {device.battery && (
              <Group gap={4} title="Battery">
                <Battery className={cn("h-3.5 w-3.5 flex-shrink-0", Number(device.battery) < 20 ? "text-red-500" : "text-muted-foreground")} />
                <Text size="xs" fw={600} ff="monospace">{device.battery}%</Text>
              </Group>
            )}
            {device.signal && (
              <Group gap={4} title="Signal">
                <Wifi className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <Text size="xs" fw={600} ff="monospace">{device.signal}</Text>
              </Group>
            )}
            {device.gps_strength && (
              <Group gap={4} title="GPS">
                <Signal className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <Text size="xs" fw={600} ff="monospace">{device.gps_strength}</Text>
              </Group>
            )}
            {device.temperature && (
              <Group gap={4} title="Temperature">
                <Thermometer className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <Text size="xs" fw={600} ff="monospace">{device.temperature}</Text>
              </Group>
            )}
          </Group>
        )}

        {/* Footer */}
        <Group justify="space-between" className="pl-4 mt-3 pt-2">
          {formattedDate && (
            <Group gap={4} wrap="nowrap">
              <CalendarIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <Text size="0.65rem" c="dimmed" className="truncate">{formattedDate}</Text>
            </Group>
          )}
          <Button
            size="xs"
            variant="subtle"
            color={isActive ? "gray" : "teal"}
            className={cn(
              "action-button font-bold uppercase tracking-wide ml-auto flex-shrink-0",
              isActive && "hover:bg-muted"
            )}
            onClick={handleToggleStatus}
            loading={isToggling}
            leftSection={!isToggling && <Power size="0.8rem" />}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Button>
        </Group>
      </Card>

      <SwitchModeDialog
        open={switchModeOpen}
        onOpenChange={setSwitchModeOpen}
        imei={device.imei}
        currentModeName={device.currentMode}
        onSwitched={() => { onSwitchMode?.(); onStatusToggle?.(); }}
      />
    </>
  );
}
