// src/pages/DeviceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnalyticsByImei, getAnalyticsHealth, getAnalyticsUptime } from "../utils/analytics";
import { getDeviceByTopic } from "../utils/device";
import { getDeviceDisplayNameWithMaskedImei } from "../utils/deviceDisplay";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { parseTemperature } from "../utils/telemetryTransformers";
import TripSummary from "../components/TripSummary";
import { sendDeviceCommand } from "../utils/deviceCommandAPI";
import { Notification } from "../components/Notification";
import { mapAlertErrorCode } from "../utils/alertErrorMapper";
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
  if (!packets || packets.length === 0) {
    console.log("🔋 Battery Drain: No packets");
    return "-";
  }
  
  // Step 2: Filter to normal packets only (type "N" or "PACKET_N")
  const normalPackets = packets.filter(
    (p) => p.packetType === "N" || p.packetType === "PACKET_N"
  );
  
  console.log(`🔋 Battery Drain: ${normalPackets.length} normal packets out of ${packets.length} total`);
  
  if (normalPackets.length === 0) {
    console.log("🔋 Battery Drain: No normal packets");
    return "-";
  }
  
  // Step 3: Find most recent 100% battery packet
  let fullBatteryPacket = null;
  
  for (let i = 0; i < normalPackets.length; i++) {
    const p = normalPackets[i];
    const battery = extractBatteryValue(p.battery);
    
    if (battery === 100) {
      fullBatteryPacket = p;
      console.log(`🔋 Battery Drain: Found 100% at index ${i}, battery value:`, p.battery);
      break; // Found most recent, stop searching
    }
  }
  
  if (!fullBatteryPacket) {
    console.log("🔋 Battery Drain: No 100% record found");
    return "No 100% record";
  }
  
  // Step 4: Get current battery level (first normal packet)
  const currentBattery = extractBatteryValue(normalPackets[0].battery);
  console.log("🔋 Battery Drain: Current battery:", currentBattery, "from", normalPackets[0].battery);
  
  if (isNaN(currentBattery)) {
    console.log("🔋 Battery Drain: Current battery is NaN");
    return "-";
  }
  
  if (currentBattery === 100) {
    console.log("🔋 Battery Drain: Current battery is 100%");
    return "-";
  }
  
  // Step 5: Calculate time difference
  const fullTime = parseTimestampWithFallback(fullBatteryPacket);
  const currentTime = parseTimestampWithFallback(normalPackets[0]);
  
  console.log("🔋 Battery Drain: Timestamps -", {
    fullTime,
    currentTime,
    fullPacketFields: {
      deviceRawTimestamp: fullBatteryPacket.deviceRawTimestamp,
      deviceTimestamp: fullBatteryPacket.deviceTimestamp
    },
    currentPacketFields: {
      deviceRawTimestamp: normalPackets[0].deviceRawTimestamp,
      deviceTimestamp: normalPackets[0].deviceTimestamp
    }
  });
  
  if (!fullTime || !currentTime) {
    console.log("🔋 Battery Drain: Invalid timestamps");
    return "-";
  }
  
  const elapsedMs = currentTime - fullTime;
  console.log("🔋 Battery Drain: Elapsed ms:", elapsedMs);
  
  if (elapsedMs < 0) {
    console.log("🔋 Battery Drain: Negative time difference");
    return "-";
  }
  
  // Step 6: Format output
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  if (elapsedHours >= 1) {
    const result = elapsedHours.toFixed(1) + "h";
    console.log("🔋 Battery Drain: Result:", result);
    return result;
  } else {
    const elapsedMinutes = Math.round(elapsedMs / (1000 * 60));
    const result = elapsedMinutes + "m";
    console.log("🔋 Battery Drain: Result:", result);
    return result;
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
  if (!packet) {
    console.log("⏰ parseTimestampWithFallback: packet is null/undefined");
    return null;
  }
  
  // Try deviceRawTimestamp first (PRIMARY field in normalized data)
  let timestamp = packet.deviceRawTimestamp;
  console.log("⏰ parseTimestampWithFallback: deviceRawTimestamp =", timestamp);
  
  // Fall back to deviceTimestamp for backward compatibility
  if (!timestamp) {
    timestamp = packet.deviceTimestamp;
    console.log("⏰ parseTimestampWithFallback: falling back to deviceTimestamp =", timestamp);
  }
  
  if (!timestamp) {
    console.log("⏰ parseTimestampWithFallback: no timestamp available");
    return null;
  }
  
  const date = new Date(timestamp);
  console.log("⏰ parseTimestampWithFallback: parsed date =", date, "valid =", !isNaN(date.getTime()));
  
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
  const [device, setDevice] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sosLoading, setSosLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleAckSOS = async () => {
    setSosLoading(true);
    setNotification(null);
    
    try {
      await sendDeviceCommand(imei, "STOP_SOS", {});
      setNotification({
        type: "success",
        message: "SOS acknowledgment sent successfully"
      });
    } catch (error) {
      let errorMessage = "Failed to send SOS acknowledgment";
      
      if (error.code === 'VALIDATION_ERROR') {
        errorMessage = `Validation error: ${error.message}`;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = `Network error: ${error.message}`;
      } else if (error.code === 'API_ERROR') {
        errorMessage = `API error: ${error.message}`;
      }
      
      setNotification({
        type: "error",
        message: errorMessage
      });
    } finally {
      setSosLoading(false);
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  useEffect(() => {
    let timer;

    async function load() {
      try {
        const byImei = await getAnalyticsByImei(imei);

        const healthData = await getAnalyticsHealth(imei);
        setHealth(healthData);

        const uptimeData = await getAnalyticsUptime(imei);
        setUptime(uptimeData);
        
        // Fetch device info to get studentName
        if (byImei.length > 0 && byImei[0].topic) {
          try {
            const deviceData = await getDeviceByTopic(byImei[0].topic);
            setDevice(deviceData);
          } catch (err) {
            console.warn('Failed to fetch device info:', err);
          }
        }
        
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
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-3xl text-[#ffc107]"></i>
          </div>
          <div className="text-gray-800 text-lg font-semibold mb-2">
            No Data Found
          </div>
          <div className="text-gray-600 text-sm mb-4">
            No telemetry data found for device {imei}
          </div>
          <button
            onClick={() => navigate('/devices')}
            className="px-6 py-3 bg-[#ffc107] hover:bg-[#e0a800] text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Devices
          </button>
        </div>
      </div>
    );
  }

  const latest = packets[0];
  const normalPackets = packets.filter(
    (p) => p.packetType === "N" || p.packetType === "PACKET_N"
  );
  const normal = normalPackets[0] || {};
  
  // Filter alerts: packetType 'A' OR alert code starts with 'A'
  const alertPackets = packets
    .filter((p) => {
      if (p.packetType === "A" && (!p.alert || !String(p.alert).toUpperCase().startsWith("E"))) {
        return true;
      }
      if (p.alert && String(p.alert).toUpperCase().startsWith("A")) {
        return true;
      }
      return false;
    })
    .slice(0, 5);
  
  // Filter errors: packetType 'E' OR alert code starts with 'E'
  const errorPackets = packets
    .filter((p) => {
      if (p.packetType === "E") {
        return true;
      }
      if (p.alert && String(p.alert).toUpperCase().startsWith("E")) {
        return true;
      }
      return false;
    })
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
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Notification Display */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* AdminLTE v3 Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/devices')}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors text-sm font-medium"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Devices
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className={cn(
              'px-3 py-1 rounded text-xs font-semibold',
              latest.packetType === 'N' ? 'bg-[#28a745] text-white' :
              latest.packetType === 'A' ? 'bg-[#ffc107] text-white' :
              'bg-[#dc3545] text-white'
            )}>
              {latest.packetType === 'N' ? 'Online' : 
               latest.packetType === 'A' ? 'Alert' : 'Error'}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-gray-600 text-xs">Last Seen</div>
              <div className="text-gray-900 text-lg font-bold">
                {timeAgo(latest.serverTimestampISO || latest.deviceRawTimestamp)}
              </div>
              <div className="text-gray-500 text-xs">
                {formatIST(latest.serverTimestampISO || latest.deviceRawTimestamp)}
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#17a2b8] hover:bg-[#138496] text-white rounded transition-colors text-sm font-medium"
            >
              <i className="fas fa-redo mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-microchip mr-2 text-[#007bff]"></i>
            Device Telemetry
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time monitoring and analytics for device <span className="font-mono font-semibold text-gray-900">
              {device ? getDeviceDisplayNameWithMaskedImei(device) : imei}
            </span>
          </p>
        </div>
      </div>

      {/* Navigation Tabs - AdminLTE Style */}
      <div className="bg-white rounded-lg shadow-md p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-[#007bff] text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Section - GPS, Speed, Battery, Signal at Top - AdminLTE Small Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* GPS & Speed Small Box */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={cn(
            "p-4 bg-gradient-to-br",
            (() => {
              const speed = normal.speed;
              const n = speed == null ? NaN : Number(speed);
              if (isNaN(n)) return "from-gray-400 to-gray-500";
              if (n > 70) return "from-[#dc3545] to-[#c82333]"; // Red - Overspeeding
              if (n > 40) return "from-[#ffc107] to-[#ffca2c]"; // Yellow - Moderate
              return "from-[#28a745] to-[#20c997]"; // Green - Normal
            })()
          )}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white/90 text-sm font-medium mb-1">GPS & Speed</div>
                <div className="text-white text-2xl font-bold mb-2">
                  {normal.speed != null && !isNaN(Number(normal.speed)) ? `${normal.speed} km/h` : '-'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', getGpsStatus(normal).color)}></div>
                    <span className="text-white/80 text-xs">{getGpsStatus(normal).text}</span>
                  </div>
                  <div className="text-white/70 text-xs">
                    Status: {getSpeedStatus(normal).text}
                  </div>
                  <div className="text-white/70 text-xs">
                    Tracking: Active
                  </div>
                </div>
              </div>
              <div className="text-white/30">
                <i className="fas fa-tachometer-alt text-5xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 py-2 text-center">
            <span className="text-gray-600 text-xs">Real-time tracking</span>
          </div>
        </div>

        {/* Battery Small Box */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={cn(
            "p-4 bg-gradient-to-br",
            (() => {
              const b = normal.battery;
              const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
              if (isNaN(n)) return "from-gray-400 to-gray-500";
              if (n > 60) return "from-[#28a745] to-[#20c997]"; // Green
              if (n > 30) return "from-[#ffc107] to-[#ffca2c]"; // Yellow
              return "from-[#dc3545] to-[#c82333]"; // Red
            })()
          )}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white/90 text-sm font-medium mb-1">Battery</div>
                <div className="text-white text-2xl font-bold mb-2">
                  {(() => {
                    const b = normal.battery;
                    const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
                    return !isNaN(n) ? `${n}%` : '-';
                  })()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', getBatteryStatus(normal).color)}></div>
                    <span className="text-white/80 text-xs">{getBatteryStatus(normal).text}</span>
                  </div>
                  <div className="text-white/70 text-xs">
                    Drain: {computeBatteryDrainTime(packets)}
                  </div>
                  <div className="text-white/70 text-xs">
                    Runtime: {computeBatteryRuntimeHours(packets)} hrs
                  </div>
                </div>
              </div>
              <div className="text-white/30">
                <i className="fas fa-battery-three-quarters text-5xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 py-2 text-center">
            <span className="text-gray-600 text-xs">Updated: {timeAgo(normal.deviceTimestamp)}</span>
          </div>
        </div>

        {/* Signal Small Box */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={cn(
            "p-4 bg-gradient-to-br",
            (() => {
              const s = normal.signal;
              const n = s == null ? NaN : Number(s);
              if (isNaN(n)) return "from-gray-400 to-gray-500";
              if (n > 70) return "from-[#28a745] to-[#20c997]"; // Green
              if (n > 40) return "from-[#ffc107] to-[#ffca2c]"; // Yellow
              return "from-[#dc3545] to-[#c82333]"; // Red
            })()
          )}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white/90 text-sm font-medium mb-1">Signal</div>
                <div className="text-white text-2xl font-bold mb-2">
                  {normal.signal != null && !isNaN(Number(normal.signal)) ? `${normal.signal}%` : '-'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/80 text-xs">Strength</span>
                  </div>
                  <div className="text-white/70 text-xs">
                    Network: Active
                  </div>
                  <div className="text-white/70 text-xs">
                    Status: Connected
                  </div>
                </div>
              </div>
              <div className="text-white/30">
                <i className="fas fa-signal text-5xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 py-2 text-center">
            <span className="text-gray-600 text-xs">Network status</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* Latest Packet Information - AdminLTE White Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Packet (Any Type) */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  latest.packetType === 'N' ? 'bg-[#28a745]' : 
                  (() => {
                    const alertCode = String(latest.alert || '').toUpperCase();
                    if (alertCode.startsWith('A')) return 'bg-[#ffc107]';
                    if (alertCode.startsWith('E')) return 'bg-[#dc3545]';
                    return latest.packetType === 'A' ? 'bg-[#ffc107]' : 'bg-[#dc3545]';
                  })()
                )}></div>
                {(() => {
                  if (latest.packetType === 'N') {
                    return 'Latest Normal Packet';
                  } else if (latest.alert) {
                    // Auto-detect packet type from alert code if needed
                    let detectedPacketType = latest.packetType;
                    const alertCode = String(latest.alert).toUpperCase();
                       
                    // If alert code starts with E, it's an error
                    if (alertCode.startsWith('E')) {
                      detectedPacketType = 'E';
                    }
                    // If alert code starts with A, it's an alert
                    else if (alertCode.startsWith('A')) {
                      detectedPacketType = 'A';
                    }
                    
                    const mapped = mapAlertErrorCode(latest.alert, detectedPacketType);
                    return mapped.description;
                  } else {
                    return `Latest ${latest.packetType === 'A' ? 'Alert' : 'Error'} Packet`;
                  }
                })()}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Device</span>
                  <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">
                    {device ? getDeviceDisplayNameWithMaskedImei(device) : latest.imei}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Timestamp</span>
                  <span className="text-gray-800 text-xs">{formatIST(latest.serverTimestampISO || latest.deviceRawTimestamp)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Received</span>
                  <span className="text-gray-800 font-medium">{timeAgo(latest.serverTimestampISO || latest.deviceRawTimestamp)}</span>
                </div>
              </div>
            </div>

            {/* Latest Normal Packet Data - Enhanced Device Status */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-heartbeat text-[#28a745]"></i>
                Device Status
              </h3>
              
              {/* Status Badges - More Prominent */}
              <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="text-center">
                  <div className={cn('w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center', getGpsStatus(normal).color)}>
                    <i className="fas fa-satellite text-white text-lg"></i>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">{getGpsStatus(normal).text}</div>
                  <div className="text-xs text-gray-500">GPS</div>
                </div>
                <div className="text-center">
                  <div className={cn('w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center', getSpeedStatus(normal).color)}>
                    <i className="fas fa-tachometer-alt text-white text-lg"></i>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">{getSpeedStatus(normal).text}</div>
                  <div className="text-xs text-gray-500">Speed</div>
                </div>
                <div className="text-center">
                  <div className={cn('w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center', getBatteryStatus(normal).color)}>
                    <i className="fas fa-battery-three-quarters text-white text-lg"></i>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">{getBatteryStatus(normal).text}</div>
                  <div className="text-xs text-gray-500">Battery</div>
                </div>
              </div>
              
              {/* Device Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Geofence ID when device enters any geofence">GEO ID</span>
                    <span className="text-gray-800 font-medium">{normal.geoid ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="View device location on Google Maps">View on Map</span>
                    {(() => {
                      const lat = Number(normal.latitude);
                      const lon = Number(normal.longitude);
                      const hasValidCoords = lat && lon && !isNaN(lat) && !isNaN(lon);
                      
                      return hasValidCoords ? (
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#007bff] hover:text-[#0056b3] text-xs underline flex items-center gap-1"
                        >
                          <i className="fas fa-map-marker-alt"></i>
                          Open Maps
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No location</span>
                      );
                    })()}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Current speed in kilometers per hour">Speed</span>
                    <span className="text-gray-800 font-medium">{normal.speed ?? "-"} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Current signal strength percentage">Signal</span>
                    <span className="text-gray-800 font-medium">{normal.signal ?? "-"}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Time interval for normal packet transmission">Interval</span>
                    <span className="text-gray-800 font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Current device temperature in Celsius">Temperature</span>
                    <span className="text-gray-800 font-medium">{parseTemperature(normal.rawTemperature)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Current date and time from device">Timestamp</span>
                    <span className="text-gray-800 text-xs">{formatIST(normal.deviceTimestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600" title="Current battery percentage">Battery</span>
                    <span className="text-gray-800 font-medium">{normal.battery ?? "-"}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Information - AdminLTE White Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-[#007bff]"></i>
                Device Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Device</span>
                  <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">
                    {device ? getDeviceDisplayNameWithMaskedImei(device) : latest.imei}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">GEO ID</span>
                  <span className="text-gray-800">{normal.geoid || "-"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Firmware</span>
                  <span className="text-gray-800">-</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Temperature</span>
                  <span className="text-gray-800">{parseTemperature(normal.rawTemperature)}°C</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Last Update</span>
                  <span className="text-gray-800 text-xs">{formatIST(normal.deviceTimestamp)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-[#28a745]"></i>
                Location & Movement
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Distance Today</span>
                  <span className="text-gray-800">{computeTodayDistance(packets)} km</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Movement</span>
                  <div className="text-right">
                    {(() => {
                      const m = movementBreakdown(packets);
                      return (
                        <div className="text-xs">
                          <span className="text-[#28a745]">{m.movingPct}% moving</span>
                          <span className="text-gray-400 mx-1">•</span>
                          <span className="text-[#ffc107]">{m.idlePct}% idle</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">View on Map</span>
                  {latest.latitude && latest.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${latest.latitude},${latest.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007bff] hover:text-[#0056b3] text-xs underline"
                    >
                      Open Maps
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">No location</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "telemetry" && (
        <div className="space-y-6">
          {/* Health Analytics */}
          {health && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-chart-bar text-[#6f42c1]"></i>
                Device Health Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">GPS Health Score</span>
                    <span className="text-[#6f42c1] font-bold text-lg">{health.gpsScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Temperature Status</span>
                    <span className="text-[#17a2b8]">{health.temperatureStatus}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Temperature Index</span>
                    <span className="text-gray-800">{health.temperatureHealthIndex}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-2">Movement Pattern</div>
                  <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed max-h-32 overflow-y-auto">
                    <span>{health.movement.slice(0, 10).join(", ")}</span>
                    {health.movement.length > 10 && (
                      <span className="text-gray-500 ml-1">+ {health.movement.length - 10} more</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-gray-600 text-sm mb-2">Movement Stats</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {health.movementStats.map((stat, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-gray-100 border border-gray-300 text-gray-700">
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uptime Analytics */}
          {uptime && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-clock text-[#ffc107]"></i>
                Uptime Reliability Score
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-gray-600 text-xs font-medium mb-2">Score</div>
                  <div className="text-[#ffc107] font-bold text-2xl">{uptime.score}/100</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-gray-600 text-xs font-medium mb-2">Expected</div>
                  <div className="text-gray-800 font-bold text-2xl">{uptime.expectedPackets}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-gray-600 text-xs font-medium mb-2">Received</div>
                  <div className="text-gray-800 font-bold text-2xl">{uptime.receivedPackets}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-gray-600 text-xs font-medium mb-2">Dropouts</div>
                  <div className="text-gray-800 font-bold text-2xl">{uptime.dropouts}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Largest Gap</span>
                  <span className="text-gray-800 font-medium">{Math.round(uptime.largestGapSec)} seconds</span>
                </div>
              </div>
            </div>
          )}

          {/* Telemetry Alerts Summary */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-[#dc3545]"></i>
              Telemetry Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="text-gray-600 text-xs font-medium mb-2">High Speed</div>
                <div className="text-[#dc3545] font-bold text-2xl">{highSpeedCount}</div>
                <div className="text-gray-500 text-xs mt-1">&gt;70 km/h</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="text-gray-600 text-xs font-medium mb-2">High Temperature</div>
                <div className="text-[#dc3545] font-bold text-2xl">{highTempCount}</div>
                <div className="text-gray-500 text-xs mt-1">&gt;50°C</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="text-gray-600 text-xs font-medium mb-2">Low Battery</div>
                <div className="text-[#dc3545] font-bold text-2xl">{lowBatteryCount}</div>
                <div className="text-gray-500 text-xs mt-1">&lt;20%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trips" && (
        <div className="space-y-6">
          {/* Trip Filter Controls - AdminLTE White Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-filter text-[#007bff]"></i>
              Filter Trips by Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 text-sm block mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-[#007bff] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm block mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-[#007bff] focus:outline-none"
                />
              </div>
            </div>
          </div>

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
          {/* Alert Packets - AdminLTE White Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-[#ffc107]"></i>
              Alert Packets (A)
              <span className="ml-2 px-2 py-1 bg-[#ffc107] text-white text-xs rounded-full">
                {alertPackets.length}
              </span>
            </h3>
            {alertPackets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="fas fa-check-circle text-3xl text-[#28a745]"></i>
                </div>
                <div className="text-[#28a745] font-semibold mb-2">No Alerts</div>
                <div className="text-gray-600 text-sm">Your device is operating normally</div>
              </div>
            ) : (
              <div className="space-y-3">
                {alertPackets.map((alert, i) => {
                  // Auto-detect packet type from alert code
                  let detectedPacketType = 'A';
                  const alertCode = String(alert.alert || '').toUpperCase();
                  
                  if (alertCode.startsWith('E')) {
                    detectedPacketType = 'E';
                    } else if (alertCode.startsWith('A')) {
                    detectedPacketType = 'A';
                  }
                  
                  const mapped = mapAlertErrorCode(alert.alert, detectedPacketType);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#ffc107] bg-opacity-20 rounded-full flex items-center justify-center">
                          <i className="fas fa-exclamation-triangle text-[#ffc107]"></i>
                        </div>
                        <div>
                          <div className="text-gray-800 font-semibold text-sm">{mapped.description}</div>
                          <div className="text-gray-600 text-xs">{timeAgo(alert.deviceRawTimestamp)}</div>
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm">
                        {formatIST(alert.deviceRawTimestamp)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Packets - AdminLTE White Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-times-circle text-[#dc3545]"></i>
              Error Packets (E)
              <span className="ml-2 px-2 py-1 bg-[#dc3545] text-white text-xs rounded-full">
                {errorPackets.length}
              </span>
            </h3>
            {errorPackets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="fas fa-check-circle text-3xl text-[#28a745]"></i>
                </div>
                <div className="text-[#28a745] font-semibold mb-2">No Errors</div>
                <div className="text-gray-600 text-sm">Your device is running smoothly</div>
              </div>
            ) : (
              <div className="space-y-3">
                {errorPackets.map((error, i) => {
                  // Auto-detect packet type from alert code
                  let detectedPacketType = 'E';
                  const alertCode = String(error.alert || '').toUpperCase();
                  
                  if (alertCode.startsWith('E')) {
                    detectedPacketType = 'E';
                  } else if (alertCode.startsWith('A')) {
                    detectedPacketType = 'A';
                  }
                  
                  const mapped = mapAlertErrorCode(error.alert, detectedPacketType);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#dc3545] bg-opacity-20 rounded-full flex items-center justify-center">
                          <i className="fas fa-times-circle text-[#dc3545]"></i>
                        </div>
                        <div>
                          <div className="text-gray-800 font-semibold text-sm">{mapped.description}</div>
                          <div className="text-gray-600 text-xs">{timeAgo(error.deviceRawTimestamp)}</div>
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm">
                        {formatIST(error.deviceRawTimestamp)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SOS Panel - AdminLTE White Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-microphone text-[#dc3545]"></i>
              SOS Emergency
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-4 h-4 bg-[#28a745] rounded-full"></div>
                  <div className="w-4 h-4 bg-[#dc3545] rounded-full"></div>
                  <div className="w-4 h-4 bg-[#ffc107] rounded-full"></div>
                </div>
                <div className="text-gray-600 text-sm">
                  <div>System Status: Normal</div>
                  <div>Emergency: Not Active</div>
                  <div>Response: Ready</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAckSOS}
                  disabled={sosLoading}
                  className="px-4 py-2 bg-[#ffc107] hover:bg-[#e0a800] text-white rounded transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {sosLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    "ACK"
                  )}
                </button>
                <button className="px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white rounded transition-colors text-sm font-medium">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "esim" && (
        <div className="space-y-6">
          {/* E-SIM Management - AdminLTE White Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-6 text-center flex items-center justify-center gap-2">
              <i className="fas fa-sim-card text-[#007bff]"></i>
              E-SIM Management
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((sim) => (
                <div key={sim} className={cn(
                  "bg-white rounded-lg shadow-md p-4 border-l-4",
                  sim === 1 ? "border-[#28a745]" : "border-[#dc3545]"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-800 font-semibold text-lg">SIM {sim}</h4>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-[#28a745] rounded-full"></div>
                      <div className="w-3 h-3 bg-[#dc3545] rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-[#ffc107] rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">SIM No.</span>
                      <span className="text-gray-800">-</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">MSDN No.</span>
                      <span className="text-gray-800 font-mono">654135135</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Profile Code</span>
                      <span className="text-gray-800 font-mono">654135135</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Data Usage</span>
                      <span className="text-gray-800">{sim === 1 ? "38/50 MB" : "3/10 MB"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">SMS</span>
                      <span className="text-gray-800">{sim === 1 ? "5/100" : "3/100"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Signal Strength</span>
                      <span className={cn(
                        'font-semibold',
                        sim === 1 ? "text-[#28a745]" : "text-[#dc3545]"
                      )}>
                        {sim === 1 ? "75%" : "23%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Roaming</span>
                      <span className={cn(
                        'font-semibold',
                        sim === 1 ? "text-gray-600" : "text-[#ffc107]"
                      )}>
                        {sim === 1 ? "Disabled" : "Active"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Fallback History</span>
                      <span className="text-gray-800 text-xs">
                        {sim === 1 ? "SIM 2 → SIM 1" : "05-11-2022 12:35:11"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
