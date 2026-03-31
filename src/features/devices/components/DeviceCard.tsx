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
  Cpu,
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
} from "lucide-react";
import { toast } from "sonner";

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
};

export function DeviceCard({
  device,
  onClick,
  onView,
  onGeofencing,
  onTelemetry,
  onSettings,
  onRemove,
}: Props) {
  // Format createdAt if it exists
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
    // Prevent card click when clicking on dropdown
    if ((e.target as HTMLElement).closest(".dropdown-trigger")) {
      return;
    }
    onClick?.();
  };

  return (
    <Card
      onClick={handleCardClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 relative group"
    >
      <CardContent className="p-4">
        {/* Dropdown Menu - Top Right */}
        <div className="absolute top-2 right-2 z-10 dropdown-trigger">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Device Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* View Option */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.();
                }}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>View Details</span>
                  <span className="text-xs text-muted-foreground">
                    View device information
                  </span>
                </div>
              </DropdownMenuItem>

              {/* Settings Option */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onSettings?.();
                }}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Settings</span>
                  <span className="text-xs text-muted-foreground">
                    Configure device
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onGeofencing?.();
                }}
                className="cursor-pointer"
              >
                <MapPinned className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Geofencing</span>
                  <span className="text-xs text-muted-foreground">
                    Manage map boundaries
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTelemetry?.();
                }}
                className="cursor-pointer"
              >
                <Activity className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Telemetry</span>
                  <span className="text-xs text-muted-foreground">
                    View raw data stream
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Remove Option (Disabled) */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
                disabled
                className="text-destructive focus:text-destructive cursor-not-allowed opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Remove Device</span>
                  <span className="text-xs text-muted-foreground">
                    Coming soon
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header row - Name, status, short ID */}
        <div className="flex items-center justify-between mb-3 pr-8">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold truncate">{device.displayName}</h3>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-1.5 py-0 h-5 capitalize",
                device.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {device.status}
            </Badge>
          </div>
        </div>

        {/* Compact info grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          {/* IMEI */}
          <div className="min-w-0 group/copy">
            <span className="block text-xs uppercase text-muted-foreground">IMEI</span>
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
              title="Click to copy IMEI"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(device.imei);
                toast.success("IMEI copied to clipboard");
              }}
            >
              <span className="font-mono truncate">{device.imei}</span>
              <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Topic (if exists) */}
          {device.topic && (
            <div className="min-w-0 group/copy">
              <span className="block text-xs uppercase text-muted-foreground">
                Topic
              </span>
              <div
                className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
                title="Click to copy Topic"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(device.topic!);
                  toast.success("Topic copied to clipboard");
                }}
              >
                <span className="font-mono truncate">
                  {device.topic.length > 20
                    ? `${device.topic.substring(0, 18)}…`
                    : device.topic}
                </span>
                <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* Geo ID and fingerprint chips */}
          {(device.geoid || device.imei) && (
            <div className="col-span-2 flex flex-wrap items-center gap-1 mt-1">
              <Cpu className="h-3 w-3 text-muted-foreground" />
              {device.geoid && (
                <span className="rounded border border-border bg-muted text-muted-foreground px-1.5 py-0.5 text-xs font-mono">
                  geo:{device.geoid}
                </span>
              )}

            </div>
          )}

          {/* Telemetry Stats */}
          <div className="col-span-2 flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-border/50">
            {device.battery && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Battery">
                <Battery className="h-3.5 w-3.5 text-green-500" />
                <span className="font-medium">{device.battery}%</span>
              </div>
            )}
            {device.signal && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Network Signal">
                <Wifi className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-medium">{device.signal}</span>
              </div>
            )}
            {device.gps_strength && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="GPS Strength">
                <Signal className="h-3.5 w-3.5 text-purple-500" />
                <span className="font-medium">{device.gps_strength}</span>
              </div>
            )}
            {device.temperature && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Temperature">
                <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-medium">{device.temperature}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with date */}
        {formattedDate && (
          <div className="mt-2 flex items-center gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
