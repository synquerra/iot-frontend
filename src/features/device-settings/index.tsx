import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Battery,
  Bell,
  Clock,
  Cpu,
  Download,
  Eye,
  EyeOff,
  Gauge,
  Headphones,
  Lock,
  MapPin,
  Pencil,
  Phone,
  Power,
  RotateCcw,
  Save,
  Settings2,
  Shield,
  Thermometer,
  Upload,
  Users,
  Wifi,
} from "lucide-react";

export default function DeviceSettings() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white ">
      <div className=" mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Device Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure and manage your device parameters
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 hover:bg-red-400"
              disabled
            >
              <RotateCcw size={16} />
              Reset All
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2">
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Devices", value: "3", icon: Cpu, color: "purple" },
            {
              label: "Registered Numbers",
              value: "4",
              icon: Phone,
              color: "blue",
            },
            { label: "Active Modes", value: "5", icon: Power, color: "green" },
            {
              label: "Last Updated",
              value: "2 min ago",
              icon: Clock,
              color: "orange",
            },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className=""
              style={{ borderLeftColor: `var(--${stat.color}-500)` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="communication" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-transparent h-auto p-0">
            {[
              { value: "communication", label: "Communication", icon: Phone },
              { value: "intervals", label: "Intervals", icon: Clock },
              { value: "safety", label: "Safety", icon: Shield },
              { value: "modes", label: "Modes", icon: Gauge },
              { value: "advanced", label: "Advanced", icon: Settings2 },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 gap-2"
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Registered Mobile Numbers
                  </CardTitle>
                  <CardDescription>
                    Manage emergency and registered contacts
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Pencil size={14} />
                  Edit Numbers
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      label: "Primary Number",
                      number: "+91 9988776655",
                      badge: "Primary",
                      type: "primary",
                    },
                    {
                      label: "Secondary Number",
                      number: "+91 7788994433",
                      badge: "Secondary",
                      type: "secondary",
                    },
                    {
                      label: "Control Room",
                      number: "+91 8877665544",
                      badge: "Emergency",
                      type: "emergency",
                    },
                    {
                      label: "Backup Number",
                      number: "+91 7799886655",
                      badge: "Backup",
                      type: "backup",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.type === "primary"
                              ? "bg-green-500"
                              : item.type === "emergency"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <span className="font-medium">{item.label}</span>
                          <p className="text-sm text-muted-foreground">
                            {item.number}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.type === "emergency"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-purple-600" />
                  Ambient Listening
                </CardTitle>
                <CardDescription>
                  Configure audio monitoring settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Bell className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Ambient Listening</p>
                      <p className="text-sm text-muted-foreground">
                        Enable real-time audio monitoring
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="destructive" className="gap-2">
                    <Power size={16} />
                    Stop Ambient Listening
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} />
                    View / Download Audio Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intervals Tab */}
          <TabsContent value="intervals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Time Intervals
                </CardTitle>
                <CardDescription>
                  Configure data transmission and GPS intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Normal Sending Interval",
                      value: "600s",
                      desc: "Standard data transmission",
                    },
                    {
                      label: "SOS Sending Interval",
                      value: "60s",
                      desc: "Emergency transmission",
                      urgent: true,
                    },
                    {
                      label: "Normal GPS Interval",
                      value: "300s",
                      desc: "Standard GPS update",
                    },
                    {
                      label: "Aeroplane Scan Interval",
                      value: "400s",
                      desc: "Flight mode scanning",
                    },
                    {
                      label: "Low Battery Data Interval",
                      value: "900s",
                      desc: "Power saving mode",
                    },
                    {
                      label: "Low Battery GPS Interval",
                      value: "600s",
                      desc: "Power saving GPS",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="space-y-2 p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        <Badge
                          variant={item.urgent ? "destructive" : "outline"}
                          className="text-lg"
                        >
                          {item.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" className="text-purple-600 gap-2">
                    <RotateCcw size={16} />
                    Set to Default Values
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Safety Parameters
                </CardTitle>
                <CardDescription>
                  Configure safety thresholds and limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold">Temperature Limit</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input type="number" defaultValue="30" className="w-24" />
                      <span className="text-lg">°C</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alert when temperature exceeds limit
                    </p>
                  </div>

                  <div className="space-y-4 p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">Speed Limit</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input type="number" defaultValue="60" className="w-24" />
                      <span className="text-lg">km/h</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alert when speed exceeds limit
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" className="text-purple-600 gap-2">
                    <RotateCcw size={16} />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modes Tab */}
          <TabsContent value="modes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-600" />
                  Device Modes
                </CardTitle>
                <CardDescription>
                  Enable or disable device features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Lock,
                      label: "Privacy Mode",
                      desc: "Enable privacy protection",
                      color: "purple",
                    },
                    {
                      icon: EyeOff,
                      label: "Incognito Mode",
                      desc: "Hide device activity",
                      color: "blue",
                    },
                    {
                      icon: Wifi,
                      label: "Aeroplane Active",
                      desc: "Flight mode enabled",
                      color: "orange",
                    },
                    {
                      icon: Users,
                      label: "School Access",
                      desc: "Educational mode",
                      color: "green",
                    },
                    {
                      icon: AlertTriangle,
                      label: "DNT",
                      desc: "Do not track",
                      color: "red",
                    },
                    {
                      icon: Eye,
                      label: "LED ON",
                      desc: "Indicator lights",
                      color: "yellow",
                    },
                    {
                      icon: Shield,
                      label: "Safe Mode",
                      desc: "Restricted operation",
                      color: "indigo",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${item.color}-100`}>
                          <item.icon
                            className={`h-4 w-4 text-${item.color}-600`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked={idx < 4} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-purple-600" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Configure advanced device parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Feature Toggles</h3>
                    {[
                      {
                        label: "Incog Sett. Allow",
                        desc: "Allow incognito settings",
                        icon: Lock,
                      },
                      {
                        label: "I/C Call Enable",
                        desc: "Incoming calls allowed",
                        icon: Phone,
                      },
                      {
                        label: "Call sec. matrix",
                        desc: "Secure call routing",
                        icon: Shield,
                      },
                      {
                        label: "Extended GEO-F",
                        desc: "Extended geofencing",
                        icon: MapPin,
                      },
                      {
                        label: "Accel Enabled",
                        desc: "Accelerometer active",
                        icon: Gauge,
                      },
                      {
                        label: "AI Power Save",
                        desc: "AI power management",
                        icon: Battery,
                      },
                      {
                        label: "Access to Police",
                        desc: "Law enforcement access",
                        icon: Users,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <Switch defaultChecked={idx % 2 === 0} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Power Management</h3>
                    {[
                      {
                        label: "Calling Enable",
                        desc: "Enable call features",
                        icon: Phone,
                      },
                      {
                        label: "O/g Call Enable",
                        desc: "Outgoing calls allowed",
                        icon: Upload,
                      },
                      {
                        label: "Extended History",
                        desc: "Extended data retention",
                        icon: Clock,
                      },
                      {
                        label: "Temp Comp.",
                        desc: "Temperature compensation",
                        icon: Thermometer,
                      },
                      {
                        label: "Ble Enabled",
                        desc: "Bluetooth low energy",
                        icon: Wifi,
                      },
                      {
                        label: "Battery Reserved %",
                        desc: "Reserve battery level",
                        icon: Battery,
                        input: true,
                        value: "10",
                      },
                      {
                        label: "Low Battery %",
                        desc: "Low battery threshold",
                        icon: Battery,
                        input: true,
                        value: "30",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        {item.input ? (
                          <Input
                            className="w-20 h-8"
                            defaultValue={item.value}
                          />
                        ) : (
                          <Switch defaultChecked={idx % 2 === 0} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
