import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ModeSidebar } from "./ModeSidebar";
import { ModeForm } from "./ModeForm";
import {
  listModes,
  addMode,
  updateMode,
  deleteMode,
  getModeById
} from "../services/modeService";
import type { DeviceMode, CreateModePayload, UpdateModePayload } from "../types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModeManagement() {
  const [modes, setModes] = useState<DeviceMode[]>([]);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<DeviceMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchModes = useCallback(async (selectId?: string) => {
    try {
      setLoading(true);
      const res = await listModes();
      if (res.status === "success") {
        setModes(res.data);
        if (selectId) {
          setSelectedModeId(selectId);
        } else if (res.data.length > 0 && !selectedModeId) {
          setSelectedModeId(res.data[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch modes");
    } finally {
      setLoading(false);
    }
  }, [selectedModeId]);

  const fetchModeDetails = useCallback(async (id: string) => {
    try {
      setDetailsLoading(true);
      const res = await getModeById(id);
      if (res.status === "success") {
        setSelectedMode(res.data);
      }
    } catch (error) {
      toast.error("Failed to load mode details");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModes();
  }, []);

  useEffect(() => {
    if (selectedModeId) {
      fetchModeDetails(selectedModeId);
    } else {
      setSelectedMode(null);
    }
  }, [selectedModeId, fetchModeDetails]);

  const handleSave = async (data: CreateModePayload | UpdateModePayload) => {
    setIsSaving(true);
    const toastId = toast.loading(selectedMode ? "Updating mode..." : "Creating mode...");
    try {
      let res;
      if (selectedMode) {
        res = await updateMode({ ...data, id: selectedMode.id } as UpdateModePayload);
      } else {
        res = await addMode(data as CreateModePayload);
      }

      if (res.status === "success") {
        toast.success(selectedMode ? "Mode updated" : "Mode created", { id: toastId });
        fetchModes(res.data.id);
      } else {
        toast.error(res.message || "Operation failed", { id: toastId });
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mode?")) return;

    const toastId = toast.loading("Deleting mode...");
    try {
      const res = await deleteMode(id);
      if (res.status === "success") {
        toast.success("Mode deleted", { id: toastId });
        setSelectedModeId(null);
        fetchModes();
      } else {
        toast.error(res.message || "Delete failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to delete mode", { id: toastId });
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const handleSelectMode = (id: string) => {
    setSelectedModeId(id);
    setShowMobileSidebar(false);
  };

  const handleAddNew = () => {
    setSelectedModeId(null);
    setSelectedMode(null);
    setShowMobileSidebar(false);
  };

  const handleDuplicate = (data: CreateModePayload) => {
    setSelectedModeId(null);
    setSelectedMode(null); // This triggers ModeForm to reset, but we want it to stay with the new data
    // We'll need to change ModeForm to accept an initialData prop or handle this better
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile when a mode is selected, collapsible on desktop */}
      <div className={cn(
        "md:flex transition-all duration-300 ease-in-out shrink-0",
        showMobileSidebar ? "flex w-full" : "hidden",
        isSidebarCollapsed ? "md:w-0 md:opacity-0" : "md:w-64 lg:w-72 opacity-100"
      )}>
        <div className="w-full h-full bg-card border-r border-border overflow-hidden">
          <ModeSidebar
            modes={modes}
            selectedModeId={selectedModeId}
            onSelectMode={handleSelectMode}
            onAddNew={handleAddNew}
            loading={loading}
          />
        </div>
      </div>

      {/* Detail Area - Hidden on mobile when showing the sidebar */}
      <div className={cn(
        "flex-1 min-w-0 h-full relative overflow-hidden",
        !showMobileSidebar ? "block" : "hidden md:block"
      )}>
        {detailsLoading ? (
          <div className="p-4 md:p-8 space-y-6">
            <Skeleton className="h-12 w-1/3 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        ) : (
          <ModeForm
            mode={selectedMode}
            onSave={handleSave}
            onDelete={handleDelete}
            onDuplicate={(data) => {
              setSelectedModeId(null);
              setSelectedMode(null);
              // We'll pass the duplicated data to the form
              // Since we're setting selectedMode to null, the form will reset.
              // To avoid this, we can use a separate state for initialFormData or 
              // just let ModeForm handle its own state and NOT reset if it's already in "duplicate" mode.
            }}
            onCancel={() => {
              if (selectedModeId) {
                fetchModeDetails(selectedModeId);
              } else {
                setSelectedMode(null);
              }
              setShowMobileSidebar(true);
            }}
            onBackToList={() => setShowMobileSidebar(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
