// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
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

// Speed Distribution Card
import SpeedDistributionCard from "../components/dashboard/SpeedDistributionCard";

// Geo Distribution Card
import GeoDistributionCard from "../components/dashboard/GeoDistributionCard";

// Premium Journey Map - Ola/Uber style with timeline
import PremiumJourneyMap from "../components/PremiumJourneyMap";
// Detailed Journey Map - End-to-end street view
import DetailedJourneyMap from "../components/DetailedJourneyMap";
// Ola/Uber Style Map - Simple and clean
import OlaUberStyleMap from "../components/OlaUberStyleMap";
// Clean Journey Map - Realistic and smooth
import CleanJourneyMap from "../components/CleanJourneyMap";
import { loadLocationDataProgressive } from "../utils/progressiveMapDataLoader";

// API utilities
import {
  getAnalyticsCount,
  getAnalyticsPaginated,
  getAllAnalytics,
  getAnalyticsByImei,
} from "../utils/analytics";

// Enhanced API utilities for handling truncation
import {
  getAllAnalyticsSafe,
  getAnalyticsByImeiSafe,
  getRecentAnalyticsSafe,
  EnhancedAnalyticsAPI
} from "../utils/enhancedAnalytics";
import { listDevicesFiltered } from "../utils/deviceFiltered";

// Speed analytics utilities
import {
  processSpeedDistribution,
  transformToChartData
} from "../utils/speedAnalytics";

// Device filtering hook
import { useDeviceFilter } from "../hooks/useDeviceFilter";

// Design system utilities
import { cn } from "../design-system/utils/cn";

// Trip Analytics Section
import TripAnalyticsSection from "../components/analytics/TripAnalyticsSection";

// Device Health Section
import DeviceHealthSection from "../components/analytics/DeviceHealthSection";

// Geofence Analytics Section
import GeofenceAnalyticsSection from "../components/analytics/GeofenceAnalyticsSection";


