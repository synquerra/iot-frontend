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
    blue: "bg-blue-600 border-blue-700 shadow-blue-900/20",
    orange: "bg-orange-500 border-orange-600 shadow-orange-900/20",
    red: "bg-red-600 border-red-700 shadow-red-900/20",
    emerald: "bg-emerald-600 border-emerald-700 shadow-emerald-900/20",
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
