import { listDevices, getDeviceByImei, type Device } from "@/features/devices/services/deviceService";
import {
  getLatestDeviceSettings,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { GeneralDeviceControls } from "./components/GeneralDeviceControls";
import { IntervalsSettings } from "./components/IntervalsSettings";
import { CommunicationSettings } from "./components/CommunicationSettings";
import { AdvancedSettings } from "./components/AdvancedSettings";
import {
  Badge,
  ScrollArea,
  Skeleton,
  Box,
  Group,
  Text,
  ActionIcon,
  NavLink
} from "@mantine/core";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  RefreshCw,
  ChevronRight,
  Signal,
  Battery,
  CheckCircle2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";

export default function DeviceSettings() {
  const { imei: routeImei } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [selectedImei, setSelectedImei] = useState(routeImei ?? "");
  const [selectedDeviceData, setSelectedDeviceData] = useState<Device | null>(null);
  const [latestSettings, setLatestSettings] = useState<LatestDeviceSettingsRecord | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isRefreshingSettings, setIsRefreshingSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSelectedImei(routeImei ?? "");
    if (routeImei) {
      getDeviceByImei(routeImei).then(d => {
        if (d) setSelectedDeviceData(d);
      });
    }
  }, [routeImei]);

  useEffect(() => {
    let isMounted = true;
    const loadDevices = async () => {
      try {
        setIsLoadingDevices(true);
        const response = await listDevices();
        if (!isMounted) return;
        setDevices(response);
        // Auto-select first device if no route IMEI
        if (!routeImei && response.length > 0) {
          const firstImei = response[0].imei;
          setSelectedImei(firstImei);
          getDeviceByImei(firstImei).then(setSelectedDeviceData);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load devices");
      } finally {
        if (isMounted) setIsLoadingDevices(false);
      }
    };
    loadDevices();
    return () => { isMounted = false; };
  }, [routeImei]);

  const selectedDevice = useMemo(
    () => selectedDeviceData || devices.find((d) => d.imei === selectedImei) || null,
    [devices, selectedImei, selectedDeviceData],
  );


  const loadSettings = async (silent = false) => {
    if (!selectedDevice?.topic) {
      setLatestSettings(null);
      return;
    }
    try {
      if (!silent) setIsLoadingSettings(true);
      else setIsRefreshingSettings(true);
      const response = await getLatestDeviceSettings(selectedDevice.topic);
      setLatestSettings(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load device settings");
    } finally {
      setIsLoadingSettings(false);
      setIsRefreshingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [selectedDevice?.topic]);

  const handleSelectDevice = (imei: string) => {
    if (routeImei) {
      navigate(`/devices/settings/${imei}`);
    } else {
      setSelectedImei(imei);
    }
  };

  return (
    <Box className="space-y-6">
      <PageHeader
        title="Device Settings"
        description="Configure unit parameters and system behavior"
        icon={Settings}
      />
      <Box className="flex flex-col lg:flex-row gap-4 min-h-0 relative">
      {/* ── Device Selector Panel ── */}
      <aside className={cn(
        "shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        isSidebarCollapsed ? "w-0 opacity-0" : "w-full lg:w-64 xl:w-72"
      )}>
        <Box className="bg-card border border-border rounded-xl overflow-hidden sticky top-0">
          {/* Panel header */}
          <Group justify="space-between" align="center" className="px-4 py-3 border-b border-border bg-muted/30">
            <Group gap="sm" align="center">
              <Settings className="h-4 w-4 text-primary" />
              <Text size="xs" fw={700} tt="uppercase" className="tracking-wide">Device Fleet</Text>
            </Group>
            <Badge variant="light" color="gray" size="sm">
              {devices.length}
            </Badge>
          </Group>

          {/* Device list */}
          <ScrollArea className="h-40 lg:h-[calc(100vh-14rem)]">
            {isLoadingDevices ? (
              <Box className="p-3 space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg animate-pulse" />
                ))}
              </Box>
            ) : devices.length === 0 ? (
              <Box className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Smartphone className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <Text size="xs" c="dimmed">No devices available</Text>
              </Box>
            ) : (
              <Box className="p-2 space-y-1">
                {devices.map((device) => {
                  const isSelected = device.imei === selectedImei;
                  const isActive = device.status === "active";
                  return (
                    <NavLink
                      key={device.imei}
                      active={isSelected}
                      onClick={() => handleSelectDevice(device.imei)}
                      label={
                        <Text size="xs" fw={700}>
                          {device.displayName}
                        </Text>
                      }
                      description={device.imei}
                      leftSection={
                        <Box
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                          }}
                          className={cn(
                            isSelected
                              ? (isActive ? "bg-white animate-pulse" : "bg-white/40")
                              : (isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30")
                          )}
                        />
                      }
                      rightSection={isSelected ? <ChevronRight size={12} /> : null}
                      className="rounded-md mb-1"
                      variant="filled"
                    />
                  );
                })}
              </Box>
            )}
          </ScrollArea>
        </Box>
      </aside>

      {/* ── Settings Content Panel ── */}
      <Box className="flex-1 min-w-0 space-y-4">

        {/* Selected device context bar */}
        <Group align="center" justify="space-between" className={cn(
          "bg-card border border-border rounded-xl px-4 py-2.5 transition-all",
          !selectedDevice && "opacity-50"
        )}>
          <Group gap="md" align="center" className="flex-1 min-w-0">
            <ActionIcon
              variant="subtle"
              color="gray"
              className="shrink-0"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Show device list" : "Hide device list"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </ActionIcon>

            <Box className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
              selectedDevice?.status === "active"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-muted border border-border"
            )}>
              <Smartphone className={cn(
                "h-3.5 w-3.5",
                selectedDevice?.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              )} />
            </Box>

            <Box className="flex-1 min-w-0">
              {selectedDevice ? (
                <>
                  <Group gap="xs" align="center" wrap="wrap">
                    <Text size="sm" fw={700} className="truncate">{selectedDevice.displayName}</Text>
                    <Badge
                      variant="light"
                      color={selectedDevice.status === "active" ? "green" : "gray"}
                      size="xs"
                      className="font-bold border"
                    >
                      {selectedDevice.status === "active" ? "Online" : "Offline"}
                    </Badge>
                    {selectedDevice.currentMode && (
                      <Badge variant="outline" color="orange" size="xs" className="font-bold">
                        {selectedDevice.currentMode}
                      </Badge>
                    )}
                  </Group>
                  <Group gap="md" align="center" className="mt-1" wrap="nowrap">
                    <Text size="0.65rem" className="font-mono" c="dimmed">{selectedDevice.imei}</Text>
                    {selectedDevice.battery && (
                      <Text size="0.65rem" className="flex items-center gap-0.5" c="dimmed">
                        <Battery className="h-3 w-3" />{selectedDevice.battery}%
                      </Text>
                    )}
                    {selectedDevice.signal && (
                      <Text size="0.65rem" className="flex items-center gap-0.5" c="dimmed">
                        <Signal className="h-3 w-3" />{selectedDevice.signal}
                      </Text>
                    )}
                  </Group>
                </>
              ) : (
                <Text size="xs" c="dimmed">Select a device from the panel to configure settings</Text>
              )}
            </Box>
          </Group>

          <Group gap="xs" align="center" className="flex-shrink-0" wrap="nowrap">
            {latestSettings && (
              <Group gap={4} align="center" className="text-[10px] text-emerald-600 dark:text-emerald-400" wrap="nowrap">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <Text size="xs" fw={700} className="hidden sm:inline">Settings loaded</Text>
              </Group>
            )}
            {selectedDevice && (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => loadSettings(true)}
                disabled={isRefreshingSettings || isLoadingSettings}
                title="Refresh settings"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshingSettings || isLoadingSettings) && "animate-spin text-primary")} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Settings loading skeleton */}
        {isLoadingSettings && selectedDevice && (
          <Box className="space-y-4">
            <Skeleton className="h-32 rounded-xl animate-pulse" />
            <Skeleton className="h-64 rounded-xl animate-pulse" />
          </Box>
        )}

        {/* All settings — shown as scrollable sections */}
        {!isLoadingSettings && (
          <Box className="space-y-4">
            {/* Quick Controls */}
            <GeneralDeviceControls
              selectedDevice={selectedDevice}
              latestSettings={latestSettings}
            />

            {/* Two-column layout for intervals and contacts on desktop */}
            <Box className="grid gap-4 xl:grid-cols-2">
              <IntervalsSettings
                selectedImei={selectedImei}
                latestSettings={latestSettings}
              />
              <CommunicationSettings
                selectedImei={selectedImei}
                latestSettings={latestSettings}
                isLoadingLatestSettings={isLoadingSettings}
              />
            </Box>

            {/* Advanced — full width */}
            <AdvancedSettings selectedImei={selectedImei} />
          </Box>
        )}
      </Box>
    </Box>
   </Box>
  );
}