/* ------------------------------------------------
   MAIN DASHBOARD
---------------------------------------------------*/
export default function Dashboard() {
  // Device filtering hook (Requirement 4.2)
  const { filterDevices, shouldFilterDevices } = useDeviceFilter();
  
  // State management
  const [totalAnalytics, setTotalAnalytics] = useState(0);
  const [recentAnalytics, setRecentAnalytics] = useState([]);
  const [devices, setDevices] = useState([]);
  const [allAnalytics, setAllAnalytics] = useState([]);
  const [selectedImei, setSelectedImei] = useState("");
  const [locationPath, setLocationPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geofences, setGeofences] = useState([]);
  
  // Enhanced analytics API instance
  const [analyticsAPI] = useState(() => new EnhancedAnalyticsAPI({
    maxRetries: 3,
    fallbackPageSize: 500,
    validation: {
      maxResponseSize: 10 * 1024 * 1024, // 10MB
      minExpectedSize: 50
    },
    pagination: {
      defaultPageSize: 1000,
      maxPages: 50
    }
  }));

  // Progress tracking state
  const [loadingProgress, setLoadingProgress] = useState({
    analytics: { current: 0, total: 0, percentage: 0 },
    location: { current: 0, total: 0, percentage: 0 }
  });

  // Apply device filtering (Requirement 4.2)
  const filteredDevices = useMemo(() => {
    return filterDevices(devices);
  }, [devices, filterDevices]);

  // Get allowed IMEIs for analytics filtering
  const allowedIMEIs = useMemo(() => {
    if (!shouldFilterDevices()) {
      return null; // No filtering needed for ADMIN users
    }
    return filteredDevices.map(d => d.imei?.toLowerCase());
  }, [filteredDevices, shouldFilterDevices]);

  // Filter analytics data by allowed devices (Requirement 4.2)
  const filteredAnalytics = useMemo(() => {
    if (!allowedIMEIs) {
      return allAnalytics; // No filtering for ADMIN users
    }
    return allAnalytics.filter(a => 
      a.imei && allowedIMEIs.includes(a.imei.toLowerCase())
    );
  }, [allAnalytics, allowedIMEIs]);

  // Filter recent analytics by allowed devices (Requirement 4.2)
  const filteredRecentAnalytics = useMemo(() => {
    if (!allowedIMEIs) {
      return recentAnalytics; // No filtering for ADMIN users
    }
    return recentAnalytics.filter(a => 
      a.imei && allowedIMEIs.includes(a.imei.toLowerCase())
    );
  }, [recentAnalytics, allowedIMEIs]);

  // Filter and limit recent analytics to show only 5 records with speed > 0
  const displayRecentAnalytics = useMemo(() => {
    console.log('🔍 ========== FILTERING RECENT ANALYTICS ==========');
    console.log('📊 Total records received:', filteredRecentAnalytics.length);
    
    // Log first 10 records to see what we have
    console.log('📋 First 10 records:', filteredRecentAnalytics.slice(0, 10).map((a, idx) => ({
      index: idx,
      imei: a.imei,
      speed: a.speed,
      speedType: typeof a.speed,
      type: a.type,
      packet: a.packet,
      timestamp: a.deviceTimestamp || a.timestamp,
    })));
    
    // Count records by type
    const typeCount = {};
    const speedCount = { zero: 0, positive: 0, negative: 0, null: 0 };
    filteredRecentAnalytics.forEach(a => {
      typeCount[a.type] = (typeCount[a.type] || 0) + 1;
      const speed = Number(a.speed || 0);
      if (speed === 0) speedCount.zero++;
      else if (speed > 0) speedCount.positive++;
      else if (speed < 0) speedCount.negative++;
      else speedCount.null++;
    });
    console.log('📊 Type distribution:', typeCount);
    console.log('📊 Speed distribution:', speedCount);
    console.log(`💡 Note: ${speedCount.zero} records have speed=0 and will be filtered out`);
    console.log(`💡 Note: ${speedCount.positive} records have speed>0 and are candidates for display`);
    
    const filtered = filteredRecentAnalytics
      .filter(a => {
        const speed = Number(a.speed || 0);
        const isNormalPacket = a.type === 'packet_N';
        const isValid = speed > 0 && isNormalPacket;
        
        if (!isValid && filteredRecentAnalytics.indexOf(a) < 5) {
          // Only log first 5 rejections to avoid spam
          console.log(`🔎 Record check: IMEI=${a.imei}, Speed=${speed} (${typeof a.speed}), Type="${a.type}", Packet="${a.packet}", Valid=${isValid}`);
          
          if (speed === 0 || speed <= 0) {
            console.log(`  ❌ REJECTED: Speed is ${speed}`);
          }
          if (!isNormalPacket) {
            console.log(`  ❌ REJECTED: Type is not packet_N (got: "${a.type}")`);
          }
        }
        
        return isValid;
      })
      .sort((a, b) => {
        const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
        const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
    
    console.log('✅ ========== FINAL FILTERED RESULTS ==========');
    console.log('📊 Count:', filtered.length);
    if (filtered.length > 0) {
      console.log('📋 Filtered Records (sorted by timestamp, newest first):');
      filtered.forEach((a, idx) => {
        const timestamp = a.deviceTimestamp || a.timestamp;
        const date = new Date(timestamp);
        console.log(`  ${idx + 1}. IMEI: ${a.imei}, Speed: ${a.speed} km/h, Time: ${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
      });
    } else {
      console.log('❌ NO RECORDS MATCHED THE FILTER CRITERIA');
      console.log('💡 Check if your database has records with type="packet_N" AND speed > 0');
    }
    console.log('========================================');
    
    return filtered;
  }, [filteredRecentAnalytics]);

  // Process speed distribution data with enhanced analytics (Requirement 4.2)
  const speedDistributionData = useMemo(() => {
    return processSpeedDistribution(filteredAnalytics);
  }, [filteredAnalytics]);

  // Transform speed data for chart rendering
  const speedChart = useMemo(() => {
    return transformToChartData(speedDistributionData.categories);
  }, [speedDistributionData]);

  // Process geographic distribution with filtered devices (Requirement 4.2)
  const geoPie = (() => {
    const dist = {};
    filteredDevices.forEach((d) => {
      const g = d.geoid ?? "Unknown";
      dist[g] = (dist[g] || 0) + 1;
    });

    return Object.keys(dist).map((g) => ({
      name: g,
      value: dist[g],
    }));
  })();

  // Calculate stats with filtered data (Requirement 4.2)
  const stats = {
    devicesCount: filteredDevices.length,
    recentCount: displayRecentAnalytics.length,
    totalAnalytics: shouldFilterDevices() ? filteredAnalytics.length : Number(totalAnalytics) || 0
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Loading dashboard data with enhanced analytics...");
      
      // Progress callback for analytics loading
      const analyticsProgress = (progress) => {
        setLoadingProgress(prev => ({
          ...prev,
          analytics: {
            current: progress.totalItems || 0,
            total: progress.totalEstimated || 0,
            percentage: progress.completionPercentage || 0
          }
        }));
      };

      // Load data with enhanced error handling and progress tracking
      const [countData, recentData, devicesData, allData] = await Promise.all([
        // Use basic count (usually small and fast)
        getAnalyticsCount().catch(err => {
          console.warn("Count query failed, using fallback:", err.message);
          return 0;
        }),
        
        // Use enhanced recent analytics with truncation protection
        // Fetch 200 records to ensure we get enough recent Normal packets with speed > 0
        // Since about 50% of records have speed=0, we need more records to get 5 with speed>0
        getRecentAnalyticsSafe(200).catch(err => {
          console.warn("Recent analytics failed, using fallback:", err.message);
          return getAnalyticsPaginated(0, 200).catch(() => []);
        }),
        
        // Load devices (usually small dataset)
        listDevicesFiltered().catch(err => {
          console.warn("Devices loading failed:", err.message);
          return { devices: [], full: [] };
        }),
        
        // Use enhanced analytics with progress tracking and chunking
        getAllAnalyticsSafe({
          pageSize: 1000,
          maxPages: 20, // Limit to prevent excessive loading
          onProgress: analyticsProgress,
          includeRawData: false
        }).catch(err => {
          console.warn("Enhanced analytics failed, trying basic fallback:", err.message);
          // Fallback to basic analytics with smaller limit
          return getAllAnalytics().catch(fallbackErr => {
            console.error("All analytics loading methods failed:", fallbackErr.message);
            return [];
          });
        })
      ]);

      console.log("✅ Dashboard data loaded successfully:", {
        countData,
        recentCount: recentData?.length,
        devicesCount: Array.isArray(devicesData?.devices) ? devicesData.devices.length : 0,
        analyticsCount: allData?.length
      });

      setTotalAnalytics(countData || 0);
      setRecentAnalytics(Array.isArray(recentData) ? recentData : []);
      
      const devicesList = Array.isArray(devicesData?.devices)
        ? devicesData.devices
        : Array.isArray(devicesData?.full)
        ? devicesData.full
        : [];
      
      console.log("📱 Processed devices list:", devicesList.length);
      setDevices(devicesList.slice(0, 10));
      
      setAllAnalytics(Array.isArray(allData) ? allData : []);
      
      // Load sample geofences for analytics
      // In a real app, this would come from an API
      setGeofences([
        {
          id: "GEO1",
          name: "Home Zone",
          type: "polygon",
          coordinates: [
            { latitude: 23.301624, longitude: 85.327065 },
            { latitude: 23.302624, longitude: 85.328065 },
            { latitude: 23.303624, longitude: 85.327065 },
            { latitude: 23.302624, longitude: 85.326065 },
            { latitude: 23.301624, longitude: 85.327065 }
          ]
        },
        {
          id: "GEO2",
          name: "Office Zone",
          type: "circle",
          center: { latitude: 23.305624, longitude: 85.330065 },
          radius: 500 // meters
        }
      ]);
      
      // Reset progress
      setLoadingProgress({
        analytics: { current: 0, total: 0, percentage: 100 },
        location: { current: 0, total: 0, percentage: 0 }
      });
      
    } catch (err) {
      console.error("❌ Dashboard data loading error:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load location history with progressive loading
  const loadHistory = async (imei) => {
    console.log("🗺️ loadHistory called with imei:", imei);
    
    if (!imei) {
      setSelectedImei("");
      setLocationPath([]);
      setLoadingProgress(prev => ({
        ...prev,
        location: { current: 0, total: 0, percentage: 0 }
      }));
      return;
    }

    setSelectedImei(imei);
    setLocationLoading(true);
    
    try {
      console.log("🔍 Fetching location data for imei:", imei);
      
      // Progress callback for location loading
      const locationProgress = (progress) => {
        console.log("📊 Location loading progress:", progress);
        
        setLoadingProgress(prev => ({
          ...prev,
          location: {
            current: progress.totalPoints || 0,
            total: progress.estimatedTotal || progress.totalPoints || 0,
            percentage: progress.progress || 0
          }
        }));
      };

      // Use progressive data loader with chunked fetching (Requirement 2.1, 2.3)
      const result = await loadLocationDataProgressive(
        getAnalyticsByImei,
        imei,
        {
          onProgress: locationProgress,
          chunkSize: 100, // Load 100 points per chunk
          enableSampling: true, // Enable sampling for large datasets (Requirement 2.2)
          config: {
            samplingThreshold: 500,
            maxPoints: 1000,
          }
        }
      );
      
      const locationData = result.data;
      
      console.log("📍 Raw location data received:", locationData?.length || 0, "points");
      console.log("📊 Load metadata:", result.metadata);
      
      const processedPath = Array.isArray(locationData) 
        ? locationData
            .map((p) => ({
              lat: Number(p.latitude),
              lng: Number(p.longitude),
              speed: Number(p.speed || 0),
              time: p.deviceTimestamp || p.timestamp || p.deviceRawTimestamp,
            }))
            .filter((p) => {
              // Filter out invalid data:
              // 1. NaN coordinates
              // 2. Zero coordinates (0.000000, 0.000000)
              // 3. Speed must be greater than 0
              const hasValidCoords = !isNaN(p.lat) && !isNaN(p.lng) && 
                                     p.lat !== 0 && p.lng !== 0 &&
                                     Math.abs(p.lat) > 0.0001 && Math.abs(p.lng) > 0.0001;
              const hasValidSpeed = p.speed > 0;
              
              return hasValidCoords && hasValidSpeed;
            })
        : [];
      
      console.log("✅ Processed location path:", processedPath.length, "valid points");
      setLocationPath(processedPath);
      
      // Update progress to complete
      setLoadingProgress(prev => ({
        ...prev,
        location: { 
          current: processedPath.length, 
          total: processedPath.length, 
          percentage: 100 
        }
      }));
      
    } catch (e) {
      console.error("❌ Location loading error:", e);
      setLocationPath([]);
      setError(`Failed to load location data: ${e.message}`);
      
      // Reset progress on error
      setLoadingProgress(prev => ({
        ...prev,
        location: { current: 0, total: 0, percentage: 0 }
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  // Refresh dashboard
  const refreshDashboard = async () => {
    console.log("🔄 Refreshing dashboard...");
    
    // Perform health check first
    try {
      const healthStatus = await analyticsAPI.healthCheck();
      console.log("🏥 API Health Status:", healthStatus);
      
      if (healthStatus.status === 'unhealthy') {
        console.warn("⚠️ API health check failed, but proceeding with refresh");
      }
    } catch (healthError) {
      console.warn("Health check failed:", healthError.message);
    }
    
    // Proceed with data refresh
    await loadDashboardData();
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ------------------------------------------------
       Render
  ---------------------------------------------------*/
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-6">
          <Loading 
            type="spinner" 
            size="xl" 
            text="Loading dashboard..." 
            textPosition="bottom"
          />
          
          {/* Enhanced Progress Indicators */}
          {(loadingProgress.analytics.percentage > 0 || loadingProgress.location.percentage > 0) && (
            <div className="max-w-md mx-auto space-y-4">
              {/* Analytics Loading Progress */}
              {loadingProgress.analytics.percentage > 0 && loadingProgress.analytics.percentage < 100 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Loading Analytics</span>
                    <span className="text-xs text-white/70">
                      {loadingProgress.analytics.current} / {loadingProgress.analytics.total}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(loadingProgress.analytics.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {loadingProgress.analytics.percentage.toFixed(1)}% complete
                  </div>
                </div>
              )}
              
              {/* Location Loading Progress */}
              {loadingProgress.location.percentage > 0 && loadingProgress.location.percentage < 100 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Loading Location Data</span>
                    <span className="text-xs text-white/70">
                      {loadingProgress.location.current} / {loadingProgress.location.total}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(loadingProgress.location.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {loadingProgress.location.percentage.toFixed(1)}% complete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-red-500/40">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-300 mb-2">Dashboard Error</h3>
            <p className="text-red-200/90 mb-6 text-sm leading-relaxed">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                loadDashboardData();
              }}
              className="px-6 py-3 bg-red-500/30 hover:bg-red-500/40 text-red-200 rounded-xl border border-red-500/50 transition-all duration-200 hover:scale-105 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Enhanced Dashboard Header with Gradient Design */}
      <DashboardHeader
        title="IoT Analytics Dashboard"
        subtitle="Live analytics dashboard with comprehensive device monitoring and real-time insights"
        stats={{
          devicesCount: stats.devicesCount,
          recentCount: stats.recentCount,
          totalAnalytics: stats.totalAnalytics,
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
        showFilterIndicator={shouldFilterDevices()}
      />

      {/* Enhanced KPI Section with Gradient Backgrounds and Responsive Layout */}
      <HierarchySection level={1} colorScheme="violet" spacing="sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Total Analytics KPI with Performance Styling */}
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <KpiCard
              title="Total Analytics"
              value={stats.totalAnalytics}
              subtitle="All datapoints collected"
              type="performance"
              colorScheme="blue"
              trend="up"
              trendValue="+12%"
              size="lg"
              animated={true}
              className="relative overflow-hidden group border-2 border-blue-500/50"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.5)',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>

          {/* Total Devices KPI with Status Styling */}
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <KpiCard
              title="Active Devices"
              value={stats.devicesCount}
              subtitle="Connected IoT devices"
              type="status"
              colorScheme="green"
              trend="stable"
              trendValue="100%"
              size="lg"
              animated={true}
              className="relative overflow-hidden group border-2 border-green-500/50"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.25) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>

          {/* Recent Data KPI with Growth Styling */}
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
            <KpiCard
              title="Recent Activity"
              value={stats.recentCount}
              subtitle="Latest data points"
              type="growth"
              colorScheme="amber"
              trend="up"
              trendValue="+5%"
              size="lg"
              animated={true}
              className="relative overflow-hidden group border-2 border-amber-500/50"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.5)',
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
        spacing="sm" 
        animated={true}
      />

      {/* ENHANCED MAP SECTION with Glassmorphism and Improved Interactions */}
      <ContentSection variant="accent" colorScheme="blue" padding="md" spacing="sm" bordered={true} elevated={true}>
        {/* Enhanced Gradient Card Wrapper with Advanced Glassmorphism Effects */}
        <Card 
          variant="glass" 
          padding="lg" 
          colorScheme="blue" 
          glowEffect={true}
          hover={true}
          className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-blue-600/25 via-cyan-600/20 to-teal-600/25 border-2 border-blue-400/50 shadow-2xl shadow-blue-500/30 transition-all duration-500 ease-out hover:shadow-blue-500/40 hover:border-blue-300/60"
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
                  Street-Level Device Tracking
                </Card.Title>
                <Card.Description className="text-blue-100/80 mt-1">
                  Interactive street-by-street device location history with detailed waypoint tracking
                </Card.Description>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Enhanced Device Selection Dropdown */}
                <div className="relative group">
                  <select
                    value={selectedImei}
                    onChange={(e) => loadHistory(e.target.value)}
                    className={cn(
                      'px-5 py-3.5 min-w-[200px] rounded-xl',
                      'bg-white/15 backdrop-blur-xl border border-white/30',
                      'text-white placeholder-white/70',
                      'shadow-xl shadow-black/30',
                      'hover:bg-white/20 hover:border-white/40 hover:shadow-2xl hover:shadow-blue-500/25',
                      'focus:bg-white/25 focus:border-blue-300/60 focus:outline-none focus:ring-4 focus:ring-blue-400/20',
                      'active:scale-[0.98] active:bg-white/30',
                      'transition-all duration-300 ease-out',
                      'text-sm font-semibold tracking-wide',
                      'sm:min-w-[240px] md:min-w-[260px] lg:min-w-[280px]',
                      'backdrop-saturate-150 backdrop-contrast-125'
                    )}
                  >
                    <option value="" className="bg-slate-900/95 text-white font-medium">
                      🗺️ Select device to track
                    </option>
                    {filteredDevices.map((d) => (
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
            </div>
          </Card.Header>

          <Card.Content className="pt-6 relative z-10">
            {selectedImei ? (
              <div className="relative">
                {/* Map Container with proper dimensions (Requirement 1.4) */}
                <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-xl bg-slate-800"
                     style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                  {locationLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <div className="text-center space-y-4">
                        <Loading 
                          type="spinner" 
                          size="xl" 
                          color="white"
                          className="drop-shadow-2xl"
                        />
                        <div className="text-white font-medium">
                          Loading location data...
                        </div>
                        
                        {/* Location Loading Progress */}
                        {loadingProgress.location.percentage > 0 && (
                          <div className="max-w-xs mx-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-white/80">Progress</span>
                              <span className="text-xs text-white/60">
                                {loadingProgress.location.current} / {loadingProgress.location.total || '?'}
                              </span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(loadingProgress.location.percentage, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-white/60 mt-1">
                              {loadingProgress.location.percentage.toFixed(1)}% complete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      {/* Clean Journey Map - Realistic and smooth */}
                      <CleanJourneyMap
                        path={locationPath}
                        className="w-full h-full"
                      />
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
                    Choose a device from the dropdown above to view its detailed street-by-street location history with enhanced waypoint tracking and movement patterns
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
        spacing="sm" 
        animated={true}
      />

      {/* ENHANCED CHARTS SECTION with Advanced Visual Effects and Responsive Layout */}
      <HierarchySection level={2} colorScheme="teal" spacing="sm">
        {/* Enhanced Charts Container with Advanced Glassmorphism and Gradient Effects */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-teal-500/50 bg-gradient-to-br from-teal-900/20 via-slate-900/20 to-teal-900/20 backdrop-blur-sm">
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

          {/* Responsive Grid Layout: Full width for speed distribution, side column for geo */}
          <div className="relative z-10 p-8">

            {/* Enhanced Speed Distribution Card - Full Width */}
            <div className="mb-4">
              <SpeedDistributionCard speedDistributionData={speedDistributionData} />
            </div>
          </div>

          {/* Enhanced Section Footer with Interactive Elements */}
          <div className="relative z-10 px-8 pb-4">
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
        spacing="sm" 
        animated={true}
      />

      {/* Recent Analytics Table with Enhanced Styling */}
      <ContentSection variant="subtle" colorScheme="purple" padding="md" spacing="sm" bordered={true}>
        <EnhancedTableContainer 
          variant="enhanced" 
          colorScheme="purple" 
          padding="md"
          className="relative overflow-hidden border-2 border-purple-500/50 rounded-xl bg-gradient-to-br from-purple-900/20 via-slate-900/20 to-purple-900/20 backdrop-blur-sm"
        >
          {/* Enhanced Header with Gradient Design */}
          <div className="mb-4">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Latest Analytics (Moving Device)
                </h2>
                <p className="text-purple-100/90 text-sm font-medium leading-relaxed">
                  Last 5 Normal data (packet_N) with speed &gt; 0 km/h
                </p>
              </div>
              
              {/* Refresh Button and Statistics Badge */}
              <div className="ml-6 flex items-center gap-3">
                <button
                  onClick={refreshDashboard}
                  disabled={loading}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh Analytics"
                >
                  <svg 
                    className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <StatusBadge 
                  type="info" 
                  value={`${stats.recentCount} records`}
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
            loadingColumns={6}
            data={displayRecentAnalytics}
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
                  } else if (speed > 0) {
                    colorScheme = { bg: 'bg-green-500/15', text: 'text-green-300', border: 'border-green-500/30' };
                    icon = '🚶';
                  } else {
                    colorScheme = { bg: 'bg-gray-500/15', text: 'text-gray-300', border: 'border-gray-500/30' };
                    icon = '🅿️';
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
                key: 'timestamp',
                header: 'Date & Time (IST)',
                sortable: true,
                render: (value, row) => {
                  // Use deviceTimestamp first, then timestamp
                  let timestampValue = row.deviceTimestamp || row.timestamp || value;
                  
                  if (!timestampValue) {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">❓</span>
                        <span className="px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm bg-gray-500/15 text-gray-300 border-gray-500/30">
                          No timestamp
                        </span>
                      </div>
                    );
                  }
                  
                  // Parse timestamp manually to extract components
                  let dateStr, timeStr;
                  if (typeof timestampValue === 'string') {
                    // Extract date/time components from ISO string
                    // Handles: 2026-01-17T19:37:39.940Z or 2026-01-17T19:37:39.940+00:00
                    const match = timestampValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
                    if (match) {
                      const [, year, month, day, hour, minute, second] = match;
                      
                      // Format date as "Jan 17, 2026"
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      dateStr = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
                      
                      // Format time as "07:44:45 PM" (12-hour format)
                      let hourNum = parseInt(hour);
                      const ampm = hourNum >= 12 ? 'PM' : 'AM';
                      hourNum = hourNum % 12 || 12; // Convert to 12-hour format
                      timeStr = `${String(hourNum).padStart(2, '0')}:${minute}:${second} ${ampm}`;
                    } else {
                      // Fallback to standard parsing
                      const date = new Date(timestampValue);
                      if (!isNaN(date.getTime())) {
                        dateStr = date.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        });
                        timeStr = date.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit',
                          hour12: true
                        });
                      }
                    }
                  } else {
                    const date = new Date(timestampValue);
                    if (!isNaN(date.getTime())) {
                      dateStr = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      });
                      timeStr = date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: true
                      });
                    }
                  }
                  
                  // Check if parsing was successful
                  if (!dateStr || !timeStr) {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">❓</span>
                        <span className="px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm bg-gray-500/15 text-gray-300 border-gray-500/30">
                          Invalid date
                        </span>
                      </div>
                    );
                  }
                  
                  // Check if recent (within 1 hour) - use rough comparison
                  const now = new Date();
                  const isRecent = false; // Simplified for now since we're doing manual parsing
                  
                  return (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">📅</span>
                        <span className={`px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${
                          isRecent 
                            ? 'bg-green-500/15 text-green-300 border-green-500/30' 
                            : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                        }`}>
                          {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">🕒</span>
                        <span className={`px-2.5 py-1.5 rounded-lg border font-medium text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg transition-all duration-200 ${
                          isRecent 
                            ? 'bg-green-500/15 text-green-300 border-green-500/30' 
                            : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                        }`}>
                          {timeStr}
                        </span>
                      </div>
                    </div>
                  );
                }
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
              }
            ]}
            emptyMessage="No recent analytics data with speed > 0 available"
            onRowClick={(row) => {
              console.log('Selected analytics row:', row);
              // Could implement row selection or detail view
            }}
          />
          
          {/* Enhanced Table Footer with Statistics */}
          <div className="mt-4 pt-4 border-t border-white/10">
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
                <StatusBadge type="info" value={`${stats.recentCount} total`} size="sm" />
              </div>
            </div>
          </div>
        </EnhancedTableContainer>
      </ContentSection>

      {/* Trip Analytics Section */}
      <SectionDivider 
        variant="rainbow" 
        colorScheme="blue" 
        spacing="sm" 
        animated={true}
      />

      <TripAnalyticsSection
        analyticsData={filteredAnalytics}
        selectedDevice={selectedImei}
        loading={loading}
      />

      {/* Device Health Section */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="green" 
        spacing="sm" 
        animated={true}
      />

      <DeviceHealthSection
        devices={filteredDevices}
        analyticsData={filteredAnalytics}
        loading={loading}
      />

      {/* Geofence Analytics Section */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="teal" 
        spacing="sm" 
        animated={true}
      />

      <GeofenceAnalyticsSection
        analyticsData={filteredAnalytics}
        geofences={geofences}
        loading={loading}
      />

      {/* Final Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="orange" 
        spacing="md" 
        animated={true}
      />

      {/* Devices Table with Enhanced Styling and Status Indicators */}
      <ContentSection variant="accent" colorScheme="red" padding="md" spacing="sm" bordered={true} elevated={true}>
        <EnhancedTableContainer 
          variant="enhanced" 
          colorScheme="red" 
          padding="md"
          className="relative overflow-hidden border-2 border-red-500/50 rounded-xl bg-gradient-to-br from-red-900/20 via-slate-900/20 to-red-900/20 backdrop-blur-sm"
        >
          {/* Enhanced Header with Gradient Design */}
          <div className="mb-4">
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
                  value={`${stats.devicesCount} devices`}
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
            data={filteredDevices}
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
          <div className="mt-4 pt-4 border-t border-white/10">
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
                <StatusBadge type="info" value={`${stats.devicesCount} total`} size="sm" />
              </div>
            </div>
          </div>
        </EnhancedTableContainer>
      </ContentSection>
    </div>
  );
}
