import { useParams, useNavigate } from "react-router-dom";
import { LiveMap } from "./components/LiveMap";
import useDeviceOverview from "./hooks/useDeviceOverview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MetricCardSkeleton } from "./components/SkeletonItems";

export default function MapPage() {
  const { imei } = useParams();
  const navigate = useNavigate();
  const { device, deviceStatus, isLoading } = useDeviceOverview(imei ?? "");

  if (isLoading) return <MetricCardSkeleton />;

  const data = {
    name: device?.studentName ?? "",
    imei: deviceStatus?.imei ?? device?.imei ?? "",
    latitude: deviceStatus?.latitude ? Number(deviceStatus.latitude) : 0,
    longitude: deviceStatus?.longitude ? Number(deviceStatus.longitude) : 0,
    speed: deviceStatus?.speed != null ? Number(deviceStatus.speed) : 0,
    battery: deviceStatus?.battery ? Number(deviceStatus.battery) : 0,
    lastUpdate: deviceStatus?.timestamp ?? deviceStatus?.deviceTimestamp ?? device?.createdAt ?? new Date().toISOString(),
    geoid: device?.geoid ?? null,
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="absolute top-4 left-4 z-[1001] flex items-center gap-4">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="rounded-full shadow-2xl bg-background/80 backdrop-blur border border-white/20 hover:bg-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 w-full h-full relative">
        <LiveMap
          latitude={data.latitude}
          longitude={data.longitude}
          speed={data.speed}
          name={data.name}
          battery={data.battery}
          lastUpdate={data.lastUpdate}
          geoid={data.geoid}
          fullScreen={true}
          imei={data.imei}
        />
      </div>
    </div>
  );
}
