import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTelemetry } from "./hooks/useTelemetry";
import { TelemetryTable } from "./components/TelemetryTable";
// import { TelemetryHeader } from "./components/TelemetryHeader";
import { TelemetryFilters } from "./components/TelemetryFilters";
import { TelemetryPagination } from "./components/TelemetryPagination";
import { getDeviceByImei, type Device } from "@/features/devices/services/deviceService";
import { RefreshCw, Activity } from "lucide-react";
import { ActionIcon, Stack, Paper, Text, Group } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";

export default function TelemetryPage() {
  const { imei } = useParams();
  const [device, setDevice] = useState<Device | null>(null);
  
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

  useEffect(() => {
    if (imei) {
      getDeviceByImei(imei).then(setDevice);
    }
  }, [imei]);

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
    <Stack gap="lg" className="w-full min-w-0 mx-auto overflow-x-hidden pb-10">
      <PageHeader
        title="Live Telemetry"
        description={device ? `Real-time data stream for ${device.displayName}` : (imei ? `Real-time data stream for ${imei}` : "Real-time raw data transmission logs")}
        icon={Activity}
      >
        <ActionIcon
          variant="default"
          size="lg"
          onClick={refresh}
          loading={isLoading}
        >
          <RefreshCw size="1.1rem" />
        </ActionIcon>
      </PageHeader>

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
        <Paper className="border-destructive/20 bg-destructive/5" p="xl" radius="xl" withBorder>
          <Group align="center">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
               <Activity className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <Text size="xs" fw={700} tt="uppercase" className="tracking-widest opacity-70 text-destructive">
                Stream Interrupted
              </Text>
              <Text size="sm" className="text-destructive">{error}</Text>
            </div>
          </Group>
        </Paper>
      ) : (
        <Stack gap="md">
          <TelemetryTable data={data} loading={isLoading} />
          
          <TelemetryPagination 
            skip={skip}
            dataLength={data.length}
            limit={limit}
            isLoading={isLoading}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        </Stack>
      )}
    </Stack>
  );
}
