import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertsHeaderProps {
  icon: any;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AlertsHeader({ icon: Icon, isRefreshing, onRefresh }: AlertsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Alerts & Errors
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor and manage system events across all devices
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRefresh()} 
            disabled={isRefreshing}
            className="gap-2"
         >
           <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
           Refresh
         </Button>
      </div>
    </div>
  );
}
