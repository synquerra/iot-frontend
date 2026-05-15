import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Battery,
  Cpu,
  MapPin,
  RefreshCw,
  Signal,
  TrendingUp,
  Wifi,
  AlertCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import { listDevices, type Device } from "@/features/devices/services/deviceService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadDevices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const data = await listDevices();
      setDevices(data);
    } catch {
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDevices(); }, []);

  const stats = useMemo(() => {
    const total = devices.length;
    const active = devices.filter(d => d.status === "active").length;
    const inactive = devices.filter(d => d.status === "inactive").length;
    const withBattery = devices.filter(d => d.battery && Number(d.battery) < 20).length;
    return { total, active, inactive, lowBattery: withBattery };
  }, [devices]);

  const recentDevices = useMemo(() =>
    [...devices].sort((a, b) => {
      const at = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bt = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bt - at;
    }).slice(0, 6),
    [devices]
  );

  const formatTime = (ts?: string | null) => {
    if (!ts) return "No data yet";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(new Date(ts));
    } catch { return "Unknown"; }
  };

  const statCards = [
    {
      label: "Total Devices",
      value: stats.total,
      icon: Cpu,
      color: "text-primary",
      bg: "bg-primary/10",
      description: "Registered in fleet",
    },
    {
      label: "Active",
      value: stats.active,
      icon: Activity,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      description: "Currently transmitting",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: Signal,
      color: "text-muted-foreground",
      bg: "bg-muted",
      description: "Not transmitting",
    },
    {
      label: "Low Battery",
      value: stats.lowBattery,
      icon: Battery,
      color: "text-red-500",
      bg: "bg-red-500/10",
      description: "Below 20% charge",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Overview"
        description="Real-time monitoring and analytics command center"
        icon={TrendingUp}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => loadDevices(true)}
          disabled={refreshing}
          className="h-10 w-10 rounded-xl"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin text-primary")} />
        </Button>
      </PageHeader>

      {/* Phase 2 Notice */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
        <div className="flex-shrink-0 p-2 rounded-xl bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">Analytics Center — Coming in Phase 2</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Trip history, heat maps, and custom reporting will be available in the next major update.
          </p>
        </div>
        <Badge variant="secondary" className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-0">
          Phase 2
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">{card.label}</p>
                      <p className="text-base sm:text-lg font-bold text-foreground leading-none">{card.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{card.description}</p>
                    </div>
                    <div className={cn("p-2 rounded-lg flex-shrink-0", card.bg)}>
                      <Icon className={cn("h-4 w-4", card.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Devices */}
        <div className="lg:col-span-2">
          <Card className="border-border shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-primary" />
                Recent Activity
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => loadDevices(true)}
                  disabled={refreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin text-primary")} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold"
                  onClick={() => navigate("/devices/list")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-5 space-y-3">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : recentDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Cpu className="h-10 w-10 opacity-20 mb-3" />
                  <p className="text-sm font-medium">No devices registered yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentDevices.map((device) => (
                    <button
                      key={device.imei}
                      onClick={() => navigate(`/devices/${device.imei}`)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left group"
                    >
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full flex-shrink-0",
                        device.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{device.displayName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{device.imei}</span>
                          {device.battery && (
                            <span className={cn(
                              "text-[10px] font-bold flex items-center gap-0.5",
                              Number(device.battery) < 20 ? "text-red-500" : "text-muted-foreground"
                            )}>
                              <Battery className="h-3 w-3" />{device.battery}%
                            </span>
                          )}
                          {device.geoid && device.geoid !== "10" && device.geoid !== "11" && (
                            <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />{device.geoid}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {device.timestamp && (
                          <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-1">
                            <Clock className="h-3 w-3" />{formatTime(device.timestamp)}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fleet Overview Panel */}
        <div className="space-y-4">
          {/* Status Breakdown */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-primary" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{stats.active}</span>
                        <span className="text-xs text-muted-foreground">
                          {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: stats.total > 0 ? `${(stats.active / stats.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        <span className="text-sm font-medium">Inactive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{stats.inactive}</span>
                        <span className="text-xs text-muted-foreground">
                          {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-muted-foreground/40 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: stats.total > 0 ? `${(stats.inactive / stats.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>

                  {stats.lowBattery > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Low Battery Alert</span>
                      </div>
                      <Badge variant="destructive" className="text-xs font-bold">
                        {stats.lowBattery} device{stats.lowBattery !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="border-border shadow-sm">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wide">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-0.5">
              {[
                { label: "Manage Devices", desc: "View and configure fleet", path: "/devices/list", icon: Cpu },
                { label: "Device Settings", desc: "Configure telemetry params", path: "/devices/settings", icon: Signal },
                { label: "Geofencing", desc: "Manage zone boundaries", path: "/devices/geofencing", icon: MapPin },
                { label: "Alerts & Errors", desc: "Review system events", path: "/alerts", icon: AlertCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
