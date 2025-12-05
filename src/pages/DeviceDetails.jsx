// src/pages/DeviceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnalyticsByImei, getAnalyticsHealth } from "../utils/analytics";

/* ------------------------------------
   TIMESTAMP HELPERS (RAW TIMESTAMP LOGIC)
------------------------------------- */

function parseTS(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

function formatIST(dateObj) {
  if (!dateObj) return "-";
  const d = dateObj instanceof Date ? dateObj : parseTS(dateObj);
  if (!d) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  let hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${day}-${month}-${year} ${String(hour).padStart(2, "0")}:${minute}:${second} ${ampm}`;
}

function extractRawTime(ts) {
  if (!ts) return "--:--:--";
  const d = parseTS(ts);
  if (!d) return ts;
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function timeAgo(ts) {
  const d = parseTS(ts);
  if (!d) return "-";
  const diff = Date.now() - d.getTime();
  const s = diff / 1000;
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago}`;
}

/* ------------------------------------
   TRIP DETECTION
------------------------------------- */

function detectTrips(packets) {
  if (!Array.isArray(packets) || packets.length === 0) return [];

  const MIN_START_SPEED = 5;   // >5 km/h means start trip
  const MIN_STOP_SPEED = 2;    // <=2 km/h means idle
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

    // ─────────────── TRIP START ───────────────
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

    // If not in trip, skip further processing
    if (!inTrip) continue;

    // ─────────────── TRACK TRIP ───────────────
    currentTrip.packets.push(p);

    if (speed > currentTrip.maxSpeed) {
      currentTrip.maxSpeed = speed;
    }

    // distance calculation
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

    // ─────────────── TRIP END LOGIC ───────────────
    if (speed <= MIN_STOP_SPEED) {
      idleCounter++;
      if (idleCounter >= IDLE_PACKET_REQUIRED) {
        // Trip ended
        currentTrip.endTime = p.deviceTimestamp;
        currentTrip.endLat = lat;
        currentTrip.endLon = lon;

        // Duration
        const start = new Date(currentTrip.startTime);
        const end = new Date(currentTrip.endTime);
        currentTrip.durationMin = Number(
          ((end - start) / 1000 / 60).toFixed(1)
        );

        // Average speed
        const totalPackets = currentTrip.packets.length;
        const speedSum = currentTrip.packets.reduce(
          (acc, x) => acc + Number(x.speed || 0),
          0
        );
        currentTrip.avgSpeed = Number((speedSum / totalPackets).toFixed(1));

        // Distance fix
        currentTrip.distance = Number(currentTrip.distance.toFixed(3));

        trips.push(currentTrip);

        // Reset
        inTrip = false;
        currentTrip = null;
        idleCounter = 0;
      }
    } else {
      idleCounter = 0; // speed picked up again
    }
  }

  return trips;
}


/* ------------------------------------
   STATUS HELPERS
------------------------------------- */

function getGpsStatus(p) {
  const lat = Number(p?.latitude);
  const lon = Number(p?.longitude);
  if (!lat || !lon) return { text: "No GPS", color: "bg-red-600" };

  const speed = Number(p?.speed ?? 0);
  if (isNaN(speed)) return { text: "Unknown", color: "bg-gray-600" };
  if (speed === 0) return { text: "Idle", color: "bg-yellow-500" };
  return { text: "Moving", color: "bg-green-500" };
}

function getSpeedStatus(p) {
  const speed = Number(p?.speed);
  if (isNaN(speed)) return { text: "-", color: "bg-gray-600" };
  if (speed === 0) return { text: "Idle", color: "bg-yellow-600" };
  if (speed > 70) return { text: "Overspeed", color: "bg-red-600" };
  return { text: "Normal", color: "bg-green-600" };
}

function getBatteryStatus(p) {
  const b = p?.battery;
  const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
  if (isNaN(n)) return { text: "-", color: "bg-gray-600" };
  if (n >= 60) return { text: "Good", color: "bg-green-600" };
  if (n >= 20) return { text: "Medium", color: "bg-yellow-600" };
  return { text: "Low", color: "bg-red-600" };
}

