import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertItem } from "./AlertItem";
import type { HistoryItem } from "../types";

interface AlertsHistoryProps {
  loading: boolean;
  filteredItems: HistoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRefreshing: boolean;
  onAcknowledge: (id: string) => void;
  formatDate: (date: string) => string;
}

export function AlertsHistory({
  loading,
  filteredItems,
  searchQuery,
  setSearchQuery,
  isRefreshing,
  onAcknowledge,
  formatDate
}: AlertsHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <AlertItem
                key={item.id}
                item={item}
                isRefreshing={isRefreshing}
                onAcknowledge={onAcknowledge}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/10 rounded-3xl border border-dashed border-border/50">
            <div className="rounded-full bg-muted/40 p-5 mb-4 border border-border/50">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter">No active events</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6 font-bold uppercase tracking-tight opacity-60">
              {searchQuery 
                ? "Try adjusting your filter parameters"
                : "The system is currently stable and all monitoring protocols are normal."}
            </p>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-muted rounded-full px-6"
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
