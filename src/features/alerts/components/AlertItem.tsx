import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Smartphone, Clock, CheckCircle2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "../types";

interface AlertItemProps {
  item: HistoryItem;
  isRefreshing: boolean;
  onAcknowledge: (id: string) => void;
  formatDate: (date: string) => string;
}

export function AlertItem({ item, isRefreshing, onAcknowledge, formatDate }: AlertItemProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border-2 p-5 transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        item.is_acknowledged ? "bg-muted/30 opacity-75" : "bg-background"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
        item.is_acknowledged ? "bg-slate-300" : `bg-${item.color}-500`
      )} />

      <div className="flex flex-col gap-4 pl-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <Badge
              className={cn(
                "capitalize font-bold px-3 py-1 border-0",
                item.severity === "critical" && "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
                item.severity === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                item.severity === "advisory" && "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
              )}
            >

              {item.severity}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold tracking-wider">{item.code}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5" />
              <span className="font-mono">{item.imei}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(item.timestamp)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:self-center">
          <Button
            size="sm"
            variant={item.is_acknowledged ? "ghost" : "default"}
            disabled={item.is_acknowledged || isRefreshing}
            onClick={() => onAcknowledge(item.id)}
            className={cn(
              "h-9 px-4 font-bold shadow-sm transition-all",
              !item.is_acknowledged && "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {item.is_acknowledged ? (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Acknowledged</>
            ) : (
              <><Bell className="h-4 w-4 mr-2" /> Acknowledge</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