function Dot({ color }) {
  return (
    <span
      className={`inline-block rounded-full ${color}`}
      style={{ width: 12, height: 12 }}
    ></span>
  );
}

/* ------------------------------------
   BATTERY RUNTIME (REAL CALCULATION)
------------------------------------- */

function computeBatteryRuntimeHours(packets) {
  if (!packets || packets.length === 0) return "-";

  // We search for the LAST occurrence of battery = 100%
  let lastFull = null;

  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    const b = Number(String(p.battery || "").replace(/[^\d]/g, ""));
    if (b === 100) {
      lastFull = p;
      break;
    }
  }

  if (!lastFull) return "-"; // Never hit 100% recently

  const fullTime = new Date(lastFull.deviceTimestamp);
  const latestTime = new Date(packets[0].deviceTimestamp);

  if (isNaN(fullTime) || isNaN(latestTime)) return "-";

  const diffMs = latestTime - fullTime;
  const diffHrs = diffMs / (1000 * 60 * 60);

  return diffHrs < 0 ? "-" : diffHrs.toFixed(1);
}


/* ------------------------------------
   DISTANCE + MOVEMENT (RAW TIMESTAMP)
------------------------------------- */

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeTodayDistance(list) {
  const today = new Date().toISOString().slice(0, 10);

  // Filter only today's packets
  let pts = list.filter((p) =>
    p.deviceRawTimestamp?.startsWith(today)
  );

  if (pts.length < 2) return 0;

  // Step 1: Dedupe by raw timestamp (one packet per timestamp)
  const seen = new Set();
  pts = pts.filter((p) => {
    if (seen.has(p.deviceRawTimestamp)) return false;
    seen.add(p.deviceRawTimestamp);
    return true;
  });

  // Step 2: Dedupe identical coordinates
  const unique = [];
  let prev = null;

  for (const p of pts) {
    const lat = Number(p.latitude);
    const lon = Number(p.longitude);

    if (!lat || !lon) continue;

    if (!prev || prev.lat !== lat || prev.lon !== lon) {
      unique.push({ lat, lon });
      prev = { lat, lon };
    }
  }

  if (unique.length < 2) return 0;

  // Step 3: Accurate Haversine between unique points
  let dist = 0;

  for (let i = 1; i < unique.length; i++) {
    const a = unique[i - 1];
    const b = unique[i];
    dist += haversine(a.lat, a.lon, b.lat, b.lon);
  }

  return dist.toFixed(2);
}


function movementBreakdown(list) {
  let idle = 0;
  let moving = 0;

  list.forEach((p) => {
    if (p.speed == null || isNaN(Number(p.speed))) return;
    if (Number(p.speed) <= 2) idle++;
    else moving++;
  });

  const total = idle + moving;
  if (!total) return { idlePct: 0, movingPct: 0 };

  return {
    idlePct: Math.round((idle / total) * 100),
    movingPct: Math.round((moving / total) * 100),
  };
}

/* ------------------------------------
   MAIN COMPONENT
------------------------------------- */

