import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Terminal,
  Check,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";
import { getDeviceJobs, type DeviceJob } from "@/features/devices/services/deviceService";
import { toast } from "sonner";

interface JobHistoryTableProps {
  imei: string;
}

export function JobHistoryTable({ imei }: JobHistoryTableProps) {
  const [jobs, setJobs] = useState<DeviceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getDeviceJobs(imei, 100, 0);
      setJobs(data);
    } catch (error) {
      console.error("Failed to load device jobs:", error);
      if (!silent) {
        toast.error("Failed to retrieve jobs log");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [imei]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "completed":
      case "success":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 font-semibold">
            <Check className="h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
      case "running":
      case "queued":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 gap-1 font-semibold animate-pulse">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "failed":
      case "error":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 gap-1 font-semibold">
            <AlertTriangle className="h-3 w-3" /> Failed
          </Badge>
        );
      case "cancelled":
      case "canceled":
        return (
          <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 gap-1 font-semibold">
            <X className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job) => {
    const query = search.toLowerCase();
    return (
      (job.job_type || "").toLowerCase().includes(query) ||
      (job.status || "").toLowerCase().includes(query) ||
      (job.id || "").toLowerCase().includes(query)
    );
  });

  // Paginated list
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Header bar */}
      <CardHeader className="p-4 border-b border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Device Job Logs</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-tight text-muted-foreground">Execution tracking & status confirmations</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
                className="pl-8 h-8 text-xs w-48 sm:w-60"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchJobs(true)}
                    disabled={refreshing}
                    className="h-8 w-8 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Refresh Log</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      {/* Main content */}
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-12 text-center">
            <Terminal className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No Jobs Found</p>
            <p className="text-xs text-muted-foreground mt-1 px-4">No active or historic execution jobs registered for this device yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Type</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scheduled At</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => {
                  const isExpanded = !!expandedRows[job.id];
                  return (
                    <>
                      <TableRow key={job.id} className="hover:bg-muted/10 transition-colors border-b border-border/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRow(job.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{job.job_type || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{formatDateTime(job.run_at || job.created_at)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{formatDateTime(job.completed_at)}</TableCell>
                      </TableRow>
                      
                      {isExpanded && (
                        <TableRow className="bg-muted/5 hover:bg-muted/5">
                          <TableCell colSpan={5} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Payload Column */}
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Payload Parameters</p>
                                {job.payload ? (
                                  <pre className="text-[10px] leading-tight font-mono p-3 bg-card border border-border rounded-md max-h-48 overflow-y-auto w-full text-foreground whitespace-pre-wrap break-all">
                                    {JSON.stringify(job.payload, null, 2)}
                                  </pre>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No payload parameters associated.</p>
                                )}
                              </div>

                              {/* Execution logs Column */}
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Execution Trace / Logs</p>
                                {job.execution_logs ? (
                                  Array.isArray(job.execution_logs) ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                      {job.execution_logs.map((log: any, idx: number) => {
                                        const isStr = typeof log === "string";
                                        const message = isStr ? log : (log.message || log.log || JSON.stringify(log));
                                        const time = isStr ? "" : (log.timestamp || log.time || "");
                                        return (
                                          <div key={idx} className="p-2 rounded bg-card border border-border/50 text-[10px] font-mono leading-tight whitespace-pre-wrap break-all">
                                            {time && <span className="text-muted-foreground mr-2 font-bold">[{formatDateTime(time)}]</span>}
                                            <span>{message}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : typeof job.execution_logs === "object" ? (
                                    <pre className="text-[10px] leading-tight font-mono p-3 bg-card border border-border rounded-md max-h-48 overflow-y-auto w-full text-foreground whitespace-pre-wrap break-all">
                                      {JSON.stringify(job.execution_logs, null, 2)}
                                    </pre>
                                  ) : (
                                    <pre className="text-[10px] leading-tight font-mono p-3 bg-card border border-border rounded-md w-full text-foreground whitespace-pre-wrap break-all">
                                      {String(job.execution_logs)}
                                    </pre>
                                  )
                                ) : (
                                  <p className="text-xs text-muted-foreground">No execution trace logs available.</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
