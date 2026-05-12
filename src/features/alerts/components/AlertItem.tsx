import { Badge } from "@/components/ui/badge";
import { Smartphone, Clock } from "lucide-react";
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
    critical: "bg-red-50/80 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40 text-red-700 dark:text-red-400",
    danger: "bg-red-50/80 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40 text-red-700 dark:text-red-400",
    warning: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
    caution: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
    advisory: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-400",
  };

  const theme = severityThemes[item.severity.toLowerCase()] || severityThemes.advisory;

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-all duration-200 py-2.5 px-4",
        item.is_acknowledged ? "bg-muted/30 border-border opacity-50" : theme
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-[13px] font-black tracking-tight truncate leading-none">{item.title}</h3>
            <Badge
              className={cn(
                "text-[9px] font-black uppercase px-1.5 py-0 h-4 border-0",
                item.is_acknowledged ? "bg-muted text-muted-foreground" : "bg-foreground/5 text-inherit"
              )}
            >
              {item.severity}
            </Badge>
            <span className="text-[9px] font-mono font-black text-muted-foreground/60 bg-foreground/5 px-1.5 py-0.5 rounded leading-none">
              {item.code}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight">
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3 w-3 opacity-40" />
              <span className="font-mono text-foreground/70">{item.imei}</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-border/40 pl-3">
              <Clock className="h-3 w-3 opacity-40" />
              <span className="opacity-70">{formatDate(item.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
