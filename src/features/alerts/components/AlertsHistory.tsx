import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <Card className="overflow-hidden border border-border bg-card shadow-sm rounded-2xl">
      <CardHeader className="border-b border-border bg-muted/5 py-4 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Audit Stream</CardTitle>
            <p className="text-[11px] font-bold uppercase tracking-tight text-foreground/80 leading-none">System Event Log</p>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2 py-0.5 h-5 bg-muted/30 border-border/50">
               {filteredItems.length} Records Found
             </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-5 mb-4 border border-border/50">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold">No active events</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6 font-medium">
              {searchQuery 
                ? "Try adjusting your filter parameters"
                : "The system is currently stable and all monitoring protocols are normal."}
            </p>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="h-8 text-xs font-bold uppercase tracking-wider hover:bg-muted"
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
