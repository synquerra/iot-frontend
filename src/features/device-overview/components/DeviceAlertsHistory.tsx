import { useState, useEffect, useMemo, useCallback } from "react";
import { getDeviceIncidents, acknowledgeAlert, type AlertErrorItem } from "@/features/alerts/services/alertsService";
import { AlertsHistory } from "@/features/alerts/components/AlertsHistory";
import { SeverityOverview } from "@/features/alerts/components/SeverityOverview";
import { Tabs, Box, Group } from "@mantine/core";
import { AlertCircle, AlertOctagon, XCircle, AlertTriangle, Info } from "lucide-react";
import type { HistoryItem, ViewMode, SeverityCard } from "@/features/alerts/types";
import { toast } from "@/lib/toast";

interface DeviceAlertsHistoryProps {
  imei: string;
  deviceName: string;
}

export function DeviceAlertsHistory({ imei, deviceName }: DeviceAlertsHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("errors");
  const [incidents, setIncidents] = useState<AlertErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setIsRefreshing(true);
      const data = await getDeviceIncidents(imei);
      setIncidents(data || []);
    } catch (error) {
      console.error("Failed to fetch device incidents:", error);
      if (!isSilent) toast.error("Failed to fetch alerts/errors");
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [imei]);

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

  const allFilteredItems = useMemo((): HistoryItem[] => {
    const rawItems = incidents.filter(item =>
      viewMode === "alerts" ? item.type === "alert" : item.type === "error"
    );

    const getColor = (severity: string) => {
      const s = severity.toLowerCase();
      if (s === "critical" || s === "danger") return "rose";
      if (s === "warning" || s === "caution") return "orange";
      return "amber";
    };

    return rawItems.map((item): HistoryItem => ({
      id: item.id,
      title: item.description,
      name: deviceName || item.imei,
      imei: item.imei,
      timestamp: item.createdAt,
      severity: item.severity || (item.type === "alert" ? "danger" : "critical"),
      type: item.type,
      color: getColor(item.severity || (item.type === "alert" ? "danger" : "critical")),
      is_acknowledged: item.is_acknowledged,
      code: item.code
    }));
  }, [incidents, viewMode, deviceName]);

  const cards: SeverityCard[] = useMemo(() => {
    const counts: Record<string, number> = {};
    allFilteredItems.forEach(item => {
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
  }, [viewMode, allFilteredItems]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allFilteredItems;
    const query = searchQuery.toLowerCase();
    return allFilteredItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
    );
  }, [allFilteredItems, searchQuery]);

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
    <Box className="space-y-6 h-[800px] scroll-container rounded-xl">
      <Group mb="md">
        <Tabs 
          value={viewMode} 
          onChange={(v) => setViewMode(v as ViewMode)}
          variant="pills"
          className="w-full max-w-md"
        >
          <Tabs.List grow>
            <Tabs.Tab 
              value="errors" 
              leftSection={<AlertOctagon size="1rem" />}
            >
              Errors
            </Tabs.Tab>
            <Tabs.Tab 
              value="alerts" 
              leftSection={<AlertCircle size="1rem" />}
            >
              Alerts
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>

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
    </Box>
  );
}
