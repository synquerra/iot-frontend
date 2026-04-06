import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TelemetryData } from "../hooks/useTelemetry";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

type Props = {
  data: TelemetryData[];
  loading: boolean;
};

export function TelemetryTable({ data, loading }: Props) {
  if (loading && data.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground animate-pulse">
        Fetching live telemetry log stream...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        No telemetry packets found for this device.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow className="bg-muted/50 whitespace-nowrap">
            <TableHead>System Time</TableHead>
            <TableHead>Device Time</TableHead>
            <TableHead>Packet Type</TableHead>
            <TableHead>Lat / Lng</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>Bat / Sig</TableHead>
            <TableHead>Temp</TableHead>
            <TableHead>Alert Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((log) => (
            <TableRow key={log.id} className="whitespace-nowrap text-md  font-mono">
              {/* System Time */}
              <TableCell>
                {log.timestamp ? formatDate(log.timestamp) : "-"}
              </TableCell>

              {/* Device Time */}
              <TableCell>
                {log.deviceTimestamp ? formatDate(log.deviceTimestamp) : log.deviceRawTimestamp || "-"}
              </TableCell>

              {/* Packet Type */}
              <TableCell>
                <Badge variant="outline" className="text-[10px] h-5 tracking-widest uppercase">
                  {log.packet || "UNK"}
                </Badge>
              </TableCell>

              {/* Coordinates */}
              <TableCell>
                {log.latitude && log.longitude ? (
                  <span className="text-muted-foreground">
                    {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                  </span>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Speed */}
              <TableCell>
                {log.speed ? `${log.speed} km/h` : "-"}
              </TableCell>

              {/* Battery & Signal */}
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="text-green-600 dark:text-green-400 font-semibold">{log.battery ? `${log.battery}%` : "-"}</span>
                  <span className="text-blue-600 dark:text-blue-400">{log.signal ? `${log.signal} sig` : "-"}</span>
                </div>
              </TableCell>

              {/* Temperature */}
              <TableCell>
                {log.rawTemperature ? `${log.rawTemperature}` : "-"}
              </TableCell>

              {/* Alert Status */}
              <TableCell>
                {log.alert && log.alert !== "normal" ? (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    {log.alert}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Normal</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
