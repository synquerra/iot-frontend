import { Button, ActionIcon, SegmentedControl } from "@mantine/core";
import { RefreshCw, AlertOctagon, AlertCircle, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertsHeaderProps {
  viewMode: "errors" | "alerts";
  onViewModeChange: (mode: "errors" | "alerts") => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AlertsHeader({ 
  viewMode, 
  onViewModeChange, 
  isRefreshing, 
  onRefresh,
  searchQuery,
  onSearchChange
}: AlertsHeaderProps) {
  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          {/* Left: Mode Selection */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="shrink-0 flex items-center gap-3 px-1">
               <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <AlertOctagon className="h-4 w-4 text-primary" />
               </div>
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 leading-none mb-1">Incident View</h3>
                  <p className="text-[11px] font-bold uppercase tracking-tight text-foreground/80 leading-none">Management Console</p>
               </div>
            </div>

            <div className="h-8 w-px bg-border/60 mx-2 hidden sm:block" />

            <SegmentedControl
              value={viewMode}
              onChange={(val: any) => onViewModeChange(val)}
              data={[
                { label: <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><AlertOctagon className="h-3 w-3" /> Errors</span>, value: 'errors' },
                { label: <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><AlertCircle className="h-3 w-3" /> Alerts</span>, value: 'alerts' },
              ]}
              classNames={{ root: 'bg-muted/40 border border-border/50 h-9 p-1 rounded-xl', indicator: 'bg-background shadow-sm rounded-lg' }}
            />
          </div>

          {/* Right: Search & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Filter by IMEI or Message..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-3 h-9 text-xs font-bold bg-muted/20 border border-border/50 focus:bg-background outline-none transition-all rounded-xl w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                color="gray"
                onClick={onRefresh} 
                disabled={isRefreshing}
                className="h-9 px-4 font-black uppercase tracking-widest text-[9px] gap-2 rounded-xl border-border/50 bg-background hover:bg-muted/50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
                {isRefreshing ? "Syncing" : "Refresh"}
              </Button>
              
              <ActionIcon 
                variant="outline" 
                color="gray"
                className="h-9 w-9 rounded-xl border-border/50 bg-background hover:bg-muted/50"
              >
                <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              </ActionIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
