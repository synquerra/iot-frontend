// src/utils/detectTrips.js

import haversine from "./haversine";


export default function detectTrips(packets) {
  if (!Array.isArray(packets) || packets.length === 0) return [];

  const MIN_START_SPEED = 5;
  const MIN_STOP_SPEED = 2;
  const IDLE_PACKET_REQUIRED = 3;

  let trips = [];
  let inTrip = false;
  let currentTrip = null;
  let idleCounter = 0;

  for (let i = 0; i < packets.length; i++) {
    const p = packets[i];
    const speed = Number(p.speed);
    const lat = Number(p.latitude);
    const lon = Number(p.longitude);

    if (isNaN(speed) || !lat || !lon) continue;

    if (!inTrip && speed > MIN_START_SPEED) {
      inTrip = true;
      currentTrip = {
        startTime: p.deviceTimestamp,
        startLat: lat,
        startLon: lon,
        distance: 0,
        maxSpeed: speed,
        packets: [p],
      };
      continue;
    }

    if (!inTrip) continue;

    currentTrip.packets.push(p);

    if (speed > currentTrip.maxSpeed) {
      currentTrip.maxSpeed = speed;
    }

    if (currentTrip.packets.length >= 2) {
      const prev = currentTrip.packets[currentTrip.packets.length - 2];
      const dist = haversine(
        Number(prev.latitude),
        Number(prev.longitude),
        Number(p.latitude),
        Number(p.longitude)
      );
      currentTrip.distance += dist;
    }

    if (speed <= MIN_STOP_SPEED) {
      idleCounter++;
      if (idleCounter >= IDLE_PACKET_REQUIRED) {
        currentTrip.endTime = p.deviceTimestamp;
        currentTrip.endLat = lat;
        currentTrip.endLon = lon;

        const start = new Date(currentTrip.startTime);
        const end = new Date(currentTrip.endTime);

        currentTrip.durationMin = Number(
          ((end - start) / 1000 / 60).toFixed(1)
        );

        const totalPackets = currentTrip.packets.length;
        const speedSum = currentTrip.packets.reduce(
          (acc, x) => acc + Number(x.speed || 0),
          0
        );
        currentTrip.avgSpeed = Number((speedSum / totalPackets).toFixed(1));

        currentTrip.distance = Number(currentTrip.distance.toFixed(3));

        trips.push(currentTrip);

        inTrip = false;
        currentTrip = null;
        idleCounter = 0;
      }
    } else {
      idleCounter = 0;
    }
  }

  return trips;
}
