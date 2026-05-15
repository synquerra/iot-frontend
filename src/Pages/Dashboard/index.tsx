import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  Battery,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  Filter,
  Gauge,
  MapPin,
  MoreVertical,
  Navigation,
  RefreshCw,
  Signal,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [timeRange, setTimeRange] = useState("today");

  // Enhanced stats with icons and colors
  const stats = [
    {
      title: "Total Analytics",
      value: "12,894",
      change: "+12.3%",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950/50",
      trend: "up",
    },
    {
      title: "Active Devices",
      value: "12",
      change: "+2",
      icon: Cpu,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950/50",
      trend: "up",
    },
    {
      title: "Recent Activity",
      value: "5",
      change: "-2",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950/50",
      trend: "down",
    },
    {
      title: "Avg Response",
      value: "1.2s",
      change: "-0.3s",
      icon: Gauge,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950/50",
      trend: "up",
    },
  ];

  const devices = [
    {
      imei: "123456",
      interval: 20,
      geoid: "Ranchi",
      status: "active",
      battery: 85,
      signal: 92,
      lastSeen: "2 min ago",
      alerts: 0,
    },
    {
      imei: "789012",
      interval: 95,
      geoid: "Delhi",
      status: "idle",
      battery: 45,
      signal: 78,
      lastSeen: "15 min ago",
      alerts: 2,
    },
    {
      imei: "345678",
      interval: 30,
      geoid: "Mumbai",
      status: "active",
      battery: 92,
      signal: 95,
      lastSeen: "Just now",
      alerts: 0,
    },
    {
      imei: "901234",
      interval: 120,
      geoid: "Bangalore",
      status: "offline",
      battery: 12,
      signal: 0,
      lastSeen: "2 hours ago",
      alerts: 1,
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      device: "789012",
      message: "Low battery",
      time: "5 min ago",
      severity: "warning",
    },
    {
      id: 2,
      device: "901234",
      message: "Device offline",
      time: "2 hours ago",
      severity: "error",
    },
    {
      id: 3,
      device: "123456",
      message: "Movement detected",
      time: "10 min ago",
      severity: "info",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      {/* Header Section with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards with Icons and Colors */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stat.value}</span>
                      <span
                        className={`text-xs font-medium ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <Progress value={75} className="mt-4 h-1" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Section */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Select Device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices.map((d) => (
                    <SelectItem key={d.imei} value={d.imei}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(d.status)}`}
                        />
                        {d.imei}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {selectedDevice !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedDevice("all")}
                  className="gap-2"
                >
                  Clear
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side - Map and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card */}
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Device Location Map
                </CardTitle>
                <Badge variant="outline" className="bg-white dark:bg-gray-900">
                  Live Tracking
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] p-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto animate-bounce" />
                  <p className="text-muted-foreground">
                    Interactive Map Component
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Badge variant="secondary">12 Active Markers</Badge>
                    <Badge variant="secondary">Zoom: 10x</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Analytics Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Navigation className="h-5 w-5 text-green-600" />
                  Trip Analytics
                </CardTitle>
                <Tabs defaultValue="overview" className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      156
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Avg Distance
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      45 km
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      328h
                    </p>
                  </div>
                </div>
                <div className="h-[100px] bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <span className="ml-2 text-muted-foreground">
                    Trip trend chart
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Quick Stats & Alerts */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardHeader className="pb-3 border-b border-gray-700">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="h-5 w-5 text-yellow-400" />
                Live Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  {
                    label: "Total Distance",
                    value: "245 km",
                    icon: Navigation,
                    color: "text-blue-400",
                  },
                  {
                    label: "Active Now",
                    value: "4 devices",
                    icon: Activity,
                    color: "text-green-400",
                  },
                  {
                    label: "Avg Interval",
                    value: "42s",
                    icon: Clock,
                    color: "text-purple-400",
                  },
                  {
                    label: "Data Usage",
                    value: "2.4 GB",
                    icon: Signal,
                    color: "text-orange-400",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-gray-300">
                          {item.label}
                        </span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">System Health</span>
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-400"
                  >
                    98%
                  </Badge>
                </div>
                <Progress value={98} className="h-2 bg-gray-700" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Recent Alerts
                <Badge variant="destructive" className="ml-auto">
                  3 New
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Device: {alert.device} • {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Device Management Table */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="h-5 w-5 text-purple-600" />
              Device Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">IMEI</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Battery</TableHead>
                <TableHead className="font-semibold">Signal</TableHead>
                <TableHead className="font-semibold">Last Seen</TableHead>
                <TableHead className="font-semibold">Alerts</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow
                  key={device.imei}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)} animate-pulse`}
                      />
                      <span className="capitalize">{device.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {device.imei}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {device.geoid}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Battery
                        className={`h-4 w-4 ${
                          device.battery > 70
                            ? "text-green-500"
                            : device.battery > 30
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      />
                      <span>{device.battery}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-blue-500" />
                      <span>{device.signal}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {device.lastSeen}
                  </TableCell>
                  <TableCell>
                    {device.alerts > 0 ? (
                      <Badge variant="destructive" className="rounded-full">
                        {device.alerts}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full text-green-600"
                      >
                        0
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
