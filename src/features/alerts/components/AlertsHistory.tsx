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
    <Card className="overflow-hidden border-2">
      <CardHeader className="border-b bg-background/50 backdrop-blur-sm p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Event History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredItems.length} {filteredItems.length === 1 ? 'event' : 'events'} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {searchQuery 
                ? "Try adjusting your search query or switching tabs"
                : "Excellent! All systems are operating normally."}
            </p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="font-bold underline"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
