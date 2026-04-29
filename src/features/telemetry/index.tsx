import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTelemetry } from "./hooks/useTelemetry";
import { TelemetryTable } from "./components/TelemetryTable";
import { TelemetryHeader } from "./components/TelemetryHeader";
import { TelemetryFilters } from "./components/TelemetryFilters";
import { TelemetryPagination } from "./components/TelemetryPagination";
import { Activity } from "lucide-react";

export default function TelemetryPage() {
  const { imei } = useParams();
  
  // State for pagination and filtering
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, error, refresh } = useTelemetry({
    imei,
    skip,
    limit,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
  });

  const handleNextPage = () => setSkip(prev => prev + limit);
  const handlePrevPage = () => setSkip(prev => Math.max(0, prev - limit));
  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
    setSkip(0);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSkip(0);
  };

  return (
    <div className="space-y-6 w-full min-w-0 mx-auto overflow-x-hidden pb-10">
      <TelemetryHeader 
        imei={imei} 
        isLoading={isLoading} 
        onRefresh={refresh} 
      />

      <TelemetryFilters 
        startDate={startDate}
        endDate={endDate}
        limit={limit}
        onStartDateChange={(val) => { setStartDate(val); setSkip(0); }}
        onEndDateChange={(val) => { setEndDate(val); setSkip(0); }}
        onLimitChange={handleLimitChange}
        onReset={handleResetFilters}
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
             <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">Stream Interrupted</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <TelemetryTable data={data} loading={isLoading} />
          
          <TelemetryPagination 
            skip={skip}
            dataLength={data.length}
            limit={limit}
            isLoading={isLoading}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        </div>
      )}
    </div>
  );
}
