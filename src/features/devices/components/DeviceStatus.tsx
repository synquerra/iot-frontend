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
    CreditCard as CardSim,
    Database,
    SatelliteDish,
    Battery,
    Bluetooth,
    Activity,
    ChevronDown,
    ChevronUp,
    Filter,
} from "lucide-react";

// Solid color variants using consistent solid colors
const colorVariants: Record<string, { bg: string; text: string; icon: string; border: string; iconBg: string; hoverShadow: string }> = {
    cyan: {
        bg: "bg-cyan-600",
        text: "text-white",
        icon: "text-cyan-100",
        border: "border-cyan-400/30",
        iconBg: "bg-cyan-500/20",
        hoverShadow: "hover:shadow-cyan-900/40"
    },
    green: {
        bg: "bg-emerald-600",
        text: "text-white",
        icon: "text-emerald-100",
        border: "border-emerald-400/30",
        iconBg: "bg-emerald-500/20",
        hoverShadow: "hover:shadow-emerald-900/40"
    },
    yellow: {
        bg: "bg-amber-600",
        text: "text-white",
        icon: "text-amber-100",
        border: "border-amber-400/30",
        iconBg: "bg-amber-500/20",
        hoverShadow: "hover:shadow-amber-900/40"
    },
    red: {
        bg: "bg-red-600",
        text: "text-white",
        icon: "text-red-100",
        border: "border-red-400/30",
        iconBg: "bg-red-500/20",
        hoverShadow: "hover:shadow-red-900/40"
    },
    purple: {
        bg: "bg-purple-600",
        text: "text-white",
        icon: "text-purple-100",
        border: "border-purple-400/30",
        iconBg: "bg-purple-500/20",
        hoverShadow: "hover:shadow-purple-900/40"
    },
    orange: {
        bg: "bg-orange-600",
        text: "text-white",
        icon: "text-orange-100",
        border: "border-orange-400/30",
        iconBg: "bg-orange-500/20",
        hoverShadow: "hover:shadow-orange-900/40"
    },
    rose: {
        bg: "bg-rose-600",
        text: "text-white",
        icon: "text-rose-100",
        border: "border-rose-400/30",
        iconBg: "bg-rose-500/20",
        hoverShadow: "hover:shadow-rose-900/40"
    },
    amber: {
        bg: "bg-amber-600",
        text: "text-white",
        icon: "text-amber-100",
        border: "border-amber-400/30",
        iconBg: "bg-amber-500/20",
        hoverShadow: "hover:shadow-amber-900/40"
    },
    pink: {
        bg: "bg-pink-600",
        text: "text-white",
        icon: "text-pink-100",
        border: "border-pink-400/30",
        iconBg: "bg-pink-500/20",
        hoverShadow: "hover:shadow-pink-900/40"
    },
    indigo: {
        bg: "bg-indigo-600",
        text: "text-white",
        icon: "text-indigo-100",
        border: "border-indigo-400/30",
        iconBg: "bg-indigo-500/20",
        hoverShadow: "hover:shadow-indigo-900/40"
    },
    violet: {
        bg: "bg-violet-600",
        text: "text-white",
        icon: "text-violet-100",
        border: "border-violet-400/30",
        iconBg: "bg-violet-500/20",
        hoverShadow: "hover:shadow-violet-900/40"
    },
    emerald: {
        bg: "bg-emerald-600",
        text: "text-white",
        icon: "text-emerald-100",
        border: "border-emerald-400/30",
        iconBg: "bg-emerald-500/20",
        hoverShadow: "hover:shadow-emerald-900/40"
    },
};

const cardColorMap: Record<string, string> = {
    "Total Devices": "indigo",
    "Active": "green",
    "Inactive": "yellow",
    "Hanged": "red",
    "Tampered": "purple",
    "High Temp": "orange",
    "SOS": "rose",
    "Overspeed": "amber",
    "Anomaly": "pink",
    "Restricted Entry": "violet",
    "SIM Issues": "red",
    "Low Data": "yellow",
    "GPS Issues": "orange",
    "Battery Health": "emerald",
    "BLE": "cyan",
};

