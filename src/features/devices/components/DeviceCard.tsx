import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CalendarIcon, Cpu } from "lucide-react"

type Props = {
    device: {
        imei: string
        displayName: string
        studentName?: string | null
        status: "active" | "inactive"
        studentId: string | null
        geoid?: string | null
        createdAt?: string | null
        topic?: string | null
    }
    onClick?: () => void
}

export function DeviceCard({ device, onClick }: Props) {
    // Format createdAt if it exists
    const formattedDate = device.createdAt
        ? new Date(device.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : null

    // Shorten IDs for display
    const shortStudentId = device.studentId
        ? device.studentId.length > 8
            ? `${device.studentId.substring(0, 6)}…${device.studentId.substring(device.studentId.length - 4)}`
            : device.studentId
        : null

    return (
        <Card
            onClick={onClick}
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
        >
            <CardContent className="p-4">
                {/* Header row - Name, status, short ID */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold truncate">
                            {device.displayName}
                        </h3>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "text-xs px-1.5 py-0 h-5 capitalize",
                                device.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                            )}
                        >
                            {device.status}
                        </Badge>
                    </div>
                    {shortStudentId && (
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded shrink-0">
                            {shortStudentId}
                        </span>
                    )}
                </div>

                {/* Compact info grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    {/* IMEI */}
                    <div className="min-w-0">
                        <span className="text-slate-500 block text-xs uppercase">IMEI</span>
                        <span className="font-mono truncate block" title={device.imei}>
                            {device.imei}
                        </span>
                    </div>

                    {/* Topic (if exists) */}
                    {device.topic && (
                        <div className="min-w-0">
                            <span className="text-slate-500 block text-xs uppercase">Topic</span>
                            <span className="font-mono truncate block" title={device.topic}>
                                {device.topic.length > 20 ? `${device.topic.substring(0, 18)}…` : device.topic}
                            </span>
                        </div>
                    )}

                    {/* Student ID (if exists) */}
                    {device.studentId && (
                        <div className="min-w-0 col-span-2">
                            <span className="text-slate-500 block text-xs uppercase">Student ID</span>
                            <span className="font-mono text-xs break-all bg-slate-50 p-1 rounded border border-slate-200 block">
                                {device.studentId}
                            </span>
                        </div>
                    )}

                    {/* Geo ID and fingerprint chips */}
                    {(device.geoid || device.imei) && (
                        <div className="col-span-2 flex flex-wrap items-center gap-1 mt-1">
                            <Cpu className="h-3 w-3 text-slate-400" />
                            {device.geoid && (
                                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                    geo:{device.geoid}
                                </span>
                            )}
                            <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                imei:{device.imei.slice(-6)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer with date */}
                {formattedDate && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formattedDate}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
