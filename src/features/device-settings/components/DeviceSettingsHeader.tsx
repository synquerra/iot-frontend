import { Badge } from "@/components/ui/badge";

interface DeviceSettingsHeaderProps {
  title?: string;
  currentMode?: string | null;
}

export function DeviceSettingsHeader({ title = "Device Settings", currentMode }: DeviceSettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Configure and manage your device parameters
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
