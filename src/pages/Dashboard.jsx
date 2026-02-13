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

// User Context
import { useUserContext } from "../contexts/UserContext";

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

// Device Activity Timeline Section
import DeviceActivityTimeline from "../components/analytics/DeviceActivityTimeline";


/* ------------------------------------------------
   MAIN DASHBOARD
---------------------------------------------------*/
export default function Dashboard() {
  // User context for role-based logic
  const { isAdmin, userType } = useUserContext();
  
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
  
  // Global device filter for dashboard data
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState("all");
  
  // Device Management table state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [speedFilter, setSpeedFilter] = useState("all");
  const [geoidFilter, setGeoidFilter] = useState("all");
  
  // Previous stats for trend calculation
  const [previousStats, setPreviousStats] = useState({
    totalAnalytics: 0,
    devicesCount: 0,
    recentCount: 0,
    timestamp: Date.now()
  });
  
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

  // Determine if device filter should be shown
  // Show filter if: ADMIN (always) OR Parent with 2+ devices
  const shouldShowDeviceFilter = useMemo(() => {
    if (isAdmin()) {
      return true; // Always show for ADMIN
    }
    // For PARENTS, only show if they have 2 or more devices
    return filteredDevices.length >= 2;
  }, [isAdmin, filteredDevices.length]);

  // Apply search, status, speed, and geoid filters to devices for Device Management table
  const filteredDevicesForTable = useMemo(() => {
    let filtered = filteredDevices;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.imei?.toLowerCase().includes(query) ||
        d.topic?.toLowerCase().includes(query) ||
        d.geoid?.toLowerCase().includes(query)
      );
    }
    
    // Status filter (based on interval)
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => {
        const interval = Number(d.interval);
        if (statusFilter === "active") return interval <= 30;
        if (statusFilter === "normal") return interval > 30 && interval <= 120;
        if (statusFilter === "slow") return interval > 120 && interval <= 600;
        if (statusFilter === "very-slow") return interval > 600;
        return true;
      });
    }
    
    // Speed filter (based on interval)
    if (speedFilter !== "all") {
      filtered = filtered.filter(d => {
        const interval = Number(d.interval);
        if (speedFilter === "fast") return interval <= 30;
        if (speedFilter === "normal") return interval > 30 && interval <= 120;
        if (speedFilter === "slow") return interval > 120;
        return true;
      });
    }
    
    // Geoid filter
    if (geoidFilter !== "all") {
      filtered = filtered.filter(d => d.geoid === geoidFilter);
    }
    
    return filtered;
  }, [filteredDevices, searchQuery, statusFilter, speedFilter, geoidFilter]);

  // Pagination for Device Management table
  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDevicesForTable.slice(startIndex, endIndex);
  }, [filteredDevicesForTable, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDevicesForTable.length / itemsPerPage);

  // Get unique geoids for filter dropdown
  const uniqueGeoids = useMemo(() => {
    const geoids = new Set();
    filteredDevices.forEach(d => {
      if (d.geoid) geoids.add(d.geoid);
    });
    return Array.from(geoids).sort();
  }, [filteredDevices]);

  // Get allowed IMEIs for analytics filtering
  const allowedIMEIs = useMemo(() => {
    if (!shouldFilterDevices()) {
      return null; // No filtering needed for ADMIN users
    }
    return filteredDevices.map(d => d.imei?.toLowerCase());
  }, [filteredDevices, shouldFilterDevices]);

  // Filter analytics data by allowed devices (Requirement 4.2)
  // AND filter by packet type: only packet_N, packet_A, and packet_E
  // AND filter by selected device (if specific device is selected)
  const filteredAnalytics = useMemo(() => {
    let filtered = allAnalytics;
    
    // Log packet type distribution for debugging
    if (allAnalytics.length > 0) {
      const packetTypeBreakdown = allAnalytics.reduce((acc, record) => {
        const type = record.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Packet Type Breakdown (All Analytics):', packetTypeBreakdown);
      console.log('📊 Total Records:', allAnalytics.length);
    }
    
    // Filter by device permissions (for NON-ADMIN users)
    if (allowedIMEIs) {
      filtered = filtered.filter(a => 
        a.imei && allowedIMEIs.includes(a.imei.toLowerCase())
      );
      console.log('📱 After device filtering:', filtered.length, 'records');
    }
    
    // Filter by packet type: only Normal (packet_N), Alert (packet_A), and Error (packet_E)
    const beforeTypeFilter = filtered.length;
    filtered = filtered.filter(a => {
      const packetType = a.type || '';
      return packetType === 'packet_N' || packetType === 'packet_A' || packetType === 'packet_E';
    });
    
    console.log('🔍 Packet Type Filter Applied:');
    console.log('   Before:', beforeTypeFilter, 'records');
    console.log('   After:', filtered.length, 'records (packet_N + packet_A + packet_E only)');
    console.log('   Filtered out:', beforeTypeFilter - filtered.length, 'records (packet_H, etc.)');
    
    // Filter by selected device (Global Device Filter)
    if (selectedDeviceFilter !== "all") {
      filtered = filtered.filter(a => 
        a.imei && a.imei.toLowerCase() === selectedDeviceFilter.toLowerCase()
      );
      console.log('🎯 Selected Device Filter Applied:', selectedDeviceFilter);
      console.log('   Filtered to:', filtered.length, 'records');
    }
    
    return filtered;
  }, [allAnalytics, allowedIMEIs, selectedDeviceFilter]);

  // Filter recent analytics by allowed devices (Requirement 4.2)
  // AND filter by packet type: only packet_N, packet_A, and packet_E
  const filteredRecentAnalytics = useMemo(() => {
    let filtered = recentAnalytics;
    
    // Filter by device permissions (for NON-ADMIN users)
    if (allowedIMEIs) {
      filtered = filtered.filter(a => 
        a.imei && allowedIMEIs.includes(a.imei.toLowerCase())
      );
    }
    
    // Filter by packet type: only Normal (packet_N), Alert (packet_A), and Error (packet_E)
    filtered = filtered.filter(a => {
      const packetType = a.type || '';
      return packetType === 'packet_N' || packetType === 'packet_A' || packetType === 'packet_E';
    });
    
    return filtered;
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
  // Total analytics now counts only packet_N and packet_A
  const stats = useMemo(() => {
    // Always use filteredAnalytics.length since it now includes packet type filtering
    const currentTotalAnalytics = filteredAnalytics.length;
    const currentDevicesCount = filteredDevices.length;
    const currentRecentCount = displayRecentAnalytics.length;
    
    // Calculate trend percentages based on previous stats
    const calculateTrend = (current, previous) => {
      if (previous === 0) return { trend: 'stable', value: '0%' };
      const change = ((current - previous) / previous) * 100;
      
      if (Math.abs(change) < 1) {
        return { trend: 'stable', value: '0%' };
      } else if (change > 0) {
        return { trend: 'up', value: `+${change.toFixed(1)}%` };
      } else {
        return { trend: 'down', value: `${change.toFixed(1)}%` };
      }
    };
    
    const totalAnalyticsTrend = calculateTrend(currentTotalAnalytics, previousStats.totalAnalytics);
    const devicesTrend = calculateTrend(currentDevicesCount, previousStats.devicesCount);
    const recentTrend = calculateTrend(currentRecentCount, previousStats.recentCount);
    
    return {
      devicesCount: currentDevicesCount,
      recentCount: currentRecentCount,
      totalAnalytics: currentTotalAnalytics,
      totalAnalyticsTrend: totalAnalyticsTrend.trend,
      totalAnalyticsTrendValue: totalAnalyticsTrend.value,
      devicesTrend: devicesTrend.trend,
      devicesTrendValue: devicesTrend.value,
      recentTrend: recentTrend.trend,
      recentTrendValue: recentTrend.value
    };
  }, [filteredAnalytics, filteredDevices, displayRecentAnalytics, previousStats]);

  // Load dashboard data with progressive loading
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Loading dashboard data with progressive loading...");
      
      // PHASE 1: Load critical data first (fast, small datasets)
      console.log("📊 Phase 1: Loading critical data...");
      const [countData, devicesData] = await Promise.all([
        getAnalyticsCount().catch(err => {
          console.warn("Count query failed, using fallback:", err.message);
          return 0;
        }),
        listDevicesFiltered().catch(err => {
          console.warn("Devices loading failed:", err.message);
          return { devices: [], full: [] };
        })
      ]);

      const devicesList = Array.isArray(devicesData?.devices)
        ? devicesData.devices
        : Array.isArray(devicesData?.full)
        ? devicesData.full
        : [];
      
      console.log("✅ Phase 1 complete:", { countData, devicesCount: devicesList.length });
      
      // Update UI with initial data
      setTotalAnalytics(countData || 0);
      setDevices(devicesList.slice(0, 10));
      setLoading(false); // Allow UI to render with basic data
      
      // PHASE 2: Load recent analytics (medium priority)
      console.log("📊 Phase 2: Loading recent analytics...");
      setTimeout(async () => {
        try {
          const recentData = await getRecentAnalyticsSafe(200).catch(err => {
            console.warn("Recent analytics failed, using fallback:", err.message);
            return getAnalyticsPaginated(0, 200).catch(() => []);
          });
          
          console.log("✅ Phase 2 complete:", { recentCount: recentData?.length });
          setRecentAnalytics(Array.isArray(recentData) ? recentData : []);
        } catch (err) {
          console.warn("Phase 2 error:", err.message);
        }
      }, 500); // Load after 500ms
      
      // PHASE 3: Load all analytics (heavy, can be slow)
      console.log("📊 Phase 3: Loading all analytics (background)...");
      setTimeout(async () => {
        try {
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

          const allData = await getAllAnalytics().catch(err => {
            console.warn("getAllAnalytics failed, trying enhanced analytics:", err.message);
            return getAllAnalyticsSafe({
              pageSize: 1000,
              maxPages: 100,
              onProgress: analyticsProgress,
              includeRawData: false
            }).catch(fallbackErr => {
              console.error("All analytics loading methods failed:", fallbackErr.message);
              return [];
            });
          });

          console.log("✅ Phase 3 complete:", { analyticsCount: allData?.length });
          
          if (Array.isArray(allData) && allData.length > 0) {
            const rawPacketTypeBreakdown = allData.reduce((acc, record) => {
              const type = record.type || 'unknown';
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {});
            console.log('📊 Raw Data Packet Type Breakdown:', rawPacketTypeBreakdown);
          }
          
          setAllAnalytics(Array.isArray(allData) ? allData : []);
          
          // Update previous stats for trend calculation
          setPreviousStats(prev => {
            const timeSinceLastUpdate = Date.now() - prev.timestamp;
            if (timeSinceLastUpdate < 5000) {
              return prev;
            }
            
            const filteredByType = Array.isArray(allData) 
              ? allData.filter(a => {
                  const packetType = a.type || '';
                  return packetType === 'packet_N' || packetType === 'packet_A' || packetType === 'packet_E';
                })
              : [];
            
            const currentTotal = shouldFilterDevices() 
              ? filteredByType.filter(a => {
                  const allowedIMEIs = devicesList
                    .filter(d => d.imei)
                    .map(d => d.imei.toLowerCase());
                  return a.imei && allowedIMEIs.includes(a.imei.toLowerCase());
                }).length
              : filteredByType.length;
            
            return {
              totalAnalytics: currentTotal,
              devicesCount: devicesList.length,
              recentCount: Array.isArray(allData) ? allData.length : 0,
              timestamp: Date.now()
            };
          });
          
          // Reset progress
          setLoadingProgress({
            analytics: { current: 0, total: 0, percentage: 100 },
            location: { current: 0, total: 0, percentage: 0 }
          });
          
        } catch (err) {
          console.warn("Phase 3 error:", err.message);
        }
      }, 1000); // Load after 1 second
      
      // Load sample geofences
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
          radius: 500
        }
      ]);
      
    } catch (err) {
      console.error("❌ Dashboard data loading error:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
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

  // Load data on component mount with lazy loading
  useEffect(() => {
    // Use setTimeout to defer data loading until after initial render
    // This allows the login to complete and dashboard to render quickly
    const loadTimer = setTimeout(() => {
      loadDashboardData();
    }, 100); // Small delay to allow UI to render first
    
    return () => clearTimeout(loadTimer);
  }, []);

  // Auto-select device for parents with only 1 device
  useEffect(() => {
    // Only auto-select if:
    // 1. Not ADMIN
    // 2. Has exactly 1 device
    // 3. Device filter is not shown (shouldShowDeviceFilter is false)
    // 4. No device is currently selected
    if (!isAdmin() && filteredDevices.length === 1 && !shouldShowDeviceFilter && selectedDeviceFilter === "all") {
      const singleDevice = filteredDevices[0];
      console.log('🎯 Auto-selecting single device for parent:', singleDevice.imei);
      setSelectedDeviceFilter(singleDevice.imei);
      setSelectedImei(singleDevice.imei);
      loadHistory(singleDevice.imei);
    }
  }, [isAdmin, filteredDevices, shouldShowDeviceFilter, selectedDeviceFilter]);

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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Global Device Filter - Only show if ADMIN or Parent with 2+ devices */}
      {shouldShowDeviceFilter && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <i className="fas fa-filter text-[#007bff] text-xl"></i>
              <h3 className="text-lg font-semibold text-gray-700">Dashboard View</h3>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">Show data for:</label>
              <select
                value={selectedDeviceFilter}
                onChange={(e) => {
                  setSelectedDeviceFilter(e.target.value);
                  // Auto-select device in map if specific device is chosen
                  if (e.target.value !== "all") {
                    setSelectedImei(e.target.value);
                    loadHistory(e.target.value);
                  } else {
                    setSelectedImei("");
                    setLocationPath([]);
                  }
                }}
                className="form-select px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff] cursor-pointer min-w-[250px]"
              >
                <option value="all">🌐 All Devices (Combined Data)</option>
                <optgroup label="Individual Devices">
                  {filteredDevices.map((d) => (
                    <option key={d.imei} value={d.imei}>
                      📱 {d.topic || d.imei} ({d.imei.slice(-6)})
                    </option>
                  ))}
                </optgroup>
              </select>
              {selectedDeviceFilter !== "all" && (
                <button
                  onClick={() => {
                    setSelectedDeviceFilter("all");
                    setSelectedImei("");
                    setLocationPath([]);
                  }}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  title="Clear filter"
                >
                  <i className="fas fa-times mr-1"></i>
                  Clear
                </button>
              )}
            </div>
          </div>
          {selectedDeviceFilter !== "all" && (
            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-[#007bff] rounded">
              <p className="text-sm text-gray-700">
                <i className="fas fa-info-circle text-[#007bff] mr-2"></i>
                Showing data for device: <span className="font-mono font-semibold">{selectedDeviceFilter}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* AdminLTE v3 Small Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Analytics - Info Color */}
        <div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          title="Total Analytics: Counts all packet_N (Normal), packet_A (Alert), and packet_E (Error) records from your devices. Excludes packet_H (Heartbeat) packets. Filtered by your device permissions."
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.totalAnalytics.toLocaleString()}</div>
            <div className="text-sm font-medium mt-1">Total Analytics</div>
            <div className="text-xs text-white/70 mt-1">
              📊 Packet types: N, A, E only
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          <a href="#" className="block bg-black/20 hover:bg-black/30 transition-colors px-4 py-2 text-center text-sm">
            More info <span className="ml-1">→</span>
          </a>
        </div>

        {/* Active Devices - Success Color */}
        <div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#28a745] to-[#218838] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          title="Active Devices: Total number of devices you have access to. For ADMIN users, shows all devices. For PARENT users, shows only devices assigned to their account."
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.devicesCount}</div>
            <div className="text-sm font-medium mt-1">Active Devices</div>
            <div className="text-xs text-white/70 mt-1">
              📱 Based on your permissions
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
            </svg>
          </div>
          <a href="#" className="block bg-black/20 hover:bg-black/30 transition-colors px-4 py-2 text-center text-sm">
            More info <span className="ml-1">→</span>
          </a>
        </div>

        {/* Recent Activity - Warning Color */}
        <div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#ffc107] to-[#e0a800] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          title="Recent Activity: Shows the 5 most recent packet_N (Normal) records with speed > 0. Filters out stationary records (speed = 0) and non-movement packets."
        >
          <div className="p-4">
            <div className="text-3xl font-bold">{stats.recentCount}</div>
            <div className="text-sm font-medium mt-1">Recent Activity</div>
            <div className="text-xs text-white/70 mt-1">
              🚗 Moving devices (speed &gt; 0)
            </div>
          </div>
          <div className="absolute top-2 right-3 text-white/30">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
            </svg>
          </div>
          <a href="#" className="block bg-black/20 hover:bg-black/30 transition-colors px-4 py-2 text-center text-sm">
            More info <span className="ml-1">→</span>
          </a>
        </div>
      </div>

      {/* 2-Column Layout for Better Organization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Device Location Tracking */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 
                className="text-lg font-semibold text-gray-700"
                title="Device Location Tracking: Displays GPS coordinates from analytics records on a map. Shows movement path with speed indicators. Only displays records with valid coordinates (lat/lng ≠ 0) and speed > 0."
              >
                <i className="fas fa-map-marked-alt mr-2 text-[#007bff]"></i>
                Device Location Tracking
                <span className="text-xs text-gray-500 ml-2">🗺️ GPS path visualization</span>
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedImei}
                  onChange={(e) => loadHistory(e.target.value)}
                  className="form-select px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff] cursor-pointer"
                  style={{ minWidth: '200px' }}
                >
                  <option value="">Select Device</option>
                  {filteredDevices.map((d) => (
                    <option key={d.imei} value={d.imei}>
                      {d.imei}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4">
              {selectedImei ? (
                <div className="relative rounded border border-gray-200" style={{ height: '450px' }}>
                  {locationLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <div className="spinner-border text-[#007bff]" role="status">
                          <Loading type="spinner" size="lg" />
                        </div>
                        <div className="text-sm text-gray-600 mt-3 font-medium">Loading location data...</div>
                        {loadingProgress.location.percentage > 0 && (
                          <div className="mt-4 max-w-xs mx-auto">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-[#007bff] h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(loadingProgress.location.percentage, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-2 font-medium">
                              {loadingProgress.location.percentage.toFixed(0)}% complete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <CleanJourneyMap path={locationPath} className="w-full h-full" />
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded border border-gray-200">
                  <div className="w-20 h-20 mx-auto mb-4 bg-[#007bff]/10 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#007bff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Device Selected</h4>
                  <p className="text-sm text-gray-500">Select a device from the dropdown above to view its location history</p>
                </div>
              )}
            </div>
          </div>

          {/* Trip Analytics Section */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 
                className="text-lg font-semibold text-gray-700"
                title="Trip Analytics: Analyzes device movement patterns including trip duration, distance traveled, average speed, and stop detection. Calculated from sequential analytics records."
              >
                <i className="fas fa-route mr-2 text-[#007bff]"></i>
                Trip Analytics
                <span className="text-xs text-gray-500 ml-2">🚗 Movement analysis</span>
              </h3>
            </div>
            <div className="p-4">
              <TripAnalyticsSection
                analyticsData={filteredAnalytics}
                selectedDevice={selectedImei}
                loading={loading}
              />
            </div>
          </div>

          {/* Device Activity Timeline Section */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 
                className="text-lg font-semibold text-gray-700"
                title="Device Activity Timeline: Visualizes device activity over time. Shows when devices were active, data transmission patterns, and activity gaps. Useful for identifying usage patterns and downtime."
              >
                <i className="fas fa-chart-area mr-2 text-[#007bff]"></i>
                Device Activity Timeline
                <span className="text-xs text-gray-500 ml-2">📅 Time-based activity</span>
              </h3>
            </div>
            <div className="p-4">
              <DeviceActivityTimeline
                analyticsData={filteredAnalytics}
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Speed Distribution Analytics */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 
                className="text-lg font-semibold text-gray-700"
                title="Speed Distribution: Categorizes all analytics records by speed ranges. Shows how often devices are stationary, slow, moderate, or fast moving."
              >
                <i className="fas fa-tachometer-alt mr-2 text-[#ffc107]"></i>
                Speed Distribution
                <span className="text-xs text-gray-500 ml-2">📈 Speed ranges</span>
              </h3>
            </div>
            <div className="p-4">
              <SpeedDistributionCard speedDistributionData={speedDistributionData} />
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 
                className="text-base font-semibold text-gray-700"
                title="Quick Stats: Summary metrics calculated from your device data and analytics records."
              >
                <i className="fas fa-chart-pie mr-2 text-[#17a2b8]"></i>
                Quick Stats
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Total Distance */}
              <div 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded border-l-4 border-[#007bff]"
                title="Total Distance: Calculated by summing all speed values from analytics records and multiplying by 0.016 (assumes speed in km/h and 1-minute intervals). Formula: Σ(speed) × 0.016 km"
              >
                <div>
                  <div className="text-xs text-gray-600 font-medium">Total Distance</div>
                  <div className="text-xl font-bold text-gray-900">
                    {(filteredAnalytics.reduce((sum, a) => sum + (Number(a.speed) || 0), 0) * 0.016).toFixed(1)} km
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Σ(speed) × 0.016</div>
                </div>
                <div className="text-3xl">🛣️</div>
              </div>

              {/* Active Now */}
              <div 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded border-l-4 border-[#28a745]"
                title="Active Now: Devices with reporting interval ≤ 30 seconds. These devices are sending data frequently and are considered actively transmitting."
              >
                <div>
                  <div className="text-xs text-gray-600 font-medium">Active Now</div>
                  <div className="text-xl font-bold text-gray-900">
                    {filteredDevices.filter(d => Number(d.interval) <= 30).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Interval ≤ 30s</div>
                </div>
                <div className="text-3xl">✅</div>
              </div>

              {/* Data Points Today */}
              <div 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded border-l-4 border-[#6f42c1]"
                title="Data Points: Total number of analytics records (packet_N, packet_A, packet_E) received from your devices. Each record represents one data transmission."
              >
                <div>
                  <div className="text-xs text-gray-600 font-medium">Data Points</div>
                  <div className="text-xl font-bold text-gray-900">
                    {filteredAnalytics.length.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Total records</div>
                </div>
                <div className="text-3xl">📊</div>
              </div>

              {/* Avg Response Time */}
              <div 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded border-l-4 border-[#fd7e14]"
                title="Avg Interval: Average reporting interval across all devices. Calculated as: Σ(device intervals) ÷ number of devices. Lower values indicate more frequent data transmission."
              >
                <div>
                  <div className="text-xs text-gray-600 font-medium">Avg Interval</div>
                  <div className="text-xl font-bold text-gray-900">
                    {filteredDevices.length > 0 
                      ? Math.round(filteredDevices.reduce((sum, d) => sum + Number(d.interval), 0) / filteredDevices.length)
                      : 0}s
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Mean of all devices</div>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            </div>
          </div>

          {/* Top Active Devices Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 
                className="text-base font-semibold text-gray-700"
                title="Top Active Devices: Devices ranked by reporting interval (lowest first). Lower intervals mean more frequent data transmission. Fast: ≤30s, Normal: 31-120s, Slow: >120s"
              >
                <i className="fas fa-star mr-2 text-[#ffc107]"></i>
                Top Active Devices
                <span className="text-xs text-gray-500 ml-2">⚡ By interval</span>
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {filteredDevices
                  .sort((a, b) => Number(a.interval) - Number(b.interval))
                  .slice(0, 5)
                  .map((device, idx) => {
                    const interval = Number(device.interval);
                    let badgeColor = 'bg-green-500';
                    if (interval > 120) badgeColor = 'bg-orange-500';
                    else if (interval > 30) badgeColor = 'bg-yellow-500';
                    
                    return (
                      <div key={device.imei} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-full ${badgeColor} flex items-center justify-center text-white text-xs font-bold`}>
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono text-gray-900 truncate">...{device.imei.slice(-8)}</div>
                            <div className="text-xs text-gray-500">{device.topic || 'Unknown'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{interval}s</div>
                          <div className="text-xs text-gray-500">interval</div>
                        </div>
                      </div>
                    );
                  })}
                {filteredDevices.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No devices available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device Health Monitoring */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 
                className="text-base font-semibold text-gray-700"
                title="Device Health: Monitors device status based on reporting intervals and data quality. Healthy devices report regularly with valid data."
              >
                <i className="fas fa-heartbeat mr-2 text-[#28a745]"></i>
                Device Health
                <span className="text-xs text-gray-500 ml-2">💚 Status monitoring</span>
              </h3>
            </div>
            <div className="p-4">
              <DeviceHealthSection
                devices={filteredDevices}
                analyticsData={filteredAnalytics}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Section - Device Management Table */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 
              className="text-lg font-semibold text-gray-700"
              title="Device Management: Complete list of all devices with their reporting intervals, geographic IDs, and status. Interval indicates how frequently the device sends data. Lower intervals = more active devices."
            >
              Device Management
              <span className="text-xs text-gray-500 ml-2">📋 All devices</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
              {filteredDevicesForTable.length} devices
            </span>
          </div>
          
          {/* Search and Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]"
                style={{ minWidth: '200px' }}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff] bg-white"
              style={{ backgroundColor: 'white', color: '#111827' }}
            >
              <option value="all" style={{ backgroundColor: 'white', color: '#111827' }}>All Status</option>
              <option value="active" style={{ backgroundColor: 'white', color: '#111827' }}>Active (≤30s)</option>
              <option value="normal" style={{ backgroundColor: 'white', color: '#111827' }}>Normal (31-120s)</option>
              <option value="slow" style={{ backgroundColor: 'white', color: '#111827' }}>Slow (121-600s)</option>
              <option value="very-slow" style={{ backgroundColor: 'white', color: '#111827' }}>Very Slow (>600s)</option>
            </select>
            
            {/* Speed Filter */}
            <select
              value={speedFilter}
              onChange={(e) => {
                setSpeedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff] bg-white"
              style={{ backgroundColor: 'white', color: '#111827' }}
            >
              <option value="all" style={{ backgroundColor: 'white', color: '#111827' }}>All Speeds</option>
              <option value="fast" style={{ backgroundColor: 'white', color: '#111827' }}>Fast (≤30s)</option>
              <option value="normal" style={{ backgroundColor: 'white', color: '#111827' }}>Normal (31-120s)</option>
              <option value="slow" style={{ backgroundColor: 'white', color: '#111827' }}>Slow (>120s)</option>
            </select>
            
            {/* Geoid Filter */}
            <select
              value={geoidFilter}
              onChange={(e) => {
                setGeoidFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff] bg-white"
              style={{ backgroundColor: 'white', color: '#111827' }}
            >
              <option value="all" style={{ backgroundColor: 'white', color: '#111827' }}>All Locations</option>
              {uniqueGeoids.map(geoid => (
                <option key={geoid} value={geoid} style={{ backgroundColor: 'white', color: '#111827' }}>{geoid}</option>
              ))}
            </select>
            
            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "all" || speedFilter !== "all" || geoidFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSpeedFilter("all");
                  setGeoidFilter("all");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <i className="fas fa-times mr-1"></i>
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  title="Topic: Device identifier or friendly name assigned to the device"
                >
                  Topic
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  title="Device IMEI: International Mobile Equipment Identity - unique 15-digit identifier for the device"
                >
                  Device IMEI
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  title="Interval: Time in seconds between data transmissions. Lower = more frequent updates. Fast: ≤30s, Normal: 31-120s, Slow: 121-600s, Very Slow: >600s"
                >
                  Interval
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  title="Geographic ID: Location identifier or zone where the device is registered"
                >
                  Geographic ID
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  title="Status: Device activity status based on reporting interval. Active devices send data more frequently"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Loading type="spinner" size="md" />
                  </td>
                </tr>
              ) : paginatedDevices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-gray-500 text-sm">
                    {searchQuery || statusFilter !== "all" || speedFilter !== "all" || geoidFilter !== "all" 
                      ? "No devices match your filters" 
                      : "No devices found"}
                  </td>
                </tr>
              ) : (
                paginatedDevices.map((device, idx) => {
                  const interval = Number(device.interval);
                  let speedBadge, speedColor, speedTooltip, speedIcon;
                  
                  // Speed indicator based on interval:
                  // 0-30s: Fast (Green)
                  // 31-120s: Normal (Yellow)
                  // 121-600s: Slow (Orange)
                  // 600+s: Very Slow (Red)
                  
                  if (interval <= 30) {
                    speedBadge = '●';
                    speedIcon = '⚡';
                    speedColor = 'text-[#28a745]';
                    speedTooltip = 'Fast';
                  } else if (interval <= 120) {
                    speedBadge = '●';
                    speedIcon = '⏱️';
                    speedColor = 'text-[#ffc107]';
                    speedTooltip = 'Normal';
                  } else if (interval <= 600) {
                    speedBadge = '●';
                    speedIcon = '🐌';
                    speedColor = 'text-[#fd7e14]';
                    speedTooltip = 'Slow';
                  } else {
                    speedBadge = '●';
                    speedIcon = '⚠️';
                    speedColor = 'text-[#dc3545]';
                    speedTooltip = 'Very Slow';
                  }
                  
                  return (
                    <tr key={device.imei || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{device.topic}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{device.imei}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 font-medium">{device.interval}s</span>
                          <div className="flex items-center gap-1">
                            <span 
                              className={`text-xl ${speedColor} font-bold`}
                              title={speedTooltip}
                            >
                              {speedBadge}
                            </span>
                            <span className="text-base" title={speedTooltip}>
                              {speedIcon}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{device.geoid || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded text-white bg-[#28a745]">
                          <i className="fas fa-check-circle"></i>
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDevicesForTable.length)} of {filteredDevicesForTable.length} devices
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === pageNum
                          ? 'bg-[#007bff] text-white border-[#007bff]'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
