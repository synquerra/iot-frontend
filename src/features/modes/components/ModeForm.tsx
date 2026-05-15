import { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  X,
  Copy,
  Settings2,
  Wifi,
  ShieldAlert,
  Gauge,
  Thermometer,
  BatteryLow,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Zap,
  Timer,
  Plane,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DeviceMode, CreateModePayload } from "../types";

interface ModeFormProps {
  mode: DeviceMode | null;
  onSave: (data: any) => void;
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
  normal_sending_intervalm: 30,
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
  const [noTimeout, setNoTimeout] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);

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
      });
      setNoTimeout(mode.watch_time === 0);
    } else {
      // Only reset if we're not currently in the middle of a duplication
      if (!isDuplicating) {
        setFormData(initialValues);
        setNoTimeout(true);
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
    setFormData(prev => ({
      ...prev,
      name: `${prev.name} (Copy)`,
      is_system_mode: false,
    }));
    // Inform parent to clear selection so the next save is a "Create"
    if (onDuplicate) onDuplicate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-background/50">
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
                  {mode ? `Profile: ${mode.name}` : "New Profile Configuration"}
                </CardTitle>
                {mode && (
                  <Badge variant="outline" className="hidden lg:flex shrink-0 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                    ID: {mode.id.split('-')[0]}...
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {mode && !mode.is_system_mode && (
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Mode Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g. High Performance"
                      className="h-9 bg-muted/20 border-border/50 font-bold text-xs rounded-lg focus:bg-background transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Priority</Label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleChange("priority", parseInt(e.target.value))}
                      className="h-9 bg-muted/20 border-border/50 font-bold text-xs rounded-lg focus:bg-background transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                  <div className="flex items-center gap-3 py-2 px-3 bg-muted/20 rounded-xl border border-border/30 has-[:disabled]:opacity-40 transition-opacity">
                    <div className="flex-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">System Mode</Label>
                      <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Critical profile state</p>
                    </div>
                    <Checkbox
                      checked={formData.is_system_mode}
                      onCheckedChange={(v) => handleChange("is_system_mode", !!v)}
                      disabled={!!mode}
                      className="rounded border-border/60 data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2 px-3 bg-muted/20 rounded-xl border border-border/30 has-[:disabled]:opacity-40 transition-opacity">
                    <div className="flex-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Watchdog Timer</Label>
                      <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Automatic timeout</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.watch_time}
                        onChange={(e) => handleChange("watch_time", parseInt(e.target.value))}
                        disabled={noTimeout}
                        className="h-7 w-16 bg-background border-border/50 text-[10px] font-bold text-center p-0 rounded-md disabled:opacity-50 disabled:bg-muted/50 disabled:border-dashed disabled:cursor-not-allowed"
                      />
                      <Checkbox
                        checked={noTimeout}
                        onCheckedChange={(v) => {
                          setNoTimeout(!!v);
                          if (v) handleChange("watch_time", 0);
                        }}
                        className="rounded border-border/60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-border/40 mx-1" />

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
                    hint="Regular packet transmission rate"
                    value={formData.normal_sending_interval}
                    unit="min"
                    onChange={(v) => handleChange("normal_sending_intervalm", parseInt(v))}
                  />
                  <SettingRow
                    icon={Zap}
                    label="SOS Sending Interval"
                    hint="Emergency burst transmission rate"
                    value={formData.sos_sending_interval}
                    unit="min"
                    iconColor="text-red-500"
                    onChange={(v) => handleChange("sos_sending_interval", parseInt(v))}
                  />
                  <SettingRow
                    icon={Activity}
                    label="Normal Scanning Interval"
                    hint="GPS and sensor update frequency"
                    value={formData.normal_scanning_interval}
                    unit="sec"
                    onChange={(v) => handleChange("normal_scanning_interval", parseInt(v))}
                  />
                  <SettingRow
                    icon={Plane}
                    label="Airplane Mode Interval"
                    hint="Periodic wake-up rate during flight"
                    value={formData.airplane_interval}
                    unit="min"
                    iconColor="text-blue-500"
                    onChange={(v) => handleChange("airplane_interval", parseInt(v))}
                  />
                </div>
              </div>

              <div className="h-[1px] bg-border/40 mx-1" />

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
                    hint="Hardware thermal safety threshold"
                    value={formData.temperature_limit}
                    unit="°C"
                    iconColor="text-orange-500"
                    onChange={(v) => handleChange("temperature_limit", parseInt(v))}
                  />
                  <SettingRow
                    icon={Gauge}
                    label="Speed Limit"
                    hint="Velocity monitoring alert threshold"
                    value={formData.speed_limit}
                    unit="km/h"
                    iconColor="text-amber-500"
                    onChange={(v) => handleChange("speed_limit", parseInt(v))}
                  />
                  <SettingRow
                    icon={BatteryLow}
                    label="Low Battery Limit"
                    hint="Minimum power level alert threshold"
                    value={formData.lowbat_limit}
                    unit="%"
                    iconColor="text-red-500"
                    onChange={(v) => handleChange("lowbat_limit", parseInt(v))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  value,
  unit,
  disabled = false,
  iconColor = "text-primary/60",
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
  value: any;
  unit: string;
  disabled?: boolean;
  iconColor?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 py-2 px-2 rounded-xl transition-all group",
      disabled ? "opacity-40 grayscale-[0.5]" : "hover:bg-muted/30"
    )}>
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/40 transition-colors",
        !disabled && "group-hover:bg-background",
        iconColor.replace('text-', 'bg-').replace('500', '500/10')
      )}>
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground/90 leading-tight">{label}</p>
        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wide leading-tight mt-0.5">{hint}</p>
      </div>
      <div className={cn(
        "flex items-center gap-1 border rounded-lg px-2 py-1 transition-colors w-[100px] shrink-0",
        disabled
          ? "bg-muted/20 border-dashed border-border/40"
          : "bg-muted/40 border-border/60 group-hover:border-primary/30"
      )}>
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
