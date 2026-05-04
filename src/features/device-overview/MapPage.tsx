import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LiveMap } from "./components/LiveMap";
import useDeviceOverview from "./hooks/useDeviceOverview";
import { useLiveLocation } from "./hooks/useLiveLocation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wifi, Battery, Activity } from "lucide-react";
import { MetricCardSkeleton } from "./components/SkeletonItems";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { listGeofences } from "../geofencing/services/geofenceService";
import type { GeofenceRecord } from "../geofencing/types";

export default function MapPage() {
  const { imei } = useParams();
  const navigate = useNavigate();
  
  // Use device overview for metadata (name, geoid)
  const { device, isLoading: isOverviewLoading } = useDeviceOverview(imei ?? "");
  
  // Use live location for high-frequency polling
  const { location, isLoading: isLocationLoading, error } = useLiveLocation(imei ?? "", 3000);

  const [geofences, setGeofences] = useState<GeofenceRecord[]>([]);

  useEffect(() => {
    if (imei) {
      listGeofences(imei).then(res => {
        if (res.data) setGeofences(res.data);
      }).catch(err => console.error("Failed to load geofences for map", err));
    }
  }, [imei]);

  if (isOverviewLoading && !device) return <MetricCardSkeleton />;

  const data = {
    name: device?.studentName ?? "Unknown Device",
    imei: imei ?? "",
    latitude: location?.latitude ?? 0,
    longitude: location?.longitude ?? 0,
    speed: location?.speed ?? 0,
    battery: location?.battery ?? 0,
    signal: location?.signal ?? 0,
    lastUpdate: location?.timestamp ?? new Date().toISOString(),
    geoid: location?.geoid ?? device?.geoid ?? null,
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Dynamic Header HUD */}
      <div className="absolute top-4 left-4 right-4 z-[1001] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => navigate(`/devices/overview/${imei}`)} 
            className="rounded-xl shadow-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:bg-slate-900 text-white pointer-events-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl flex items-center gap-4 shadow-2xl ring-1 ring-white/5">
            <div className="flex flex-col">
              <h2 className="text-white text-sm font-black tracking-tight uppercase leading-none">{data.name}</h2>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                 <Wifi className={cn("h-3.5 w-3.5 mb-1", data.signal > 50 ? "text-emerald-400" : "text-orange-400")} />
                 <span className="text-[9px] font-mono text-white/60">{data.signal}%</span>
              </div>
              <div className="flex flex-col items-center">
                 <Battery className={cn("h-3.5 w-3.5 mb-1", data.battery > 30 ? "text-emerald-400" : "text-red-400")} />
                 <span className="text-[9px] font-mono text-white/60">{data.battery}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 pointer-events-auto">
           {error ? (
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest gap-2">
                <Activity className="h-3 w-3 animate-pulse" />
                SIGNAL LOST
              </Badge>
           ) : (
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE TRACKING
              </Badge>
           )}
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        {!isNaN(data.latitude) && !isNaN(data.longitude) && (data.latitude !== 0 || data.longitude !== 0) ? (
          <LiveMap
            latitude={data.latitude}
            longitude={data.longitude}
            geoid={data.geoid}
            fullScreen={true}
            imei={data.imei}
            geofences={geofences.filter(g => g.coordinates) as any}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
             <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
             <p className="font-black text-xs uppercase tracking-widest opacity-50">Synchronizing Global Coordinates...</p>
          </div>
        )}
      </div>
    </div>
  );
}
