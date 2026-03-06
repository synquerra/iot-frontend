import { haversine } from "./geo"

export type Packet = {
    speed?: number | string
    latitude?: number | string
    longitude?: number | string
    deviceTimestamp: string
}

export type Trip = {
    startTime: string
    endTime?: string
    startLat: number
    startLon: number
    endLat?: number
    endLon?: number
    distance: number
    maxSpeed: number
    avgSpeed?: number
    durationMin?: number
    packets: Packet[]
}

export function detectTrips(packets: Packet[]): Trip[] {
    if (!Array.isArray(packets) || packets.length === 0) return []

    const MIN_START_SPEED = 5
    const MIN_STOP_SPEED = 2
    const IDLE_PACKET_REQUIRED = 3

    // Ensure packets are sorted chronologically
    const sorted = [...packets].sort(
        (a, b) =>
            new Date(a.deviceTimestamp).getTime() -
            new Date(b.deviceTimestamp).getTime()
    )

    const trips: Trip[] = []

    let inTrip = false
    let currentTrip: Trip | null = null
    let idleCounter = 0

    for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i]

        const speed = Number(p.speed)
        const lat = Number(p.latitude)
        const lon = Number(p.longitude)

        if (
            isNaN(speed) ||
            isNaN(lat) ||
            isNaN(lon)
        )
            continue

        // ─────────────── TRIP START ───────────────
        if (!inTrip && speed > MIN_START_SPEED) {
            inTrip = true
            idleCounter = 0

            currentTrip = {
                startTime: p.deviceTimestamp,
                startLat: lat,
                startLon: lon,
                distance: 0,
                maxSpeed: speed,
                packets: [p],
            }

            continue
        }

        if (!inTrip || !currentTrip) continue

        // ─────────────── TRACK TRIP ───────────────
        currentTrip.packets.push(p)

        if (speed > currentTrip.maxSpeed) {
            currentTrip.maxSpeed = speed
        }

        // Distance calculation
        const prev =
            currentTrip.packets[
            currentTrip.packets.length - 2
            ]

        if (prev) {
            const dist = haversine(
                Number(prev.latitude),
                Number(prev.longitude),
                lat,
                lon
            )
            currentTrip.distance += dist
        }

        // ─────────────── TRIP END ───────────────
        if (speed <= MIN_STOP_SPEED) {
            idleCounter++

            if (idleCounter >= IDLE_PACKET_REQUIRED) {
                currentTrip.endTime = p.deviceTimestamp
                currentTrip.endLat = lat
                currentTrip.endLon = lon

                const start = new Date(currentTrip.startTime)
                const end = new Date(currentTrip.endTime)

                currentTrip.durationMin = Number(
                    ((end.getTime() - start.getTime()) /
                        1000 /
                        60).toFixed(1)
                )

                const speedSum =
                    currentTrip.packets.reduce(
                        (acc, x) => acc + Number(x.speed || 0),
                        0
                    )

                currentTrip.avgSpeed = Number(
                    (
                        speedSum /
                        currentTrip.packets.length
                    ).toFixed(1)
                )

                currentTrip.distance = Number(
                    currentTrip.distance.toFixed(3)
                )

                trips.push(currentTrip)

                inTrip = false
                currentTrip = null
                idleCounter = 0
            }
        } else {
            idleCounter = 0
        }
    }

    return trips
}
