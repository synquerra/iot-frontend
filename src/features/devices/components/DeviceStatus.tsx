import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    Cpu,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Shield,
    Thermometer,
    PhoneCall,
    Gauge,
    AlertOctagon,
    Ban,
    CardSim,
    Database,
    SatelliteDish,
    Battery,
    Bluetooth,
    Activity,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronUp,
    Filter,
} from "lucide-react";

// Solid color variants that pop on black background
const colorVariants = {
    cyan: "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-900/50",
    green: "bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-900/50",
    yellow: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-900/50",
    red: "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50",
    purple: "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/50",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-900/50",
    pink: "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-900/50",
    indigo: "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50",
    rose: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-900/50",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-900/50",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/50",
    violet: "bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-900/50",
};

// Footer variants - slightly darker gradient
const footerVariants = {
    cyan: "bg-gradient-to-r from-cyan-700 to-cyan-800 text-white/90 border-t border-cyan-400/20",
    green: "bg-gradient-to-r from-green-700 to-green-800 text-white/90 border-t border-green-400/20",
    yellow: "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white/90 border-t border-yellow-400/20",
    red: "bg-gradient-to-r from-red-700 to-red-800 text-white/90 border-t border-red-400/20",
    purple: "bg-gradient-to-r from-purple-700 to-purple-800 text-white/90 border-t border-purple-400/20",
    orange: "bg-gradient-to-r from-orange-600 to-orange-700 text-white/90 border-t border-orange-400/20",
    pink: "bg-gradient-to-r from-pink-600 to-pink-700 text-white/90 border-t border-pink-400/20",
    indigo: "bg-gradient-to-r from-indigo-700 to-indigo-800 text-white/90 border-t border-indigo-400/20",
    rose: "bg-gradient-to-r from-rose-600 to-rose-700 text-white/90 border-t border-rose-400/20",
    amber: "bg-gradient-to-r from-amber-600 to-amber-700 text-white/90 border-t border-amber-400/20",
    emerald: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white/90 border-t border-emerald-400/20",
    violet: "bg-gradient-to-r from-violet-700 to-violet-800 text-white/90 border-t border-violet-400/20",
};

// Map card titles to color keys
const cardColorMap: Record<string, keyof typeof colorVariants> = {
    "Total Devices": "cyan",
    "Active": "green",
    "Inactive": "yellow",
    "Hanged": "red",
    "Tampered": "purple",
    "High Temp": "orange",
    "SOS": "rose",
    "Overspeed": "amber",
    "Anomaly": "pink",
    "Restricted Entry": "indigo",
    "SIM Issues": "red",
    "Low Data": "yellow",
    "GPS Issues": "orange",
    "Battery Health": "violet",
    "BLE": "emerald",
};

// Helper to get trend indicator
const getTrend = (value: number, trend?: string) => {
    if (!trend) return null;

    return (
        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-black/20 border-white/20 text-white">
            {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
            ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
            )}
            <span>{trend === 'up' ? '+12%' : '-5%'}</span>
        </Badge>
    );
};

