import {
    createContext,
    useContext,
    useMemo,
    useState,
} from "react"
import type { Device } from "../services/deviceService"

type DeviceTableContextType = {
    devices: Device[]
    filteredDevices: Device[]
    loading: boolean
    search: string
    setSearch: (v: string) => void
    statusFilter: string
    setStatusFilter: (v: string) => void
    selected: string[]
    toggleSelect: (imei: string) => void
    clearSelection: () => void
    refresh: () => void
}

const DeviceTableContext =
    createContext<DeviceTableContextType | null>(null)

export function useDeviceTable() {
    const ctx = useContext(DeviceTableContext)
    if (!ctx)
        throw new Error(
            "useDeviceTable must be used inside provider"
        )
    return ctx
}

type Props = {
    children: React.ReactNode
    devices: Device[]
    loading: boolean
    refresh: () => void
}

export function DeviceTableProvider({
    children,
    devices,
    loading,
    refresh,
}: Props) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] =
        useState("all")
    const [selected, setSelected] = useState<string[]>(
        []
    )

    const filteredDevices = useMemo(() => {
        return devices.filter((d) => {
            const matchesSearch =
                d.displayName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                d.imei.includes(search)

            const matchesStatus =
                statusFilter === "all" ||
                d.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [devices, search, statusFilter])

    function toggleSelect(imei: string) {
        setSelected((prev) =>
            prev.includes(imei)
                ? prev.filter((i) => i !== imei)
                : [...prev, imei]
        )
    }

    function clearSelection() {
        setSelected([])
    }

    return (
        <DeviceTableContext.Provider
            value={{
                devices,
                filteredDevices,
                loading,
                search,
                setSearch,
                statusFilter,
                setStatusFilter,
                selected,
                toggleSelect,
                clearSelection,
                refresh,
            }}
        >
            {children}
        </DeviceTableContext.Provider>
    )
}
