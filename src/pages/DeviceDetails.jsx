// src/pages/DeviceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnalyticsByImei, getAnalyticsHealth, getAnalyticsUptime } from "../utils/analytics";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { parseTemperature } from "../utils/telemetryTransformers";
import TripSummary from "../components/TripSummary";
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
  return `${Math.floor(h / 24)}d ago`;
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

function computeBatteryDrainTime(packets) {
  // Step 1: Validate input
  if (!packets || packets.length === 0) return "-";
  
  // Step 2: Filter to normal packets only (type "N" or "PACKET_N")
  const normalPackets = packets.filter(
    (p) => p.packetType === "N" || p.packetType === "PACKET_N"
  );
  
  if (normalPackets.length === 0) return "-";
  
  // Step 3: Find most recent 100% battery packet
  let fullBatteryPacket = null;
  
  for (let i = 0; i < normalPackets.length; i++) {
    const p = normalPackets[i];
    const battery = extractBatteryValue(p.battery);
    
    if (battery === 100) {
      fullBatteryPacket = p;
      break; // Found most recent, stop searching
    }
  }
  
  if (!fullBatteryPacket) return "No 100% record";
  
  // Step 4: Get current battery level (first normal packet)
  const currentBattery = extractBatteryValue(normalPackets[0].battery);
  
  if (isNaN(currentBattery) || currentBattery === 100) return "-";
  
  // Step 5: Calculate time difference
  const fullTime = parseTimestampWithFallback(fullBatteryPacket);
  const currentTime = parseTimestampWithFallback(normalPackets[0]);
  
  if (!fullTime || !currentTime) return "-";
  
  const elapsedMs = currentTime - fullTime;
  
  if (elapsedMs < 0) return "-";
  
  // Step 6: Format output
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  if (elapsedHours >= 1) {
    return elapsedHours.toFixed(1) + "h";
  } else {
    const elapsedMinutes = Math.round(elapsedMs / (1000 * 60));
    return elapsedMinutes + "m";
  }
}

// Helper function to extract numeric battery value from various formats
function extractBatteryValue(batteryField) {
  if (batteryField == null) return NaN;
  
  // Handle string formats like "85%", "85", or numbers
  const batteryStr = String(batteryField).replace(/[^\d]/g, "");
  const batteryNum = Number(batteryStr);
  
  return batteryNum;
}

