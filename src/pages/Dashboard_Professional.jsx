// src/pages/Dashboard_Professional.jsx
// Professional Clean UI Dashboard - Maintains all internal logic
import React, { useEffect, useState } from "react";
import { Loading } from "../design-system/components/Loading";
import {
  EnhancedBarChart,
  EnhancedPieChart,
} from "../components/LazyCharts";
import PremiumJourneyMap from "../components/PremiumJourneyMap";
import { loadLocationDataProgressive } from "../utils/progressiveMapDataLoader";
import {
  getAnalyticsCount,
  getAnalyticsPaginated,
  getAllAnalytics,
  getAnalyticsByImei,
} from "../utils/analytics";
import {
  getAllAnalyticsSafe,
  getAnalyticsByImeiSafe,
  getRecentAnalyticsSafe,
  EnhancedAnalyticsAPI
} from "../utils/enhancedAnalytics";
import { listDevices } from "../utils/device";

export default function Dashboard() {
  // State management - UNCHANGED
  const [totalAnalytics, setTotalAnalytics] = useState(0);
  const [recentAnalytics, setRecentAnalytics] = useState([]);
  const [devices, setDevices] = useState([]);
  const [allAnalytics, setAllAnalytics] = useState([]);
  const [selectedImei, setSelectedImei] = useState("");
  const [locationPath, setLocationPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [analyticsAPI] = useState(() => new EnhancedAnalyticsAPI({
    maxRetries: 3,
    fallbackPageSize: 500,
    validation: {
      maxResponseSize: 10 * 1024 * 1024,
      minExpectedSize: 50
    },
    pagination: {
      defaultPageSize: 1000,
      maxPages: 50
    }
  }));

  const [loadingProgress, setLoadingProgress] = useState({
    analytics: { current: 0, total: 0, percentage: 0 },
    location: { current: 0, total: 0, percentage: 0 }
  });

  // Process speed chart data - UNCHANGED
  const speedChart = (() => {
    const ranges = {
      "0 - 20": 0,
      "20 - 40": 0,
      "40 - 60": 0,
      "60 - 80": 0,
      "80+": 0,
    };

    allAnalytics.forEach((a) => {
      const s = Number(a.speed || 0);
      if (s <= 20) ranges["0 - 20"]++;
      else if (s <= 40) ranges["20 - 40"]++;
      else if (s <= 60) ranges["40 - 60"]++;
      else if (s <= 80) ranges["60 - 80"]++;
      else ranges["80+"]++;
    });

    return Object.keys(ranges).map((key) => ({
      name: key,
      count: ranges[key],
    }));
  })();

  // Process geographic distribution - UNCHANGED
  const geoPie = (() => {
    const dist = {};
    devices.forEach((d) => {
      const g = d.geoid ?? "Unknown";
      dist[g] = (dist[g] || 0) + 1;
    });

    return Object.keys(dist).map((g) => ({
      name: g,
      value: dist[g],
    }));
  })();

  // Calculate stats - UNCHANGED
  const stats = {
    devicesCount: devices.length,
    recentCount: recentAnalytics.length,
    totalAnalytics: Number(totalAnalytics) || 0
  };

  // Load dashboard data - UNCHANGED LOGIC
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Loading dashboard data with enhanced analytics...");
      
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

      const [countData, recentData, devicesData, allData] = await Promise.all([
        getAnalyticsCount().catch(err => {
          console.warn("Count query failed, using fallback:", err.message);
          return 0;
        }),
        
        getRecentAnalyticsSafe(10).catch(err => {
          console.warn("Recent analytics failed, using fallback:", err.message);
          return getAnalyticsPaginated(0, 10).catch(() => []);
        }),
        
        listDevices().catch(err => {
          console.warn("Devices loading failed:", err.message);
          return { devices: [], full: [] };
        }),
        
        getAllAnalyticsSafe({
          pageSize: 1000,
          maxPages: 20,
          onProgress: analyticsProgress,
          includeRawData: false
        }).catch(err => {
          console.warn("Enhanced analytics failed, trying basic fallback:", err.message);
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

  // Load location history - UNCHANGED LOGIC
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

      const result = await loadLocationDataProgressive(
        getAnalyticsByImei,
        imei,
        {
          onProgress: locationProgress,
          chunkSize: 100,
          enableSampling: true,
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
              time: p.timestampIso || p.timestamp,
            }))
            .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
        : [];
      
      console.log("✅ Processed location path:", processedPath.length, "valid points");
      setLocationPath(processedPath);
      
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
      
      setLoadingProgress(prev => ({
        ...prev,
        location: { current: 0, total: 0, percentage: 0 }
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  // Refresh dashboard - UNCHANGED LOGIC
  const refreshDashboard = async () => {
    console.log("🔄 Refreshing dashboard...");
    
    try {
      const healthStatus = await analyticsAPI.healthCheck();
      console.log("🏥 API Health Status:", healthStatus);
      
      if (healthStatus.status === 'unhealthy') {
        console.warn("⚠️ API health check failed, but proceeding with refresh");
      }
    } catch (healthError) {
      console.warn("Health check failed:", healthError.message);
    }
    
    await loadDashboardData();
  };

  // Load data on component mount - UNCHANGED
  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ------------------------------------------------
       Render - PROFESSIONAL CLEAN UI
  ---------------------------------------------------*/
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-6">
          <Loading 
            type="spinner" 
            size="xl" 
            text="Loading dashboard..." 
            textPosition="bottom"
          />
          
          {(loadingProgress.analytics.percentage > 0 || loadingProgress.location.percentage > 0) && (
            <div className="max-w-md mx-auto space-y-4">
              {loadingProgress.analytics.percentage > 0 && loadingProgress.analytics.percentage < 100 && (
                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Loading Analytics</span>
                    <span className="text-xs text-slate-400">
                      {loadingProgress.analytics.current} / {loadingProgress.analytics.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(loadingProgress.analytics.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {loadingProgress.location.percentage > 0 && loadingProgress.location.percentage < 100 && (
                <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Loading Location Data</span>
                    <span className="text-xs text-slate-400">
                      {loadingProgress.location.current} / {loadingProgress.location.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(loadingProgress.location.percentage, 100)}%` }}
                    />
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Dashboard Error</h3>
            <p className="text-red-300 mb-6 text-sm">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                loadDashboardData();
              }}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/40 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Professional Dashboard Header */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">IoT Analytics Dashboard</h1>
            <p className="text-slate-400">Real-time device monitoring and analytics</p>
          </div>
          
          <button
            onClick={refreshDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-violet-500/50 disabled:cursor-not-allowed"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Analytics KPI */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalAnalytics.toLocaleString()}</div>
          <div className="text-sm text-slate-400">Total Analytics</div>
        </div>

        {/* Active Devices KPI */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">Active</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.devicesCount}</div>
          <div className="text-sm text-slate-400">Active Devices</div>
        </div>

        {/* Recent Activity KPI */}
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-1 rounded-lg">+5%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.recentCount}</div>
          <div className="text-sm text-slate-400">Recent Activity</div>
        </div>
      </div>

      {/* Professional Map Section */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">Device Location Tracking</h2>
            <p className="text-slate-400 text-sm">Real-time location history and movement patterns</p>
          </div>
          
          <select
            value={selectedImei}
            onChange={(e) => loadHistory(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/80 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
          >
            <option value="">Select device</option>
            {devices.map((d) => (
              <option key={d.imei} value={d.imei}>
                Device: {d.imei}
              </option>
            ))}
          </select>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50" style={{ height: '400px' }}>
          {selectedImei ? (
            locationLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <div className="text-center space-y-4">
                  <Loading type="spinner" size="xl" color="white" />
                  <div className="text-white font-medium">Loading location data...</div>
                  
                  {loadingProgress.location.percentage > 0 && (
                    <div className="max-w-xs mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Progress</span>
                        <span className="text-xs text-slate-500">
                          {loadingProgress.location.current} / {loadingProgress.location.total || '?'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(loadingProgress.location.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <PremiumJourneyMap path={locationPath} className="w-full h-full" />
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white mb-2">No device selected</div>
                  <div className="text-slate-400 text-sm">Choose a device from the dropdown to view its location history</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Charts Section */}
      <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Speed Distribution Chart */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Speed Distribution</h3>
              <p className="text-slate-400 text-sm">Vehicle speed ranges across all analytics</p>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <EnhancedBarChart
              data={speedChart}
              bars={[{ dataKey: 'count', name: 'Speed Count' }]}
              height={300}
              layout="vertical"
              animated={true}
              colorVariant="vibrant"
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-slate-400">{speedChart?.length || 0} speed ranges</span>
            </div>
            <span className="text-slate-500">Real-time data</span>
          </div>
        </div>

        {/* Geographic Distribution Chart */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Geographic Distribution</h3>
              <p className="text-slate-400 text-sm">Device distribution across regions</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <EnhancedPieChart
              data={geoPie}
              height={300}
              innerRadius={60}
              outerRadius={110}
              animated={true}
              colorCombination={0}
              paddingAngle={3}
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-400">{geoPie?.length || 0} regions</span>
            </div>
            <span className="text-slate-500">Live distribution</span>
          </div>
        </div>
      </div>

      {/* Recent Analytics Table */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">Latest Analytics</h2>
            <p className="text-slate-400 text-sm">Most recent data from all devices</p>
          </div>
          <span className="text-xs font-medium text-violet-400 bg-violet-500/20 px-3 py-1.5 rounded-lg">
            {stats.recentCount} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Device IMEI</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Speed</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Latitude</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Longitude</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalytics.length > 0 ? (
                recentAnalytics.map((item, idx) => {
                  const speed = Number(item.speed);
                  let speedColor = 'text-green-400 bg-green-500/10';
                  if (speed > 80) speedColor = 'text-red-400 bg-red-500/10';
                  else if (speed > 40) speedColor = 'text-amber-400 bg-amber-500/10';
                  
                  return (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-violet-400 bg-violet-500/10 px-2 py-1 rounded">
                          {item.imei}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${speedColor}`}>
                          {item.speed} km/h
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-teal-400">
                          {Number(item.latitude).toFixed(4)}°
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-cyan-400">
                          {Number(item.longitude).toFixed(4)}°
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No recent analytics data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400">Real-time updates</span>
          </div>
          <span className="text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Devices Table */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">Device Management</h2>
            <p className="text-slate-400 text-sm">Connected IoT devices overview</p>
          </div>
          <span className="text-xs font-medium text-green-400 bg-green-500/20 px-3 py-1.5 rounded-lg">
            {stats.devicesCount} active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">IMEI</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Geo ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.length > 0 ? (
                devices.map((device, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {device.imei}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-300">
                        {device.geoid || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-green-400 bg-green-500/10 px-2 py-1 rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-500">
                    No devices available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
