import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricCardProps } from "@/types";

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color = "primary",
  children,
}: MetricCardProps) {
  const solidBackgrounds: Record<string, string> = {
    blue: "bg-blue-600 border-blue-400/40 shadow-blue-900/20",
    sky: "bg-sky-500 border-sky-300/40 shadow-sky-900/20",
    slate: "bg-slate-700 border-slate-500/40 shadow-slate-950/30",
    orange: "bg-orange-600 border-orange-400/40 shadow-orange-900/20",
    red: "bg-red-600 border-red-400/40 shadow-red-900/20",
    emerald: "bg-emerald-600 border-emerald-400/40 shadow-emerald-900/20",
    purple: "bg-purple-600 border-purple-400/40 shadow-purple-900/20",
    primary: "bg-slate-900 border-slate-700 shadow-black/30",
  };

  const hoverGlows: Record<string, string> = {
    blue: "hover:shadow-blue-900/40",
    sky: "hover:shadow-sky-900/40",
    slate: "hover:shadow-slate-950/40",
    orange: "hover:shadow-orange-900/40",
    red: "hover:shadow-red-900/40",
    emerald: "hover:shadow-emerald-900/40",
    purple: "hover:shadow-purple-900/40",
    primary: "hover:shadow-black/40",
  };

  return (
    <Card className={cn(
      "group relative transition-all duration-300 overflow-hidden border-2 h-full",
      "hover:shadow-xl hover:translate-y-[-4px] active:translate-y-0",
      solidBackgrounds[color] || solidBackgrounds.primary,
      hoverGlows[color] || hoverGlows.primary,
    )}>
      <div className="absolute -right-4 -top-4 opacity-[0.08] group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none rotate-6 scale-150 transform-gpu">
        <Icon className="h-24 w-24 text-white" />
      </div>

      <CardContent className="p-4 md:p-5 relative z-10 flex flex-col justify-between h-full text-white">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl p-2.5 transition-all duration-300 bg-white/15 group-hover:bg-white/25 group-hover:scale-105"
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/85">
            {label}
          </p>
        </div>

        <div className="space-y-0 mt-4">
          <div className="flex items-baseline gap-1.5 overflow-hidden">
            <span className="text-3xl font-black tracking-tighter font-mono leading-none drop-shadow-sm truncate">
              {value}
            </span>
            {unit && (
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">
                {unit}
              </span>
            )}
          </div>
        </div>

        {children && <div className="mt-4 pt-4 border-t border-white/15">{children}</div>}
      </CardContent>
    </Card>
  );
}