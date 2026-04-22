import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CheckCircle2 } from "lucide-react";
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
    <Card className="overflow-hidden border border-border bg-card shadow-sm rounded-xl">
      <CardHeader className="border-b border-border bg-muted/5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Event Log</CardTitle>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {filteredItems.length} {filteredItems.length === 1 ? 'record' : 'records'} found
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              placeholder="Filter by code or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/20 text-sm font-medium"
            />
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
