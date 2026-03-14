import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight } from "lucide-react";


interface AlertBannerProps {
  alert: string;
}

export function AlertBanner({ alert }: AlertBannerProps) {
  if (alert === "Normal") return null;

  return (
    <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/90 to-red-900/90 p-4 animate-in slide-in-from-top shadow-[0_0_25px_rgba(239,68,68,0.35)] backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="rounded-full bg-red-500/20 p-2.5 shrink-0 ring-2 ring-red-500/30">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>

        <div className="flex-1 space-y-1">
          <p className="font-semibold text-red-400">🚨 Device Alert</p>
          <p className="text-sm text-red-300/90">
            Device is in <span className="font-bold uppercase text-red-300">{alert}</span> mode. Immediate attention required.
          </p>
          <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            This is an example alert for demonstration purposes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-red-500/40 bg-red-950/50 text-red-300 hover:bg-red-900 hover:text-red-200 hover:border-red-500/60 shrink-0"
        >
          View Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Glow effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
    </div>
  );
}