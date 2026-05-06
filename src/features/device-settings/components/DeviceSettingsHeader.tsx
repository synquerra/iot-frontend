import { Badge } from "@/components/ui/badge";

interface DeviceSettingsHeaderProps {
  title?: string;
  currentMode?: string | null;
}

export function DeviceSettingsHeader({ title = "Device Settings", currentMode }: DeviceSettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
          {title}
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Operational Control Panel
        </p>
      </div>
      <div className="flex items-center gap-2">
        {currentMode && (
          <Badge variant="secondary" className="px-3 py-1 font-mono text-[11px] font-bold tracking-tight bg-slate-100 text-slate-600 border border-slate-200 uppercase">
            Mode: {currentMode}
          </Badge>
        )}
      </div>
    </div>
  );
}
