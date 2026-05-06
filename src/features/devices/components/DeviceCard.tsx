import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { toggleDeviceStatus } from "../services/deviceService";

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
  };
  onClick?: () => void;
  onView?: () => void;
  onGeofencing?: () => void;
  onTelemetry?: () => void;
  onSettings?: () => void;
  onRemove?: () => void;
  onStatusToggle?: () => void;
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
}: Props) {
  const [isToggling, setIsToggling] = useState(false);

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
    <Card
      onClick={handleCardClick}
      className={cn(
        "cursor-pointer transition-all duration-200 relative group hover:shadow-md border-border",
        !isActive && "opacity-75"
      )}
    >
      <CardContent className="p-3">
        {/* Dropdown Menu */}
        <div className="absolute top-3 right-3 z-10 dropdown-trigger">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Device Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleToggleStatus} disabled={isToggling} className="cursor-pointer">
                <Power className={cn("h-4 w-4 mr-2", isActive ? "text-destructive" : "text-emerald-500")} />
                <div className="flex flex-col text-left">
                  <span>{isActive ? "Deactivate" : "Activate"}</span>
                  <span className="text-xs text-muted-foreground">{isActive ? "Set to offline" : "Set to online"}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(); }} className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                <span>View Overview</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSettings?.(); }} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGeofencing?.(); }} className="cursor-pointer">
                <MapPinned className="h-4 w-4 mr-2" />
                <span>Geofencing</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTelemetry?.(); }} className="cursor-pointer">
                <Activity className="h-4 w-4 mr-2" />
                <span>Telemetry</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                disabled
                className="text-destructive focus:text-destructive cursor-not-allowed opacity-40"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Remove Device</span>
                  <span className="text-xs text-muted-foreground">Coming soon</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status indicator line */}
        <div className={cn(
          "absolute left-0 top-4 bottom-4 w-0.5 rounded-full transition-all",
          isActive ? "bg-emerald-500" : "bg-muted-foreground/20"
        )} />

        {/* Header */}
        <div className="pl-3 pr-7 mb-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] px-1.5 py-0 h-3.5 capitalize font-bold border",
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            {device.geoid && device.geoid !== "10" && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 font-mono font-bold border-primary/30 text-primary">
                {device.geoid === "11" ? "GPS Off" : `Zone: ${device.geoid}`}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm tracking-tight truncate">{device.displayName}</h3>
        </div>

        {/* Info Grid */}
        <div className="pl-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div className="min-w-0">
            <span className="block text-[9px] font-semibold uppercase text-muted-foreground mb-0.5">IMEI</span>
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group/imei"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(device.imei);
                toast.success("IMEI copied");
              }}
              title="Click to copy"
            >
              <span className="font-mono truncate">{device.imei}</span>
              <Copy className="h-3 w-3 opacity-0 group-hover/imei:opacity-60 transition-opacity flex-shrink-0" />
            </div>
          </div>

          {device.topic && (
            <div className="min-w-0">
              <span className="block text-[9px] font-semibold uppercase text-muted-foreground mb-0.5">Topic</span>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors group/topic"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(device.topic!);
                  toast.success("Topic copied");
                }}
                title="Click to copy"
              >
                <span className="font-mono truncate">{device.topic.length > 18 ? `${device.topic.substring(0, 16)}…` : device.topic}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover/topic:opacity-60 transition-opacity flex-shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Row */}
        {(device.battery || device.signal || device.gps_strength || device.temperature) && (
          <div className="pl-3 flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/50">
            {device.battery && (
              <div className={cn("flex items-center gap-1 text-xs", Number(device.battery) < 20 ? "text-red-500" : "text-muted-foreground")} title="Battery">
                <Battery className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">{device.battery}%</span>
              </div>
            )}
            {device.signal && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Signal">
                <Wifi className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">{device.signal}</span>
              </div>
            )}
            {device.gps_strength && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="GPS">
                <Signal className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">{device.gps_strength}</span>
              </div>
            )}
            {device.temperature && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Temperature">
                <Thermometer className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">{device.temperature}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pl-3 mt-2 flex items-center justify-between gap-2">
          {formattedDate && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CalendarIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "action-button h-7 px-3 text-[10px] font-bold uppercase tracking-wide ml-auto flex-shrink-0",
              isActive
                ? "text-muted-foreground hover:bg-muted"
                : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            )}
            onClick={handleToggleStatus}
            disabled={isToggling}
          >
            {isToggling ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Power className="h-3.5 w-3.5 mr-1" />
                {isActive ? "Deactivate" : "Activate"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
