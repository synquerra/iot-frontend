import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertOctagon,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { getAlerts, getErrors, acknowledgeAlert, type AlertErrorItem } from "./services/alertsService";
import { useDevices } from "../devices/hooks/useDevices";
import { toast } from "sonner";

// Sub-components
import { AlertsHeader } from "./components/AlertsHeader";
import { SeverityOverview } from "./components/SeverityOverview";
import { AlertsHistory } from "./components/AlertsHistory";

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

  const Icon = viewMode === "alerts" ? AlertCircle : AlertOctagon;

  return (
    <div className="min-h-screen">
      <div className="mx-auto ">
        <AlertsHeader 
          icon={Icon} 
          isRefreshing={isRefreshing} 
          onRefresh={() => fetchData(false)} 
        />

        {/* Mode Toggle */}
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1">
              <TabsTrigger value="errors" className=" gap-2">
                <AlertOctagon className="h-4 w-4" />
                Errors
              </TabsTrigger>
              <TabsTrigger value="alerts" className=" gap-2">
                <AlertCircle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
    </div>
  );
}