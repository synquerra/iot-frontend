import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LiveMap } from "./components/LiveMap";
import useDeviceOverview from "./hooks/useDeviceOverview";
import { useLiveLocation } from "./hooks/useLiveLocation";
import { ActionIcon, Badge, Box, Group, Text } from "@mantine/core";
import { ArrowLeft, Wifi, Battery, Activity } from "lucide-react";
import { MetricCardSkeleton } from "./components/SkeletonItems";
import { cn } from "@/lib/utils";
import { listGeofences } from "../geofencing/services/geofenceService";
import type { GeofenceRecord } from "../geofencing/types";

export default function MapPage() {
  const { imei } = useParams();
  const navigate = useNavigate();
  
  // Use device overview for metadata (name, geoid)
  const { device, isLoading: isOverviewLoading } = useDeviceOverview(imei ?? "");
  
  // Use live location for high-frequency polling
  const { location, error } = useLiveLocation(imei ?? "", 3000);

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
    <Box className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Dynamic Header HUD */}
      <Box className="absolute top-4 left-4 right-4 z-[1001] flex items-center justify-between pointer-events-none">
        <Group gap="md" className="pointer-events-auto">
          <ActionIcon 
            variant="default" 
            size="xl" 
            radius="xl"
            onClick={() => navigate(`/devices/overview/${imei}`)} 
            className="shadow-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:bg-slate-900 text-white"
          >
            <ArrowLeft size="1.2rem" />
          </ActionIcon>
          
          <Box className="bg-slate-950/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl flex items-center gap-4 shadow-2xl ring-1 ring-white/5">
            <Box className="flex flex-col">
              <Text c="white" size="sm" fw={900} tt="uppercase" className="tracking-tight leading-none">{data.name}</Text>
            </Box>
            <Box className="h-8 w-px bg-white/10" />
            <Group gap="sm" align="center">
              <Box className="flex flex-col items-center">
                 <Wifi className={cn("h-3.5 w-3.5 mb-1", data.signal > 50 ? "text-emerald-400" : "text-orange-400")} />
                 <Text size="0.55rem" ff="monospace" c="dimmed" className="text-white/60">{data.signal}%</Text>
              </Box>
              <Box className="flex flex-col items-center">
                 <Battery className={cn("h-3.5 w-3.5 mb-1", data.battery > 30 ? "text-emerald-400" : "text-red-400")} />
                 <Text size="0.55rem" ff="monospace" c="dimmed" className="text-white/60">{data.battery}%</Text>
              </Box>
            </Group>
          </Box>
        </Group>

        <Group className="hidden md:flex pointer-events-auto" gap="sm">
           {error ? (
              <Badge variant="filled" color="red" size="lg" className="bg-red-500/20 text-red-400 border border-red-500/50 px-4 font-black tracking-widest" leftSection={<Activity size="0.8rem" className="animate-pulse" />}>
                SIGNAL LOST
              </Badge>
           ) : (
              <Badge variant="filled" color="green" size="lg" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-4 font-black tracking-widest" leftSection={<Box className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />}>
                LIVE TRACKING
              </Badge>
           )}
        </Group>
      </Box>

      <Box className="flex-1 w-full h-full relative">
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
          <Box className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
             <Box className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
             <Text fw={900} size="xs" tt="uppercase" className="tracking-widest opacity-50">Synchronizing Global Coordinates...</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
