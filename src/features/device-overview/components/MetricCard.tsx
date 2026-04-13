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
    blue: "bg-gradient-to-br from-blue-500 to-indigo-600 border-indigo-400/30 shadow-indigo-900/30",
    sky: "bg-gradient-to-br from-sky-400 to-blue-500 border-sky-300/30 shadow-sky-900/20",
    slate: "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-600/30 shadow-slate-950/40",
    orange: "bg-gradient-to-br from-amber-500 to-orange-700 border-orange-500/30 shadow-orange-900/40",
    red: "bg-gradient-to-br from-rose-500 to-red-700 border-rose-500/30 shadow-red-900/40",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-500/30 shadow-emerald-900/40",
    purple: "bg-gradient-to-br from-fuchsia-600 to-purple-800 border-purple-500/30 shadow-purple-900/40",
    primary: "bg-slate-900 border-slate-950 shadow-black/20",
  };

  return (
    <Card className={cn(
      "group relative transition-all duration-500 overflow-hidden border-2 h-full",
      "hover:shadow-xl hover:translate-y-[-4px] active:translate-y-0",
      solidBackgrounds[color] || solidBackgrounds.primary,
    )}>
      <div className="absolute -right-4 -top-4 opacity-[0.1] group-hover:opacity-[0.2] transition-all duration-700 pointer-events-none rotate-6 scale-150 transform-gpu text-white">
        <Icon className="h-24 w-24" />
      </div>
      
      <CardContent className="p-4 md:p-5 relative z-10 flex flex-col justify-between h-full text-white">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl p-2.5 transition-all duration-500 bg-white/20 shadow-inner group-hover:scale-110"
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
            {label}
          </p>
        </div>
        
        <div className="space-y-0 mt-4">
          <div className="flex items-baseline gap-1.5 overflow-hidden">
            <span className="text-3xl font-black tracking-tighter text-white font-mono leading-none truncate drop-shadow-md">
              {value}
            </span>
            {unit && (
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none drop-shadow-sm">{unit}</span>
            )}
          </div>
        </div>
        
        {children && <div className="mt-4 pt-4 border-t border-white/10">{children}</div>}
      </CardContent>
    </Card>
  );
}
