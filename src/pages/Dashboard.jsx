// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Card from "../components/Card";

import {
  getAnalyticsCount,
  getAnalyticsPaginated,
  getAllAnalytics,
  getAnalyticsByImei,
} from "../utils/analytics";

import { listDevices } from "../utils/device";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

// Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";

/* ------------------------------------------------
   FitBounds — proper auto zoom for device path
---------------------------------------------------*/
function FitBounds({ path }) {
  const map = useMap();

  useEffect(() => {
    if (!path || path.length === 0) return;

    const bounds = path.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [path]);

  return null;
}

/* ------------------------------------------------
   MiniMap component
---------------------------------------------------*/
function MiniMap({ path }) {
  const fallback = [20.5937, 78.9629]; // India

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 h-80">
      <MapContainer
        center={fallback}
        zoom={5}
        scrollWheelZoom
        style={{ height: "100%" }}
      >
        <FitBounds path={path} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Draw path */}
        {path.length > 1 && (
          <Polyline
            positions={path.map((p) => [p.lat, p.lng])}
            color="#1976d2"
            weight={4}
          />
        )}

        {/* Start */}
        {path.length > 0 && (
          <Marker position={[path[0].lat, path[0].lng]}>
            <Popup>
              Start<br />
              {path[0].time}
            </Popup>
          </Marker>
        )}

        {/* End */}
        {path.length > 1 && (
          <Marker
            position={[path[path.length - 1].lat, path[path.length - 1].lng]}
          >
            <Popup>
              End<br />
              {path[path.length - 1].time}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

/* ------------------------------------------------
   Small UI components
---------------------------------------------------*/
function KPI({ title, value, subtitle, color }) {
  return (
    <div className="flex flex-col">
      <div className="text-sm tracking-wider text-slate-400">{title}</div>
      <div className={`mt-2 text-3xl font-semibold ${color}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm text-white font-medium">{value}</div>
    </div>
  );
}

/* ------------------------------------------------
   MAIN DASHBOARD
---------------------------------------------------*/
export default function Dashboard() {
  const [totalAnalytics, setTotalAnalytics] = useState(0);
  const [recentAnalytics, setRecentAnalytics] = useState([]);
  const [devices, setDevices] = useState([]);

  const [speedChart, setSpeedChart] = useState([]);
  const [geoPie, setGeoPie] = useState([]);

  // Map states
  const [selectedImei, setSelectedImei] = useState("");
  const [locationPath, setLocationPath] = useState([]);

  // Load state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------------------------------------
       Load dashboard data
  ---------------------------------------------------*/
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const count = await getAnalyticsCount();
        if (mounted) setTotalAnalytics(Number(count) || 0);

        const recent = await getAnalyticsPaginated(0, 10);
        if (mounted) setRecentAnalytics(Array.isArray(recent) ? recent : []);

        const devResp = await listDevices();
        const devArr = Array.isArray(devResp.devices)
          ? devResp.devices
          : Array.isArray(devResp.full)
          ? devResp.full
          : [];

        if (mounted) setDevices(devArr.slice(0, 10));

        const all = await getAllAnalytics();
        if (mounted) {
          buildSpeedChart(all);
          buildGeoChart(devArr);
        }
      } catch (e) {
        if (mounted) setError(e.message || "Dashboard failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  /* ------------------------------------------------
       Chart builders
  ---------------------------------------------------*/
  function buildSpeedChart(data) {
    const ranges = {
      "0 - 20": 0,
      "20 - 40": 0,
      "40 - 60": 0,
      "60 - 80": 0,
      "80+": 0,
    };

    data.forEach((a) => {
      const s = Number(a.speed || 0);

      if (s <= 20) ranges["0 - 20"]++;
      else if (s <= 40) ranges["20 - 40"]++;
      else if (s <= 60) ranges["40 - 60"]++;
      else if (s <= 80) ranges["60 - 80"]++;
      else ranges["80+"]++;
    });

    setSpeedChart(
      Object.keys(ranges).map((key) => ({
        range: key,
        count: ranges[key],
      }))
    );
  }

  function buildGeoChart(devList) {
    const dist = {};
    devList.forEach((d) => {
      const g = d.geoid ?? "Unknown";
      dist[g] = (dist[g] || 0) + 1;
    });

    const colors = ["#1976d2", "#00b39f", "#ffb74d", "#9c27b0", "#ef5350"];

    setGeoPie(
      Object.keys(dist).map((g, i) => ({
        geoid: g,
        count: dist[g],
        color: colors[i % colors.length],
      }))
    );
  }

  /* ------------------------------------------------
       Load location history for map
  ---------------------------------------------------*/
  async function loadHistory(imei) {
    if (!imei) {
      setSelectedImei("");
      setLocationPath([]);
      return;
    }

    try {
      const data = await getAnalyticsByImei(imei);

      const formatted = data
        .map((p) => ({
          lat: Number(p.latitude),
          lng: Number(p.longitude),
          time: p.timestampIso || p.timestamp,
        }))
        .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));

      setSelectedImei(imei);
      setLocationPath(formatted);
    } catch (e) {
      console.error("path error:", e);
      setLocationPath([]);
    }
  }

  /* ------------------------------------------------
       Render
  ---------------------------------------------------*/
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        Loading dashboard…
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        {error}
      </div>
    );

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Live analytics dashboard</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6">
            <MiniStat label="Devices" value={devices.length} />
            <MiniStat label="Recent" value={recentAnalytics.length} />
          </div>

          {/* REFRESH BUTTON */}
          <button
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 hover:bg-slate-700 transition"
            onClick={async () => {
              try {
                setLoading(true);
                setError("");

                const [count, recent, devResp, all] = await Promise.all([
                  getAnalyticsCount(),
                  getAnalyticsPaginated(0, 10),
                  listDevices(),
                  getAllAnalytics(),
                ]);

                setTotalAnalytics(Number(count) || 0);
                setRecentAnalytics(recent);

                const dArr = Array.isArray(devResp.devices)
                  ? devResp.devices
                  : Array.isArray(devResp.full)
                  ? devResp.full
                  : [];

                setDevices(dArr.slice(0, 10));
                buildSpeedChart(all);
                buildGeoChart(dArr);
              } catch (e) {
                setError(e.message || "Failed to refresh");
              } finally {
                setLoading(false);
              }
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <KPI title="Total Analytics" value={totalAnalytics} subtitle="All datapoints" color="text-sky-400" />
        </Card>

        <Card className="p-6">
          <KPI title="Total Devices" value={devices.length} subtitle="Active devices" color="text-emerald-400" />
        </Card>

        <Card className="p-6">
          <KPI title="Recent Data" value={recentAnalytics.length} subtitle="Last 10 datapoints" color="text-amber-400" />
        </Card>
      </div>

      {/* MAP SECTION */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Device Location Map</h3>

          <select
            value={selectedImei}
            onChange={(e) => loadHistory(e.target.value)}
            className="px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded"
          >
            <option value="">Select device</option>
            {devices.map((d) => (
              <option key={d.imei} value={d.imei}>
                {d.imei}
              </option>
            ))}
          </select>
        </div>

        {selectedImei ? (
          <MiniMap path={locationPath} />
        ) : (
          <div className="text-center py-10 text-slate-500">
            Select a device to view map
          </div>
        )}
      </Card>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Speed Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Speed Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speedChart}>
                <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fill: "#9ca3af" }} />
                <YAxis tick={{ fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", color: "#fff" }} />
                <Bar dataKey="count" fill="#1976d2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Geo Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Device Geo Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={geoPie}
                  dataKey="count"
                  nameKey="geoid"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {geoPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Analytics Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">Latest Analytics</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">IMEI</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Lat</th>
                <th className="px-4 py-3">Lng</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalytics.map((a, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white">{a.imei}</td>
                  <td className="px-4 py-3">{a.speed}</td>
                  <td className="px-4 py-3">{a.latitude}</td>
                  <td className="px-4 py-3">{a.longitude}</td>
                  <td className="px-4 py-3">{a.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Devices Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Devices</h3>
          <div className="text-sm text-slate-400">{devices.length} shown</div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">IMEI</th>
                <th className="px-4 py-3">Interval</th>
                <th className="px-4 py-3">Geoid</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white">{d.topic}</td>
                  <td className="px-4 py-3">{d.imei}</td>
                  <td className="px-4 py-3">{d.interval}</td>
                  <td className="px-4 py-3">{d.geoid}</td>
                </tr>
              ))}

              {devices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
