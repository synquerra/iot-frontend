// src/pages/DeviceDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnalyticsByImei, getAllAnalytics } from "../utils/analytics";

/* ------------------------------------
   TIMESTAMP HELPERS — FINAL VERSION
------------------------------------- */

/** 
 * timestamp format in DB:
 * "2025-12-03T15:38:05"
 * → THIS IS ALREADY IST
 * → NO TIMEZONE CONVERSION REQUIRED
 */
function parseISTTimestamp(ts) {
  if (!ts) return null;
  try {
    return new Date(ts); // treat as IST
  } catch {
    return null;
  }
}

/** 
 * Format -> DD-MM-YYYY hh:mm:ss AM/PM 
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

/** Time ago */
function timeAgo(d) {
  if (!d) return "-";
  const date = d instanceof Date ? d : parseISTTimestamp(d);
  if (!date) return "-";

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

/** Extract timestamp (using ONLY timestamp as you requested) */
function extractTimestamp(p) {
  return p?.timestamp ? parseISTTimestamp(p.timestamp) : null;
}

/* ------------------------------------
   STATUS HELPERS
------------------------------------- */
function getGpsStatus(p) {
  const lat = Number(p?.latitude);
  const lon = Number(p?.longitude);
  if (!lat || !lon) return { text: "No GPS", color: "bg-red-600" };

  const speed = Number(p?.speed ?? 0);
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
  const b = p?.battery ?? p?.Battery;
  const n = b == null ? NaN : Number(b);
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
    timer = setInterval(load, 50000);
    return () => clearInterval(timer);
  }, [imei]);

  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (packets.length === 0) return <div className="p-8">No data found for {imei}</div>;

  /* Normalize */
  const normalized = packets.map((p) => {
    const ts = extractTimestamp(p);
    const packetType =
      (p.packet && p.packet.toUpperCase()) ||
      (p.type && p.type.toUpperCase()) ||
      null;

    return {
      raw: p,
      packetType,
      imei: p.imei,
      speed: Number(p.speed),
      battery: Number(p.battery ?? p.Battery),
      latitude: p.latitude,
      longitude: p.longitude,
      alert: p.alert,
      timestamp: ts,
    };
  });

  /* Sort newest first */
  normalized.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

  const latest = normalized[0];

  /* Last Normal Packet */
  const normal = normalized
    .filter((x) => x.packetType === "N" || x.packetType === "PACKET_N")
    .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))[0];

  /* Alerts */
  const alertPackets = normalized.filter((x) => x.packetType === "A").slice(0, 5);

  /* Errors */
  const errorPackets = normalized
    .filter(
      (x) =>
        x.packetType === "E" ||
        (x.packetType === "A" && x.alert && String(x.alert).startsWith("E"))
    )
    .slice(0, 5);

  /* Telemetry */
  const highSpeedCount = normalized.filter((p) => p.speed > 70).length;
  const highTempCount = normalized.filter((p) => Number(p.raw?.temperature) > 50).length;
  const lowBatteryCount = normalized.filter((p) => p.battery < 20).length;

  /* ------------------------------------
     UI START
  ------------------------------------- */
  return (
    <div className="p-6 bg-[#0f1724] min-h-screen text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Data Telemetry</h2>
          <div className="w-32 h-0.5 bg-gray-500 mx-auto mt-2"></div>
        </div>

        {/* HEADER */}
        <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 grid grid-cols-2">
          <div>
            <div className="text-sm text-slate-400">IMEI (Device)</div>
            <div className="text-lg font-semibold">{latest.imei}</div>

            <div className="mt-3 text-sm text-slate-400">Firmware Version</div>
            <div>–</div>

            <div className="mt-3 text-sm text-slate-400">Device Status</div>
            <div className="text-green-400 font-medium">Online</div>
          </div>

          {/* RIGHT SIDE */}
          <div className="text-right">
            <div className="text-sm text-slate-400">Last Seen (IST)</div>

            <div className="flex items-center justify-end gap-3">
              <span className="text-green-300 font-semibold text-lg">
                {latest.timestamp ? formatIST(latest.timestamp) : "-"}
              </span>
              <span className="text-xs bg-green-700 px-2 py-0.5 rounded">
                {latest.timestamp ? timeAgo(latest.timestamp) : "-"}
              </span>
            </div>

            {/* Packet Type */}
            <div className="flex items-center justify-end gap-2 mt-1 text-sm text-slate-300">
              <span className="font-semibold">Packet:</span>
              <span className="font-bold text-green-300">
                {latest.packetType ?? "-"}
                {latest.alert ? `(${latest.alert})` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* NORMAL PACKET */}
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
              <div className="flex justify-between"><span className="text-slate-400">GEO ID</span><span>{normal?.raw?.geoid ?? "-"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Latitude</span><span>{normal?.latitude ?? "-"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Speed</span><span>{normal?.speed ?? "-"} Km/hr</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Signal</span><span>{normal?.raw?.signal ?? "-"}</span></div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">GEO Number</span><span>-</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Longitude</span><span>{normal?.longitude ?? "-"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Timestamp (IST)</span>
                <span>{normal?.timestamp ? formatIST(normal.timestamp) : "-"}</span>
              </div>
              <div className="flex justify-between"><span className="text-slate-400">Battery</span><span>{normal?.battery ?? "-"}</span></div>
            </div>

            <div className="col-span-2 flex justify-between">
              <span className="text-slate-400">Temperature</span>
              <span>{normal?.raw?.temperature ?? "-"}</span>
            </div>
          </div>
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
                  <span className="text-yellow-300 font-semibold">
                    A({a.alert})
                  </span>
                </div>
                <span className="text-yellow-200">
                  {a.timestamp ? formatIST(a.timestamp) : "-"}
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
                  {e.timestamp ? formatIST(e.timestamp) : "-"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* E-SIM MANAGEMENT (STATIC) */}
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
                  <span>SIM No.</span><span>–</span>
                  <span>MSDN No.</span><span>654135135</span>
                  <span>Profile Code</span><span>654135135</span>
                  <span>Data Usage</span><span>{sim === 1 ? "38/50 MB" : "3/10 MB"}</span>
                  <span>SMS</span><span>{sim === 1 ? "5/100" : "3/100"}</span>
                  <span>Signal %</span>
                  <span className={sim === 1 ? "text-green-400" : "text-red-400"}>
                    {sim === 1 ? "75%" : "23%"}
                  </span>
                  <span>Roaming</span>
                  <span className={sim === 1 ? "text-gray-300" : "text-yellow-400"}>
                    {sim === 1 ? "Disable" : "Active"}
                  </span>
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