export default function DeviceDetails() {
  const { imei } = useParams();

  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let timer;

    async function load() {
      try {
        const byImei = await getAnalyticsByImei(imei);

        const healthData = await getAnalyticsHealth(imei);
        setHealth(healthData);
        
        const normalized = byImei.map((p) => ({
          ...p,

          packetType:
            (p.packet && p.packet.toUpperCase()) ||
            (p.type && p.type.toUpperCase()) ||
            null,

          // RAW TIMESTAMP IS NOW THE MASTER CLOCK
          deviceTimestampDate: parseTS(p.deviceRawTimestamp),
          deviceTimestampISO: p.deviceRawTimestamp,
          deviceRawTimestamp: p.deviceRawTimestamp,
        }));

        normalized.sort(
          (a, b) =>
            (b.deviceTimestampDate?.getTime() || 0) -
            (a.deviceTimestampDate?.getTime() || 0)
        );

        setPackets(normalized);
      } finally {
        setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 20000);

    return () => clearInterval(timer);
  }, [imei]);

  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (!packets.length)
    return <div className="p-8">No data found for {imei}</div>;

  const latest = packets[0];

  const normalPackets = packets.filter(
    (p) => p.packetType === "N" || p.packetType === "PACKET_N"
  );

  const normal = normalPackets[0] || {};

  const alertPackets = packets
    .filter((p) => p.packetType === "A")
    .slice(0, 5);

  const errorPackets = packets
    .filter(
      (p) =>
        p.packetType === "E" ||
        (p.packetType === "A" && p.alert && p.alert.startsWith("E"))
    )
    .slice(0, 5);

  const highSpeedCount = packets.filter((p) => p.speed > 70).length;

  const highTempCount = packets.filter((p) => {
    if (!p.rawTemperature) return false;
    const n = Number(String(p.rawTemperature).replace(/[^\d.-]/g, ""));
    return n > 50;
  }).length;

  const lowBatteryCount = packets.filter(
    (p) => Number(p.battery) < 20
  ).length;

  /* ------------------------------------
     UI STARTS — NO UI CHANGES, ONLY FIXED LOGIC
  ------------------------------------- */

  return (
    <div className="p-6 bg-[#0f1724] min-h-screen text-white">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Data Telemetry</h2>
          <div className="w-32 h-0.5 bg-gray-500 mx-auto mt-2"></div>
        </div>

        {/* HEADER — LAST PACKET */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 grid grid-cols-2">
          <div>
            <div className="text-sm text-slate-400">IMEI (Device)</div>
            <div className="text-lg font-semibold">{latest.imei}</div>

            <div className="mt-3 text-sm text-slate-400">Firmware Version</div>
            <div>–</div>

            <div className="mt-3 text-sm text-slate-400">Device Status</div>
            <div className="text-green-400 font-medium">Online</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">
              Last Seen (Device Time)
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <span className="text-green-300 font-semibold text-lg">
                  {formatIST(latest.deviceRawTimestamp)}
                </span>

                <div className="text-xs text-slate-400 mt-1">
                  Your device sent:{" "}
                  {extractRawTime(latest.deviceRawTimestamp)}
                </div>
              </div>

              <span className="text-xs bg-green-700 px-2 py-0.5 rounded">
                {timeAgo(latest.deviceRawTimestamp)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-1 text-sm text-slate-300">
              <span className="font-semibold">Packet:</span>
              <span className="font-bold text-green-300">
                {latest.packetType}
                {latest.alert ? ` (${latest.alert})` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* NORMAL PACKET PANEL */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-300 text-lg font-semibold">
              Normal Packet (N)
            </h3>

            <div className="flex gap-2">
              <span
                className={`${getGpsStatus(normal).color} text-xs px-2 py-1 rounded`}
              >
                {getGpsStatus(normal).text}
              </span>

              <span
                className={`${getSpeedStatus(normal).color} text-xs px-2 py-1 rounded`}
              >
                {getSpeedStatus(normal).text}
              </span>

              <span
                className={`${getBatteryStatus(normal).color} text-xs px-2 py-1 rounded`}
              >
                Battery: {getBatteryStatus(normal).text}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">GEO ID</span>
                <span>{normal.geoid ?? "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Latitude</span>
                <span>{normal.latitude ?? "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Speed</span>
                <span>{normal.speed ?? "-"} Km/hr</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Signal</span>
                <span>{normal.signal ?? "-"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">GEO Number</span>
                <span>-</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Longitude</span>
                <span>{normal.longitude ?? "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp (Device)</span>
                <span>{formatIST(normal.deviceTimestamp)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Battery</span>
                <span>{normal.battery ?? "-"}</span>
              </div>
            </div>

            <div className="col-span-2 flex justify-between">
              <span className="text-slate-400">Temperature</span>
              <span>{normal.rawTemperature ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* BATTERY INSIGHTS */}
        <div className="col-span-2 bg-slate-800 p-3 rounded mt-3">
          <h4 className="text-sm font-semibold text-green-300 mb-2">
            Battery Insights
          </h4>

          <div className="text-xs space-y-1">
            <div>
              <span className="text-slate-400">Health:</span>{" "}
              {getBatteryStatus(normal).text}
            </div>

            <div>
              <span className="text-slate-400">Estimated Runtime Left:</span>{" "}
              {computeBatteryRuntimeHours(packets)} hrs
            </div>

            <div>
              <span className="text-slate-400">Last Battery Update:</span>{" "}
              {formatIST(normal.deviceTimestamp)}
            </div>
          </div>
        </div>
        {health && (
  <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
    <h3 className="text-lg text-purple-300 font-semibold mb-3">
      Device Health Analytics
    </h3>

    <div className="space-y-3">

      {/* GPS HEALTH */}
      <div className="flex justify-between">
        <span className="text-slate-400">GPS Health Score</span>
        <span className="text-purple-300 font-semibold">
          {health.gpsScore}/100
        </span>
      </div>

      {/* MOVEMENT PATTERN (LAST 10 READABLE) */}
      <div>
  <span className="text-slate-400 block mb-1">Movement Pattern</span>

  <div className="text-xs text-slate-300 bg-slate-800 p-2 rounded leading-relaxed">

    {/* Show only first 10 patterns */}
    <span>
      {health.movement.slice(0, 10).join(", ")}
    </span>

    {/* If more exist, show a counter */}
    {health.movement.length > 10 && (
      <span className="text-slate-500 ml-1">
        + {health.movement.length - 10} more
      </span>
    )}
  </div>
</div>
{/* MOVEMENT STATS (clean pills) */}
<div>
  <span className="text-slate-400 block mb-1">Movement Stats</span>

  <div className="flex flex-wrap gap-2 text-xs">
    {health.movementStats.map((stat, i) => (
      <span
        key={i}
        className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
      >
        {stat}
      </span>
    ))}
  </div>
</div>

      {/* TEMPERATURE */}
      <div className="flex justify-between">
        <span className="text-slate-400">Temperature Status</span>
        <span className="text-cyan-300">{health.temperatureStatus}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-400">Temperature Index</span>
        <span>{health.temperatureHealthIndex}</span>
      </div>
    </div>
  </div>
)}



        {/* MOVEMENT SUMMARY */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
          <h3 className="text-lg text-cyan-300 font-semibold mb-3">
            Device Activity Summary
          </h3>

          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Distance Travelled Today</span>
            <span>{computeTodayDistance(packets)} km</span>
          </div>

          {(() => {
            const m = movementBreakdown(packets);
            return (
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Idle / Moving</span>
                <span>
                  {m.idlePct}% idle • {m.movingPct}% moving
                </span>
              </div>
            );
          })()}

          {latest.latitude && latest.longitude && (
            <div className="flex justify-between mt-2">
              <span className="text-slate-400">Last Known Location</span>

              <a
                href={`https://www.google.com/maps?q=${latest.latitude},${latest.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Open in Maps
              </a>
            </div>
          )}
        </div>
        {/* TRIP SUMMARY */}
<div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
  <h3 className="text-lg text-purple-300 font-semibold mb-3">
    Trip Summary (Auto Detected)
  </h3>

  {(() => {
    const trips = detectTrips(packets);

    if (trips.length === 0) {
      return <div className="text-slate-500">No trips detected</div>;
    }

    return (
      <div className="space-y-4">
        {trips.map((t, i) => (
          <div
            key={i}
            className="border border-slate-600 p-4 rounded bg-slate-800"
          >
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Trip #{i + 1}</span>
              <span className="text-purple-300 font-semibold">
                {t.distance} km
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <span className="text-slate-400">Start Time</span>
              <span>{formatIST(t.startTime)}</span>

              <span className="text-slate-400">End Time</span>
              <span>{formatIST(t.endTime)}</span>

              <span className="text-slate-400">Duration</span>
              <span>{t.durationMin} min</span>

              <span className="text-slate-400">Avg Speed</span>
              <span>{t.avgSpeed} km/h</span>

              <span className="text-slate-400">Max Speed</span>
              <span>{t.maxSpeed} km/h</span>

              <span className="text-slate-400">Start Location</span>
              <a
                href={`https://www.google.com/maps?q=${t.startLat},${t.startLon}`}
                target="_blank"
                className="text-blue-400 underline"
              >
                Open
              </a>

              <span className="text-slate-400">End Location</span>
              <a
                href={`https://www.google.com/maps?q=${t.endLat},${t.endLon}`}
                target="_blank"
                className="text-blue-400 underline"
              >
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  })()}
</div>


        {/* ALERT PACKETS */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg text-yellow-400 font-semibold mb-3">
            Alert Packet (A)
          </h3>

          {alertPackets.length === 0 ? (
            <div className="text-slate-500">No alerts</div>
          ) : (
            alertPackets.map((a, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">⚠</span>
                  <span className="text-yellow-300 font-semibold">
                    A({a.alert})
                  </span>
                </div>

                <span className="text-yellow-200">
                  {formatIST(a.deviceRawTimestamp)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* ERROR PACKETS */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg text-red-400 font-semibold mb-3">
            Error Packet (E)
          </h3>

          {errorPackets.length === 0 ? (
            <div className="text-slate-500">No errors</div>
          ) : (
            errorPackets.map((e, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠</span>
                  <span className="text-red-300 font-semibold">
                    {e.alert}
                  </span>
                </div>

                <span className="text-red-300">
                  {formatIST(e.deviceRawTimestamp)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* E-SIM MANAGEMENT PANEL */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
          <h3 className="text-lg font-semibold mb-3 text-center">
            E-Sim Management
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((sim) => (
              <div key={sim} className="bg-slate-800 p-4 rounded">
                <div className="flex justify-between mb-3">
                  <span className="font-semibold">Sim {sim}</span>

                  <div className="flex gap-2">
                    <Dot color="bg-green-500" />
                    <Dot color="bg-red-500" />
                    <Dot color="bg-white" />
                    <Dot color="bg-orange-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span>SIM No.</span>
                  <span>–</span>

                  <span>MSDN No.</span>
                  <span>654135135</span>

                  <span>Profile Code</span>
                  <span>654135135</span>

                  <span>Data Usage</span>
                  <span>{sim === 1 ? "38/50 MB" : "3/10 MB"}</span>

                  <span>SMS</span>
                  <span>{sim === 1 ? "5/100" : "3/100"}</span>

                  <span>Signal %</span>
                  <span
                    className={
                      sim === 1 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {sim === 1 ? "75%" : "23%"}
                  </span>

                  <span>Roaming</span>
                  <span
                    className={
                      sim === 1
                        ? "text-gray-300"
                        : "text-yellow-400"
                    }
                  >
                    {sim === 1 ? "Disable" : "Active"}
                  </span>

                  <span>Fall Back Hist.</span>
                  <span>
                    {sim === 1
                      ? "Sim 2 to Sim 1"
                      : "05-11-2022 12:35:11"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOS + TELEMETRY */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3">SOS</h4>

            <div className="flex gap-6">
              <div className="flex flex-col gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="bg-yellow-400 text-black px-3 py-1 rounded">
                  ACK
                </button>
                <button className="bg-green-500 px-3 py-1 rounded">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3">
              Telemetry Alert
            </h4>

            <ul className="text-sm space-y-2">
              <li>HighSpeed – {highSpeedCount}</li>
              <li>High Temperature – {highTempCount}</li>
              <li>Low Battery – {lowBatteryCount}</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
