import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type DeviceStatsSummary = {
    total: number
    active: number
    devicesWithIssues: number
    criticalIncidents: number
}

type DeviceStatsProps = {
    stats: DeviceStatsSummary
    onSelect: (key: string) => void
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | null | undefined

export function DeviceStats({ stats, onSelect }: DeviceStatsProps) {
    const items: Array<{
        key: string
        label: string
        value: number
        variant?: BadgeVariant
    }> = [
        {
            key: "total",
            label: "Total Devices",
            value: stats.total,
        },
        {
            key: "active",
            label: "Active",
            value: stats.active,
        },
        {
            key: "issues",
            label: "Devices with Issues",
            value: stats.devicesWithIssues,
            variant: "secondary",
        },
        {
            key: "critical",
            label: "Critical Alerts",
            value: stats.criticalIncidents,
            variant: "destructive",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {items.map((item) => (
                <Card
                    key={item.key}
                    className="cursor-pointer hover:shadow-md transition"
                    onClick={() => onSelect(item.key)}
                >
                    <CardContent className="p-6">
                        <div className="text-2xl font-semibold">
                            {item.value}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {item.label}
                        </p>

                        {item.variant && (
                            <Badge
                                variant={item.variant}
                                className="mt-3"
                            >
                                View details
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
