import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Smartphone,
  User,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertOctagon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ViewMode = "errors" | "alerts";

type SeverityCard = {
  label: string;
  count: number;
  color: string;
  icon: any;
};

type HistoryItem = {
  id: number;
  title: string;
  name: string;
  imei: string;
  timestamp: string;
  severity: string;
  color: string;
  status?: "resolved" | "pending" | "investigating";
};

const content: Record<
  ViewMode,
  {
    heading: string;
    description: string;
    icon: any;
    cards: SeverityCard[];
    items: HistoryItem[];
  }
> = {
  errors: {
    heading: "System Errors",
    description: "Monitor and resolve system errors across all devices",
    icon: AlertOctagon,
    cards: [
      {
        label: "Critical",
        count: 6,
        color: "rose",
        icon: XCircle
      },
      {
        label: "Warning",
        count: 9,
        color: "amber",
        icon: AlertTriangle
      },
      {
        label: "Advisory",
        count: 9,
        color: "blue",
        icon: Info
      },
    ],
    items: [
      {
        id: 1,
        title: "SD Card Failure",
        name: "Rajesh Shukla",
        imei: "486515616516",
        timestamp: "2024-12-12T16:14:47",
        severity: "critical",
        color: "rose",
        status: "pending",
      },
      {
        id: 2,
        title: "Microphone Failure",
        name: "Aditya Patil",
        imei: "446166186848",
        timestamp: "2024-12-12T16:14:47",
        severity: "critical",
        color: "rose",
        status: "investigating",
      },
      {
        id: 3,
        title: "MQTT Connection Lost",
        name: "Vijay Singh",
        imei: "155484868646",
        timestamp: "2024-12-12T16:14:47",
        severity: "warning",
        color: "amber",
        status: "pending",
      },
      {
        id: 4,
        title: "No SIM Detected",
        name: "Rajesh Shukla",
        imei: "486515616516",
        timestamp: "2024-12-12T16:14:47",
        severity: "warning",
        color: "amber",
        status: "resolved",
      },
      {
        id: 5,
        title: "Low Battery Warning",
        name: "Priya Sharma",
        imei: "789123456789",
        timestamp: "2024-12-12T15:30:22",
        severity: "advisory",
        color: "blue",
        status: "resolved",
      },
      {
        id: 6,
        title: "GPS Signal Lost",
        name: "Amit Kumar",
        imei: "321654987321",
        timestamp: "2024-12-12T14:45:10",
        severity: "warning",
        color: "amber",
        status: "investigating",
      },
    ],
  },
  alerts: {
    heading: "Security Alerts",
    description: "Real-time security alerts and incidents requiring attention",
    icon: AlertCircle,
    cards: [
      {
        label: "Danger",
        count: 6,
        color: "rose",
        icon: AlertOctagon
      },
      {
        label: "Caution",
        count: 9,
        color: "amber",
        icon: AlertTriangle
      },
      {
        label: "Notice",
        count: 9,
        color: "blue",
        icon: Info
      },
    ],
    items: [
      {
        id: 1,
        title: "Speed Limit Exceeded",
        name: "Rajesh Shukla",
        imei: "486515616516",
        timestamp: "2024-12-12T16:14:47",
        severity: "danger",
        color: "rose",
        status: "investigating",
      },
      {
        id: 2,
        title: "Temperature Limit Exceeded",
        name: "Rajesh Shukla",
        imei: "486515616516",
        timestamp: "2024-12-12T16:14:47",
        severity: "danger",
        color: "rose",
        status: "pending",
      },
      {
        id: 3,
        title: "Restricted Zone Breached",
        name: "Rajesh Shukla",
        imei: "486515616516",
        timestamp: "2024-12-12T16:14:47",
        severity: "caution",
        color: "amber",
        status: "resolved",
      },
      {
        id: 4,
        title: "Unusual Movement Pattern",
        name: "Rajesh Shukla",
        imei: "486515616516",
        timestamp: "2024-12-12T16:14:47",
        severity: "caution",
        color: "amber",
        status: "investigating",
      },
      {
        id: 5,
        title: "Device Tampering Detected",
        name: "Sanjay Patel",
        imei: "987654321012",
        timestamp: "2024-12-12T13:20:15",
        severity: "danger",
        color: "rose",
        status: "pending",
      },
      {
        id: 6,
        title: "Battery Low - 15%",
        name: "Neha Gupta",
        imei: "456123789456",
        timestamp: "2024-12-12T11:05:30",
        severity: "notice",
        color: "blue",
        status: "resolved",
      },
    ],
  },
};

