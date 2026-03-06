import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Battery,
  Bluetooth,
  ChevronRight,
  Clock,
  Clock4,
  Cpu,
  Eye,
  Footprints,
  Globe,
  HardDrive,
  MapPin,
  Maximize2,
  MessageSquare,
  Mic,
  Move,
  Navigation,
  Pause,
  Phone,
  Radio,
  RefreshCcw,
  Satellite,
  Settings,
  Shield,
  Signal,
  Thermometer,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import useDeviceTelemetry from "../hooks/useDeviceTelemetry";

// Define proper types
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  color?: string;
  children?: React.ReactNode;
}

export default function DeviceTelemetryPage() {
  const { imei } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const { device, deviceStatus, isLoading } = useDeviceTelemetry(imei ?? "");

  // Ensure all values are primitives, not objects
  const dummyData = {
    name: "Leela",
    imei: "8948613516161515",
    status: "Online",
    temperature: 23,
    battery: 66,
    speed: 3,
    latitude: 23.6516,
    longitude: 51.6125,
    signal: 80,
    gpsSignal: 92,
    satellites: 3,
    distance: "6",
    steps: 8554,
    performance: 86,
    lastUpdate: "2024-12-08T14:21:54",
    guardian1: "Rajesh Kumar",
    guardian1Phone: "8641651566",
    guardian2: "Aravind Shukla",
    guardian2Phone: "7915131351",
    dataInterval: "600",
    audioRecording: true,
    aeroplaneMode: false,
    outgoingCall: true,
    sms: true,
    ble: false,
    ledStatus: true,
    currentMode: "Incognito",
    alert: "Normal",
    safetyEvents: 9,
    crawling: 5,
    stationary: 5,
    overspeeding: 5,
    firmware: "v2.1.4",
    storage: 68,
    ram: 42,
  };

  // Safely extract primitive values
  const data = {
    name: device?.studentName ?? dummyData.name,
    imei: device?.imei ?? dummyData.imei,
    status: deviceStatus?.status ?? dummyData.status,

    temperature: Number(deviceStatus?.rawTemperature ?? dummyData.temperature),
    battery: Number(deviceStatus?.battery ?? dummyData.battery),
    speed: Number(deviceStatus?.speed ?? dummyData.speed),

    latitude: Number(deviceStatus?.latitude ?? dummyData.latitude),
    longitude: Number(deviceStatus?.longitude ?? dummyData.longitude),

    signal: Number(deviceStatus?.signal ?? dummyData.signal),
    gpsSignal: Number(dummyData.gpsSignal),

    satellites: Number(dummyData.satellites),
    distance: String(dummyData.distance),
    steps: Number(dummyData.steps),

    performance: Number(dummyData.performance),
    lastUpdate: device?.createdAt ?? dummyData.lastUpdate,

    guardian1: String(dummyData.guardian1),
    guardian1Phone: String(dummyData.guardian1Phone),

    guardian2: String(dummyData.guardian2),
    guardian2Phone: String(dummyData.guardian2Phone),

    dataInterval: String(device?.interval ?? dummyData.dataInterval),

    audioRecording: Boolean(dummyData.audioRecording),
    aeroplaneMode: Boolean(dummyData.aeroplaneMode),
    ble: Boolean(dummyData.ble),
    ledStatus: Boolean(dummyData.ledStatus),

    currentMode: String(dummyData.currentMode),
    alert: deviceStatus?.alert ?? dummyData.alert,

    safetyEvents: Number(dummyData.safetyEvents),
    crawling: Number(dummyData.crawling),
    stationary: Number(dummyData.stationary),
    overspeeding: Number(dummyData.overspeeding),

    firmware: String(dummyData.firmware),
    storage: Number(dummyData.storage),
    ram: Number(dummyData.ram),
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return "text-green-600";
    if (level >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getSignalStrength = (signal: number) => {
    if (signal >= 80) return 4;
    if (signal >= 60) return 3;
    if (signal >= 40) return 2;
    if (signal >= 20) return 1;
    return 0;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    unit,
    color = "primary",
    children,
  }: MetricCardProps) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              {label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "rounded-full p-3 group-hover:scale-110 transition-transform",
              `bg-${color}-500/10`,
            )}
          >
            <Icon className={cn("h-5 w-5", `text-${color}-500`)} />
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading device data...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
                  <Radio className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                      Device Telemetry
                    </h1>
                    <Badge
                      variant="outline"
                      className="hidden md:inline-flex border-primary/20 bg-primary/5 text-primary"
                    >
                      Beta
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {data.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(data.lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full animate-pulse",
                      data.status === "Online" ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                  <span className="text-sm font-medium">{data.status}</span>
                </div>

                <Badge variant="secondary" className="px-3 py-1.5 gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  {data.currentMode}
                </Badge>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshCcw
                        className={cn("h-4 w-4", refreshing && "animate-spin")}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>

                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configure</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Alert Banner */}
          {data.alert !== "Normal" && (
            <div className="rounded-xl border border-destructive/20 bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 animate-in slide-in-from-top">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-destructive/20 p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-destructive">Device Alert</p>
                  <p className="text-sm text-destructive/80">
                    Device is in {data.alert} mode. Immediate attention
                    required.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Move}
              label="Movement"
              value={data.speed}
              unit="km/h"
              color="blue"
            >
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                <MapPin className="h-3.5 w-3.5" />
                <span className="font-mono">
                  {data.latitude.toFixed(4)}°N, {data.longitude.toFixed(4)}°E
                </span>
              </div>
            </MetricCard>

            <MetricCard
              icon={Battery}
              label="Battery"
              value={data.battery}
              unit="%"
              color="yellow"
            >
              <div className="mt-4 space-y-2">
                <Progress
                  value={data.battery}
                  className="h-2"
                  indicatorClassName={cn(
                    data.battery > 60
                      ? "bg-green-500"
                      : data.battery > 20
                        ? "bg-yellow-500"
                        : "bg-red-500",
                  )}
                />
                <p className="text-xs text-muted-foreground flex justify-between">
                  <span>≈ 3 hours remaining</span>
                  <span className="font-mono">{data.battery}%</span>
                </p>
              </div>
            </MetricCard>

            <MetricCard
              icon={Wifi}
              label="Signal"
              value={data.signal}
              unit="%"
              color="purple"
            >
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-6 rounded-full transition-all",
                        i < getSignalStrength(data.signal)
                          ? "bg-primary"
                          : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Satellite className="h-3.5 w-3.5" />
                  <span>{data.satellites} SAT</span>
                </div>
              </div>
            </MetricCard>

            <MetricCard
              icon={Activity}
              label="Activity"
              value={data.steps.toLocaleString()}
              unit="steps"
              color="green"
            >
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{data.distance} km today</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  +12% <TrendingUp className="h-3 w-3 ml-1 inline" />
                </Badge>
              </div>
            </MetricCard>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tabs Navigation */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 dark:bg-slate-800 p-1">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="network"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                  >
                    Network
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Status Cards Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            Device Health
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Real-time
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              icon: Thermometer,
                              label: "Temperature",
                              value: `${data.temperature}°C`,
                              color: "blue",
                            },
                            {
                              icon: Cpu,
                              label: "Performance",
                              value: `${data.performance}%`,
                              progress: data.performance,
                              color: "green",
                            },
                            {
                              icon: HardDrive,
                              label: "Storage",
                              value: `${data.storage}%`,
                              progress: data.storage,
                              color: "purple",
                            },
                            {
                              icon: Clock4,
                              label: "Data Interval",
                              value: `${data.dataInterval}s`,
                              color: "orange",
                            },
                          ].map((item, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <item.icon
                                    className={cn(
                                      "h-4 w-4",
                                      `text-${item.color}-500`,
                                    )}
                                  />
                                  <span className="text-sm">{item.label}</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {item.value}
                                </span>
                              </div>
                              {item.progress !== undefined && (
                                <Progress
                                  value={item.progress}
                                  className="h-1.5"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            Safety Status
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {data.safetyEvents} events
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Alert Level",
                              value: data.alert,
                              variant:
                                data.alert === "SOS"
                                  ? "destructive"
                                  : "secondary",
                            },
                            {
                              label: "Current Mode",
                              value: data.currentMode,
                              icon: Shield,
                            },
                            {
                              label: "Firmware",
                              value: data.firmware,
                              icon: Cpu,
                            },
                            {
                              label: "RAM Usage",
                              value: `${data.ram}%`,
                              progress: data.ram,
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-muted-foreground">
                                {item.label}
                              </span>
                              {item.variant ? (
                                <Badge variant={item.variant as any}>
                                  {String(item.value)}
                                </Badge>
                              ) : item.progress !== undefined ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {String(item.value)}
                                  </span>
                                  <Progress
                                    value={item.progress}
                                    className="w-16 h-1.5"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  {item.icon && (
                                    <item.icon className="h-3.5 w-3.5" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {String(item.value)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Breakdown */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Activity Breakdown</CardTitle>
                          <CardDescription>
                            Last 24 hours monitoring
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <BarChart3 className="h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          {
                            label: "Crawling",
                            value: data.crawling,
                            icon: Footprints,
                            color: "blue",
                          },
                          {
                            label: "Stationary",
                            value: data.stationary,
                            icon: Pause,
                            color: "orange",
                          },
                          {
                            label: "Overspeeding",
                            value: data.overspeeding,
                            icon: TrendingUp,
                            color: "red",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold">
                                  {item.value}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.label}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "rounded-full p-2",
                                  `bg-${item.color}-500/10`,
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    "h-4 w-4",
                                    `text-${item.color}-500`,
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Map Placeholder */}
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>Live Location</CardTitle>
                        <Badge variant="outline" className="gap-1">
                          <Satellite className="h-3 w-3" />
                          {data.satellites} satellites
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative group">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="rounded-full bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg mb-3">
                              <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">Map View</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {data.latitude.toFixed(4)}°N,{" "}
                              {data.longitude.toFixed(4)}°E
                            </p>
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1"
                          >
                            <Maximize2 className="h-3 w-3" />
                            Expand
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                      <CardDescription>
                        Movement history and events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                          >
                            <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                              <Activity className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  Location Update
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {i * 15} min ago
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(23.6516 + i * 0.001).toFixed(4)}°N,{" "}
                                {(51.6125 + i * 0.001).toFixed(4)}°E
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="network" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Network Performance</CardTitle>
                      <CardDescription>
                        Signal strength and connectivity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Signal className="h-4 w-4 text-green-500" />
                              GPS Signal
                            </span>
                            <span className="font-medium">
                              {data.gpsSignal}%
                            </span>
                          </div>
                          <Progress value={data.gpsSignal} className="h-2" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Wifi className="h-4 w-4 text-blue-500" />
                              Network Signal
                            </span>
                            <span className="font-medium">{data.signal}%</span>
                          </div>
                          <Progress value={data.signal} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="flex items-center gap-3 rounded-lg border p-3">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">4G/LTE</p>
                              <p className="text-xs text-muted-foreground">
                                Connected
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border p-3">
                            <Satellite className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {data.satellites} Satellites
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Active
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Remote device controls</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {[
                    { icon: Phone, label: "Call Guardian", color: "blue" },
                    { icon: MessageSquare, label: "Send SMS", color: "green" },
                    { icon: MapPin, label: "Locate Device", color: "purple" },
                    {
                      icon: AlertTriangle,
                      label: "SOS Test",
                      color: "red",
                      destructive: true,
                    },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-auto py-3 px-4",
                        action.destructive &&
                          "text-destructive hover:text-destructive hover:bg-destructive/10",
                      )}
                    >
                      <action.icon
                        className={cn(
                          "h-4 w-4",
                          !action.destructive && `text-${action.color}-500`,
                        )}
                      />
                      <span className="flex-1 text-left">{action.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Guardians Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Guardians</CardTitle>
                  <CardDescription>Emergency contacts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      name: data.guardian1,
                      phone: data.guardian1Phone,
                      initials: "RK",
                    },
                    {
                      name: data.guardian2,
                      phone: data.guardian2Phone,
                      initials: "AS",
                    },
                  ].map((guardian, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {guardian.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {guardian.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {guardian.phone}
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Call now</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Device Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Settings</CardTitle>
                  <CardDescription>Current configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        icon: Mic,
                        label: "Audio Recording",
                        active: data.audioRecording,
                      },
                      {
                        icon: WifiOff,
                        label: "Aeroplane Mode",
                        active: data.aeroplaneMode,
                        destructive: true,
                      },
                      {
                        icon: Bluetooth,
                        label: "Bluetooth LE",
                        active: data.ble,
                      },
                      {
                        icon: Eye,
                        label: "LED Status",
                        active: data.ledStatus,
                      },
                    ].map((setting) => (
                      <div
                        key={setting.label}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              setting.active
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <setting.icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm">{setting.label}</span>
                        </div>
                        <Badge
                          variant={setting.active ? "default" : "secondary"}
                          className={cn(
                            setting.destructive &&
                              setting.active &&
                              "bg-destructive text-destructive-foreground",
                          )}
                        >
                          {setting.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Info Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Device Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">IMEI</span>
                      <span className="font-mono font-medium">{data.imei}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">GT-1000</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Firmware</span>
                      <span className="font-medium">{data.firmware}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Last Calibration
                      </span>
                      <span className="font-medium">2024-12-01</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
