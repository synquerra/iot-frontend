import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useDeviceTable } from "../context/DeviceTableContext"

export function DeviceTable() {
    const {
        filteredDevices,
        loading,
        selected,
        toggleSelect,
    } = useDeviceTable()

    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading devices...
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead />
                        <TableHead>Status</TableHead>
                        <TableHead>Device</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {filteredDevices.map((device) => (
                        <TableRow key={device.imei}>
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(
                                        device.imei
                                    )}
                                    onCheckedChange={() =>
                                        toggleSelect(device.imei)
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant={
                                        device.status === "active"
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {device.status}
                                </Badge>
                            </TableCell>

                            <TableCell className="font-medium">
                                {device.displayName}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
