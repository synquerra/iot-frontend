// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "../design-system/components/Card";
import { KpiCard } from "../design-system/components/KpiCard";
import { Table, TableContainer } from "../design-system/components/Table";
import { 
  EnhancedTable, 
  EnhancedTableContainer,
  StatusBadge 
} from "../design-system/components/EnhancedTable";
import { Loading } from "../design-system/components/Loading";
import {
  SectionDivider,
  GradientHeader,
  ContentSection,
  HierarchySection
} from "../design-system/components/LayoutComponents";
// Enhanced Dashboard Header
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
// Lazy-loaded components
import {
  EnhancedBarChart,
  EnhancedPieChart,
} from "../components/LazyCharts";

import { LeafletComponents } from "../components/LazyMap";

// Custom hooks for data management
import { useDashboardData } from "../hooks/useDashboardData";

// Design system utilities
import { cn } from "../design-system/utils/cn";

// Performance monitoring utilities
import { usePerformanceMonitor, createPerformanceProfiler } from "../utils/performanceMonitor";
import { performanceMonitor } from "../design-system/utils/performance";

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
   MiniMap component with enhanced styling and performance optimizations
---------------------------------------------------*/
const MiniMap = React.memo(function MiniMap({ path }) {
  const fallback = [20.5937, 78.9629]; // India

  // Performance monitoring for map component
  const { metrics, recordRender } = usePerformanceMonitor('MiniMap');
  
  // Memoize path positions to avoid recalculation
  const pathPositions = useMemo(() => {
    return path.map((p) => [p.lat, p.lng]);
  }, [path]);

  // Memoize map styles to prevent unnecessary re-renders
  const mapStyles = useMemo(() => ({
    height: "100%", 
    width: "100%"
  }), []);

  useEffect(() => {
    recordRender();
  });

  return (
    <div className={cn(
      'rounded-xl overflow-hidden shadow-2xl',
      'border border-white/20 backdrop-blur-sm',
      'h-full w-full relative',
      // Responsive height constraints
      'min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]'
    )}>
      <LeafletComponents>
        {({ MapContainer, TileLayer, Marker, Polyline, Popup, useMap }) => (
          <MapContainer
            center={fallback}
            zoom={5}
            scrollWheelZoom
            style={mapStyles}
            className="rounded-xl"
          >
            <FitBounds path={path} useMap={useMap} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />

            {/* Enhanced path rendering with gradient and improved visualization */}
            {path.length > 1 && (
              <>
                {/* Shadow path for depth effect */}
                <Polyline
                  positions={pathPositions}
                  color="#1e293b"
                  weight={6}
                  opacity={0.3}
                  className="drop-shadow-xl"
                />
                {/* Main gradient path */}
                <Polyline
                  positions={pathPositions}
                  color="#3b82f6"
                  weight={4}
                  opacity={0.95}
                  className="drop-shadow-lg"
                  dashArray="0"
                />
                {/* Animated overlay path for movement effect */}
                <Polyline
                  positions={pathPositions}
                  color="#60a5fa"
                  weight={2}
                  opacity={0.7}
                  dashArray="10, 5"
                  className="animate-pulse"
                />
              </>
            )}

            {/* Enhanced start marker with improved styling */}
            {path.length > 0 && (
              <Marker position={[path[0].lat, path[0].lng]}>
                <Popup className="rounded-lg shadow-xl backdrop-blur-md">
                  <div className="text-sm p-3 bg-white/95 backdrop-blur-sm rounded-lg border border-green-200/50">
                    <div className="font-bold text-green-600 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Journey Start
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs font-medium mb-1">{path[0].time}</div>
                    <div className="text-gray-500 text-xs font-mono bg-gray-100/80 px-2 py-1 rounded border">
                      {path[0].lat.toFixed(4)}, {path[0].lng.toFixed(4)}
                    </div>
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      📍 Starting Point
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Enhanced end marker with improved styling */}
            {path.length > 1 && (
              <Marker
                position={[path[path.length - 1].lat, path[path.length - 1].lng]}
              >
                <Popup className="rounded-lg shadow-xl backdrop-blur-md">
                  <div className="text-sm p-3 bg-white/95 backdrop-blur-sm rounded-lg border border-red-200/50">
                    <div className="font-bold text-red-600 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                      <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        Journey End
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs font-medium mb-1">{path[path.length - 1].time}</div>
                    <div className="text-gray-500 text-xs font-mono bg-gray-100/80 px-2 py-1 rounded border">
                      {path[path.length - 1].lat.toFixed(4)}, {path[path.length - 1].lng.toFixed(4)}
                    </div>
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      🏁 Destination
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </LeafletComponents>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.path.length === nextProps.path.length &&
    prevProps.path.every((point, index) => 
      point.lat === nextProps.path[index]?.lat &&
      point.lng === nextProps.path[index]?.lng &&
      point.time === nextProps.path[index]?.time
    )
  );
});

/* ------------------------------------------------
   Small UI components
---------------------------------------------------*/

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
      {/* Enhanced Dashboard Header with Gradient Design */}
      <DashboardHeader
        title="IoT Analytics Dashboard"
        subtitle="Live analytics dashboard with comprehensive device monitoring and real-time insights"
        stats={{
          devicesCount: memoizedStats.devicesCount,
          recentCount: memoizedStats.recentCount,
          totalAnalytics: memoizedStats.totalAnalytics,
          // Add trend data for enhanced statistics
          devicesTrend: "stable",
          recentTrend: "up",
          recentTrendValue: "+5%",
          totalTrend: "up",
          totalTrendValue: "+12%"
        }}
        onRefresh={refreshDashboard}
        loading={loading}
        colorScheme="violet"
        size="lg"
        showStats={true}
      />

      {/* Enhanced KPI Section with Gradient Backgrounds and Responsive Layout */}
      <HierarchySection level={1} colorScheme="violet" spacing="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Total Analytics KPI with Performance Styling */}
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <KpiCard
              title="Total Analytics"
              value={memoizedStats.totalAnalytics}
              subtitle="All datapoints collected"
              type="performance"
              colorScheme="blue"
              trend="up"
              trendValue="+12%"
              size="lg"
              animated={true}
              className="relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>

          {/* Total Devices KPI with Status Styling */}
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <KpiCard
              title="Active Devices"
              value={memoizedStats.devicesCount}
              subtitle="Connected IoT devices"
              type="status"
              colorScheme="green"
              trend="stable"
              trendValue="100%"
              size="lg"
              animated={true}
              className="relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.25) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.4)',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>

          {/* Recent Data KPI with Growth Styling */}
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
            <KpiCard
              title="Recent Activity"
              value={memoizedStats.recentCount}
              subtitle="Latest data points"
              type="growth"
              colorScheme="amber"
              trend="up"
              trendValue="+5%"
              size="lg"
              animated={true}
              className="relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>
        </div>

        {/* Enhanced Visual Effects for KPI Section */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-amber-500 opacity-30 animate-pulse" />
          
          {/* Subtle glow effects */}
          <div className="absolute top-4 left-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-4 right-4 w-32 h-32 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
      </HierarchySection>

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="rainbow" 
        spacing="lg" 
        animated={true}
      />

      {/* ENHANCED MAP SECTION with Glassmorphism and Improved Interactions */}
      <ContentSection variant="accent" colorScheme="blue" padding="lg" spacing="md" bordered={true} elevated={true}>
        {/* Enhanced Gradient Card Wrapper with Advanced Glassmorphism Effects */}
        <Card 
          variant="glass" 
          padding="lg" 
          colorScheme="blue" 
          glowEffect={true}
          hover={true}
          className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-blue-600/25 via-cyan-600/20 to-teal-600/25 border border-blue-400/40 shadow-2xl shadow-blue-500/30 transition-all duration-500 ease-out hover:shadow-blue-500/40 hover:border-blue-300/50"
        >
          {/* Enhanced Background Effects with Multiple Layers */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Primary animated gradient mesh */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/8 via-transparent to-cyan-500/8 animate-pulse" />
            
            {/* Secondary gradient layer for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/5 to-teal-400/8 animate-pulse delay-1000" />
            
            {/* Enhanced glassmorphism overlay with noise texture */}
            <div className="absolute inset-0 bg-white/8 backdrop-blur-sm" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                                    radial-gradient(circle at 75% 75%, rgba(59,130,246,0.1) 0%, transparent 50%)`,
                 }} />
            
            {/* Floating glow effects with staggered animations */}
            <div className="absolute top-6 left-6 w-32 h-32 bg-blue-400/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-12 right-8 w-24 h-24 bg-cyan-400/12 rounded-full blur-2xl animate-pulse delay-700" />
            <div className="absolute bottom-8 right-6 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1400" />
            <div className="absolute bottom-6 left-12 w-28 h-28 bg-blue-300/8 rounded-full blur-2xl animate-pulse delay-2100" />
            
            {/* Subtle animated border highlight */}
            <div className="absolute inset-0 rounded-xl border border-white/10 animate-pulse delay-500" />
          </div>

          <Card.Header className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="flex-1">
                <Card.Title className="text-white text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Device Location Map
                </Card.Title>
                <Card.Description className="text-blue-100/80 mt-1">
                  Interactive map showing device locations and movement paths
                </Card.Description>
              </div>
              
              {/* Enhanced Device Selection Dropdown with Advanced Glassmorphism */}
              <div className="relative group">
                <select
                  value={selectedImei}
                  onChange={(e) => loadHistory(e.target.value)}
                  className={cn(
                    // Base styling with advanced glassmorphism
                    'px-5 py-3.5 min-w-[200px] rounded-xl',
                    'bg-white/15 backdrop-blur-xl border border-white/30',
                    'text-white placeholder-white/70',
                    'shadow-xl shadow-black/30',
                    
                    // Enhanced interactive states with smooth transitions
                    'hover:bg-white/20 hover:border-white/40 hover:shadow-2xl hover:shadow-blue-500/25',
                    'focus:bg-white/25 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/20',
                    'active:scale-[0.98] active:bg-white/30',
                    
                    // Smooth transitions with spring-like easing
                    'transition-all duration-300 ease-out',
                    
                    // Enhanced typography
                    'text-sm font-semibold tracking-wide',
                    
                    // Responsive sizing with better proportions
                    'sm:min-w-[240px] md:min-w-[260px] lg:min-w-[280px]',
                    
                    // Additional glassmorphism effects
                    'backdrop-saturate-150 backdrop-contrast-125'
                  )}
                >
                  <option value="" className="bg-slate-900/95 text-white font-medium">
                    🗺️ Select device to track
                  </option>
                  {devices.map((d) => (
                    <option 
                      key={d.imei} 
                      value={d.imei} 
                      className="bg-slate-900/95 text-white hover:bg-slate-800/95 font-medium py-2"
                    >
                      📱 Device: {d.imei}
                    </option>
                  ))}
                </select>
                
                {/* Enhanced dropdown icon overlay with animation */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-110">
                  <svg 
                    className="w-5 h-5 text-white/80 drop-shadow-lg" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-teal-400/0 group-hover:from-blue-400/10 group-hover:via-cyan-400/5 group-hover:to-teal-400/10 transition-all duration-300 pointer-events-none" />
              </div>
            </div>
          </Card.Header>

          <Card.Content className="pt-6 relative z-10">
            {selectedImei ? (
              <div className="relative">
                {/* Enhanced gradient background for map container */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-teal-500/15 rounded-xl -z-10" />
                
                {/* Responsive Map Container with Proper Aspect Ratios */}
                <div className={cn(
                  'relative rounded-xl overflow-hidden',
                  'border border-white/20 shadow-2xl shadow-blue-500/20',
                  'backdrop-blur-sm',
                  // Responsive aspect ratios
                  'aspect-video sm:aspect-[4/3] md:aspect-video lg:aspect-[21/9]',
                  // Minimum heights for usability
                  'min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]'
                )}>
                  {locationLoading ? (
                    /* Enhanced Loading States with Skeleton UI and Smooth Animations */
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-md">
                      {/* Enhanced skeleton map background with animated elements */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 animate-pulse" />
                      
                      {/* Animated map grid overlay */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-8 grid-rows-6 h-full w-full gap-1 p-4">
                          {Array.from({ length: 48 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-white/10 rounded animate-pulse"
                              style={{
                                animationDelay: `${(i * 0.05)}s`,
                                animationDuration: '2s',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Loading spinner with enhanced styling and floating animation */}
                      <div className="relative z-10 flex flex-col items-center gap-6 animate-bounce">
                        <div className="relative">
                          {/* Outer glow ring */}
                          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/30 rounded-full animate-ping" />
                          {/* Inner spinner */}
                          <Loading 
                            type="spinner" 
                            size="xl" 
                            color="white"
                            className="drop-shadow-2xl relative z-10"
                          />
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-white font-bold text-xl mb-2 animate-pulse">
                            Loading location data...
                          </div>
                          <div className="text-blue-200/90 text-sm font-medium">
                            Fetching device movement history
                          </div>
                          
                          {/* Animated dots indicator */}
                          <div className="flex justify-center items-center gap-1 mt-3">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{
                                  animationDelay: `${i * 0.2}s`,
                                  animationDuration: '1s',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced animated loading bars with progress simulation */}
                      <div className="absolute bottom-6 left-6 right-6 space-y-3">
                        <div className="space-y-2">
                          <div className="text-xs text-blue-200/80 font-medium">Loading progress</div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 rounded-full transition-all duration-1000 ease-out animate-pulse" 
                              style={{ width: '75%' }} 
                            />
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-1500 ease-out animate-pulse delay-300" 
                            style={{ width: '60%' }} 
                          />
                        </div>
                        
                        {/* Status text */}
                        <div className="text-xs text-blue-200/70 font-medium animate-pulse">
                          Connecting to location services...
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Enhanced Map Component */
                    <div className="w-full h-full relative">
                      {/* Map overlay with subtle effects */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none z-10 rounded-xl" />
                      
                      <MiniMap path={locationPath} />
                      
                      {/* Enhanced map controls overlay with glassmorphism */}
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                        <button 
                          className={cn(
                            'p-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/40',
                            'hover:bg-white/30 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25',
                            'active:scale-95 active:bg-white/40',
                            'transition-all duration-200 ease-out',
                            'text-white shadow-xl shadow-black/20',
                            'group relative overflow-hidden'
                          )}
                          onClick={() => loadHistory(selectedImei)}
                          title="Refresh location data"
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          
                          <svg className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Enhanced path info overlay with glassmorphism */}
                      {locationPath.length > 0 && (
                        <div className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/30 shadow-xl shadow-black/30">
                          <div className="flex items-center gap-3">
                            {/* Path icon */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            </div>
                            
                            <div className="flex-1">
                              <div className="text-white text-sm font-bold mb-1">
                                Journey Path: {locationPath.length} points
                              </div>
                              <div className="text-white/80 text-xs font-medium">
                                {locationPath[0]?.time} → {locationPath[locationPath.length - 1]?.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Enhanced Empty State with Advanced Glassmorphism */
              <div className={cn(
                'text-center py-20 px-10 rounded-xl relative overflow-hidden',
                'bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-teal-500/15',
                'border border-white/20 backdrop-blur-xl shadow-2xl shadow-blue-500/20'
              )}>
                {/* Animated background effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 animate-pulse" />
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                  
                  {/* Floating particles effect */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
                      style={{
                        top: `${20 + (i * 15)}%`,
                        left: `${10 + (i * 12)}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '3s',
                      }}
                    />
                  ))}
                </div>
                
                {/* Enhanced icon with glassmorphism */}
                <div className="mx-auto w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-blue-400/25 to-cyan-400/25 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl relative group">
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <svg className="w-10 h-10 text-blue-300 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                
                {/* Enhanced text content with better typography */}
                <div className="relative z-10">
                  <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent animate-pulse">
                    No device selected
                  </div>
                  <div className="text-blue-200/90 text-base max-w-lg mx-auto leading-relaxed font-medium">
                    Choose a device from the dropdown above to view its location history and movement patterns on the interactive map
                  </div>
                  
                  {/* Enhanced call to action with glassmorphism */}
                  <div className="mt-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-blue-200 text-sm font-semibold shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-pointer group">
                      <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <span>Select device above</span>
                    </div>
                  </div>
                </div>
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

      {/* ENHANCED CHARTS SECTION with Advanced Visual Effects and Responsive Layout */}
      <HierarchySection level={2} colorScheme="teal" spacing="lg">
        {/* Enhanced Charts Container with Advanced Glassmorphism and Gradient Effects */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Multi-layered Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Primary animated gradient mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-cyan-600/15 to-blue-600/20 animate-pulse" />
            
            {/* Secondary gradient layer for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-400/8 to-cyan-400/12 animate-pulse delay-1000" />
            
            {/* Floating glow effects with staggered animations */}
            <div className="absolute top-8 left-8 w-40 h-40 bg-teal-400/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-12 right-12 w-32 h-32 bg-cyan-400/12 rounded-full blur-2xl animate-pulse delay-700" />
            <div className="absolute bottom-8 right-8 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1400" />
            <div className="absolute bottom-12 left-16 w-36 h-36 bg-teal-300/8 rounded-full blur-2xl animate-pulse delay-2100" />
          </div>

          {/* Responsive Grid Layout: Side-by-side on desktop, stacked on mobile */}
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-8 p-8">

            {/* Enhanced Speed Chart with Advanced Glassmorphism */}
            <div className="group relative overflow-hidden">
              {/* Chart Container with Enhanced Glassmorphism Effects */}
              <div className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-gradient-to-br from-amber-600/25 via-orange-600/20 to-red-600/25',
                'backdrop-blur-2xl border border-amber-400/40',
                'shadow-2xl shadow-amber-500/30',
                'transition-all duration-500 ease-out',
                'hover:shadow-amber-500/40 hover:border-amber-300/50 hover:scale-[1.02]',
                'group-hover:bg-gradient-to-br group-hover:from-amber-600/30 group-hover:via-orange-600/25 group-hover:to-red-600/30'
              )}>
                {/* Enhanced Background Effects with Multiple Layers */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Primary animated gradient mesh */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/12 via-transparent to-orange-500/12 animate-pulse" />
                  
                  {/* Secondary gradient layer for depth */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/8 to-red-400/10 animate-pulse delay-1000" />
                  
                  {/* Enhanced glassmorphism overlay with noise texture */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" 
                       style={{
                         backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), 
                                          radial-gradient(circle at 75% 75%, rgba(245,158,11,0.15) 0%, transparent 50%)`,
                       }} />
                  
                  {/* Floating glow effects with staggered animations */}
                  <div className="absolute top-6 left-6 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute top-8 right-8 w-20 h-20 bg-orange-400/15 rounded-full blur-xl animate-pulse delay-700" />
                  <div className="absolute bottom-6 right-6 w-28 h-28 bg-red-400/12 rounded-full blur-2xl animate-pulse delay-1400" />
                  <div className="absolute bottom-8 left-8 w-22 h-22 bg-amber-300/10 rounded-full blur-xl animate-pulse delay-2100" />
                  
                  {/* Subtle animated border highlight */}
                  <div className="absolute inset-0 rounded-2xl border border-white/15 animate-pulse delay-500" />
                </div>

                {/* Chart Header with Enhanced Typography */}
                <div className="relative z-10 p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
                        Speed Distribution
                      </h3>
                      <p className="text-amber-100/90 text-sm font-medium leading-relaxed">
                        Distribution of vehicle speeds across all analytics data with enhanced visualization
                      </p>
                    </div>
                    
                    {/* Interactive Chart Icon with Hover Effects */}
                    <div className="ml-4 p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-6 h-6 text-amber-200 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enhanced Chart Content with Glow Effects */}
                <div className="relative z-10 px-6 pb-6">
                  <div className="relative">
                    {/* Chart background with enhanced gradient and glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/12 to-red-500/15 rounded-xl -z-10" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl -z-10" />
                    
                    {/* Glow effect around chart */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/20 via-orange-400/15 to-red-400/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-20" />
                    
                    {/* Enhanced Chart Component with Interactive Tooltips */}
                    <div className="relative rounded-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                      <EnhancedBarChart
                        data={memoizedChartData.speedChart}
                        bars={[{ dataKey: 'count', name: 'Speed Count' }]}
                        height={320}
                        layout="vertical"
                        animated={true}
                        colorVariant="vibrant"
                        className="transition-all duration-300 group-hover:scale-[1.01]"
                      />
                    </div>
                    
                    {/* Interactive Overlay for Enhanced Hover States */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Enhanced Chart Footer with Statistics */}
                <div className="relative z-10 px-6 pb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
                      <span className="text-amber-200/90 font-medium">
                        {memoizedChartData.speedChart?.length || 0} speed ranges
                      </span>
                    </div>
                    <div className="text-amber-200/70 font-medium">
                      Real-time data
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Geo Pie Chart with Advanced Glassmorphism */}
            <div className="group relative overflow-hidden">
              {/* Chart Container with Enhanced Glassmorphism Effects */}
              <div className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-gradient-to-br from-green-600/25 via-teal-600/20 to-cyan-600/25',
                'backdrop-blur-2xl border border-green-400/40',
                'shadow-2xl shadow-green-500/30',
                'transition-all duration-500 ease-out',
                'hover:shadow-green-500/40 hover:border-green-300/50 hover:scale-[1.02]',
                'group-hover:bg-gradient-to-br group-hover:from-green-600/30 group-hover:via-teal-600/25 group-hover:to-cyan-600/30'
              )}>
                {/* Enhanced Background Effects with Multiple Layers */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Primary animated gradient mesh */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/12 via-transparent to-teal-500/12 animate-pulse" />
                  
                  {/* Secondary gradient layer for depth */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-400/8 to-cyan-400/10 animate-pulse delay-1000" />
                  
                  {/* Enhanced glassmorphism overlay with noise texture */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" 
                       style={{
                         backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), 
                                          radial-gradient(circle at 75% 75%, rgba(34,197,94,0.15) 0%, transparent 50%)`,
                       }} />
                  
                  {/* Floating glow effects with staggered animations */}
                  <div className="absolute top-6 left-6 w-24 h-24 bg-green-400/20 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute top-8 right-8 w-20 h-20 bg-teal-400/15 rounded-full blur-xl animate-pulse delay-700" />
                  <div className="absolute bottom-6 right-6 w-28 h-28 bg-cyan-400/12 rounded-full blur-2xl animate-pulse delay-1400" />
                  <div className="absolute bottom-8 left-8 w-22 h-22 bg-green-300/10 rounded-full blur-xl animate-pulse delay-2100" />
                  
                  {/* Subtle animated border highlight */}
                  <div className="absolute inset-0 rounded-2xl border border-white/15 animate-pulse delay-500" />
                </div>

                {/* Chart Header with Enhanced Typography */}
                <div className="relative z-10 p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-green-100 to-teal-100 bg-clip-text text-transparent">
                        Device Geo Distribution
                      </h3>
                      <p className="text-green-100/90 text-sm font-medium leading-relaxed">
                        Geographic distribution of registered devices with interactive visualization
                      </p>
                    </div>
                    
                    {/* Interactive Chart Icon with Hover Effects */}
                    <div className="ml-4 p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-6 h-6 text-green-200 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enhanced Chart Content with Glow Effects */}
                <div className="relative z-10 px-6 pb-6">
                  <div className="relative">
                    {/* Chart background with enhanced gradient and glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-teal-500/12 to-cyan-500/15 rounded-xl -z-10" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl -z-10" />
                    
                    {/* Glow effect around chart */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-green-400/20 via-teal-400/15 to-cyan-400/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 -z-20" />
                    
                    {/* Enhanced Chart Component with Interactive Tooltips */}
                    <div className="relative rounded-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                      <EnhancedPieChart
                        data={memoizedChartData.geoPie}
                        height={320}
                        innerRadius={60}
                        outerRadius={110}
                        animated={true}
                        colorCombination={0}
                        paddingAngle={3}
                        className="transition-all duration-300 group-hover:scale-[1.01]"
                      />
                    </div>
                    
                    {/* Interactive Overlay for Enhanced Hover States */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Enhanced Chart Footer with Statistics */}
                <div className="relative z-10 px-6 pb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-green-200/90 font-medium">
                        {memoizedChartData.geoPie?.length || 0} regions
                      </span>
                    </div>
                    <div className="text-green-200/70 font-medium">
                      Live distribution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Section Footer with Interactive Elements */}
          <div className="relative z-10 px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white text-sm font-bold">
                    Enhanced Analytics Visualization
                  </div>
                  <div className="text-white/80 text-xs font-medium">
                    Interactive charts with real-time data updates
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span>Auto-refresh enabled</span>
              </div>
            </div>
          </div>
        </div>
      </HierarchySection>

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="dotted" 
        colorScheme="pink" 
        spacing="lg" 
        animated={true}
      />

      {/* Recent Analytics Table with Enhanced Styling */}
      <ContentSection variant="subtle" colorScheme="purple" padding="lg" spacing="md" bordered={true}>
        <EnhancedTableContainer 
          variant="enhanced" 
          colorScheme="purple" 
          padding="lg"
          className="relative overflow-hidden"
        >
          {/* Enhanced Header with Gradient Design */}
          <div className="mb-8">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Latest Analytics
                </h2>
                <p className="text-purple-100/90 text-sm font-medium leading-relaxed">
                  Most recent analytics data from all devices with enhanced color-coded formatting
                </p>
              </div>
              
              {/* Enhanced Statistics Badge */}
              <div className="ml-6">
                <StatusBadge 
                  type="info" 
                  value={`${memoizedStats.recentCount} records`}
                  size="md"
                />
              </div>
            </div>
            
            {/* Enhanced Visual Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
          </div>

          {/* Enhanced Table with Color-Coded Cells and Improved Typography */}
          <EnhancedTable
            variant="enhanced"
            size="md"
            colorScheme="purple"
            hoverable={true}
            striped={true}
            loading={loading}
            loadingRows={5}
            loadingColumns={5}
            data={recentAnalytics}
            colorCoded={true}
            showBadges={true}
            responsive={true}
            columns={[
              {
                key: 'imei',
                header: 'Device IMEI',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">📱</span>
                    <span className="font-mono text-purple-300 bg-purple-500/15 px-2.5 py-1.5 rounded-lg border border-purple-500/30 text-xs font-medium backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {value}
                    </span>
                  </div>
                )
              },
              {
                key: 'speed',
                header: 'Speed',
                sortable: true,
                render: (value) => {
                  const speed = Number(value);
                  let colorScheme, icon;
                  
                  if (speed > 80) {
                    colorScheme = { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' };
                    icon = '🚀';
                  } else if (speed > 40) {
                    colorScheme = { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' };
                    icon = '🚗';
                  } else {
                    colorScheme = { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30' };
                    icon = '🚶';
                  }
                  
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">{icon}</span>
                      <span className={`px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
                        {value} km/h
                      </span>
                    </div>
                  );
                }
              },
              {
                key: 'latitude',
                header: 'Latitude',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">📍</span>
                    <span className="font-mono text-teal-300 bg-teal-500/15 px-2.5 py-1.5 rounded-lg border border-teal-500/30 text-xs font-medium backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {Number(value).toFixed(4)}°
                    </span>
                  </div>
                )
              },
              {
                key: 'longitude',
                header: 'Longitude',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">📍</span>
                    <span className="font-mono text-cyan-300 bg-cyan-500/15 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-medium backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {Number(value).toFixed(4)}°
                    </span>
                  </div>
                )
              },
              {
                key: 'type',
                header: 'Data Type',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">📊</span>
                    <span className="px-2.5 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-semibold border border-purple-500/40 backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {value}
                    </span>
                  </div>
                )
              },
              {
                key: 'timestamp',
                header: 'Timestamp',
                sortable: true,
                render: (value, row) => {
                  const date = new Date(value);
                  const isRecent = Date.now() - date.getTime() < 3600000; // Less than 1 hour
                  
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">🕒</span>
                      <span className={`px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${
                        isRecent 
                          ? 'bg-green-500/15 text-green-300 border-green-500/30' 
                          : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                      }`}>
                        {date.toLocaleTimeString()}
                      </span>
                    </div>
                  );
                }
              }
            ]}
            emptyMessage="No recent analytics data available"
            onRowClick={(row) => {
              console.log('Selected analytics row:', row);
              // Could implement row selection or detail view
            }}
          />
          
          {/* Enhanced Table Footer with Statistics */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                  <span className="text-purple-200/90 text-sm font-medium">
                    Real-time data updates
                  </span>
                </div>
                <div className="text-purple-200/70 text-sm font-medium">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <StatusBadge type="success" value="Live" size="sm" />
                <StatusBadge type="info" value={`${memoizedStats.recentCount} total`} size="sm" />
              </div>
            </div>
          </div>
        </EnhancedTableContainer>
      </ContentSection>

      {/* Final Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="orange" 
        spacing="md" 
        animated={true}
      />

      {/* Devices Table with Enhanced Styling and Status Indicators */}
      <ContentSection variant="accent" colorScheme="red" padding="lg" spacing="md" bordered={true} elevated={true}>
        <EnhancedTableContainer 
          variant="enhanced" 
          colorScheme="red" 
          padding="lg"
          className="relative overflow-hidden"
        >
          {/* Enhanced Header with Gradient Design */}
          <div className="mb-8">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-red-100 to-pink-100 bg-clip-text text-transparent">
                  Device Management
                </h2>
                <p className="text-red-100/90 text-sm font-medium leading-relaxed">
                  Overview of registered devices with enhanced status indicators and responsive formatting
                </p>
              </div>
              
              {/* Enhanced Statistics Badge */}
              <div className="ml-6">
                <StatusBadge 
                  type="success" 
                  value={`${memoizedStats.devicesCount} devices`}
                  size="md"
                />
              </div>
            </div>
            
            {/* Enhanced Visual Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
          </div>

          {/* Enhanced Table with Color-Coded Status Indicators */}
          <EnhancedTable
            variant="enhanced"
            size="md"
            colorScheme="red"
            hoverable={true}
            striped={true}
            loading={loading}
            loadingRows={5}
            loadingColumns={4}
            data={devices}
            colorCoded={true}
            showBadges={true}
            responsive={true}
            columns={[
              {
                key: 'topic',
                header: 'Topic',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">📡</span>
                    <span className="font-semibold text-cyan-300 bg-cyan-500/15 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {value}
                    </span>
                  </div>
                )
              },
              {
                key: 'imei',
                header: 'Device IMEI',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">📱</span>
                    <span className="font-mono text-slate-300 bg-slate-500/15 px-2.5 py-1.5 rounded-lg border border-slate-500/30 text-xs font-medium backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {value}
                    </span>
                  </div>
                )
              },
              {
                key: 'interval',
                header: 'Update Interval',
                sortable: true,
                render: (value) => {
                  const interval = Number(value);
                  let colorScheme, icon, status;
                  
                  if (interval < 30) {
                    colorScheme = { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30' };
                    icon = '⚡';
                    status = 'Fast';
                  } else if (interval < 60) {
                    colorScheme = { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' };
                    icon = '⏱️';
                    status = 'Normal';
                  } else {
                    colorScheme = { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' };
                    icon = '🐌';
                    status = 'Slow';
                  }
                  
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">{icon}</span>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
                          {value}s
                        </span>
                        <span className="text-xs opacity-60 font-medium">
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                }
              },
              {
                key: 'geoid',
                header: 'Geographic ID',
                sortable: true,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">🌍</span>
                    <span className="px-2.5 py-1.5 bg-pink-500/20 text-pink-300 rounded-lg text-xs font-semibold border border-pink-500/40 backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200">
                      {value || 'Unknown'}
                    </span>
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Device Status',
                sortable: true,
                render: (value, row) => {
                  // Simulate device status based on interval (lower interval = more active)
                  const interval = Number(row.interval);
                  let status, colorScheme, icon;
                  
                  if (interval < 30) {
                    status = 'Online';
                    colorScheme = { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30' };
                    icon = '🟢';
                  } else if (interval < 60) {
                    status = 'Active';
                    colorScheme = { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' };
                    icon = '🟡';
                  } else {
                    status = 'Idle';
                    colorScheme = { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' };
                    icon = '🔴';
                  }
                  
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{icon}</span>
                      <span className={`px-2.5 py-1.5 rounded-lg border font-semibold text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
                        {status}
                      </span>
                    </div>
                  );
                }
              }
            ]}
            emptyMessage="No devices found in the system"
            onRowClick={(row) => {
              console.log('Selected device:', row);
              // Could implement device detail view or management actions
            }}
          />
          
          {/* Enhanced Table Footer with Device Statistics */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
                  <span className="text-red-200/90 text-sm font-medium">
                    Device monitoring active
                  </span>
                </div>
                <div className="text-red-200/70 text-sm font-medium">
                  System status: Operational
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <StatusBadge type="success" value="All Connected" size="sm" />
                <StatusBadge type="info" value={`${memoizedStats.devicesCount} total`} size="sm" />
              </div>
            </div>
          </div>
        </EnhancedTableContainer>
      </ContentSection>
    </div>
  );
}