export default function DeviceStatusGrid() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [visibleWidgetTitles, setVisibleWidgetTitles] = useState<string[]>([
        "Total Devices", "Active", "Inactive", "Hanged", "Tampered", "High Temp",
        "SOS", "Overspeed"
    ]);

    const cards = [
        {
            title: "Total Devices",
            value: 2,
            subtitle: "All registered",
            footer: "+2 from last month",
            icon: Cpu,
            trend: "up",
        },
        {
            title: "Active",
            value: 2,
            subtitle: "Online now",
            footer: "100% online",
            icon: CheckCircle,
            trend: "up",
        },
        {
            title: "Inactive",
            value: 0,
            subtitle: "Offline devices",
            footer: "No inactive devices",
            icon: AlertTriangle,
        },
        {
            title: "Hanged",
            value: 2,
            subtitle: "Not responding",
            footer: "2 devices need attention",
            icon: XCircle,
        },
        {
            title: "Tampered",
            value: 2,
            subtitle: "Security incidents",
            footer: "105 total incidents",
            icon: Shield,
        },
        {
            title: "High Temp",
            value: 0,
            subtitle: ">50°C",
            footer: "0 devices overheating",
            icon: Thermometer,
        },
        {
            title: "SOS",
            value: 1,
            subtitle: "Emergency",
            footer: "3 total incidents",
            icon: PhoneCall,
        },
        {
            title: "Overspeed",
            value: 0,
            subtitle: ">70 km/h",
            footer: "0 speeding devices",
            icon: Gauge,
        },
        {
            title: "Anomaly",
            value: 0,
            subtitle: "Unusual behavior",
            footer: "0 anomalies detected",
            icon: AlertOctagon,
        },
        {
            title: "Restricted Entry",
            value: 0,
            subtitle: "Geofence breach",
            footer: "0 breaches",
            icon: Ban,
        },
        {
            title: "SIM Issues",
            value: 0,
            subtitle: "No SIM",
            footer: "0 devices affected",
            icon: CardSim,
        },
        {
            title: "Low Data",
            value: 0,
            subtitle: "Data issues",
            footer: "0 devices",
            icon: Database,
        },
        {
            title: "GPS Issues",
            value: 1,
            subtitle: "GNSS error",
            footer: "33 total incidents",
            icon: SatelliteDish,
        },
        {
            title: "Battery Health",
            value: 0,
            subtitle: "Low battery",
            footer: "91 total incidents",
            icon: Battery,
        },
        {
            title: "BLE",
            value: 0,
            subtitle: "Bluetooth",
            footer: "All devices connected",
            icon: Bluetooth,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with glow effect */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent blur-2xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div
                        className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            Device Status
                            <Badge variant="outline" className="ml-2 border-border text-muted-foreground mr-2">
                                Overview
                            </Badge>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">Dummy</span>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 px-3 text-xs font-semibold rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
                            >
                                {isExpanded ? (
                                    <><ChevronUp className="h-4 w-4 mr-1" /> Collapse Cards</>
                                ) : (
                                    <><ChevronDown className="h-4 w-4 mr-1" /> Expand Cards</>
                                )}
                            </Button>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Real-time monitoring of all connected devices
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Widgets
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                                <DropdownMenuLabel>Toggle Status Cards</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {cards.map((w) => (
                                    <DropdownMenuCheckboxItem
                                        key={w.title}
                                        checked={visibleWidgetTitles.includes(w.title)}
                                        onCheckedChange={(checked) => {
                                            setVisibleWidgetTitles((prev) =>
                                                checked
                                                    ? [...prev, w.title]
                                                    : prev.filter((t) => t !== w.title)
                                            )
                                        }}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {w.title}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Badge variant="outline" className="gap-1.5 py-1.5 border-primary/30 bg-primary/10 text-primary">
                            <Activity className="h-3.5 w-3.5 animate-pulse" />
                            <span>Live • {new Date().toLocaleTimeString()}</span>
                        </Badge>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <>
                    {/* Cards Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {cards.filter(c => visibleWidgetTitles.includes(c.title)).map((card, index) => {
                            const Icon = card.icon;
                            const colorKey = cardColorMap[card.title];

                            return (
                                <Card
                                    key={index}
                                    className="relative overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
                                >
                                    {/* Background gradient with glow */}
                                    <div className={cn("absolute inset-0", colorVariants[colorKey])} />

                                    {/* Animated shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                    <CardContent className="relative p-0">
                                        {/* Main Content */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-4xl font-bold text-white drop-shadow-lg">
                                                            {card.value}
                                                        </p>
                                                        {getTrend(card.value, card.trend)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white/90">
                                                            {card.title}
                                                        </p>
                                                        <p className="text-xs text-white/70 mt-0.5">
                                                            {card.subtitle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="opacity-40 group-hover:opacity-60 transition-opacity">
                                                    <Icon size={36} strokeWidth={1.5} className="text-white drop-shadow-lg" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer with status */}
                                        {card.footer && (
                                            <div className={cn(
                                                "px-5 py-3 text-xs font-medium backdrop-blur-sm",
                                                footerVariants[colorKey]
                                            )}>
                                                {card.footer}
                                            </div>
                                        )}
                                    </CardContent>

                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-3xl" />
                                </Card>
                            );
                        })}
                    </div>

                </>
            )}
        </div>
    );
}