// Helper function to parse timestamp with fallback
function parseTimestampWithFallback(packet) {
  if (!packet) return null;
  
  // Try deviceTimestamp first
  let timestamp = packet.deviceTimestamp;
  
  // Fall back to deviceRawTimestamp if needed
  if (!timestamp) {
    timestamp = packet.deviceRawTimestamp;
  }
  
  if (!timestamp) return null;
  
  const date = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  
  return date;
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
  const navigate = useNavigate();

  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");


  useEffect(() => {
    let timer;

    async function load() {
      try {
        const byImei = await getAnalyticsByImei(imei);

        const healthData = await getAnalyticsHealth(imei);
        setHealth(healthData);

        const uptimeData = await getAnalyticsUptime(imei);
        setUptime(uptimeData);
        
        const normalized = byImei.map((p) => {
          const serverTS =
          (p.device_timestamp && (p.device_timestamp.$date || p.device_timestamp)) ||
          p.deviceTimestamp ||
          p.timestamp || // some records use "timestamp"
          null;

          return {
          ...p,

          packetType:
          (p.packet && String(p.packet).toUpperCase()) ||
          (p.type && String(p.type).toUpperCase()) ||
            null,

          // DEVICE TIMESTAMP
          deviceTimestampDate: parseTS(p.deviceRawTimestamp),
          deviceTimestampISO: p.deviceRawTimestamp,
          deviceRawTimestamp: p.deviceRawTimestamp,

          // SERVER TIMESTAMP (DB order)
          serverTimestampDate: parseTS(serverTS),
          serverTimestampISO: serverTS,
        };
        });

        normalized.sort((a, b) => {
          const aT =
            a.serverTimestampDate?.getTime() ??
            a.deviceTimestampDate?.getTime() ??
            0;
        
          const bT =
            b.serverTimestampDate?.getTime() ??
            b.deviceTimestampDate?.getTime() ??
            0;
        
          return bT - aT;
        });
        

        setPackets(normalized);
      } finally {
        setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 10000);

    return () => clearInterval(timer);
  }, [imei]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading 
          type="spinner" 
          size="xl" 
          color="blue"
          text="Loading device details..." 
          textPosition="bottom"
        />
      </div>
    );
  }

  if (!packets.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="glass" colorScheme="amber" padding="xl" className="max-w-md">
          <Card.Content className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-amber-400 text-lg font-semibold mb-2">
              No Data Found
            </div>
            <div className="text-amber-300 text-sm mb-4">
              No telemetry data found for device {imei}
            </div>
            <Button
              variant="outline"
              colorScheme="amber"
              onClick={() => navigate('/devices')}
            >
              Back to Devices
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

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

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "telemetry", label: "Telemetry", icon: "📡" },
    { id: "trips", label: "Trips", icon: "🚗" },
    { id: "alerts", label: "Alerts", icon: "⚠️" },
    { id: "esim", label: "E-SIM", icon: "📱" }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20 border border-blue-500/30 backdrop-blur-xl">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-6 right-6 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/devices')}
                  className="text-blue-200 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Devices
                </Button>
                <div className="w-1 h-6 bg-blue-400/50 rounded-full"></div>
                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  latest.packetType === 'N' ? 'bg-green-500/20 text-green-300' :
                  latest.packetType === 'A' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-red-500/20 text-red-300'
                )}>
                  {latest.packetType === 'N' ? 'Online' : 
                   latest.packetType === 'A' ? 'Alert' : 'Error'}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                Device Telemetry
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed">
                Real-time monitoring and analytics for device <span className="font-mono text-blue-200">{imei}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Last Seen</div>
                <div className="text-white text-xl font-bold">
                  {timeAgo(latest.serverTimestampISO || latest.deviceRawTimestamp)}
                </div>
                <div className="text-blue-200/70 text-xs">
                  {formatIST(latest.serverTimestampISO || latest.deviceRawTimestamp)}
                </div>
              </div>
              <Button
                variant="glass"
                colorScheme="teal"
                size="lg"
                onClick={() => window.location.reload()}
                className="backdrop-blur-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card variant="glass" colorScheme="slate" padding="sm" className="backdrop-blur-xl">
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-blue-500/80 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Latest Packet Information - Always Visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Packet (Any Type) */}
        <Card variant="glass" colorScheme={
          latest.packetType === 'N' ? 'green' : 
          latest.packetType === 'A' ? 'amber' : 'red'
        } padding="lg">
          <Card.Content>
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <div className={cn(
                'w-3 h-3 rounded-full animate-pulse',
                latest.packetType === 'N' ? 'bg-green-400' : 
                latest.packetType === 'A' ? 'bg-amber-400' : 'bg-red-400'
              )}></div>
              Latest Packet ({latest.packetType})
              {latest.alert && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {latest.alert}
                </span>
              )}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">IMEI</span>
                <span className="font-mono text-white bg-white/10 px-2 py-1 rounded text-xs">{latest.imei}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Packet Type</span>
                <span className="text-white font-semibold">{latest.packetType}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Device Time</span>
                <span className="text-white text-xs">{extractRawTime(latest.deviceRawTimestamp)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Server Time</span>
                <span className="text-white text-xs">{formatIST(latest.serverTimestampISO || latest.deviceRawTimestamp)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Time Ago</span>
                <span className="text-white font-medium">{timeAgo(latest.serverTimestampISO || latest.deviceRawTimestamp)}</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Latest Normal Packet Data */}
        <Card variant="glass" colorScheme="green" padding="lg">
          <Card.Content>
            <h3 className="text-green-300 text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              Latest Normal Packet (N)
              <div className="flex gap-2 ml-auto">
                <span className={cn('text-xs px-2 py-1 rounded', getGpsStatus(normal).color)}>
                  {getGpsStatus(normal).text}
                </span>
                <span className={cn('text-xs px-2 py-1 rounded', getSpeedStatus(normal).color)}>
                  {getSpeedStatus(normal).text}
                </span>
                <span className={cn('text-xs px-2 py-1 rounded', getBatteryStatus(normal).color)}>
                  {getBatteryStatus(normal).text}
                </span>
              </div>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-200/80">GEO ID</span>
                  <span className="text-white">{normal.geoid ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200/80">Latitude</span>
                  <span className="text-white font-mono text-xs">{normal.latitude ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200/80">Speed</span>
                  <span className="text-white">{normal.speed ?? "-"} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200/80">Signal</span>
                  <span className="text-white">{normal.signal ?? "-"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-200/80">GEO Number</span>
                  <span className="text-white">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200/80">Longitude</span>
                  <span className="text-white font-mono text-xs">{normal.longitude ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200/80">Device Time</span>
                  <span className="text-white text-xs">{formatIST(normal.deviceTimestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200/80">Battery</span>
                  <span className="text-white">{normal.battery ?? "-"}%</span>
                </div>
              </div>
              <div className="col-span-2 flex justify-between pt-2 border-t border-white/10">
                <span className="text-green-200/80">Temperature</span>
                <span className="text-white">{parseTemperature(normal.rawTemperature)}°C</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Device Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="glass" colorScheme="green" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-green-200/80 text-sm font-medium mb-1">GPS Status</div>
                    <div className="text-white text-2xl font-bold mb-2">{getGpsStatus(normal).text}</div>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full animate-pulse', getGpsStatus(normal).color.replace('bg-', 'bg-'))}></div>
                      <span className="text-green-200/70 text-xs">Real-time</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-blue-200/80 text-sm font-medium mb-1">Speed</div>
                    <div className="text-white text-2xl font-bold mb-2">{normal.speed || 0} km/h</div>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full animate-pulse', getSpeedStatus(normal).color.replace('bg-', 'bg-'))}></div>
                      <span className="text-blue-200/70 text-xs">{getSpeedStatus(normal).text}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-purple-200/80 text-sm font-medium mb-1">Battery</div>
                    <div className="text-white text-2xl font-bold mb-2">{normal.battery || 0}%</div>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full animate-pulse', getBatteryStatus(normal).color.replace('bg-', 'bg-'))}></div>
                      <span className="text-purple-200/70 text-xs">{getBatteryStatus(normal).text}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-amber-200/80 text-sm font-medium mb-1">Signal</div>
                    <div className="text-white text-2xl font-bold mb-2">{normal.signal || 0}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-amber-200/70 text-xs">Strength</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Device Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" colorScheme="slate" padding="lg">
              <Card.Content>
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Device Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">IMEI</span>
                    <span className="font-mono text-white bg-white/10 px-2 py-1 rounded text-xs">{latest.imei}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">GEO ID</span>
                    <span className="text-white">{normal.geoid || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">Firmware</span>
                    <span className="text-white">-</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">Temperature</span>
                    <span className="text-white">{parseTemperature(normal.rawTemperature)}°C</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70">Last Update</span>
                    <span className="text-white text-xs">{formatIST(normal.deviceTimestamp)}</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="slate" padding="lg">
              <Card.Content>
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Location & Movement
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">Latitude</span>
                    <span className="font-mono text-white text-xs">{normal.latitude || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">Longitude</span>
                    <span className="font-mono text-white text-xs">{normal.longitude || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">Distance Today</span>
                    <span className="text-white">{computeTodayDistance(packets)} km</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70">Movement</span>
                    <div className="text-right">
                      {(() => {
                        const m = movementBreakdown(packets);
                        return (
                          <div className="text-xs">
                            <span className="text-green-400">{m.movingPct}% moving</span>
                            <span className="text-white/50 mx-1">•</span>
                            <span className="text-amber-400">{m.idlePct}% idle</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70">View on Map</span>
                    {latest.latitude && latest.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${latest.latitude},${latest.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                      >
                        Open Maps
                      </a>
                    ) : (
                      <span className="text-white/50 text-xs">No location</span>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Battery Insights */}
          <Card variant="glass" colorScheme="purple" padding="lg">
            <Card.Content>
              <h3 className="text-purple-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                </svg>
                Battery Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-200/80 text-xs font-medium mb-2">Health Status</div>
                  <div className="text-white text-lg font-bold">{getBatteryStatus(normal).text}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-200/80 text-xs font-medium mb-2">Runtime Left</div>
                  <div className="text-white text-lg font-bold">{computeBatteryRuntimeHours(packets)} hrs</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-200/80 text-xs font-medium mb-2">Drain Time (100→current%)</div>
                  <div className="text-white text-lg font-bold">{computeBatteryDrainTime(packets)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-200/80 text-xs font-medium mb-2">Last Update</div>
                  <div className="text-white text-lg font-bold">{timeAgo(normal.deviceTimestamp)}</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "telemetry" && (
        <div className="space-y-6">
          {/* Health Analytics */}
          {health && (
            <Card variant="glass" colorScheme="purple" padding="lg">
              <Card.Content>
                <h3 className="text-purple-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                  Device Health Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-purple-200/80">GPS Health Score</span>
                      <span className="text-purple-300 font-bold text-lg">{health.gpsScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-purple-200/80">Temperature Status</span>
                      <span className="text-cyan-300">{health.temperatureStatus}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-purple-200/80">Temperature Index</span>
                      <span className="text-white">{health.temperatureHealthIndex}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-200/80 text-sm mb-2">Movement Pattern</div>
                    <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-lg leading-relaxed max-h-32 overflow-y-auto">
                      <span>{health.movement.slice(0, 10).join(", ")}</span>
                      {health.movement.length > 10 && (
                        <span className="text-slate-500 ml-1">+ {health.movement.length - 10} more</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="text-purple-200/80 text-sm mb-2">Movement Stats</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {health.movementStats.map((stat, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-white/10 border border-white/20 text-slate-200">
                            {stat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Uptime Analytics */}
          {uptime && (
            <Card variant="glass" colorScheme="amber" padding="lg">
              <Card.Content>
                <h3 className="text-amber-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Uptime Reliability Score
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-amber-200/80 text-xs font-medium mb-2">Score</div>
                    <div className="text-amber-300 font-bold text-2xl">{uptime.score}/100</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-amber-200/80 text-xs font-medium mb-2">Expected</div>
                    <div className="text-white font-bold text-2xl">{uptime.expectedPackets}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-amber-200/80 text-xs font-medium mb-2">Received</div>
                    <div className="text-white font-bold text-2xl">{uptime.receivedPackets}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-amber-200/80 text-xs font-medium mb-2">Dropouts</div>
                    <div className="text-white font-bold text-2xl">{uptime.dropouts}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200/80 text-sm">Largest Gap</span>
                    <span className="text-white font-medium">{Math.round(uptime.largestGapSec)} seconds</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Telemetry Alerts Summary */}
          <Card variant="glass" colorScheme="red" padding="lg">
            <Card.Content>
              <h3 className="text-red-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Telemetry Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-red-200/80 text-xs font-medium mb-2">High Speed</div>
                  <div className="text-red-300 font-bold text-2xl">{highSpeedCount}</div>
                  <div className="text-red-200/60 text-xs mt-1">&gt;70 km/h</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-red-200/80 text-xs font-medium mb-2">High Temperature</div>
                  <div className="text-red-300 font-bold text-2xl">{highTempCount}</div>
                  <div className="text-red-200/60 text-xs mt-1">&gt;50°C</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-red-200/80 text-xs font-medium mb-2">Low Battery</div>
                  <div className="text-red-300 font-bold text-2xl">{lowBatteryCount}</div>
                  <div className="text-red-200/60 text-xs mt-1">&lt;20%</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "trips" && (
        <div className="space-y-6">
          {/* Trip Filter Controls */}
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Trips by Date & Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm block mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm block mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                  />
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Trip Summary Component */}
          <TripSummary
            packets={packets}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-6">
          {/* Alert Packets */}
          <Card variant="glass" colorScheme="amber" padding="lg">
            <Card.Content>
              <h3 className="text-amber-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alert Packets (A)
                <span className="ml-2 px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full">
                  {alertPackets.length}
                </span>
              </h3>
              {alertPackets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-green-400 font-semibold mb-2">No Alerts</div>
                  <div className="text-white/70 text-sm">Your device is operating normally</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertPackets.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-amber-300 font-semibold">A({alert.alert})</div>
                          <div className="text-white/70 text-xs">{timeAgo(alert.deviceRawTimestamp)}</div>
                        </div>
                      </div>
                      <div className="text-amber-200 text-sm">
                        {formatIST(alert.deviceRawTimestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Error Packets */}
          <Card variant="glass" colorScheme="red" padding="lg">
            <Card.Content>
              <h3 className="text-red-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Error Packets (E)
                <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                  {errorPackets.length}
                </span>
              </h3>
              {errorPackets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-green-400 font-semibold mb-2">No Errors</div>
                  <div className="text-white/70 text-sm">Your device is running smoothly</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {errorPackets.map((error, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-red-300 font-semibold">{error.alert}</div>
                          <div className="text-white/70 text-xs">{timeAgo(error.deviceRawTimestamp)}</div>
                        </div>
                      </div>
                      <div className="text-red-200 text-sm">
                        {formatIST(error.deviceRawTimestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* SOS Panel */}
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                SOS Emergency
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-white/70 text-sm">
                    <div>System Status: Normal</div>
                    <div>Emergency: Not Active</div>
                    <div>Response: Ready</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="glass" colorScheme="amber" size="sm">
                    ACK
                  </Button>
                  <Button variant="glass" colorScheme="green" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "esim" && (
        <div className="space-y-6">
          {/* E-SIM Management */}
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-6 text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                E-SIM Management
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((sim) => (
                  <Card key={sim} variant="glass" colorScheme={sim === 1 ? "green" : "red"} padding="lg">
                    <Card.Content>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-lg">SIM {sim}</h4>
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">SIM No.</span>
                          <span className="text-white">-</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">MSDN No.</span>
                          <span className="text-white font-mono">654135135</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">Profile Code</span>
                          <span className="text-white font-mono">654135135</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">Data Usage</span>
                          <span className="text-white">{sim === 1 ? "38/50 MB" : "3/10 MB"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">SMS</span>
                          <span className="text-white">{sim === 1 ? "5/100" : "3/100"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">Signal Strength</span>
                          <span className={cn(
                            'font-semibold',
                            sim === 1 ? "text-green-400" : "text-red-400"
                          )}>
                            {sim === 1 ? "75%" : "23%"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">Roaming</span>
                          <span className={cn(
                            'font-semibold',
                            sim === 1 ? "text-gray-300" : "text-amber-400"
                          )}>
                            {sim === 1 ? "Disabled" : "Active"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-white/70">Fallback History</span>
                          <span className="text-white text-xs">
                            {sim === 1 ? "SIM 2 → SIM 1" : "05-11-2022 12:35:11"}
                          </span>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
}
