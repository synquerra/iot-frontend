import { useState } from "react";
import { Search, Plus, MapPin, Trash2, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GeofenceRecord } from "../types";

interface GeofenceSidebarProps {
  geofences: GeofenceRecord[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  selectedId: string | null;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function GeofenceSidebar({
  geofences,
  onSelect,
  onAdd,
  onEdit,
  selectedId,
  onDelete,
  isLoading,
}: GeofenceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGeofences = geofences.filter((geo) => {
    return geo.geofence_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 space-y-4 border-b border-border">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search geofences..."
            className="pl-9 h-9 text-sm border-border bg-muted/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button 
          size="sm"
          className="w-full gap-2 h-9 font-semibold shadow-sm text-white" 
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5" />
          New Geofence
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 border-b border-border bg-muted/10">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Geofence List ({filteredGeofences.length})
          </p>
        </div>
        
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredGeofences.length > 0 ? (
          <div className="p-2 space-y-1">
            {filteredGeofences.map((geo) => (
              <div key={geo.geofence_id} className="relative group">
                <button
                  onClick={() => onSelect(geo.geofence_id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors border",
                    selectedId === geo.geofence_id
                      ? "bg-primary/5 border-primary/20"
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: geo.color ? `${geo.color}15` : "#2563eb15",
                      borderColor: geo.color ? `${geo.color}30` : "#2563eb30",
                    }}
                  >
                    <MapPin
                      className="h-4.5 w-4.5"
                      style={{ color: geo.color || "#2563eb" }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-14">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "font-semibold text-sm truncate leading-none",
                        selectedId === geo.geofence_id ? "text-primary" : "text-foreground"
                      )}>
                        {geo.geofence_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {geo.flag && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-tight border border-border/50">
                          {geo.flag}
                        </span>
                      )}
                      {geo.geofence_number && (
                        <span className="text-[10px] text-primary font-semibold uppercase tracking-tight">
                          Slot {geo.geofence_number.replace("GEO", "")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(geo.geofence_id);
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    title="Edit Geofence"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete(geo.geofence_id);
                    }}
                    className="p-1.5 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Delete Geofence"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm font-medium">No geofences found</p>
            <p className="text-xs mt-1">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
