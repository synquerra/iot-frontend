import { useState } from "react";
import { Search, Plus, Lock, Settings, ChevronRight, ShieldAlert, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DeviceMode } from "../types";

interface ModeSidebarProps {
  modes: DeviceMode[];
  selectedModeId: string | null;
  onSelectMode: (id: string) => void;
  onAddNew: () => void;
  loading: boolean;
}

export function ModeSidebar({
  modes,
  selectedModeId,
  onSelectMode,
  onAddNew,
  loading,
}: ModeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModes = modes.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemModes = filteredModes.filter((m) => m.is_system_mode);
  const customModes = filteredModes.filter((m) => !m.is_system_mode);

  const renderModeItem = (mode: DeviceMode) => {
    const isSelected = selectedModeId === mode.id;
    return (
      <button
        key={mode.id}
        onClick={() => onSelectMode(mode.id)}
        className={cn(
          "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group flex items-center gap-3 mb-1",
          isSelected
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "hover:bg-muted/60 text-foreground"
        )}
      >
        {/* Priority Indicator Dot */}
        <div className={cn(
          "h-2 w-2 rounded-full flex-shrink-0 mt-0.5",
          isSelected
            ? "bg-primary-foreground/80 animate-pulse"
            : (mode.priority > 50 ? "bg-rose-500" : "bg-emerald-500")
        )} title={`Priority: ${mode.priority}`} />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className={cn(
              "text-xs font-bold truncate leading-tight",
              isSelected ? "text-primary-foreground" : "text-foreground/90"
            )}>
              {mode.name}
            </p>
            {mode.is_system_mode && (
              <Lock className={cn("h-2.5 w-2.5 shrink-0 opacity-40", isSelected && "text-primary-foreground opacity-60")} />
            )}
          </div>
          <p className={cn(
            "text-[10px] font-medium truncate leading-tight mt-0.5 opacity-60",
            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            Priority: {mode.priority}
          </p>
        </div>

        {isSelected && (
          <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/60 flex-shrink-0" />
        )}
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-card overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 space-y-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground/70">Mode Library</span>
          </div>
          <span className="text-[10px] font-black text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full">
            {modes.length}
          </span>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search modes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl text-xs font-bold"
          />
        </div>

        <Button
          onClick={onAddNew}
          className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-600/10 gap-2 transition-all active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3px]" />
          New Mode
        </Button>
      </div>

      {/* List Area */}
      <ScrollArea className="flex-1">
        <div className="p-3 pb-8 space-y-6">
          {/* System Modes */}
          {systemModes.length > 0 && (
            <div className="space-y-2">
              <div className="px-1 flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary/10 flex items-center justify-center">
                  <ShieldAlert className="h-2.5 w-2.5 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/70">
                  System Core
                </span>
                <div className="h-[1px] flex-1 bg-border/40" />
              </div>
              <div className="space-y-1">
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-lg mb-1" />
                  ))
                ) : systemModes.map(renderModeItem)}
              </div>
            </div>
          )}

          {/* Custom Modes */}
          <div className="space-y-2">
            <div className="px-1 flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-amber-500/10 flex items-center justify-center">
                <Settings2 className="h-2.5 w-2.5 text-amber-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-600/70">
                Custom Profiles
              </span>
              <div className="h-[1px] flex-1 bg-border/40" />
            </div>
            <div className="space-y-1">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-lg mb-1" />
                ))
              ) : customModes.length > 0 ? (
                customModes.map(renderModeItem)
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center px-4 bg-muted/5 rounded-xl border border-dashed border-border/40">
                  <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-tight">No custom<br/>profiles found</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={onAddNew}
                    className="h-auto p-0 text-[9px] font-black uppercase tracking-tighter text-primary mt-1"
                  >
                    Create first mode
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
