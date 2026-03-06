import { DeviceCard } from "./DeviceCard"
import { useDeviceTable } from "../context/DeviceTableContext"
import { useNavigate } from "react-router-dom"

export function DeviceGrid() {
    const { filteredDevices, loading } = useDeviceTable()
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Loading devices...
            </div>
        )
    }

    if (filteredDevices.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No devices found
            </div>
        )
    }
    const handleCardClick = (imei: string) => {
        // Navigate to device details page
        navigate(`/devices/${imei}`)
    }

    return (
        <div className="
      grid 
      gap-6 
      sm:grid-cols-1
      md:grid-cols-2 
      lg:grid-cols-2
    ">
            {filteredDevices.map((device) => (
                <DeviceCard
                    key={device.imei}
                    device={device}
                    onClick={() => handleCardClick(device.imei)}
                />

            ))}
        </div>
    )
}
