import { useParams, useNavigate } from "react-router-dom";
import { useTelemetry } from "./hooks/useTelemetry";
import { TelemetryTable } from "./components/TelemetryTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Activity } from "lucide-react";

export default function TelemetryPage() {
  const { imei } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refresh } = useTelemetry(imei);

  return (
    <div className="space-y-6 w-full min-w-0 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Active Telemetry Stream</h1>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              Analyzing deep packet logs for device target:
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">{imei}</span>
            </p>
          </div>
        </div>
        <Button onClick={refresh} disabled={isLoading} variant="outline" className="shrink-0">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stream
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive font-semibold">
          Error retrieving telemetry logs payload: {error}
        </div>
      ) : (
        <div className="rounded-xl border bg-card text-card-foreground shadow overflow">
          <div className="w-full max-w-full min-w-0 block overflow-scroll">
            <TelemetryTable data={data} loading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
