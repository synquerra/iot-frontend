// src/pages/DeviceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnalyticsByImei, getAnalyticsHealth, getAnalyticsUptime, getAnalyticsByFilter } from "../utils/analytics";
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
import { useUserContext } from "../contexts/UserContext";
import { getUserByIMEI } from "../utils/auth";
import { fetchDeviceCommands } from "../utils/deviceCommandsAPI";
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
  const userContext = useUserContext();

  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [uptime, setUptime] = useState(null);
  const [device, setDevice] = useState(null);
  const [parentUser, setParentUser] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sosLoading, setSosLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingIntervals, setEditingIntervals] = useState(false);
  const [commandLoading, setCommandLoading] = useState(false);
  const [contactNumbers, setContactNumbers] = useState({
    phonenum1: '',
    phonenum2: '',
    controlroomnum: ''
  });
  const [intervalSettings, setIntervalSettings] = useState({
    NormalSendingInterval: '',
    SOSSendingInterval: '',
    NormalScanningInterval: '',
    AirplaneInterval: '',
    LowbatLimit: ''
  });
  const [safetySettings, setSafetySettings] = useState({
    TemperatureLimit: '',
    SpeedLimit: ''
  });
  const [contactErrors, setContactErrors] = useState({});
  const [intervalErrors, setIntervalErrors] = useState({});
  const [safetyErrors, setSafetyErrors] = useState({});
  const [editingSafety, setEditingSafety] = useState(false);
  const [ambientListenEnabled, setAmbientListenEnabled] = useState(false);
  const [ambientLoading, setAmbientLoading] = useState(false);
  const [isAmbientListenOn, setIsAmbientListenOn] = useState(false);
  const [isLedOn, setIsLedOn] = useState(false);

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

  // Validation functions
  const validatePhoneNumber = (value) => {
    if (!value || value.trim() === '') {
      return 'Phone number is required';
    }
    // Exactly 10 digits, no special characters
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const validatePositiveInteger = (value, fieldName, min = 1, max = null) => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== null && num > max) {
      return `${fieldName} must be at most ${max}`;
    }
    if (num.toString() !== value.trim()) {
      return `${fieldName} must be a valid integer`;
    }
    return '';
  };

  const validateBatteryLimit = (value) => {
    if (!value || value.trim() === '') {
      return 'Low Battery Limit is required';
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Low Battery Limit must be a number';
    }
    if (num < 0 || num > 100) {
      return 'Low Battery Limit must be between 0 and 100';
    }
    return '';
  };

  const validateContactNumbers = () => {
    const errors = {};
    errors.phonenum1 = validatePhoneNumber(contactNumbers.phonenum1);
    errors.phonenum2 = validatePhoneNumber(contactNumbers.phonenum2);
    errors.controlroomnum = validatePhoneNumber(contactNumbers.controlroomnum);
    
    setContactErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const validateIntervals = () => {
    const errors = {};
    errors.NormalSendingInterval = validatePositiveInteger(intervalSettings.NormalSendingInterval, 'Normal Sending Interval');
    errors.SOSSendingInterval = validatePositiveInteger(intervalSettings.SOSSendingInterval, 'SOS Sending Interval');
    errors.NormalScanningInterval = validatePositiveInteger(intervalSettings.NormalScanningInterval, 'Normal Scanning Interval');
    errors.AirplaneInterval = validatePositiveInteger(intervalSettings.AirplaneInterval, 'Airplane Interval', 1, 10);
    errors.LowbatLimit = validateBatteryLimit(intervalSettings.LowbatLimit);
    
    setIntervalErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const validateSafety = () => {
    const errors = {};
    errors.TemperatureLimit = validatePositiveInteger(safetySettings.TemperatureLimit, 'Temperature Limit');
    errors.SpeedLimit = validatePositiveInteger(safetySettings.SpeedLimit, 'Speed Limit');
    
    setSafetyErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  // Fetch and parse ambient listen toggle status from device commands API
  const fetchAmbientListenStatus = async () => {
    try {
      console.log('🎧 Fetching ambient listen status for IMEI:', imei);
      
      // Fetch device commands with limit 1000
      const commands = await fetchDeviceCommands(imei, 1000);
      console.log('🎧 Fetched commands:', commands);
      
      if (!commands || commands.length === 0) {
        console.log('🎧 No commands found, defaulting to OFF');
        setIsAmbientListenOn(false);
        return;
      }
      
      // Filter for AMBIENT_ENABLE, AMBIENT_DISABLE, and AMBIENT_STOP commands
      const ambientCommands = commands.filter(cmd => 
        cmd.command === 'AMBIENT_ENABLE' || 
        cmd.command === 'AMBIENT_DISABLE' || 
        cmd.command === 'AMBIENT_STOP'
      );
      
      if (ambientCommands.length === 0) {
        console.log('🎧 No ambient commands found, defaulting to OFF');
        setIsAmbientListenOn(false);
        return;
      }
      
      // Sort by created_at timestamp to find the latest command
      const latestCommand = ambientCommands.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      
      console.log('🎧 Latest ambient command:', latestCommand);
      
      // Parse the payload to determine toggle status
      const payload = latestCommand.payload;
      
      if (latestCommand.command === 'AMBIENT_ENABLE' && payload?.AmbientListen === 'Enable') {
        console.log('🎧 AMBIENT_ENABLE with Enable, setting toggle to ON');
        setIsAmbientListenOn(true);
      } else if (latestCommand.command === 'AMBIENT_DISABLE' && payload?.AmbientListen === 'Disable') {
        console.log('🎧 AMBIENT_DISABLE with Disable, setting toggle to OFF');
        setIsAmbientListenOn(false);
      } else if (latestCommand.command === 'AMBIENT_STOP' && payload?.AmbientListen === 'Start') {
        console.log('🎧 AMBIENT_STOP with Start, setting toggle to ON');
        setIsAmbientListenOn(true);
      } else if (latestCommand.command === 'AMBIENT_STOP' && payload?.AmbientListen === 'Stop') {
        console.log('🎧 AMBIENT_STOP with Stop, setting toggle to OFF');
        setIsAmbientListenOn(false);
      } else {
        console.log('🎧 Payload format unexpected, defaulting to OFF');
        setIsAmbientListenOn(false);
      }
    } catch (error) {
      console.error('🎧 Error fetching ambient listen status:', error);
      // Default to OFF on error
      setIsAmbientListenOn(false);
    }
  };

  const handleAmbientToggle = async () => {
    try {
      const newState = !isAmbientListenOn;
      const command = newState ? 'AMBIENT_ENABLE' : 'AMBIENT_DISABLE';
      
      console.log(`🎧 Sending ${command} command for IMEI:`, imei);
      
      // Send the command
      await sendDeviceCommand(imei, command);
      
      console.log(`🎧 ${command} command sent successfully`);
      
      // Optimistically update the UI
      setIsAmbientListenOn(newState);
      
      // Refresh data after a short delay to get the latest status
      setTimeout(() => {
        fetchAmbientListenStatus();
      }, 1000);
    } catch (error) {
      console.error('🎧 Error sending ambient command:', error);
      alert('Failed to update Ambient Listen status. Please try again.');
    }
  };

  const fetchLedStatus = async () => {
    try {
      console.log('💡 Fetching LED status for IMEI:', imei);
      
      const commands = await fetchDeviceCommands(imei, 1000);
      console.log('💡 Fetched commands:', commands);
      
      if (!commands || commands.length === 0) {
        console.log('💡 No commands found, defaulting to OFF');
        setIsLedOn(false);
        return;
      }
      
      // Filter for LED_ON and LED_OFF commands
      const ledCommands = commands.filter(cmd => 
        cmd.command === 'LED_ON' || cmd.command === 'LED_OFF'
      );
      
      if (ledCommands.length === 0) {
        console.log('💡 No LED commands found, defaulting to OFF');
        setIsLedOn(false);
        return;
      }
      
      // Sort by created_at timestamp to find the latest command
      const latestCommand = ledCommands.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )[0];
      
      console.log('💡 Latest LED command:', latestCommand);
      
      const payload = latestCommand.payload;
      
      if (latestCommand.command === 'LED_ON' && payload?.LED === 'SwitchOnLed') {
        console.log('💡 LED_ON with SwitchOnLed, setting toggle to ON');
        setIsLedOn(true);
      } else if (latestCommand.command === 'LED_OFF' && payload?.LED === 'SwitchoffLed') {
        console.log('💡 LED_OFF with SwitchoffLed, setting toggle to OFF');
        setIsLedOn(false);
      } else {
        console.log('💡 Payload format unexpected, defaulting to OFF');
        setIsLedOn(false);
      }
    } catch (error) {
      console.error('💡 Error fetching LED status:', error);
      setIsLedOn(false);
    }
  };

  const handleLedToggle = async () => {
    try {
      const newState = !isLedOn;
      const command = newState ? 'LED_ON' : 'LED_OFF';
      
      console.log(`💡 Sending ${command} command for IMEI:`, imei);
      
      await sendDeviceCommand(imei, command);
      
      console.log(`💡 ${command} command sent successfully`);
      
      setIsLedOn(newState);
      
      setTimeout(() => {
        fetchLedStatus();
      }, 1000);
    } catch (error) {
      console.error('💡 Error sending LED command:', error);
      alert('Failed to update LED status. Please try again.');
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
        
        // Fetch config data for phone numbers and intervals
        try {
          const configPackets = await getAnalyticsByFilter(imei, "config_or_misc");
          if (configPackets && configPackets.length > 0) {
            // Always update configData
            setConfigData(configPackets[0]);
            
            // Only update contactNumbers if NOT editing contacts
            if (!editingContacts) {
              setContactNumbers({
                phonenum1: configPackets[0].rawPhone1 || '',
                phonenum2: configPackets[0].rawPhone2 || '',
                controlroomnum: configPackets[0].rawControlPhone || ''
              });
            } else {
              console.log('⏸️ Skipping contact numbers refresh - user is editing');
            }
            
            // Only update intervalSettings if NOT editing intervals
            if (!editingIntervals) {
              setIntervalSettings({
                NormalSendingInterval: configPackets[0].rawNormalSendingInterval || '',
                SOSSendingInterval: configPackets[0].rawSOSSendingInterval || '',
                NormalScanningInterval: configPackets[0].rawNormalScanningInterval || '',
                AirplaneInterval: configPackets[0].rawAirplaneInterval || '',
                LowbatLimit: configPackets[0].rawLowbatLimit || ''
              });
            } else {
              console.log('⏸️ Skipping interval settings refresh - user is editing');
            }
            
            // Only update safetySettings if NOT editing safety
            if (!editingSafety) {
              setSafetySettings({
                TemperatureLimit: configPackets[0].rawTemperature || '',
                SpeedLimit: configPackets[0].rawSpeedLimit || ''
              });
            } else {
              console.log('⏸️ Skipping safety settings refresh - user is editing');
            }
            
            console.log('📞 Config data loaded:', configPackets[0]);
          }
        } catch (err) {
          console.warn('Failed to fetch config data:', err);
        }
        
        // Fetch device info to get studentName
        if (byImei.length > 0 && byImei[0].topic) {
          try {
            const deviceData = await getDeviceByTopic(byImei[0].topic);
            setDevice(deviceData);
          } catch (err) {
            console.warn('Failed to fetch device info:', err);
          }
        }
        
        // Fetch parent user details by IMEI
        try {
          console.log('Fetching parent user for IMEI:', imei);
          const parentData = await getUserByIMEI(imei);
          console.log('Parent user data received:', parentData);
          setParentUser(parentData);
        } catch (err) {
          console.error('Failed to fetch parent user by IMEI:', err);
          console.error('Error details:', err.message);
        }
        
        // Fetch ambient listen toggle status from device commands API
        await fetchAmbientListenStatus();
        
        // Fetch LED toggle status from device commands API
        await fetchLedStatus();
        
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
  }, [imei, editingContacts, editingIntervals, editingSafety]);

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
    { id: "settings", label: "Settings", icon: "⚙️" },
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

      {/* Status Cards - Only show on non-Settings tabs */}
      {activeTab !== "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Movement Status Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className={cn(
              "p-4 text-white flex-1 bg-gradient-to-br",
              (() => {
                const speed = Number(normal.speed) || 0;
                if (speed > 70) return "from-red-400 to-red-500"; // Overspeeding
                if (speed > 0) return "from-green-400 to-green-500"; // Moving
                return "from-yellow-400 to-yellow-500"; // Idle
              })()
            )}>
              <div className="text-sm font-medium mb-2">Movement Status</div>
              <div className="text-3xl font-bold mb-1">{normal.speed || "0"} km/h</div>
              <div className="text-xs opacity-90">
                {latest.latitude && latest.longitude 
                  ? `${Number(latest.latitude).toFixed(5)} N, ${Number(latest.longitude).toFixed(5)} E`
                  : "No GPS data"}
              </div>
            </div>
            <div className="bg-white px-4 py-3 text-center border-t border-dashed border-gray-300 h-12 flex items-center justify-center">
              <span className="text-gray-600 text-xs">
                {normal.geoid ? `Inside Geofence: ${normal.geoid}` : "Home/ Outside Geofence"}
              </span>
            </div>
          </div>

          {/* Battery Status Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className={cn(
              "p-4 text-white flex-1 bg-gradient-to-br",
              (() => {
                const b = normal.battery;
                const battery = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
                if (isNaN(battery)) return "from-gray-400 to-gray-500";
                if (battery >= 60) return "from-green-400 to-green-500"; // Good
                if (battery >= 20) return "from-yellow-400 to-yellow-500"; // Medium
                return "from-red-400 to-red-500"; // Low
              })()
            )}>
              <div className="text-sm font-medium mb-2">Battery Status</div>
              <div className="text-3xl font-bold mb-1">
                {(() => {
                  const b = normal.battery;
                  const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
                  return !isNaN(n) ? `${n}%` : '-';
                })()}
              </div>
              <div className="text-xs opacity-90 space-y-1">
                <div>LAST CHARGED: {computeBatteryDrainTime(packets)} ago</div>
                <div>ESTIMATED NEXT CHARGE: -</div>
              </div>
            </div>
            <div className="bg-white px-4 py-3 text-center border-t border-dashed border-gray-300 h-12 flex items-center justify-center">
              <span className="text-gray-600 text-xs">
                {(() => {
                  const b = normal.battery;
                  const n = b == null ? NaN : Number(String(b).replace(/[^\d.-]/g, ""));
                  if (isNaN(n)) return "-";
                  const hours = parseFloat(computeBatteryRuntimeHours(packets));
                  if (isNaN(hours)) return "-";
                  const remaining = Math.max(0, 24 - hours);
                  return `${Math.floor(remaining)} hrs ${Math.floor((remaining % 1) * 60)} mins remaining`;
                })()}
              </span>
            </div>
          </div>

          {/* Network Status Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className={cn(
              "p-4 text-white flex-1 bg-gradient-to-br",
              (() => {
                const signal = Number(normal.signal) || 0;
                if (signal >= 70) return "from-green-400 to-green-500"; // Good
                if (signal >= 40) return "from-yellow-400 to-yellow-500"; // Medium
                if (signal > 0) return "from-red-400 to-red-500"; // Poor
                return "from-gray-400 to-gray-500"; // No signal
              })()
            )}>
              <div className="text-sm font-medium mb-2">Network Status</div>
              <div className="text-xs space-y-1 mb-2">
                <div className="flex justify-between">
                  <span>SIM 1 SIGNAL</span>
                  <span className="font-bold">{normal.signal || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span>SIM 2 SIGNAL</span>
                  <span className="font-bold">-</span>
                </div>
                <div className="flex justify-between">
                  <span>GPS SIGNAL</span>
                  <span className="font-bold">
                    {latest.latitude && latest.longitude ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GPS NO OF SATELLITE</span>
                  <span className="font-bold">-</span>
                </div>
              </div>
            </div>
            <div className="bg-white px-4 py-3 text-center border-t border-dashed border-gray-300 h-12 flex items-center justify-center">
              <span className="text-gray-600 text-xs">SIM 1 ACTIVE</span>
            </div>
          </div>

          {/* Location Status Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="relative h-32 bg-gray-200 flex-1">
              {latest.latitude && latest.longitude ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${latest.latitude}&mlon=${latest.longitude}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative group"
                >
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(latest.longitude)-0.01},${Number(latest.latitude)-0.01},${Number(latest.longitude)+0.01},${Number(latest.latitude)+0.01}&layer=mapnik&marker=${latest.latitude},${latest.longitude}`}
                    style={{ pointerEvents: 'none' }}
                  />
                  <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10">
                    Location Status
                  </div>
                </a>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <i className="fas fa-map-marker-alt text-3xl mb-2"></i>
                    <div className="text-xs">No location data</div>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white px-4 py-3 text-center border-t border-dashed border-gray-300 h-12 flex items-center justify-center">
              <a
                href={latest.latitude && latest.longitude ? `https://www.openstreetmap.org/?mlat=${latest.latitude}&mlon=${latest.longitude}&zoom=15` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs ${latest.latitude && latest.longitude ? 'text-blue-600 hover:text-blue-800 underline' : 'text-gray-400 cursor-not-allowed'}`}
              >
                Click here to get current location
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* Device Status and Activity Details - Matching Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Device Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Alert</span>
                  <span className="text-gray-900 font-medium">SOS/Normal</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Temperature</span>
                  <span className="text-gray-900 font-medium">{parseTemperature(normal.rawTemperature)}°C</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Current Mode</span>
                  <span className="text-gray-900 font-medium">Incognito</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Performance Score</span>
                  <span className="text-gray-900 font-medium">{normal.signal || "86"}/100</span>
                </div>
              </div>
            </div>

            {/* Activity Details (in last 24 hrs) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-800 text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Activity Details (in last 24 hrs)</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Distance traveled</span>
                  <span className="text-gray-900 font-medium">{computeTodayDistance(packets)}Km</span>
                </div>
                <div className="py-2">
                  <div className="text-gray-700 mb-2">Activity Analysis</div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-gray-50">
                      Crawling: 5
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-gray-50">
                      Stationary: 5
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-gray-50">
                      Overspeeding: 5
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Steps</span>
                  <span className="text-gray-900 font-medium">8554</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">No of safety events occurred today</span>
                  <span className="text-gray-900 font-medium">{alertPackets.length + errorPackets.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Information - Exact Layout from Screenshot */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-800 text-lg font-semibold mb-4 border-b border-gray-300 pb-2">Device Information</h3>
            <div className="grid grid-cols-2 gap-0 text-sm">
              {/* Left Column */}
              <div className="border-r border-gray-300 pr-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Imei No.</span>
                  <span className="text-gray-900 font-medium">{imei || "894861351616151515"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Guardian 1 Details:-</span>
                  <span className="text-gray-900 font-medium"></span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Name</span>
                  <span className="text-gray-900 font-medium">-</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Phone Number</span>
                  <span className="text-gray-900 font-medium">-</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Guardian 2 Details:-</span>
                  <span className="text-gray-900 font-medium"></span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Name</span>
                  <span className="text-gray-900 font-medium">-</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Phone Number</span>
                  <span className="text-gray-900 font-medium">-</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Data Receiving Interval</span>
                  <span className="text-gray-900 font-medium">600s</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">GPS Scanning Interval</span>
                  <span className="text-gray-900 font-medium">300s</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">SoS Interval</span>
                  <span className="text-gray-900 font-medium">50s</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="pl-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Audio Recording</span>
                  <span className="text-gray-900 font-medium">Ambient Listening Active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Aeroplane Mode</span>
                  <span className="text-gray-900 font-medium">Inactive</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">O/G Call Facility</span>
                  <span className="text-gray-900 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">SMS Facility</span>
                  <span className="text-gray-900 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">BLE</span>
                  <span className="text-gray-900 font-medium">Inactive</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">LED Status</span>
                  <span className="text-gray-900 font-medium">On</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Data Available</span>
                  <span className="text-gray-900 font-medium">64 MB</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Next Recharge Due</span>
                  <span className="text-gray-900 font-medium">12-12-21</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Working Mode</span>
                  <span className="text-gray-900 font-medium">Manual</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Weather</span>
                  <span className="text-gray-900 font-medium">Normal</span>
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

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Top Row - Phone Numbers and Intervals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registered Mobile Numbers Section */}
            <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 text-base font-bold flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-phone-alt text-blue-600 text-sm"></i>
                  </div>
                  Registered Mobile Numbers
                </h3>
                {!editingContacts ? (
                  <button 
                    onClick={() => setEditingContacts(true)}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        // Validate before sending
                        if (!validateContactNumbers()) {
                          setNotification({
                            type: 'error',
                            message: 'Please fix validation errors before saving'
                          });
                          setTimeout(() => setNotification(null), 5000);
                          return;
                        }
                        
                        try {
                          setCommandLoading(true);
                          
                          // Step 1: Send SET_CONTACTS command
                          await sendDeviceCommand(imei, 'SET_CONTACTS', contactNumbers);
                          
                          console.log('✅ SET_CONTACTS command sent successfully');
                          
                          // Step 2: Wait 2 seconds then send QUERY_DEVICE_SETTINGS command
                          setTimeout(async () => {
                            try {
                              await sendDeviceCommand(imei, 'QUERY_DEVICE_SETTINGS', {});
                              console.log('✅ QUERY_DEVICE_SETTINGS command sent successfully after 2s delay');
                            } catch (queryError) {
                              console.warn('⚠️ Failed to send QUERY_DEVICE_SETTINGS:', queryError);
                            }
                          }, 2000);
                          
                          setNotification({
                            type: 'success',
                            message: 'Emergency contacts updated successfully'
                          });
                          
                          setEditingContacts(false);
                          
                          // Refresh config data with longer delays to ensure backend has processed
                          // Try 3 times: after 3s, 6s, and 10s
                          const refreshAttempts = [3000, 6000, 10000];
                          
                          refreshAttempts.forEach((delay, index) => {
                            setTimeout(async () => {
                              try {
                                console.log(`🔄 Refresh attempt ${index + 1}/${refreshAttempts.length} after ${delay}ms`);
                                const configPackets = await getAnalyticsByFilter(imei, "config_or_misc");
                                
                                if (configPackets && configPackets.length > 0) {
                                  const latestData = configPackets[0];
                                  
                                  console.log('📊 Latest data from backend:', {
                                    rawPhone1: latestData.rawPhone1,
                                    rawPhone2: latestData.rawPhone2,
                                    rawControlPhone: latestData.rawControlPhone
                                  });
                                  
                                  // Always update with latest data
                                  setConfigData(latestData);
                                  setContactNumbers({
                                    phonenum1: latestData.rawPhone1 || '',
                                    phonenum2: latestData.rawPhone2 || '',
                                    controlroomnum: latestData.rawControlPhone || ''
                                  });
                                  
                                  console.log(`✅ Config data refreshed (attempt ${index + 1})`);
                                }
                              } catch (err) {
                                console.warn(`Failed refresh attempt ${index + 1}:`, err);
                              }
                            }, delay);
                          });
                          
                          setTimeout(() => setNotification(null), 5000);
                        } catch (error) {
                          setNotification({
                            type: 'error',
                            message: 'Failed to update emergency contacts'
                          });
                        } finally {
                          setCommandLoading(false);
                        }
                      }}
                      disabled={commandLoading}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {commandLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingContacts(false);
                        setContactNumbers({
                          phonenum1: configData?.rawPhone1 || '',
                          phonenum2: configData?.rawPhone2 || '',
                          controlroomnum: configData?.rawControlPhone || ''
                        });
                      }}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            
            <div className="space-y-3">
              {/* Phone Number 1 (Primary) */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-green-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-600 text-xs block">Phone Number 1 (Primary)</span>
                    {editingContacts ? (
                      <div>
                        <input
                          type="text"
                          value={contactNumbers.phonenum1}
                          onChange={(e) => {
                            setContactNumbers({...contactNumbers, phonenum1: e.target.value});
                            if (contactErrors.phonenum1) {
                              setContactErrors({...contactErrors, phonenum1: ''});
                            }
                          }}
                          className={`text-gray-900 font-semibold font-mono border rounded px-2 py-1 text-sm w-full ${
                            contactErrors.phonenum1 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="10 digits only"
                        />
                        {contactErrors.phonenum1 && (
                          <p className="text-red-600 text-xs mt-1">{contactErrors.phonenum1}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-900 font-semibold font-mono">{configData?.rawPhone1 || 'Not Set'}</span>
                    )}
                  </div>
                </div>
                {!editingContacts && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Call</span>
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Text</span>
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <i className="fas fa-check text-white text-xs"></i>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Number 2 */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-blue-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-600 text-xs block">Phone Number 2</span>
                    {editingContacts ? (
                      <div>
                        <input
                          type="text"
                          value={contactNumbers.phonenum2}
                          onChange={(e) => {
                            setContactNumbers({...contactNumbers, phonenum2: e.target.value});
                            if (contactErrors.phonenum2) {
                              setContactErrors({...contactErrors, phonenum2: ''});
                            }
                          }}
                          className={`text-gray-900 font-semibold font-mono border rounded px-2 py-1 text-sm w-full ${
                            contactErrors.phonenum2 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="10 digits only"
                        />
                        {contactErrors.phonenum2 && (
                          <p className="text-red-600 text-xs mt-1">{contactErrors.phonenum2}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-900 font-semibold font-mono">{configData?.rawPhone2 || 'Not Set'}</span>
                    )}
                  </div>
                </div>
                {!editingContacts && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Call</span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Text</span>
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <i className="fas fa-check text-white text-xs"></i>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Control Room Number */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-headset text-purple-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-600 text-xs block">Control Room Number</span>
                    {editingContacts ? (
                      <input
                        type="text"
                        value={contactNumbers.controlroomnum}
                        onChange={(e) => setContactNumbers({...contactNumbers, controlroomnum: e.target.value})}
                        className="text-gray-900 font-semibold font-mono border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        placeholder="10 digits only"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold font-mono">{configData?.rawControlPhone || 'Not Set'}</span>
                    )}
                  </div>
                </div>
                {!editingContacts && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Call</span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Text</span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Intervals Section */}
            <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 text-base font-bold flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-purple-600 text-sm"></i>
                  </div>
                  Intervals
                </h3>
                {!editingIntervals ? (
                  <button 
                    onClick={() => setEditingIntervals(true)}
                    className="text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        // Validate before sending
                        if (!validateIntervals()) {
                          setNotification({
                            type: 'error',
                            message: 'Please fix validation errors before saving'
                          });
                          setTimeout(() => setNotification(null), 5000);
                          return;
                        }
                        
                        try {
                          setCommandLoading(true);
                          
                          // Step 1: Send DEVICE_SETTINGS command with intervals
                          console.log('📤 Sending DEVICE_SETTINGS command with intervals:', intervalSettings);
                          await sendDeviceCommand(imei, 'DEVICE_SETTINGS', intervalSettings);
                          
                          console.log('✅ DEVICE_SETTINGS command sent successfully');
                          console.log('🔍 Sent values:', {
                            NormalSendingInterval: intervalSettings.NormalSendingInterval,
                            SOSSendingInterval: intervalSettings.SOSSendingInterval,
                            NormalScanningInterval: intervalSettings.NormalScanningInterval,
                            AirplaneInterval: intervalSettings.AirplaneInterval,
                            LowbatLimit: intervalSettings.LowbatLimit
                          });
                          
                          // Step 2: Wait 2 seconds then send QUERY_DEVICE_SETTINGS command
                          setTimeout(async () => {
                            try {
                              await sendDeviceCommand(imei, 'QUERY_DEVICE_SETTINGS', {});
                              console.log('✅ QUERY_DEVICE_SETTINGS command sent successfully after 2s delay');
                            } catch (queryError) {
                              console.warn('⚠️ Failed to send QUERY_DEVICE_SETTINGS:', queryError);
                            }
                          }, 2000);
                          
                          setNotification({
                            type: 'success',
                            message: 'Interval settings updated successfully'
                          });
                          
                          setEditingIntervals(false);
                          
                          // Refresh config data with longer delays to ensure backend has processed
                          // Try 3 times: after 3s, 6s, and 10s
                          const refreshAttempts = [3000, 6000, 10000];
                          
                          refreshAttempts.forEach((delay, index) => {
                            setTimeout(async () => {
                              try {
                                console.log(`🔄 Refresh attempt ${index + 1}/${refreshAttempts.length} after ${delay}ms`);
                                const configPackets = await getAnalyticsByFilter(imei, "config_or_misc");
                                
                                if (configPackets && configPackets.length > 0) {
                                  const latestData = configPackets[0];
                                  
                                  console.log('📊 Latest data from backend:', {
                                    NormalSendingInterval: latestData.rawNormalSendingInterval,
                                    SOSSendingInterval: latestData.rawSOSSendingInterval,
                                    NormalScanningInterval: latestData.rawNormalScanningInterval,
                                    AirplaneInterval: latestData.rawAirplaneInterval,
                                    LowbatLimit: latestData.rawLowbatLimit
                                  });
                                  
                                  // Always update with latest data
                                  setConfigData(latestData);
                                  setIntervalSettings({
                                    NormalSendingInterval: latestData.rawNormalSendingInterval || '',
                                    SOSSendingInterval: latestData.rawSOSSendingInterval || '',
                                    NormalScanningInterval: latestData.rawNormalScanningInterval || '',
                                    AirplaneInterval: latestData.rawAirplaneInterval || '',
                                    LowbatLimit: latestData.rawLowbatLimit || ''
                                  });
                                  
                                  console.log(`✅ Config data refreshed (attempt ${index + 1})`);
                                }
                              } catch (err) {
                                console.warn(`Failed refresh attempt ${index + 1}:`, err);
                              }
                            }, delay);
                          });
                          
                          setTimeout(() => setNotification(null), 5000);
                        } catch (error) {
                          setNotification({
                            type: 'error',
                            message: 'Failed to update interval settings'
                          });
                        } finally {
                          setCommandLoading(false);
                        }
                      }}
                      disabled={commandLoading}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {commandLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingIntervals(false);
                        setIntervalSettings({
                          NormalSendingInterval: configData?.rawNormalSendingInterval || '',
                          SOSSendingInterval: configData?.rawSOSSendingInterval || '',
                          NormalScanningInterval: configData?.rawNormalScanningInterval || '',
                          AirplaneInterval: configData?.rawAirplaneInterval || '',
                          LowbatLimit: configData?.rawLowbatLimit || ''
                        });
                      }}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <span className="text-gray-600 text-xs block">Normal Sending Interval</span>
                  {editingIntervals ? (
                    <input
                      type="text"
                      value={intervalSettings.NormalSendingInterval}
                      onChange={(e) => setIntervalSettings({...intervalSettings, NormalSendingInterval: e.target.value})}
                      className="text-gray-900 font-bold text-sm border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="600"
                    />
                  ) : (
                    <span className="text-gray-900 font-bold text-sm">{configData?.rawNormalSendingInterval || "Not Set"}</span>
                  )}
                </div>
                <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                  <span className="text-gray-600 text-xs block">SOS Sending Interval</span>
                  {editingIntervals ? (
                    <input
                      type="text"
                      value={intervalSettings.SOSSendingInterval}
                      onChange={(e) => setIntervalSettings({...intervalSettings, SOSSendingInterval: e.target.value})}
                      className="text-gray-900 font-bold text-sm border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="60"
                    />
                  ) : (
                    <span className="text-gray-900 font-bold text-sm">{configData?.rawSOSSendingInterval || "Not Set"}</span>
                  )}
                </div>
                <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                  <span className="text-gray-600 text-xs block">Normal Scanning Interval</span>
                  {editingIntervals ? (
                    <input
                      type="text"
                      value={intervalSettings.NormalScanningInterval}
                      onChange={(e) => setIntervalSettings({...intervalSettings, NormalScanningInterval: e.target.value})}
                      className="text-gray-900 font-bold text-sm border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="300"
                    />
                  ) : (
                    <span className="text-gray-900 font-bold text-sm">{configData?.rawNormalScanningInterval || "Not Set"}</span>
                  )}
                </div>
                <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                  <span className="text-gray-600 text-xs block">Aeroplane Interval</span>
                  {editingIntervals ? (
                    <input
                      type="text"
                      value={intervalSettings.AirplaneInterval}
                      onChange={(e) => setIntervalSettings({...intervalSettings, AirplaneInterval: e.target.value})}
                      className="text-gray-900 font-bold text-sm border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="400"
                    />
                  ) : (
                    <span className="text-gray-900 font-bold text-sm">{configData?.rawAirplaneInterval || "Not Set"}</span>
                  )}
                </div>
                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                  <span className="text-gray-600 text-xs block">Low Bat Data</span>
                  {editingIntervals ? (
                    <input
                      type="text"
                      value={intervalSettings.LowbatLimit}
                      onChange={(e) => setIntervalSettings({...intervalSettings, LowbatLimit: e.target.value})}
                      className="text-gray-900 font-bold text-sm border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="900"
                    />
                  ) : (
                    <span className="text-gray-900 font-bold text-sm">{configData?.rawLowbatLimit || "Not Set"}</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button className="text-purple-600 hover:text-purple-800 font-semibold text-xs underline">
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          {/* Safety and Ambient Listen - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Safety Section */}
            <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 text-base font-bold flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-shield-alt text-red-600 text-sm"></i>
                  </div>
                  Safety
                </h3>
                {!editingSafety ? (
                  <button 
                    onClick={() => setEditingSafety(true)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        // Validate before sending
                        if (!validateSafety()) {
                          setNotification({
                            type: 'error',
                            message: 'Please fix validation errors before saving'
                          });
                          setTimeout(() => setNotification(null), 5000);
                          return;
                        }
                        
                        try {
                          setCommandLoading(true);
                          
                          // Send DEVICE_SETTINGS command with safety settings
                          console.log('📤 Sending DEVICE_SETTINGS command with safety settings:', safetySettings);
                          await sendDeviceCommand(imei, 'DEVICE_SETTINGS', safetySettings);
                          
                          console.log('✅ DEVICE_SETTINGS command sent successfully');
                          
                          // Wait 2 seconds then send QUERY_DEVICE_SETTINGS
                          setTimeout(async () => {
                            try {
                              await sendDeviceCommand(imei, 'QUERY_DEVICE_SETTINGS', {});
                              console.log('✅ QUERY_DEVICE_SETTINGS command sent successfully after 2s delay');
                            } catch (queryError) {
                              console.warn('⚠️ Failed to send QUERY_DEVICE_SETTINGS:', queryError);
                            }
                          }, 2000);
                          
                          setNotification({
                            type: 'success',
                            message: 'Safety settings updated successfully'
                          });
                          
                          setEditingSafety(false);
                          
                          // Refresh config data with longer delays
                          const refreshAttempts = [3000, 6000, 10000];
                          
                          refreshAttempts.forEach((delay, index) => {
                            setTimeout(async () => {
                              try {
                                console.log(`🔄 Refresh attempt ${index + 1}/${refreshAttempts.length} after ${delay}ms`);
                                const configPackets = await getAnalyticsByFilter(imei, "config_or_misc");
                                
                                if (configPackets && configPackets.length > 0) {
                                  const latestData = configPackets[0];
                                  
                                  console.log('📊 Latest safety data from backend:', {
                                    TemperatureLimit: latestData.rawTemperature,
                                    SpeedLimit: latestData.rawSpeedLimit
                                  });
                                  
                                  // Always update with latest data
                                  setConfigData(latestData);
                                  setSafetySettings({
                                    TemperatureLimit: latestData.rawTemperature || '',
                                    SpeedLimit: latestData.rawSpeedLimit || ''
                                  });
                                  
                                  console.log(`✅ Config data refreshed (attempt ${index + 1})`);
                                }
                              } catch (err) {
                                console.warn(`Failed refresh attempt ${index + 1}:`, err);
                              }
                            }, delay);
                          });
                          
                          setTimeout(() => setNotification(null), 5000);
                        } catch (error) {
                          setNotification({
                            type: 'error',
                            message: 'Failed to update safety settings'
                          });
                        } finally {
                          setCommandLoading(false);
                        }
                      }}
                      disabled={commandLoading}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {commandLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingSafety(false);
                        setSafetySettings({
                          TemperatureLimit: configData?.rawTemperature || '',
                          SpeedLimit: configData?.rawSpeedLimit || ''
                        });
                        setSafetyErrors({});
                      }}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <i className="fas fa-thermometer-half text-orange-600 text-xl mb-1 block text-center"></i>
                  <div className="text-gray-600 text-xs text-center">Temperature Limit</div>
                  {editingSafety ? (
                    <div>
                      <input
                        type="text"
                        value={safetySettings.TemperatureLimit}
                        onChange={(e) => {
                          setSafetySettings({...safetySettings, TemperatureLimit: e.target.value});
                          if (safetyErrors.TemperatureLimit) {
                            setSafetyErrors({...safetyErrors, TemperatureLimit: ''});
                          }
                        }}
                        className={`text-orange-600 font-bold text-lg text-center border rounded px-2 py-1 w-full ${
                          safetyErrors.TemperatureLimit ? 'border-red-500 bg-red-50' : 'border-orange-300'
                        }`}
                        placeholder="50"
                      />
                      {safetyErrors.TemperatureLimit && (
                        <p className="text-red-600 text-xs mt-1">{safetyErrors.TemperatureLimit}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-orange-600 font-bold text-lg text-center">{configData?.rawTemperature || 'Not Set'}°C</div>
                  )}
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <i className="fas fa-tachometer-alt text-red-600 text-xl mb-1 block text-center"></i>
                  <div className="text-gray-600 text-xs text-center">Speed Limit</div>
                  {editingSafety ? (
                    <div>
                      <input
                        type="text"
                        value={safetySettings.SpeedLimit}
                        onChange={(e) => {
                          setSafetySettings({...safetySettings, SpeedLimit: e.target.value});
                          if (safetyErrors.SpeedLimit) {
                            setSafetyErrors({...safetyErrors, SpeedLimit: ''});
                          }
                        }}
                        className={`text-red-600 font-bold text-lg text-center border rounded px-2 py-1 w-full ${
                          safetyErrors.SpeedLimit ? 'border-red-500 bg-red-50' : 'border-red-300'
                        }`}
                        placeholder="80"
                      />
                      {safetyErrors.SpeedLimit && (
                        <p className="text-red-600 text-xs mt-1">{safetyErrors.SpeedLimit}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-600 font-bold text-lg text-center">{configData?.rawSpeedLimit || 'Not Set'} Km/h</div>
                  )}
                </div>
              </div>
            </div>

            {/* Ambient Listen Section */}
            <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-gray-800 text-base font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-microphone text-teal-600 text-sm"></i>
                </div>
                Ambient Listen
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-100">
                  <span className="text-gray-700 font-medium text-sm">Listening Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isAmbientListenOn}
                      onChange={handleAmbientToggle}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-gray-700 font-medium text-sm">Ambient Status</span>
                  <span className={`text-sm font-bold ${isAmbientListenOn ? 'text-green-600' : 'text-red-600'}`}>
                    {isAmbientListenOn ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-gray-700 font-medium text-sm">Audio Files</span>
                  <button className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-colors">
                    <i className="fas fa-download text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modes Section - Compact Grid */}
          <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
            <h3 className="text-gray-800 text-base font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-sliders-h text-indigo-600 text-sm"></i>
              </div>
              Device Modes
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">Privacy</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">Aeroplane</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">DNT</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">Safe Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">Incognito</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">School</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-sm">LED</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isLedOn}
                      onChange={handleLedToggle}
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Advance Settings Section */}
          <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 text-base font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cog text-purple-600 text-sm"></i>
                </div>
                Advance Settings
              </h3>
              <button className="text-gray-500 hover:text-purple-600 transition-colors">
                <i className="fas fa-edit"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left Column */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Incoq. Sett. Allow</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">I/c Call Enable</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Call esc. matrix</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Extended GEO-F</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Accl Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">AI Power Save</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Battery Reserve</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Low Battery @ %</span>
                      <input 
                        type="text" 
                        defaultValue="30" 
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900 font-semibold text-sm"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Acess to Police</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Calling Enable</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">O/g call Enable</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Extended History</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Temp Comp.</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Ble Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">AI Anomaly</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium text-sm">Battery Reserved %</span>
                      <input 
                        type="text" 
                        defaultValue="10" 
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900 font-semibold text-sm"
                      />
                    </div>
                  </div>
                </div>

            {/* Check for Firmware Updates Button - Bottom Right */}
            <div className="mt-4 flex justify-end">
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-md transition-colors">
                Check for Firmware Updates
              </button>
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