export default function DeviceStatusGrid() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [visibleWidgetTitles, setVisibleWidgetTitles] = useState<string[]>([
        "Total Devices", "Active", "Inactive", "Hanged", "Tampered", "High Temp",
        "SOS", "Overspeed"
    ]);

    const cards = [
        { title: "Total Devices", value: 2, subtitle: "All registered", footer: "+2 from last month", icon: Cpu },
        { title: "Active", value: 2, subtitle: "Online now", footer: "100% online", icon: CheckCircle },
        { title: "Inactive", value: 0, subtitle: "Offline devices", footer: "No inactive devices", icon: AlertTriangle },
        { title: "Hanged", value: 2, subtitle: "Not responding", footer: "2 devices need attention", icon: XCircle },
        { title: "Tampered", value: 2, subtitle: "Security incidents", footer: "105 total incidents", icon: Shield },
        { title: "High Temp", value: 0, subtitle: ">50°C", footer: "0 devices overheating", icon: Thermometer },
        { title: "SOS", value: 1, subtitle: "Emergency", footer: "3 total incidents", icon: PhoneCall },
        { title: "Overspeed", value: 0, subtitle: ">70 km/h", footer: "0 speeding devices", icon: Gauge },
        { title: "Anomaly", value: 0, subtitle: "Unusual behavior", footer: "0 anomalies detected", icon: AlertOctagon },
        { title: "Restricted Entry", value: 0, subtitle: "Geofence breach", footer: "0 breaches", icon: Ban },
        { title: "SIM Issues", value: 0, subtitle: "No SIM", footer: "0 devices affected", icon: CardSim },
        { title: "Low Data", value: 0, subtitle: "Data issues", footer: "0 devices", icon: Database },
        { title: "GPS Issues", value: 1, subtitle: "GNSS error", footer: "33 total incidents", icon: SatelliteDish },
        { title: "Battery Health", value: 0, subtitle: "Low battery", footer: "91 total incidents", icon: Battery },
        { title: "BLE", value: 0, subtitle: "Bluetooth", footer: "All devices connected", icon: Bluetooth },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        Status Overview
                        <Badge variant="outline" className="border-border text-muted-foreground font-semibold">
                            Live
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <><ChevronUp className="h-4 w-4 mr-1" /> Hide</>
                            ) : (
                                <><ChevronDown className="h-4 w-4 mr-1" /> Show</>
                            )}
                        </Button>
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">
                        Real-time system health and alert monitoring
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-bold border-border">
                                <Filter className="h-3.5 w-3.5" />
                                Configure
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
                            <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider">Visible Metrics</DropdownMenuLabel>
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
                                    className="text-xs font-medium"
                                >
                                    {w.title}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-primary/20 bg-primary/5 text-primary text-[10px] font-bold">
                        <Activity className="h-3 w-3 animate-pulse" />
                        SYNC: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Badge>
                </div>
            </div>

            {isExpanded && (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {cards.filter(c => visibleWidgetTitles.includes(c.title)).map((card, index) => {
                        const Icon = card.icon;
                        const theme = colorVariants[cardColorMap[card.title]] || colorVariants.indigo;

                        return (
                            <Card
                                key={index}
                                className={cn(
                                    "group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0",
                                    theme.bg,
                                    theme.border,
                                    theme.hoverShadow
                                )}
                            >
                                <div className="absolute -right-3 -top-3 opacity-[0.08] group-hover:opacity-[0.12] transition-all duration-500 pointer-events-none rotate-6 scale-150">
                                    <Icon className="h-20 w-20 text-white" />
                                </div>

                                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[120px] relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className={cn("text-3xl font-bold font-mono tracking-tight drop-shadow-sm", theme.text)}>
                                                {card.value}
                                            </p>
                                            <p className="text-xs font-bold text-white/90 tracking-tight">
                                                {card.title}
                                            </p>
                                        </div>
                                        <div className={cn("p-2 rounded-lg border transition-all duration-300 group-hover:scale-110", theme.iconBg, theme.border)}>
                                            <Icon className={cn("h-4 w-4", theme.icon)} />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                            {card.footer}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}