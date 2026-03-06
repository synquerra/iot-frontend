import { useEffect, useState, useCallback } from "react"
import { listDevices, type Device } from "../services/deviceService"

export function useDevices() {
    const [devices, setDevices] = useState<Device[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true)
            const data = await listDevices()
            setDevices(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to fetch devices")
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
