import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Clock, RefreshCcw, Settings, Smartphone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface DeviceHeaderProps {
  name: string;
  imei?: string;
  status: string;
  lastUpdate: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export function DeviceHeader({
  name,
  imei,
  status,
  lastUpdate,
  onRefresh,
  refreshing,
}: DeviceHeaderProps) {
  const { imei: routeImei } = useParams();
  const navigate = useNavigate();
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

  return (
    <header className="relative w-full overflow-hidden border-b bg-background pb-3">
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 ring-1 ring-border/50">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {name || "Device Overview"}
                </h1>
                <Badge 
                  variant={status === "Online" ? "default" : "secondary"}
                  className={cn(
                    "px-2.5 py-0.5 font-semibold text-xs tracking-wide uppercase",
                    status === "Online" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-500"
                  )}
                >
                  <span className={cn(
                    "mr-1.5 h-1.5 w-1.5 rounded-full inline-block",
                    status === "Online" ? "bg-emerald-200 animate-pulse" : "bg-slate-300"
                  )} />
                  {status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                {imei && (
                  <div className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-md border border-border">
                    <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-widest">IMEI</span>
                    <span className="font-mono text-foreground font-semibold">{imei}</span>
                  </div>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Updated {formatDateTime(lastUpdate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  <RefreshCcw
                    className={cn("h-4 w-4", refreshing && "animate-spin text-primary")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sync Dashboard</TooltipContent>
            </Tooltip>

            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm px-4 h-9"
              onClick={() => {
                navigate(`/devices/settings/${imei || routeImei}`);
              }}
            >
              <Settings className="h-4 w-4" />
              <span>Configure Device</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
