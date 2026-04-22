import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Clock, CheckCircle2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "../types";

interface AlertItemProps {
  item: HistoryItem;
  isRefreshing: boolean;
  onAcknowledge: (id: string) => void;
  formatDate: (date: string) => string;
}

export function AlertItem({ item, isRefreshing, onAcknowledge, formatDate }: AlertItemProps) {
  const severityThemes: Record<string, string> = {
    critical: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50",
    danger: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50",
    warning: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
    caution: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
    advisory: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50",
  };

  const theme = severityThemes[item.severity.toLowerCase()] || severityThemes.advisory;

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-all duration-200 p-4",
        item.is_acknowledged ? "bg-muted/30 border-border opacity-60" : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-sm font-bold tracking-tight truncate">{item.title}</h3>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase px-2 py-0 h-5 border",
                item.is_acknowledged ? "bg-muted text-muted-foreground border-border" : theme
              )}
            >
              {item.severity}
            </Badge>
            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
              {item.code}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 opacity-50" />
              <span className="font-mono text-foreground/80">{item.imei}</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-border pl-4">
              <Clock className="h-3.5 w-3.5 opacity-50" />
              <span>{formatDate(item.timestamp)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!item.is_acknowledged ? (
            <Button
              size="sm"
              disabled={isRefreshing}
              onClick={() => onAcknowledge(item.id)}
              className="h-8 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white px-4 rounded-lg"
            >
              <Bell className="h-3.5 w-3.5 mr-2" />
              Acknowledge
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase px-3 py-1.5 bg-muted rounded-lg border border-border/50">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Resolved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
