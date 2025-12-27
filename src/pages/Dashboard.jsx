// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Card } from "../design-system/components/Card";
import { Table, TableContainer } from "../design-system/components/Table";
import { Loading } from "../design-system/components/Loading";

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
    <div className="rounded-lg overflow-hidden border border-border-primary shadow-sm h-80">
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
            color="#3b82f6"
            weight={3}
            opacity={0.8}
          />
        )}

        {/* Start */}
        {path.length > 0 && (
          <Marker position={[path[0].lat, path[0].lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium text-status-success">Start</div>
                <div className="text-text-secondary">{path[0].time}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End */}
        {path.length > 1 && (
          <Marker
            position={[path[path.length - 1].lat, path[path.length - 1].lng]}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium text-status-error">End</div>
                <div className="text-text-secondary">{path[path.length - 1].time}</div>
              </div>
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
    <div className="flex flex-col space-y-3">
      <div className="text-sm font-medium tracking-wide text-text-secondary uppercase">
        {title}
      </div>
      <div className={`text-3xl font-bold ${color} leading-none`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-text-tertiary">
          {subtitle}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="text-xs text-text-tertiary font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-text-primary font-semibold">
        {value}
      </div>
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

    // Consistent color scheme using design system colors
    const colors = [
      "#3b82f6", // status-info
      "#10b981", // status-success  
      "#f59e0b", // status-warning
      "#ef4444", // status-error
      "#7c3aed", // primary
      "#5eead4", // accent
    ];

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
      <div className="flex items-center justify-center h-screen">
        <Loading 
          type="spinner" 
          size="xl" 
          text="Loading dashboard..." 
          textPosition="bottom"
        />
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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-text-primary">Overview</h1>
          <p className="text-text-secondary">Live analytics dashboard</p>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8">
            <MiniStat label="Devices" value={devices.length} />
            <MiniStat label="Recent" value={recentAnalytics.length} />
          </div>

          {/* REFRESH BUTTON */}
          <button
            className="px-4 py-2 bg-interactive-secondary border border-border-primary rounded-lg text-text-primary hover:bg-interactive-secondaryHover hover:border-border-secondary transition-all duration-200 font-medium"
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
        <Card variant="elevated" padding="lg" hover={false}>
          <KPI 
            title="Total Analytics" 
            value={totalAnalytics} 
            subtitle="All datapoints" 
            color="text-status-info" 
          />
        </Card>

        <Card variant="elevated" padding="lg" hover={false}>
          <KPI 
            title="Total Devices" 
            value={devices.length} 
            subtitle="Active devices" 
            color="text-status-success" 
          />
        </Card>

        <Card variant="elevated" padding="lg" hover={false}>
          <KPI 
            title="Recent Data" 
            value={recentAnalytics.length} 
            subtitle="Last 10 datapoints" 
            color="text-status-warning" 
          />
        </Card>
      </div>

      {/* MAP SECTION */}
      <Card variant="default" padding="lg">
        <Card.Header>
          <div className="flex items-center justify-between w-full">
            <Card.Title>Device Location Map</Card.Title>
            <select
              value={selectedImei}
              onChange={(e) => loadHistory(e.target.value)}
              className="px-3 py-2 bg-surface-secondary text-text-primary border border-border-primary rounded-lg hover:border-border-secondary focus:border-border-accent focus:outline-none transition-colors"
            >
              <option value="">Select device</option>
              {devices.map((d) => (
                <option key={d.imei} value={d.imei}>
                  {d.imei}
                </option>
              ))}
            </select>
          </div>
        </Card.Header>

        <Card.Content className="pt-6">
          {selectedImei ? (
            <MiniMap path={locationPath} />
          ) : (
            <div className="text-center py-16 text-text-tertiary">
              <div className="text-lg font-medium mb-2">No device selected</div>
              <div className="text-sm">Select a device from the dropdown to view its location history</div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Speed Chart */}
        <Card variant="default" padding="lg">
          <Card.Header>
            <Card.Title>Speed Distribution</Card.Title>
            <Card.Description>Distribution of vehicle speeds across all analytics data</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedChart}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fill: "#cbd5e1", fontSize: 12 }} 
                    axisLine={{ stroke: "#475569" }}
                  />
                  <YAxis 
                    tick={{ fill: "#cbd5e1", fontSize: 12 }} 
                    axisLine={{ stroke: "#475569" }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "#1a2332", 
                      border: "1px solid #334155", 
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "14px"
                    }} 
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    stroke="#1e40af"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Geo Pie Chart */}
        <Card variant="default" padding="lg">
          <Card.Header>
            <Card.Title>Device Geo Distribution</Card.Title>
            <Card.Description>Geographic distribution of registered devices</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={geoPie}
                    dataKey="count"
                    nameKey="geoid"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="#334155"
                    strokeWidth={1}
                  >
                    {geoPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    wrapperStyle={{ 
                      color: "#cbd5e1", 
                      fontSize: "12px" 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "#1a2332", 
                      border: "1px solid #334155", 
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "14px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Analytics Table */}
      <Card variant="default" padding="lg">
        <Card.Header>
          <Card.Title>Latest Analytics</Card.Title>
          <Card.Description>Most recent analytics data from all devices</Card.Description>
        </Card.Header>
        <Card.Content>
          <TableContainer>
            <Table
              variant="bordered"
              size="md"
              hoverable={true}
              striped={false}
              data={recentAnalytics}
              columns={[
                {
                  key: 'imei',
                  header: 'IMEI',
                  render: (value) => (
                    <span className="font-mono text-text-primary">{value}</span>
                  )
                },
                {
                  key: 'speed',
                  header: 'Speed',
                  render: (value) => (
                    <span className="text-text-secondary">{value} km/h</span>
                  )
                },
                {
                  key: 'latitude',
                  header: 'Latitude',
                  render: (value) => (
                    <span className="font-mono text-text-secondary">{Number(value).toFixed(4)}</span>
                  )
                },
                {
                  key: 'longitude',
                  header: 'Longitude',
                  render: (value) => (
                    <span className="font-mono text-text-secondary">{Number(value).toFixed(4)}</span>
                  )
                },
                {
                  key: 'type',
                  header: 'Type',
                  render: (value) => (
                    <span className="px-2 py-1 bg-surface-tertiary text-text-primary rounded-md text-xs font-medium">
                      {value}
                    </span>
                  )
                }
              ]}
              emptyMessage="No recent analytics data available"
            />
          </TableContainer>
        </Card.Content>
      </Card>

      {/* Devices Table */}
      <Card variant="default" padding="lg">
        <Card.Header>
          <div className="flex items-center justify-between w-full">
            <div>
              <Card.Title>Devices</Card.Title>
              <Card.Description>Overview of registered devices in the system</Card.Description>
            </div>
            <div className="text-sm text-text-tertiary font-medium">
              {devices.length} devices shown
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <TableContainer>
            <Table
              variant="bordered"
              size="md"
              hoverable={true}
              striped={true}
              data={devices}
              columns={[
                {
                  key: 'topic',
                  header: 'Topic',
                  render: (value) => (
                    <span className="font-medium text-text-primary">{value}</span>
                  )
                },
                {
                  key: 'imei',
                  header: 'IMEI',
                  render: (value) => (
                    <span className="font-mono text-text-secondary">{value}</span>
                  )
                },
                {
                  key: 'interval',
                  header: 'Interval',
                  render: (value) => (
                    <span className="text-text-secondary">{value}s</span>
                  )
                },
                {
                  key: 'geoid',
                  header: 'Geo ID',
                  render: (value) => (
                    <span className="px-2 py-1 bg-surface-tertiary text-text-primary rounded-md text-xs font-medium">
                      {value || 'Unknown'}
                    </span>
                  )
                }
              ]}
              emptyMessage="No devices found in the system"
            />
          </TableContainer>
        </Card.Content>
      </Card>
    </div>
  );
}
