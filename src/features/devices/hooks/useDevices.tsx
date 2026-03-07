import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { listDevices, type Device } from "../services/deviceService"

export function useDevices() {
    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await listDevices()
            setDevices(data)
            toast.success(`Successfully loaded ${data.length} device${data.length !== 1 ? 's' : ''}`)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch devices"
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDevices()
    }, [fetchDevices])

    return {
        devices,
        loading,
        error,
        refresh: fetchDevices,
    }
}
