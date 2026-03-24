import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Clock, Radio, RefreshCcw, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface DeviceHeaderProps {
  name: string;
  status: string;
  lastUpdate: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export function DeviceHeader({
  name,
  status,
  lastUpdate,
  onRefresh,
  refreshing,
}: DeviceHeaderProps) {
  const { imei } = useParams();
  const navigate = useNavigate();
  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight md:text-2xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Device Overview
                </h1>
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex border-primary/20 bg-primary/5 text-primary"
                >
                  Beta
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{name}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(lastUpdate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full animate-pulse",
                  status === "Online" ? "bg-green-500" : "bg-red-500",
                )}
              />
              <span className="text-sm font-medium">{status}</span>
            </div>



            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onRefresh}
                  disabled={refreshing}
                >
                  <RefreshCcw
                    className={cn("h-4 w-4", refreshing && "animate-spin")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>

            <Button
              className="gap-2 bg-gradient-to-r from-primary to-primary/90"
              onClick={() => {
                navigate(`/devices/settings/${imei}`);
              }}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configure</span>
            </Button>
          </div>
      </div>
    </header>
  );
}
