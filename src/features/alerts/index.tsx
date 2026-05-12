import {
  AlertOctagon,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { getAlerts, getErrors, acknowledgeAlert, type AlertErrorItem } from "./services/alertsService";
import { useDevices } from "../devices/hooks/useDevices";
import { toast } from "sonner";

// Sub-components
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SeverityOverview } from "./components/SeverityOverview";
import { AlertsHistory } from "./components/AlertsHistory";
import { cn } from "@/lib/utils";

// Types
import type { ViewMode, SeverityCard, HistoryItem } from "./types";

export default function AlertsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("errors");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [alerts, setAlerts] = useState<AlertErrorItem[]>([]);
  const [errors, setErrors] = useState<AlertErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { devices } = useDevices();

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setIsRefreshing(true);
      const [alertsData, errorsData] = await Promise.all([
        getAlerts(),
        getErrors()
      ]);
      setAlerts(alertsData);
      setErrors(errorsData);
    } catch (error) {
      toast.error("Failed to fetch alerts/errors");
      console.error(error);
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcknowledge = async (id: string) => {
    const toastId = toast.loading("Acknowledging incident...");
    try {
      await acknowledgeAlert(id);
      toast.success("Incident acknowledged", { id: toastId });
      fetchData(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to acknowledge", { id: toastId });
    }
  };

  const deviceMap = useMemo(() => {
    const map: Record<string, string> = {};
    devices.forEach(d => {
      map[d.imei] = d.displayName;
    });
    return map;
  }, [devices]);

  const allItems = useMemo((): HistoryItem[] => {
    const rawItems = viewMode === "alerts" ? alerts : errors;
    
    const getColor = (severity: string) => {
      const s = severity.toLowerCase();
      if (s === "critical" || s === "danger") return "rose"; // Red
      if (s === "warning" || s === "caution") return "orange"; // Orangeish red
      return "amber"; // Yellowish red (Advisory/Notice)
    };

    return rawItems.map((item): HistoryItem => ({
      id: item.id,
      title: item.description,
      name: deviceMap[item.imei] || item.imei,
      imei: item.imei,
      timestamp: item.createdAt,
      severity: item.severity || (viewMode === "alerts" ? "danger" : "critical"),
      type: item.type,
      color: getColor(item.severity || (viewMode === "alerts" ? "danger" : "critical")),
      is_acknowledged: item.is_acknowledged,
      code: item.code
    }));
  }, [viewMode, alerts, errors, deviceMap]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.imei.includes(query)
        );
      }
      return true;
    });
  }, [allItems, searchQuery]);

  const cards: SeverityCard[] = useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach(item => {
      const s = item.severity.toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });

    if (viewMode === "errors") {
      return [
        { label: "Critical", count: (counts['critical'] || 0) + (counts['danger'] || 0), icon: XCircle },
        { label: "Warning", count: (counts['warning'] || 0) + (counts['caution'] || 0), icon: AlertTriangle },
        { label: "Advisory", count: counts['advisory'] || counts['notice'] || 0, icon: Info },
      ];
    } else {
      return [
        { label: "Critical", count: (counts['danger'] || 0) + (counts['critical'] || 0), icon: AlertOctagon },
        { label: "Warning", count: (counts['caution'] || 0) + (counts['warning'] || 0), icon: AlertTriangle },
        { label: "Advisory", count: counts['notice'] || counts['advisory'] || 0, icon: Info },
      ];
    }
  }, [viewMode, allItems]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Incidents"
        description="Monitor system health and device status"
        icon={AlertOctagon}
      >
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="hidden md:block">
            <TabsList className="grid w-[240px] grid-cols-2 h-10 p-1 bg-muted/40 border border-border/50 rounded-xl">
              <TabsTrigger value="errors" className="text-[10px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                Errors
                <span className="flex items-center justify-center h-4.5 min-w-[1.25rem] px-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-black border border-red-500/20">
                  {errors.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-[10px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                Alerts
                <span className="flex items-center justify-center h-4.5 min-w-[1.25rem] px-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black border border-amber-500/20">
                  {alerts.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative group hidden sm:block w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs font-bold bg-muted/20 border-border/50 focus:bg-background transition-all rounded-xl"
            />
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchData(false)} 
            disabled={isRefreshing}
            className="h-10 w-10 rounded-xl"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-primary")} />
          </Button>
        </div>
      </PageHeader>

      <SeverityOverview cards={cards} loading={loading} />

      <AlertsHistory 
        loading={loading}
        filteredItems={filteredItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isRefreshing={isRefreshing}
        onAcknowledge={handleAcknowledge}
        formatDate={formatDate}
      />
    </div>
  );
}