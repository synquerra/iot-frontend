import { listDevices, getDeviceByImei, type Device } from "@/features/devices/services/deviceService";
import {
  getLatestDeviceSettings,
  type LatestDeviceSettingsRecord,
} from "@/features/device-settings/services/deviceSettingsService";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GeneralDeviceControls } from "./components/GeneralDeviceControls";
import { IntervalsSettings } from "./components/IntervalsSettings";
import { CommunicationSettings } from "./components/CommunicationSettings";
import { AdvancedSettings } from "./components/AdvancedSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="space-y-6">
      <PageHeader
        title="Device Settings"
        description="Configure unit parameters and system behavior"
        icon={Settings}
      />
      <div className="flex flex-col lg:flex-row gap-4 min-h-0 relative">
      {/* ── Device Selector Panel ── */}
      <aside className={cn(
        "shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        isSidebarCollapsed ? "w-0 opacity-0" : "w-full lg:w-64 xl:w-72"
      )}>
        <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-0">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wide">Device Fleet</span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {devices.length}
            </span>
          </div>

          {/* Device list */}
          <ScrollArea className="h-40 lg:h-[calc(100vh-14rem)]">
            {isLoadingDevices ? (
              <div className="p-3 space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Smartphone className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">No devices available</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {devices.map((device) => {
                  const isSelected = device.imei === selectedImei;
                  const isActive = device.status === "active";
                  return (
                    <button
                      key={device.imei}
                      onClick={() => handleSelectDevice(device.imei)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group flex items-center gap-3",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      {/* Status dot */}
                      <div className={cn(
                        "h-2 w-2 rounded-full flex-shrink-0 mt-0.5",
                        isSelected
                          ? (isActive ? "bg-primary-foreground/80 animate-pulse" : "bg-primary-foreground/30")
                          : (isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30")
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-xs font-semibold truncate leading-tight",
                          isSelected ? "text-primary-foreground" : "text-foreground"
                        )}>
                          {device.displayName}
                        </p>
                        <p className={cn(
                          "text-[10px] font-mono truncate leading-tight mt-0.5",
                          isSelected ? "text-primary-foreground/60" : "text-muted-foreground"
                        )}>
                          {device.imei}
                        </p>
                      </div>
                      {isSelected && (
                        <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/60 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* ── Settings Content Panel ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Selected device context bar */}
        <div className={cn(
          "bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all",
          !selectedDevice && "opacity-50"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Show device list" : "Hide device list"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
            selectedDevice?.status === "active"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-muted border border-border"
          )}>
            <Smartphone className={cn(
              "h-3.5 w-3.5",
              selectedDevice?.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )} />
          </div>

          <div className="flex-1 min-w-0">
            {selectedDevice ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold truncate">{selectedDevice.displayName}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 font-bold border",
                      selectedDevice.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {selectedDevice.status === "active" ? "Online" : "Offline"}
                  </Badge>
                  {selectedDevice.currentMode && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-800/50">
                      {selectedDevice.currentMode}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground">{selectedDevice.imei}</span>
                  {selectedDevice.battery && (
                    <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                      <Battery className="h-3 w-3" />{selectedDevice.battery}%
                    </span>
                  )}
                  {selectedDevice.signal && (
                    <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
                      <Signal className="h-3 w-3" />{selectedDevice.signal}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Select a device from the panel to configure settings</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {latestSettings && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-semibold">Settings loaded</span>
              </div>
            )}
            {selectedDevice && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => loadSettings(true)}
                disabled={isRefreshingSettings || isLoadingSettings}
                title="Refresh settings"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshingSettings || isLoadingSettings) && "animate-spin text-primary")} />
              </Button>
            )}
          </div>
        </div>

        {/* Settings loading skeleton */}
        {isLoadingSettings && selectedDevice && (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {/* All settings — shown as scrollable sections */}
        {!isLoadingSettings && (
          <div className="space-y-4">
            {/* Quick Controls */}
            <GeneralDeviceControls
              selectedDevice={selectedDevice}
              latestSettings={latestSettings}
            />

            {/* Two-column layout for intervals and contacts on desktop */}
            <div className="grid gap-4 xl:grid-cols-2">
              <IntervalsSettings
                selectedImei={selectedImei}
                latestSettings={latestSettings}
              />
              <CommunicationSettings
                selectedImei={selectedImei}
                latestSettings={latestSettings}
                isLoadingLatestSettings={isLoadingSettings}
              />
            </div>

            {/* Advanced — full width */}
            <AdvancedSettings selectedImei={selectedImei} />
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
