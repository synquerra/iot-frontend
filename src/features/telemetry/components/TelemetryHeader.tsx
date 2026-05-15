import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TelemetryHeaderProps {
  imei?: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function TelemetryHeader({ imei, isLoading, onRefresh }: TelemetryHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/30 p-6 rounded-2xl border border-primary/5 shadow-sm">
      <div className="flex items-center gap-5">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="rounded-full h-12 w-12 border-primary/10 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Telemetry Analytics
            </h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1.5 font-medium">
            Deep packet analysis for device:
            <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold border border-primary/10 tracking-tighter">
              {imei}
            </span>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={onRefresh} 
          disabled={isLoading} 
          variant="outline" 
          className="h-11 px-5 border-primary/10 hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest transition-all"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Force Refresh
        </Button>
      </div>
    </div>
  );
}
