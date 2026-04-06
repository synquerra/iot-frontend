import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, Footprints, Pause, TrendingUp } from "lucide-react";

interface ActivityBreakdownProps {
  crawling: number;
  stationary: number;
  overspeeding: number;
}



export function ActivityBreakdown({
  crawling,
  stationary,
  overspeeding,
}: ActivityBreakdownProps) {
  const total = crawling + stationary + overspeeding;

  const items = [
    {
      label: "Crawling",
      value: crawling,
      icon: Footprints,
      color: "blue",
      bgGradient: "from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-600 dark:text-blue-400",
      percentage: total > 0 ? (crawling / total) * 100 : 0
    },
    {
      label: "Stationary",
      value: stationary,
      icon: Pause,
      color: "orange",
      bgGradient: "from-orange-500/10 to-orange-600/5",
      borderColor: "border-orange-500/20",
      textColor: "text-orange-600 dark:text-orange-400",
      percentage: total > 0 ? (stationary / total) * 100 : 0
    },
    {
      label: "Overspeeding",
      value: overspeeding,
      icon: TrendingUp,
      color: "red",
      bgGradient: "from-red-500/10 to-red-600/5",
      borderColor: "border-red-500/20",
      textColor: "text-red-600 dark:text-red-400",
      percentage: total > 0 ? (overspeeding / total) * 100 : 0
    },
  ];



  return (
    <Card className="hover:shadow-2xl transition-all duration-500 border-border bg-background overflow-hidden shadow-sm">
      <CardHeader className="p-4 border-b border-border bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
           </div>
           <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest leading-none">Activity Pulse</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Live Dynamics readout</CardDescription>
           </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-4 text-white shadow-md hover:translate-y-[-4px]",
                item.color === 'blue' ? 'bg-blue-600 border-blue-700' : 
                item.color === 'orange' ? 'bg-orange-500 border-orange-600' : 
                'bg-red-600 border-red-700'
              )}
            >
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between">
                   <div className="w-fit rounded-lg p-2 bg-white/20 shadow-inner">
                     <item.icon className="h-4 w-4 text-white" />
                   </div>
                   <div className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-black/20 text-white">
                      {item.percentage.toFixed(0)}%
                   </div>
                </div>
                <div>
                  <p className="text-3xl font-black font-mono tracking-tighter text-white leading-none whitespace-nowrap">{item.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80 mt-1.5 italic">
                    {item.label}
                  </p>
                </div>
                
                {/* Opaque Progress Track */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/20">
                  <div
                    className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Additional insights footer */}
        <div className="pt-3 mt-4 border-t border-border/40">
          <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            <span>Dynamic telemetry feed</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span>Crawling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <span>Stationary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span>Overspeeding</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}