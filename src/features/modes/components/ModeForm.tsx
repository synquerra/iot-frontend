import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Zap,
  Plane,
  Thermometer,
  Gauge,
  BatteryLow,
  Save,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  Info,
  Timer,
  ShieldAlert,
  Settings2,
  PanelLeftOpen,
  PanelLeftClose,
  Copy,
  HelpCircle,
  MapPin,
  BatteryCharging,
  Edit2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeviceMode, CreateModePayload, ModeCondition } from "../types";
import {
  getModeConditionsByModeId,
  addModeCondition,
  updateModeCondition,
  deleteModeCondition,
} from "../services/modeConditionService";
import { listDevices } from "@/features/devices/services/deviceService";
import { listGeofences } from "@/features/geofencing/services/geofenceService";
import type { GeofenceRecord } from "@/features/geofencing/types";
import { toast } from "sonner";

interface ModeFormProps {
  mode: DeviceMode | null;
  onSave: (data: any, localConditions?: any[]) => void;
  onDelete: (id: string) => void;
  onDuplicate?: () => void;
  onCancel: () => void;
  onBackToList?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isSaving: boolean;
}

const initialValues: CreateModePayload = {
  name: "",
  description: "",
  normal_sending_interval: 30,
  sos_sending_interval: 4,
  normal_scanning_interval: 300,
  airplane_interval: 30,
  temperature_limit: 50,
  speed_limit: 70,
  lowbat_limit: 20,
  entry_condition: "",
  exit_condition: "",
  priority: 0,
  watch_time: 0,
  is_system_mode: false,
  allow_user_conditions: false,
};

