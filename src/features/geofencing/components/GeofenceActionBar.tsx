import { Button } from "@/components/ui/button";
import { Save, X, Trash2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeofenceActionBarProps {
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onOpenSettings: () => void;
  isSaving?: boolean;
  geofenceName?: string;
  pointsCount: number;
}

export function GeofenceActionBar({
  onClose,
  onSave,
  onDelete,
  onOpenSettings,
  isSaving,
  geofenceName,
  pointsCount,
}: GeofenceActionBarProps) {
  const isGeometryComplete = pointsCount === 5;

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 bg-card border border-border p-2 rounded-xl shadow-md z-[1000] animate-in slide-in-from-top-4 duration-300">
      <div className="px-3 border-r border-border mr-1 hidden sm:block">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
          Currently Mapping
        </p>
        <p className="text-sm font-bold text-primary truncate max-w-[150px]">
          {geofenceName || "Unnamed Zone"}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-9 gap-1.5 font-medium px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        )}

        <div className="w-px h-6 bg-border mx-1 hidden md:block" />
        
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 gap-1.5 font-semibold px-4 border-border bg-background hover:bg-muted"
          onClick={onOpenSettings}
        >
          <Settings2 className="h-4 w-4 text-primary" />
          Config Settings
        </Button>

        <Button 
          size="sm"
          className={cn(
            "h-9 gap-1.5 font-bold px-6 shadow-lg transition-all duration-300 text-white",
            isGeometryComplete 
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20" 
              : "bg-primary shadow-primary/20"
          )}
          onClick={onSave} 
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Syncing..." : "Finalize & Save"}
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button 
          variant="secondary" 
          size="icon"
          className="h-9 w-9 rounded-lg border border-border hover:bg-muted"
          onClick={onClose}
          title="Close Editor"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
