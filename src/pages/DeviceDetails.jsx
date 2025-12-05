// src/pages/DeviceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnalyticsByImei, getAllAnalytics } from "../utils/analytics";

/* ------------------------------------
   TIMESTAMP HELPERS
------------------------------------- */

/**
 * Robust parser for timestamps coming from backend.
 * Accepts ISO with timezone or naive ISO (treated as local).
 */
function parseISTTimestamp(ts) {
  if (!ts) return null;
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

/**
 * Format a Date -> DD-MM-YYYY hh:mm:ss AM/PM
 */
function formatIST(dateObj) {
  if (!dateObj) return "-";
  const d = dateObj instanceof Date ? dateObj : parseISTTimestamp(dateObj);
  if (!d || isNaN(d.getTime())) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  let hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${day}-${month}-${year} ${String(hour).padStart(2, "0")}:${minute}:${second} ${ampm}`;
}

function formatRaw(ts) {
  if (!ts) return "-";
  const d = parseISTTimestamp(ts);
  if (!d) return ts;
  return formatIST(d);
}

function extractRawTime(ts) {
  if (!ts) return "--:--:--";
  const d = parseISTTimestamp(ts);
  if (d) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  const m = String(ts).match(/T?(\d{2}:\d{2}:\d{2})/);
  return m ? m[1] : ts;
}

function timeAgo(d) {
  if (!d) return "-";
  const date = d instanceof Date ? d : parseISTTimestamp(d);
  if (!date || isNaN(date.getTime())) return "-";

  const diff = Date.now() - date.getTime();
  if (diff < 0) return "just now";

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (sec < 60) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

/* ------------------------------------
   FIXED SORT LOGIC
------------------------------------- */

// <<< FIX: This function determines correct sorting priority
function getSortDate(p) {
  if (p.deviceTimestamp) return parseISTTimestamp(p.deviceTimestamp);
  if (p.timestamp) return parseISTTimestamp(p.timestamp);
  return null;
}

/* ------------------------------------
   OLD EXTRACT TIMESTAMP (kept for backward mapping)
------------------------------------- */
function extractTimestamp(p) {
  if (!p) return null;

  if (p.deviceTimestamp) return parseISTTimestamp(p.deviceTimestamp);
  if (p.device_timestamp) return parseISTTimestamp(p.device_timestamp);

  // backend normalized timestamp fallback
  if (p.timestamp) return parseISTTimestamp(p.timestamp);

  return null;
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
  const b = p?.battery ?? p?.Battery ?? p?.rawBattery ?? p?.raw?.raw_Battery;
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

function estimateRuntimeHours(battery) {
  if (battery == null || battery === "" || Number.isNaN(Number(battery)))
    return "-";
  const b = Number(battery);
  if (b >= 80) return "20–30 hrs";
  if (b >= 60) return "12–18 hrs";
  if (b >= 40) return "8–12 hrs";
  if (b >= 20) return "4–7 hrs";
  return "1–3 hrs";
}

/* ------------------------------------
   DISTANCE HELPERS
------------------------------------- */

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
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
  const pts = list.filter((p) =>
    p.timestamp?.toISOString().startsWith(today)
  );
  if (pts.length < 2) return 0;

  let distance = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) continue;
    distance += haversine(
      Number(a.latitude),
      Number(a.longitude),
      Number(b.latitude),
      Number(b.longitude)
    );
  }
  return distance.toFixed(2);
}

function movementBreakdown(list) {
  let idle = 0;
  let moving = 0;
  list.forEach((p) => {
    if (!p || p.speed == null || Number.isNaN(Number(p.speed))) return;
    if (Number(p.speed) <= 2) idle++;
    else moving++;
  });
  const total = idle + moving;
  if (total === 0) return { idlePct: 0, movingPct: 0 };
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
  const [allPackets, setAllPackets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer;

    async function load() {
      try {
        const byImei = await getAnalyticsByImei(imei);
        let all = [];
        try {
          all = await getAllAnalytics();
        } catch {}
        setPackets(byImei || []);
        setAllPackets(all || []);
      } finally {
        setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [imei]);

  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (!packets || packets.length === 0)
    return <div className="p-8">No data found for {imei}</div>;

  /* Normalize incoming data and map raw fields */
  const normalized = packets.map((p) => {
    const rawTimestamp =
      p.rawTimestamp ??
      p.raw_timestamp ??
      (p.raw && (p.raw.rawTimestamp ?? p.raw.raw_timestamp)) ??
      null;

    const rawTemperature =
      p.raw_temperature ??
      p.rawTemperature ??
      (p.raw && (p.raw.raw_temperature ?? p.raw.rawTemperature)) ??
      null;

    const rawSpeed =
      p.raw_speed ??
      p.rawSpeed ??
      (p.raw && (p.raw.raw_speed ?? p.raw.rawSpeed)) ??
      null;

    const rawSignal =
      p.raw_Signal ??
      p.rawSignal ??
      (p.raw && (p.raw.raw_Signal ?? p.raw.rawSignal)) ??
      p.Signal ??
      null;

    const rawBattery =
      p.raw_Battery ??
      p.rawBattery ??
      (p.raw && (p.raw.raw_Battery ?? p.raw.rawBattery)) ??
      p.Battery ??
      null;

    const rawGeoid =
      p.raw_Geoid ??
      p.rawGeoid ??
      (p.raw && (p.raw.raw_Geoid ?? p.raw.rawGeoid)) ??
      p.Geoid ??
      null;

    const parsedSpeed =
      p.speed != null
        ? Number(p.speed)
        : rawSpeed
        ? Number(String(rawSpeed).replace(/[^\d.-]/g, ""))
        : NaN;

    const parsedBattery =
      p.battery != null
        ? Number(p.battery)
        : p.Battery != null
        ? Number(String(p.Battery).replace(/[^\d.-]/g, ""))
        : rawBattery
        ? Number(String(rawBattery).replace(/[^\d.-]/g, ""))
        : NaN;

    const latitude =
      p.latitude ??
      p.raw_latitude ??
      p.rawLatitude ??
      (p.raw && (p.raw.raw_latitude ?? p.raw.rawLatitude)) ??
      null;

    const longitude =
      p.longitude ??
      p.raw_longitude ??
      p.rawLongitude ??
      (p.raw && (p.raw.raw_longitude ?? p.raw.rawLongitude)) ??
      null;

    return {
      raw: p,
      rawTimestamp,
      rawTemperature,
      rawSpeed,
      rawSignal,
      rawBattery,
      rawGeoid,

      packetType:
        (p.packet && String(p.packet).toUpperCase()) ||
        (p.type && String(p.type).toUpperCase()) ||
        null,

      imei: p.imei ?? p.raw_imei ?? p.rawImei ?? null,
      speed: Number.isNaN(parsedSpeed) ? null : parsedSpeed,
      battery: Number.isNaN(parsedBattery) ? null : parsedBattery,
      latitude,
      longitude,
      alert:
        p.alert ??
        p.Alert ??
        p.rawAlert ??
        p.raw_Alert ??
        (p.raw && (p.raw.rawAlert ?? p.raw.raw_Alert)) ??
        null,

        deviceTimestamp:
        p.deviceTimestamp
          ? parseISTTimestamp(p.deviceTimestamp)
          : p.device_timestamp
          ? parseISTTimestamp(p.device_timestamp)
          : null,
      
      timestamp:
        p.deviceTimestamp
          ? parseISTTimestamp(p.deviceTimestamp)
          : p.timestamp
          ? parseISTTimestamp(p.timestamp)
          : null,
      
    };
  });

  /* <<< FIX: Correct sorting using getSortDate() */
  normalized.sort((a, b) => {
    const da = getSortDate(a);
    const db = getSortDate(b);
    return (db?.getTime() || 0) - (da?.getTime() || 0);
  });

  /* <<< FIX: TRUE last inserted packet */
  const latest = normalized[0] || {};

  /* <<< FIX: TRUE last inserted Normal packet */
  const normalPackets = normalized.filter(
    (x) => x.packetType === "N" || x.packetType === "PACKET_N"
  );

  normalPackets.sort((a, b) => {
    const da = getSortDate(a);
    const db = getSortDate(b);
    return (db?.getTime() || 0) - (da?.getTime() || 0);
  });

  const normal = normalPackets[0] || {};

  /* Alerts & Errors */
  const alertPackets = normalized.filter((x) => x.packetType === "A").slice(0, 5);

  const errorPackets = normalized
    .filter(
      (x) =>
        x.packetType === "E" ||
        (x.packetType === "A" &&
          x.alert &&
          String(x.alert).startsWith("E"))
    )
    .slice(0, 5);

  const highSpeedCount = normalized.filter((p) => p.speed != null && p.speed > 70).length;

  const highTempCount = normalized.filter((p) => {
    const t = p.rawTemperature ?? (p.raw && (p.raw.raw_temperature ?? p.raw.rawTemperature));
    if (!t) return false;
    const num = Number(String(t).replace(/[^\d.-]/g, ""));
    return !Number.isNaN(num) && num > 50;
  }).length;

  const lowBatteryCount = normalized.filter(
    (p) => (p.battery || p.battery === 0) && p.battery < 20
  ).length;

  /* ------------------------------------
     UI
  ------------------------------------- */

  return (
    <div className="p-6 bg-[#0f1724] min-h-screen text-white">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Data Telemetry</h2>
          <div className="w-32 h-0.5 bg-gray-500 mx-auto mt-2"></div>
        </div>

        {/* HEADER — always LAST PACKET */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 grid grid-cols-2">
          <div>
            <div className="text-sm text-slate-400">IMEI (Device)</div>
            <div className="text-lg font-semibold">{latest?.imei ?? "-"}</div>

            <div className="mt-3 text-sm text-slate-400">Firmware Version</div>
            <div>–</div>

            <div className="mt-3 text-sm text-slate-400">Device Status</div>
            <div className="text-green-400 font-medium">Online</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Last Seen (Device Time)</div>

            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <div>
                  <span className="text-green-300 font-semibold text-lg">
                              {latest?.deviceTimestamp
              ? formatIST(latest.deviceTimestamp)
              : latest?.timestamp
              ? formatIST(latest.timestamp)
              : "--"}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {latest?.rawTimestamp ? (
                    <span>Your device sent: {extractRawTime(latest.rawTimestamp)}</span>
                  ) : latest?.deviceTimestamp ? (
                    <span>Your device sent: {extractRawTime(latest.deviceTimestamp)}</span>
                  ) : (
                    <span>Your device sent: --:--:--</span>
                  )}
                </div>
              </div>

              <span className="text-xs bg-green-700 px-2 py-0.5 rounded">
                {latest?.rawTimestamp
                  ? timeAgo(parseISTTimestamp(latest.rawTimestamp))
                  : latest?.deviceTimestamp
                  ? timeAgo(latest.deviceTimestamp)
                  : latest?.timestamp
                  ? timeAgo(latest.timestamp)
                  : "--"}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-1 text-sm text-slate-300">
              <span className="font-semibold">Packet:</span>
              <span className="font-bold text-green-300">
                {latest?.packetType ?? "-"}
                {latest?.alert ? ` (${latest.alert})` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* NORMAL PACKET — Always last N */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-300 text-lg font-semibold">Normal Packet (N)</h3>

            <div className="flex gap-2">
              <span className={`${getGpsStatus(normal).color} text-xs px-2 py-1 rounded`}>
                {getGpsStatus(normal).text}
              </span>
              <span className={`${getSpeedStatus(normal).color} text-xs px-2 py-1 rounded`}>
                {getSpeedStatus(normal).text}
              </span>
              <span className={`${getBatteryStatus(normal).color} text-xs px-2 py-1 rounded`}>
                Battery: {getBatteryStatus(normal).text}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">GEO ID</span>
                <span>{normal?.rawGeoid ?? "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Latitude</span>
                <span>{normal?.latitude ?? "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Speed</span>
                <span>
                  {normal?.speed ??
                    (normal?.rawSpeed ? String(normal.rawSpeed).replace(/[^\d.-]/g, "") : "-")}{" "}
                  Km/hr
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Signal</span>
                <span>
                  {normal?.rawSignal ??
                    normal?.raw?.raw_Signal ??
                    normal?.raw?.Signal ??
                    normal?.Signal ??
                    "-"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">GEO Number</span>
                <span>-</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Longitude</span>
                <span>{normal?.longitude ?? "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp (Device)</span>
                <span>
                  {normal?.rawTimestamp
                    ? formatRaw(normal.rawTimestamp)
                    : normal?.deviceTimestamp
                    ? formatIST(normal.deviceTimestamp)
                    : normal?.timestamp
                    ? formatIST(normal.timestamp)
                    : "--"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Battery</span>
                <span>
                  {normal?.battery ??
                    normal?.rawBattery ??
                    normal?.raw?.raw_Battery ??
                    normal?.Battery ??
                    "-"}
                </span>
              </div>
            </div>

            <div className="col-span-2 flex justify-between">
              <span className="text-slate-400">Temperature</span>
              <span>{normal?.rawTemperature ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* Rest of your UI (unchanged)… */}
        {/* Battery Insights */}
        <div className="col-span-2 bg-slate-800 p-3 rounded mt-3">
          <h4 className="text-sm font-semibold text-green-300 mb-2">Battery Insights</h4>
          <div className="text-xs space-y-1">
            <div>
              <span className="text-slate-400">Health:</span> {getBatteryStatus(normal).text}
            </div>
            <div>
              <span className="text-slate-400">Estimated Runtime Left:</span>{" "}
              {estimateRuntimeHours(normal?.battery ?? normal?.rawBattery)}
            </div>
            <div>
              <span className="text-slate-400">Last Battery Update:</span>{" "}
              {normal?.timestamp ? formatIST(normal.timestamp) : "-"}
            </div>
          </div>
        </div>

        {/* MOVEMENT & DISTANCE */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
          <h3 className="text-lg text-cyan-300 font-semibold mb-3">Device Activity Summary</h3>

          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Distance Travelled Today</span>
            <span>{computeTodayDistance(normalized)} km</span>
          </div>

          {(() => {
            const m = movementBreakdown(normalized);
            return (
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Idle / Moving</span>
                <span>
                  {m.idlePct}% idle • {m.movingPct}% moving
                </span>
              </div>
            );
          })()}

          {latest?.latitude && latest?.longitude && (
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

        {/* ALERTS */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg text-yellow-400 font-semibold mb-3">Alert Packet (A)</h3>

          {alertPackets.length === 0 ? (
            <div className="text-slate-500">No alerts</div>
          ) : (
            alertPackets.map((a, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">⚠</span>
                  <span className="text-yellow-300 font-semibold">A({a.alert})</span>
                </div>
                <span className="text-yellow-200">
                  {a.rawTimestamp
                    ? formatRaw(a.rawTimestamp)
                    : a.deviceTimestamp
                    ? formatIST(a.deviceTimestamp)
                    : a.timestamp
                    ? formatIST(a.timestamp)
                    : "-"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* ERRORS */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg text-red-400 font-semibold mb-3">Error Packet (E)</h3>

          {errorPackets.length === 0 ? (
            <div className="text-slate-500">No errors</div>
          ) : (
            errorPackets.map((e, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠</span>
                  <span className="text-red-300 font-semibold">{e.alert}</span>
                </div>
                <span className="text-red-300">
                  {e.rawTimestamp
                    ? formatRaw(e.rawTimestamp)
                    : e.deviceTimestamp
                    ? formatIST(e.deviceTimestamp)
                    : e.timestamp
                    ? formatIST(e.timestamp)
                    : "-"}
                </span>
              </div>
            ))
          )}
        </div>

       {/* E-SIM MANAGEMENT (Static) */}
       <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
          <h3 className="text-lg font-semibold mb-3 text-center">E-Sim Management</h3>

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
                  <span className={sim === 1 ? "text-green-400" : "text-red-400"}>{sim === 1 ? "75%" : "23%"}</span>
                  <span>Roaming</span>
                  <span className={sim === 1 ? "text-gray-300" : "text-yellow-400"}>{sim === 1 ? "Disable" : "Active"}</span>
                  <span>Fall Back Hist.</span>
                  <span>{sim === 1 ? "Sim 2 to Sim 1" : "05-11-2022 12:35:11"}</span>
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
                <button className="bg-yellow-400 text-black px-3 py-1 rounded">ACK</button>
                <button className="bg-green-500 px-3 py-1 rounded">Reset</button>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3">Telemetry Alert</h4>
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