export function ModeForm({
  mode,
  onSave,
  onDelete,
  onDuplicate,
  onCancel,
  onBackToList,
  isSidebarCollapsed,
  onToggleSidebar,
  isSaving,
}: ModeFormProps) {
  const [formData, setFormData] = useState<CreateModePayload>(initialValues);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Mode Conditions state
  const [conditions, setConditions] = useState<ModeCondition[]>([]);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"entry" | "exit">("entry");
  const [editingCondition, setEditingCondition] = useState<ModeCondition | null>(null);

  // Dialog form fields
  const [condType, setCondType] = useState<string>("geofence_enter"); // "geofence_enter" | "geofence_exit" | "battery_low" | "speed_exceeded"
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string>("");
  const [batteryThreshold, setBatteryThreshold] = useState<number>(20);
  const [batteryOperator, setBatteryOperator] = useState<string>("<");
  const [speedLimitVal, setSpeedLimitVal] = useState<number>(70);
  const [speedOperator, setSpeedOperator] = useState<string>(">");
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  // Loaded geofences to choose from
  const [geofences, setGeofences] = useState<GeofenceRecord[]>([]);

  // Fetch geofences from any device to populate the dropdown
  useEffect(() => {
    const loadGeofences = async () => {
      try {
        const devices = await listDevices();
        if (devices && devices.length > 0) {
          const activeDevice = devices.find((d) => d.status === "active") || devices[0];
          const res = await listGeofences(activeDevice.imei);
          if (res && res.data) {
            setGeofences(res.data);
          }
        }
      } catch (error) {
        console.error("Failed to load geofences for conditions list", error);
      }
    };
    loadGeofences();
  }, []);

  // Fetch conditions for existing mode
  const loadConditions = useCallback(async () => {
    if (!mode?.id || isDuplicating) {
      setConditions([]);
      return;
    }
    setLoadingConditions(true);
    try {
      const res = await getModeConditionsByModeId(mode.id);
      if (res.status === "success") {
        setConditions(res.data);
      }
    } catch (err) {
      console.error("Failed to load mode conditions", err);
    } finally {
      setLoadingConditions(false);
    }
  }, [mode?.id, isDuplicating]);

  useEffect(() => {
    loadConditions();
  }, [loadConditions]);

  useEffect(() => {
    if (mode) {
      setIsDuplicating(false);
      setFormData({
        name: mode.name ?? "",
        description: mode.description ?? "",
        normal_sending_interval: mode.normal_sending_interval ?? 30,
        sos_sending_interval: mode.sos_sending_interval ?? 4,
        normal_scanning_interval: mode.normal_scanning_interval ?? 300,
        airplane_interval: mode.airplane_interval ?? 30,
        temperature_limit: mode.temperature_limit ?? 50,
        speed_limit: mode.speed_limit ?? 70,
        lowbat_limit: mode.lowbat_limit ?? 20,
        entry_condition: mode.entry_condition ?? "",
        exit_condition: mode.exit_condition ?? "",
        priority: mode.priority ?? 0,
        watch_time: mode.watch_time ?? 0,
        is_system_mode: mode.is_system_mode ?? false,
        allow_user_conditions: mode.allow_user_conditions ?? false,
      });
    } else {
      if (!isDuplicating) {
        setFormData(initialValues);
        setConditions([]);
      }
    }
  }, [mode?.id, isDuplicating]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    setFormData((prev) => ({
      ...prev,
      name: `${prev.name} (Copy)`,
      is_system_mode: false,
    }));

    // Copy conditions locally
    if (mode?.id) {
      getModeConditionsByModeId(mode.id).then((res) => {
        if (res.status === "success") {
          const copied = res.data.map((c) => ({
            ...c,
            id: `temp-${Date.now()}-${Math.random()}`,
            mode_id: "",
          }));
          setConditions(copied);
        }
      });
    }

    if (onDuplicate) onDuplicate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass local conditions if this is a new/copied profile
    if (!mode?.id || isDuplicating) {
      onSave(formData, conditions);
    } else {
      onSave(formData);
    }
  };

  // Open Add dialog
  const handleOpenAddDialog = (type: "entry" | "exit") => {
    setDialogType(type);
    setEditingCondition(null);
    setCondType("geofence_enter");
    setSelectedGeofenceId(geofences[0]?.geofence_id || "");
    setBatteryOperator("<");
    setBatteryThreshold(20);
    setSpeedOperator(">");
    setSpeedLimitVal(70);
    setIsEnabled(true);
    setIsConditionDialogOpen(true);
  };

  // Open Edit dialog
  const handleOpenEditDialog = (cond: ModeCondition) => {
    const isExit = cond.trigger === "exit";
    setDialogType(isExit ? "exit" : "entry");
    setEditingCondition(cond);
    setIsEnabled(cond.enabled);

    if (cond.condition_type === "battery") {
      setCondType("battery_low");
      setBatteryOperator(cond.config?.operator || "<");
      setBatteryThreshold(cond.config?.threshold_percentage || 20);
    } else if (cond.condition_type === "speed") {
      setCondType("speed_exceeded");
      setSpeedOperator(cond.config?.operator || ">");
      setSpeedLimitVal(cond.config?.speed_limit || 70);
    } else {
      setCondType(cond.trigger === "exit" ? "geofence_exit" : "geofence_enter");
      setSelectedGeofenceId(cond.config?.geofence_id || "");
    }
    setIsConditionDialogOpen(true);
  };

  // Delete Condition
  const handleDeleteCondition = async (condId: string) => {
    if (!confirm("Are you sure you want to delete this condition?")) return;

    if (condId.startsWith("temp-")) {
      // Local state deletion
      setConditions((prev) => prev.filter((c) => c.id !== condId));
      toast.success("Condition removed");
    } else {
      // API deletion
      const toastId = toast.loading("Deleting condition...");
      try {
        const res = await deleteModeCondition(condId);
        if (res.status === "success") {
          toast.success("Condition deleted", { id: toastId });
          loadConditions();
        } else {
          toast.error(res.message || "Failed to delete condition", { id: toastId });
        }
      } catch (err) {
        toast.error("Error deleting condition", { id: toastId });
      }
    }
  };

  // Toggle Condition Enabled/Disabled
  const handleToggleCondition = async (cond: ModeCondition, checked: boolean) => {
    if (cond.id.startsWith("temp-")) {
      setConditions((prev) =>
        prev.map((c) => (c.id === cond.id ? { ...c, enabled: checked } : c))
      );
    } else {
      try {
        const payload = {
          id: cond.id,
          mode_id: cond.mode_id,
          device_id: cond.device_id || "",
          organization_id: cond.organization_id || "",
          condition_type: cond.condition_type,
          trigger: cond.trigger,
          config: cond.config,
          enabled: checked,
        };
        const res = await updateModeCondition(payload);
        if (res.status === "success") {
          toast.success(`Condition ${checked ? "enabled" : "disabled"}`);
          loadConditions();
        }
      } catch (err) {
        toast.error("Failed to toggle condition");
      }
    }
  };

  // Save Condition
  const handleSaveCondition = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isBattery = condType === "battery_low";
    const isSpeed = condType === "speed_exceeded";
    const typeVal = isBattery ? "battery" : isSpeed ? "speed" : "geofence";
    const triggerVal = dialogType === "entry" ? "enter" : "exit"; // "enter" or "exit"

    let configVal: any = {};
    if (isBattery) {
      configVal = { 
        operator: batteryOperator,
        threshold_percentage: batteryThreshold 
      };
    } else if (isSpeed) {
      configVal = { 
        operator: speedOperator,
        speed_limit: speedLimitVal 
      };
    } else {
      configVal = {
        geofence_id: selectedGeofenceId,
        geofence_action: condType === "geofence_exit" ? "exit" : "enter"
      };
    }

    // Common payload fields matching exactly the user's example
    const conditionPayload: any = {
      mode_id: mode?.id || "",
      device_id: "",
      organization_id: "",
      condition_type: typeVal,
      trigger: triggerVal,
      config: configVal,
      enabled: isEnabled,
    };

    if (!mode?.id || isDuplicating) {
      // Local management for unsaved modes
      if (editingCondition) {
        setConditions((prev) =>
          prev.map((c) => (c.id === editingCondition.id ? { ...c, ...conditionPayload } : c))
        );
      } else {
        const newLocalCond: ModeCondition = {
          ...conditionPayload,
          id: `temp-${Date.now()}-${Math.random()}`,
        };
        setConditions((prev) => [...prev, newLocalCond]);
      }
      setIsConditionDialogOpen(false);
      toast.success("Condition saved locally");
    } else {
      // Direct API sync for existing modes
      const toastId = toast.loading(editingCondition ? "Updating condition..." : "Adding condition...");
      try {
        let res;
        if (editingCondition) {
          res = await updateModeCondition({
            ...conditionPayload,
            id: editingCondition.id,
          });
        } else {
          res = await addModeCondition(conditionPayload);
        }

        if (res.status === "success") {
          toast.success(editingCondition ? "Condition updated" : "Condition added", { id: toastId });
          setIsConditionDialogOpen(false);
          loadConditions();
        } else {
          toast.error(res.message || "Failed to save condition", { id: toastId });
        }
      } catch (err) {
        toast.error("Error saving condition", { id: toastId });
      }
    }
  };

  // Split conditions into entry and exit arrays
  const entryConditions = conditions.filter(
    (c) => c.trigger === "enter" || c.trigger === "entry"
  );
  // const exitConditions = conditions.filter(
  //   (c) => c.trigger === "exit"
  // );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-background/50 relative">
      <div className="flex-1 overflow-y-auto p-3 scroll-container">
        <Card className="border border-border shadow-sm bg-card overflow-hidden">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              {onBackToList && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBackToList}
                  className="md:hidden h-8 w-8 rounded-lg bg-muted/50 shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}

              {onToggleSidebar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="hidden md:flex h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                  title={isSidebarCollapsed ? "Show mode list" : "Hide mode list"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="flex items-center gap-2 min-w-0">
                <Settings2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest truncate">
                  {mode && !isDuplicating ? `Profile: ${mode.name}` : "New Profile Configuration"}
                </CardTitle>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {mode && !mode.is_system_mode && !isDuplicating && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(mode.id)}
                  className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Mode"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDuplicate}
                className="h-8 w-8"
                title="Duplicate Mode"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <div className="w-[1px] h-4 bg-border/60 mx-1 hidden sm:block" />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-8 w-8"
                title="Cancel Changes"
              >
                <X className="h-4 w-4" />
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className="h-8 px-3 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] rounded-lg gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {isSaving ? (
                  <Save className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 px-1">
                  <Info className="h-3.5 w-3.5 text-primary/50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">General Information</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Mode Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g. High Performance"
                      className="h-9 bg-card border-border text-foreground font-bold text-xs rounded-lg hover:border-primary/50 focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Priority</Label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleChange("priority", parseInt(e.target.value))}
                      className="h-9 bg-card border-border text-foreground font-bold text-xs rounded-lg hover:border-primary/50 focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
                  <div className="flex items-center gap-3 py-2.5 px-3 bg-card hover:bg-card/85 border border-border rounded-xl transition-all duration-200 shadow-sm group">
                    <div className="flex-1 flex items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/90 group-hover:text-foreground cursor-pointer">System Mode</Label>
                    </div>
                    <Checkbox
                      checked={formData.is_system_mode}
                      onCheckedChange={(v) => handleChange("is_system_mode", !!v)}
                      className="rounded border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2.5 px-3 bg-card hover:bg-card/85 border border-border rounded-xl transition-all duration-200 shadow-sm group">
                    <div className="flex-1 flex items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/90 group-hover:text-foreground">Watchdog Timer</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={formData.watch_time}
                        onChange={(e) => handleChange("watch_time", parseInt(e.target.value) || 0)}
                        className="h-7 w-20 bg-background hover:bg-background/80 border border-border text-[10px] font-bold text-center rounded-md text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                      <span className="text-[9px] font-black text-muted-foreground/50 uppercase">sec</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2.5 px-3 bg-card hover:bg-card/85 border border-border rounded-xl transition-all duration-200 shadow-sm group">
                    <div className="flex-1 flex items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/90 group-hover:text-foreground cursor-pointer">Allow User Conditions</Label>
                    </div>
                    <Checkbox
                      checked={formData.allow_user_conditions}
                      onCheckedChange={(v) => handleChange("allow_user_conditions", !!v)}
                      className="rounded border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-border/40 mx-1" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Intervals Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 px-1">
                    <Timer className="h-3.5 w-3.5 text-primary/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Transmission Intervals</span>
                  </div>
                  <div className="space-y-1">
                     <SettingRow
                      icon={Activity}
                      label="Normal Sending Interval"
                      value={formData.normal_sending_interval}
                      unit="sec"
                      onChange={(v) => handleChange("normal_sending_interval", parseInt(v))}
                    />
                    <SettingRow
                      icon={Zap}
                      label="SOS Sending Interval"
                      value={formData.sos_sending_interval}
                      unit="sec"
                      iconColor="text-red-500"
                      onChange={(v) => handleChange("sos_sending_interval", parseInt(v))}
                    />
                    <SettingRow
                      icon={Activity}
                      label="Normal Scanning Interval"
                      value={formData.normal_scanning_interval}
                      unit="sec"
                      onChange={(v) => handleChange("normal_scanning_interval", parseInt(v))}
                    />
                    <SettingRow
                      icon={Plane}
                      label="Airplane Mode Interval"
                      value={formData.airplane_interval}
                      unit="sec"
                      iconColor="text-blue-500"
                      onChange={(v) => handleChange("airplane_interval", parseInt(v))}
                    />
                  </div>
                </div>

                {/* Thresholds Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 px-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-orange-500/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600/80">Safety Thresholds</span>
                  </div>
                  <div className="space-y-1">
                    <SettingRow
                      icon={Thermometer}
                      label="Temperature Limit"
                      value={formData.temperature_limit}
                      unit="°C"
                      iconColor="text-orange-500"
                      onChange={(v) => handleChange("temperature_limit", parseInt(v))}
                    />
                    <SettingRow
                      icon={Gauge}
                      label="Speed Limit"
                      value={formData.speed_limit}
                      unit="km/h"
                      iconColor="text-amber-500"
                      onChange={(v) => handleChange("speed_limit", parseInt(v))}
                    />
                    <SettingRow
                      icon={BatteryLow}
                      label="Low Battery Limit"
                      value={formData.lowbat_limit}
                      unit="%"
                      iconColor="text-red-500"
                      onChange={(v) => handleChange("lowbat_limit", parseInt(v))}
                    />
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-border/40 mx-1" />

              {/* Entry Conditions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                      Entry Conditions (any one true triggers the mode)
                    </span>
                  </div>
                  <span title="Entry conditions define when this mode is automatically activated.">
                    <HelpCircle className="h-4 w-4 text-muted-foreground/40 hover:text-primary transition-colors cursor-help shrink-0" />
                  </span>
                </div>

                {loadingConditions ? (
                  <div className="flex items-center justify-center p-6 bg-muted/10 rounded-xl border border-dashed border-border">
                    <span className="text-xs font-bold text-muted-foreground animate-pulse">Loading conditions...</span>
                  </div>
                ) : entryConditions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4 bg-muted/10 rounded-xl border border-dashed border-border/80">
                    <p className="text-xs font-semibold text-muted-foreground/60 text-center">
                      No entry conditions yet. Click below to add one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {entryConditions.map((cond) => (
                      <ConditionRow
                        key={cond.id}
                        condition={cond}
                        geofences={geofences}
                        onEdit={() => handleOpenEditDialog(cond)}
                        onDelete={() => handleDeleteCondition(cond.id)}
                        onToggle={(checked) => handleToggleCondition(cond, checked)}
                      />
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenAddDialog("entry")}
                  className="w-full h-10 border-dashed border bg-background hover:bg-muted/10 border-border hover:border-primary/40 font-bold uppercase tracking-widest text-[9px] gap-2 rounded-xl transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Entry Condition
                </Button>
              </div>

              {/* Exit Conditions Section hidden as requested */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Overlay Modal for Adding/Editing Conditions */}
      {isConditionDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border border-border bg-card shadow-2xl overflow-hidden rounded-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest">
                {editingCondition 
                  ? `Edit ${dialogType === "entry" ? "Entry" : "Exit"} Condition` 
                  : `Add ${dialogType === "entry" ? "Entry" : "Exit"} Condition`}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsConditionDialogOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <div className="space-y-0">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Condition Type</Label>
                  <select
                    value={condType}
                    onChange={(e) => setCondType(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-border/80 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="geofence_enter">Geofence Enter</option>
                    <option value="geofence_exit">Geofence Exit</option>
                    <option value="battery_low">Battery Threshold</option>
                    <option value="speed_exceeded">Speed Threshold</option>
                  </select>
                </div>

                {condType.startsWith("geofence") && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Geofence Flag</Label>
                      {geofences.length === 0 ? (
                        <div className="relative">
                          <Input
                            placeholder="Enter raw geofence ID"
                            value={selectedGeofenceId}
                            onChange={(e) => setSelectedGeofenceId(e.target.value)}
                            className="h-10 bg-background border-border/80 font-bold text-xs rounded-lg"
                            required
                          />
                          <p className="text-[8px] font-bold text-amber-600 uppercase tracking-wide mt-1">
                            No active geofences found. Enter geofence ID manually.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={selectedGeofenceId}
                          onChange={(e) => setSelectedGeofenceId(e.target.value)}
                          className="w-full h-10 px-3 bg-background border border-border/80 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                          required
                        >
                          <option value="">Select a geofence</option>
                          {geofences.map((g) => (
                            <option key={g.geofence_id} value={g.geofence_id}>
                              {g.geofence_name || `Geofence ${g.geofence_id}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                  </>
                )}

                {condType === "battery_low" && (
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Operator</Label>
                      <select
                        value={batteryOperator}
                        onChange={(e) => setBatteryOperator(e.target.value)}
                        className="w-full h-10 px-3 bg-background border border-border/80 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="<">{"< Less Than"}</option>
                        <option value=">">{"> Greater Than"}</option>
                        <option value="<=">{"<= Less Than or Equal"}</option>
                        <option value=">=">{">= Greater Than or Equal"}</option>
                        <option value="==">{"== Equal To"}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Battery Value (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={batteryThreshold}
                        onChange={(e) => setBatteryThreshold(parseInt(e.target.value) || 20)}
                        className="h-10 bg-background border-border/80 font-bold text-xs rounded-lg"
                        required
                      />
                    </div>
                  </div>
                )}

                {condType === "speed_exceeded" && (
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Operator</Label>
                      <select
                        value={speedOperator}
                        onChange={(e) => setSpeedOperator(e.target.value)}
                        className="w-full h-10 px-3 bg-background border border-border/80 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value=">">{"> Greater Than"}</option>
                        <option value="<">{"< Less Than"}</option>
                        <option value=">=">{">= Greater Than or Equal"}</option>
                        <option value="<=">{"<= Less Than or Equal"}</option>
                        <option value="==">{"== Equal To"}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Speed Value (km/h)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={speedLimitVal}
                        onChange={(e) => setSpeedLimitVal(parseInt(e.target.value) || 70)}
                        className="h-10 bg-background border-border/80 font-bold text-xs rounded-lg"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 py-2 px-3 bg-muted/20 rounded-xl border border-border/30">
                  <div className="flex-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Condition Enabled</Label>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Determine active state</p>
                  </div>
                  <Checkbox
                    checked={isEnabled}
                    onCheckedChange={(v) => setIsEnabled(!!v)}
                    className="rounded border-border/60"
                  />
                </div>
              </CardContent>
              <div className="py-3 px-4 border-t bg-muted/30 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsConditionDialogOpen(false)}
                  className="h-9 px-4 font-black uppercase tracking-widest text-[9px] rounded-lg text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSaveCondition()}
                  className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] rounded-lg shadow-sm active:scale-[0.98]"
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </form>
  );
}

function ConditionRow({
  condition,
  geofences,
  onEdit,
  onDelete,
  onToggle,
}: {
  condition: ModeCondition;
  geofences: GeofenceRecord[];
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (checked: boolean) => void;
}) {
  const isBattery = condition.condition_type === "battery";
  const isSpeed = condition.condition_type === "speed";
  const geoObj = !isBattery && !isSpeed
    ? geofences.find((g) => g.geofence_id === condition.config?.geofence_id)
    : null;
  const geoName = geoObj ? geoObj.geofence_name : condition.config?.geofence_id;

  const Icon = isBattery ? BatteryCharging : isSpeed ? Gauge : MapPin;
  const label = isBattery
    ? "Battery Threshold"
    : isSpeed
    ? "Speed Threshold"
    : condition.trigger === "exit"
    ? "Geofence Exit"
    : "Geofence Enter";

  const details = isBattery
    ? `Battery level ${condition.config?.operator || "<"} ${condition.config?.threshold_percentage || 20}%`
    : isSpeed
    ? `Speed ${condition.config?.operator || ">"} ${condition.config?.speed_limit || 70} km/h`
    : `Geofence: "${geoName || "Unknown"}"`;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all group",
        !condition.enabled && "opacity-60"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/40",
          isBattery ? "bg-red-500/10 text-red-500" : isSpeed ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-bold leading-none">{label}</p>
          {!condition.enabled && (
            <Badge variant="secondary" className="px-1 py-0 text-[7px] font-black uppercase tracking-widest leading-none bg-muted-foreground/10 text-muted-foreground">
              Disabled
            </Badge>
          )}
        </div>
        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide leading-tight mt-1 truncate">
          {details}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Edit Condition"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          title="Delete Condition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="shrink-0 flex items-center pl-1">
        <Checkbox
          checked={condition.enabled}
          onCheckedChange={(checked) => onToggle(!!checked)}
          className="rounded border-border/60"
        />
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  unit,
  disabled = false,
  iconColor = "text-primary/60",
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: any;
  unit: string;
  disabled?: boolean;
  iconColor?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 px-2 rounded-xl transition-all group",
        disabled ? "opacity-40 grayscale-[0.5]" : "hover:bg-muted/30"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/40 transition-colors",
          !disabled && "group-hover:bg-background",
          iconColor.replace("text-", "bg-").replace("500", "500/10")
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground/90 leading-tight">{label}</p>
      </div>
      <div
        className={cn(
          "flex items-center gap-1 border rounded-lg px-2 py-1 transition-all w-[100px] shrink-0",
          disabled
            ? "bg-muted/20 border-dashed border-border/40"
            : "bg-card border-border/80 group-hover:border-primary/40 group-hover:bg-background/80"
        )}
      >
        <Input
          type="number"
          min="0"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "border-0 focus-visible:ring-0 h-5 w-full text-[11px] font-black font-mono bg-transparent shadow-none text-right p-0",
            disabled ? "cursor-not-allowed opacity-50" : ""
          )}
        />
        <span className="text-[9px] font-black text-muted-foreground/40 shrink-0 uppercase">{unit}</span>
      </div>
    </div>
  );
}
