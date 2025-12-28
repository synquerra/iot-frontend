// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "../design-system/components/Card";
import { KpiCard } from "../design-system/components/KpiCard";
import { Table, TableContainer } from "../design-system/components/Table";
import { Loading } from "../design-system/components/Loading";
import {
  SectionDivider,
  GradientHeader,
  ContentSection,
  HierarchySection
} from "../design-system/components/LayoutComponents";
// Lazy-loaded components
import {
  EnhancedBarChart,
  EnhancedPieChart,
} from "../components/LazyCharts";

import { LeafletComponents } from "../components/LazyMap";

// Custom hooks for data management
import { useDashboardData } from "../hooks/useDashboardData";

/* ------------------------------------------------
   FitBounds — proper auto zoom for device path
---------------------------------------------------*/
const FitBounds = React.memo(function FitBounds({ path, useMap }) {
  const map = useMap();

  useEffect(() => {
    if (!path || path.length === 0) return;

    const bounds = path.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [path, map]);

  return null;
});

/* ------------------------------------------------
   MiniMap component
---------------------------------------------------*/
const MiniMap = React.memo(function MiniMap({ path }) {
  const fallback = [20.5937, 78.9629]; // India

  return (
    <div className="rounded-lg overflow-hidden border border-border-primary shadow-sm h-80">
      <LeafletComponents>
        {({ MapContainer, TileLayer, Marker, Polyline, Popup, useMap }) => (
          <MapContainer
            center={fallback}
            zoom={5}
            scrollWheelZoom
            style={{ height: "100%" }}
          >
            <FitBounds path={path} useMap={useMap} />

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
        )}
      </LeafletComponents>
    </div>
  );
});

/* ------------------------------------------------
   Small UI components
---------------------------------------------------*/
const KPI = React.memo(function KPI({ title, value, subtitle, color, trend, trendValue }) {
  // Convert legacy KPI to new KpiCard format
  const getTypeFromColor = (color) => {
    if (color?.includes('status-info') || color?.includes('blue')) return 'performance';
    if (color?.includes('status-success') || color?.includes('green')) return 'status';
    if (color?.includes('status-warning') || color?.includes('amber')) return 'performance';
    return 'performance';
  };

  const getTrendFromColor = (color) => {
    if (color?.includes('status-success') || color?.includes('green')) return 'up';
    if (color?.includes('status-warning') || color?.includes('amber')) return 'stable';
    if (color?.includes('status-error') || color?.includes('red')) return 'down';
    return undefined;
  };

  return (
    <KpiCard
      title={title}
      value={value}
      subtitle={subtitle}
      type={getTypeFromColor(color)}
      trend={trend || getTrendFromColor(color)}
      trendValue={trendValue}
      size="md"
      animated={true}
    />
  );
});

const MiniStat = React.memo(function MiniStat({ label, value }) {
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
});

/* ------------------------------------------------
   MAIN DASHBOARD
---------------------------------------------------*/
export default function Dashboard() {
  // Use the custom dashboard data hook with caching
  const {
    totalAnalytics,
    recentAnalytics,
    devices,
    speedChart,
    geoPie,
    locationPath,
    selectedImei,
    stats: memoizedStats,
    loading,
    locationLoading,
    error,
    loadHistory,
    refreshDashboard,
    addOptimisticAnalytics
  } = useDashboardData();

  // Memoized chart data
  const memoizedChartData = useMemo(() => ({
    speedChart,
    geoPie
  }), [speedChart, geoPie]);

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
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <GradientHeader
        title="Overview"
        subtitle="Live analytics dashboard with comprehensive device monitoring"
        variant="gradient"
        colorScheme="violet"
        size="lg"
      />

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="violet" 
        spacing="md" 
        animated={true}
      />

      {/* Header Actions Section */}
      <ContentSection variant="subtle" colorScheme="slate" padding="md" spacing="sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-text-secondary">Real-time system monitoring and analytics</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8">
              <MiniStat label="Devices" value={memoizedStats.devicesCount} />
              <MiniStat label="Recent" value={memoizedStats.recentCount} />
            </div>

            {/* REFRESH BUTTON */}
            <button
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border border-violet-500/30 rounded-lg text-white font-medium transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-105"
              onClick={refreshDashboard}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </div>
            </button>
          </div>
        </div>
      </ContentSection>

      {/* KPIs with Enhanced Color-Coded Cards */}
      <HierarchySection level={1} colorScheme="violet" spacing="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPI 
            title="Total Analytics" 
            value={memoizedStats.totalAnalytics} 
            subtitle="All datapoints" 
            color="text-status-info"
            type="performance"
            colorScheme="blue"
            trend="up"
            trendValue="+12%"
          />

          <KPI 
            title="Total Devices" 
            value={memoizedStats.devicesCount} 
            subtitle="Active devices" 
            color="text-status-success"
            type="status"
            colorScheme="green"
            trend="stable"
          />

          <KPI 
            title="Recent Data" 
            value={memoizedStats.recentCount} 
            subtitle="Last 10 datapoints" 
            color="text-status-warning"
            type="performance"
            colorScheme="amber"
            trend="up"
            trendValue="+5%"
          />
        </div>
      </HierarchySection>

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="rainbow" 
        spacing="lg" 
        animated={true}
      />

      {/* MAP SECTION */}
      <ContentSection variant="accent" colorScheme="blue" padding="lg" spacing="md" bordered={true} elevated={true}>
        <Card variant="gradient" padding="lg" colorScheme="blue" glowEffect={true}>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <Card.Title className="text-white">Device Location Map</Card.Title>
              <select
                value={selectedImei}
                onChange={(e) => loadHistory(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 text-white border border-blue-500/30 rounded-lg hover:border-blue-400/50 focus:border-blue-400 focus:outline-none transition-colors backdrop-blur-sm"
              >
                <option value="">Select device</option>
                {devices.map((d) => (
                  <option key={d.imei} value={d.imei} className="bg-slate-800 text-white">
                    {d.imei}
                  </option>
                ))}
              </select>
            </div>
          </Card.Header>

          <Card.Content className="pt-6">
            {selectedImei ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg -z-10" />
                {locationLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <Loading 
                      type="spinner" 
                      size="md" 
                      text="Loading location data..." 
                      textPosition="bottom"
                    />
                  </div>
                ) : (
                  <MiniMap path={locationPath} />
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-300">
                <div className="text-lg font-medium mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  No device selected
                </div>
                <div className="text-sm text-slate-400">Select a device from the dropdown to view its location history</div>
              </div>
            )}
          </Card.Content>
        </Card>
      </ContentSection>

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="teal" 
        spacing="md" 
        animated={true}
      />

      {/* CHARTS with Enhanced Colors and Animations */}
      <HierarchySection level={2} colorScheme="teal" spacing="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Speed Chart */}
          <ContentSection variant="highlighted" colorScheme="amber" padding="lg" bordered={true}>
            <Card variant="gradient" padding="lg" colorScheme="amber" glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Speed Distribution</Card.Title>
                <Card.Description className="text-amber-100">Distribution of vehicle speeds across all analytics data</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg -z-10" />
                  <EnhancedBarChart
                    data={memoizedChartData.speedChart}
                    bars={[{ dataKey: 'count', name: 'Count' }]}
                    height={256}
                    layout="vertical"
                    animated={true}
                    colorVariant="vibrant"
                  />
                </div>
              </Card.Content>
            </Card>
          </ContentSection>

          {/* Geo Pie Chart */}
          <ContentSection variant="highlighted" colorScheme="green" padding="lg" bordered={true}>
            <Card variant="gradient" padding="lg" colorScheme="green" glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Device Geo Distribution</Card.Title>
                <Card.Description className="text-green-100">Geographic distribution of registered devices</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg -z-10" />
                  <EnhancedPieChart
                    data={memoizedChartData.geoPie}
                    height={256}
                    innerRadius={50}
                    outerRadius={90}
                    animated={true}
                    colorCombination={0}
                    paddingAngle={2}
                  />
                </div>
              </Card.Content>
            </Card>
          </ContentSection>
        </div>
      </HierarchySection>

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="dotted" 
        colorScheme="pink" 
        spacing="lg" 
        animated={true}
      />

      {/* Recent Analytics Table */}
      <ContentSection variant="subtle" colorScheme="purple" padding="lg" spacing="md" bordered={true}>
        <Card variant="gradient" padding="lg" colorScheme="purple" glowEffect={true}>
          <Card.Header>
            <Card.Title className="text-white">Latest Analytics</Card.Title>
            <Card.Description className="text-purple-100">Most recent analytics data from all devices</Card.Description>
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
                      <span className="font-mono text-text-primary bg-violet-500/10 px-2 py-1 rounded-md border border-violet-500/20">
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'speed',
                    header: 'Speed',
                    render: (value) => {
                      const speed = Number(value);
                      const colorClass = speed > 60 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                                        speed > 30 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                        'text-green-400 bg-green-500/10 border-green-500/20';
                      return (
                        <span className={`px-2 py-1 rounded-md border font-medium ${colorClass}`}>
                          {value} km/h
                        </span>
                      );
                    }
                  },
                  {
                    key: 'latitude',
                    header: 'Latitude',
                    render: (value) => (
                      <span className="font-mono text-text-secondary bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                        {Number(value).toFixed(4)}
                      </span>
                    )
                  },
                  {
                    key: 'longitude',
                    header: 'Longitude',
                    render: (value) => (
                      <span className="font-mono text-text-secondary bg-teal-500/10 px-2 py-1 rounded-md border border-teal-500/20">
                        {Number(value).toFixed(4)}
                      </span>
                    )
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    render: (value) => (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-medium border border-purple-500/30">
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
      </ContentSection>

      {/* Final Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="orange" 
        spacing="md" 
        animated={true}
      />

      {/* Devices Table */}
      <ContentSection variant="accent" colorScheme="red" padding="lg" spacing="md" bordered={true} elevated={true}>
        <Card variant="gradient" padding="lg" colorScheme="red" glowEffect={true}>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <div>
                <Card.Title className="text-white">Devices</Card.Title>
                <Card.Description className="text-red-100">Overview of registered devices in the system</Card.Description>
              </div>
              <div className="text-sm text-red-200 font-medium bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
                {memoizedStats.devicesCount} devices shown
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
                      <span className="font-medium text-text-primary bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'imei',
                    header: 'IMEI',
                    render: (value) => (
                      <span className="font-mono text-text-secondary bg-slate-500/10 px-2 py-1 rounded-md border border-slate-500/20">
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'interval',
                    header: 'Interval',
                    render: (value) => {
                      const interval = Number(value);
                      const colorClass = interval < 30 ? 'text-green-400 bg-green-500/10 border-green-500/20' : 
                                        interval < 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                        'text-red-400 bg-red-500/10 border-red-500/20';
                      return (
                        <span className={`px-2 py-1 rounded-md border font-medium ${colorClass}`}>
                          {value}s
                        </span>
                      );
                    }
                  },
                  {
                    key: 'geoid',
                    header: 'Geo ID',
                    render: (value) => (
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded-md text-xs font-medium border border-pink-500/30">
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
      </ContentSection>
    </div>
  );
}
