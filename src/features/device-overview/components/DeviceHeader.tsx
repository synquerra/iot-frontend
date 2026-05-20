import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "sonner";

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
    <header className="relative w-full overflow-hidden border-b bg-background pb-3">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: icon + name + status */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-inner">
              <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5 sm:gap-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight leading-none">{name || effectiveImei}</h1>
                <Badge
                  variant={isOnline ? "default" : "secondary"}
                  className={cn(
                    "px-2 py-0.5 font-semibold text-[10px] tracking-wide uppercase",
                    isOnline ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-500"
                  )}
                >
                  <span className={cn(
                    "mr-1.5 h-1.5 w-1.5 rounded-full inline-block",
                    isOnline ? "bg-emerald-200 animate-pulse" : "bg-slate-300"
                  )} />
                  {status}
                </Badge>
                {currentModeName && (
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-primary/30 text-primary bg-primary/5">
                    <Layers className="h-2.5 w-2.5 mr-1" />
                    {currentModeName}
                  </Badge>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Updated {formatDateTime(lastUpdate)}
              </span>
            </div>
          </div>

          {/* Right: Refresh + Actions dropdown */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin text-primary")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sync Dashboard</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm px-4 h-9">
                  <Settings className="h-4 w-4" />
                  <span>Actions</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Device Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className="cursor-pointer"
                >
                  <Power className={cn("h-4 w-4 mr-2", isOnline ? "text-destructive" : "text-emerald-500")} />
                  <div className="flex flex-col text-left">
                    <span>{isOnline ? "Deactivate" : "Activate"}</span>
                    <span className="text-xs text-muted-foreground">{isOnline ? "Set to offline" : "Set to online"}</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate(`/devices/settings/${effectiveImei}`)}
                  className="cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate(`/devices/geofencing/${effectiveImei}`)}
                  className="cursor-pointer"
                >
                  <MapPinned className="h-4 w-4 mr-2" />
                  <span>Geofencing</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate(`/devices/telemetry/${effectiveImei}`)}
                  className="cursor-pointer"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  <span>Telemetry</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSwitchModeOpen(true)}
                  className="cursor-pointer"
                >
                  <Layers className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex flex-col text-left">
                    <span>Switch Mode</span>
                    <span className="text-xs text-muted-foreground">
                      {currentModeName ? `Current: ${currentModeName}` : "Change active mode"}
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
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
        </div>
      </div>

      <SwitchModeDialog
        open={switchModeOpen}
        onOpenChange={setSwitchModeOpen}
        imei={effectiveImei}
        currentModeName={currentModeName}
        onSwitched={onModeSwitch}
      />
    </header>
  );
}