const statusConfig = {
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  investigating: { label: "Investigating", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export default function AlertsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("errors");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const activeContent = content[viewMode];
  const Icon = activeContent.icon;

  const filteredItems = useMemo(() => {
    return activeContent.items.filter((item) => {
      // Severity filter
      if (severityFilter !== "all" && item.severity !== severityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Search filter
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
  }, [activeContent.items, severityFilter, statusFilter, searchQuery]);

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

  const getSeverityCount = (severity: string) => {
    return activeContent.items.filter(item => item.severity === severity).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
      <div className="mx-auto ">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Alerts & Errors
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage system events across all devices
                </p>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90">
              <CheckCircle2 className="h-4 w-4" />
              Mark All Read
            </Button>
          </div> */}
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="errors" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 gap-2">
                <AlertOctagon className="h-4 w-4" />
                Errors
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 gap-2">
                <AlertCircle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Severity Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeContent.cards.map((card) => {
            const CardIcon = card.icon;
            const count = getSeverityCount(card.label.toLowerCase());

            return (
              <Card
                key={card.label}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                  `hover:border-${card.color}-200 dark:hover:border-${card.color}-800`
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 bg-opacity-10",
                          `bg-${card.color}-100 text-${card.color}-700 dark:bg-${card.color}-950 dark:text-${card.color}-400`
                        )}
                      >
                        {card.label}
                      </Badge>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{count}</span>
                        <span className="text-sm text-muted-foreground">events</span>
                      </div>
                    </div>
                    <div className={cn(
                      "rounded-full p-3",
                      `bg-${card.color}-100 dark:bg-${card.color}-900/30`
                    )}>
                      <CardIcon className={cn("h-5 w-5", `text-${card.color}-600 dark:text-${card.color}-400`)} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Last 24 hours</span>
                    <span className={cn(
                      "font-medium",
                      `text-${card.color}-600 dark:text-${card.color}-400`
                    )}>
                      {count > 0 ? `${count} new` : "No new"}
                    </span>
                  </div>
                </CardContent>
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-1",
                  `bg-${card.color}-500`
                )} />
              </Card>
            );
          })}
        </div>

        {/* History Section */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">Event History</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredItems.length} {filteredItems.length === 1 ? 'event' : 'events'} found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[250px]"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      {activeContent.cards.map((card) => (
                        <SelectItem key={card.label} value={card.label.toLowerCase()}>
                          {card.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredItems.length > 0 ? (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative rounded-xl border p-5 transition-all duration-200",
                      "hover:shadow-md hover:border-primary/20",
                      "bg-white dark:bg-slate-900"
                    )}
                  >
                    {/* Status Indicator Line */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                      `bg-${item.color}-500`
                    )} />

                    <div className="flex flex-col gap-4 pl-3 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              statusConfig[item.status as keyof typeof statusConfig]?.color
                            )}
                          >
                            {statusConfig[item.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Smartphone className="h-3.5 w-3.5" />
                            <span className="font-mono">{item.imei}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 sm:self-center">
                        <Badge className={cn(
                          "capitalize",
                          `bg-${item.color}-100 text-${item.color}-700 border-${item.color}-200`
                        )}>
                          {item.severity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No events found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters or search query"
                    : "All systems are operating normally"}
                </p>
                {(searchQuery || severityFilter !== "all" || statusFilter !== "all") && (
                  <Button
                    variant="link"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSeverityFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}