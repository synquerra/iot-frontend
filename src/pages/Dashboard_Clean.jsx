// Clean Professional Dashboard - Monochromatic Design
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

      setTotalAnalytics(countData || 0);
      setRecentAnalytics(Array.isArray(recentData) ? recentData : []);
      
      const devicesList = Array.isArray(devicesData?.devices)
        ? devicesData.devices
        : Array.isArray(devicesData?.full)
        ? devicesData.full
        : [];
      
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
      const locationProgress = (progress) => {
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
      
      const processedPath = Array.isArray(locationData) 
        ? locationData
            .map((p) => ({
              lat: Number(p.latitude),
              lng: Number(p.longitude),
              time: p.timestampIso || p.timestamp,
            }))
            .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
        : [];
      
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
    try {
      const healthStatus = await analyticsAPI.healthCheck();
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
       Render - CLEAN MONOCHROMATIC UI
  ---------------------------------------------------*/
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center space-y-4">
          <Loading type="spinner" size="xl" text="Loading dashboard..." textPosition="bottom" />
          
          {(loadingProgress.analytics.percentage > 0 || loadingProgress.location.percentage > 0) && (
            <div className="max-w-md mx-auto space-y-4">
              {loadingProgress.analytics.percentage > 0 && loadingProgress.analytics.percentage < 100 && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Loading Analytics</span>
                    <span className="text-xs text-slate-500">
                      {loadingProgress.analytics.current} / {loadingProgress.analytics.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(loadingProgress.analytics.percentage, 100)}%` }}
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
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 rounded-lg p-8 border border-red-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Dashboard Error</h3>
            <p className="text-slate-600 mb-6 text-sm">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                loadDashboardData();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Clean Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 text-sm mt-1">IoT device monitoring and analytics</p>
            </div>
            
            <button
              onClick={refreshDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Clean KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalAnalytics.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Analytics</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.devicesCount}</div>
            <div className="text-sm text-slate-600">Active Devices</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.recentCount}</div>
            <div className="text-sm text-slate-600">Recent Activity</div>
          </div>
        </div>

        {/* Clean Map Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Device Location</h2>
              <p className="text-slate-600 text-sm mt-1">Track device movement and location history</p>
            </div>
            
            <select
              value={selectedImei}
              onChange={(e) => loadHistory(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm"
            >
              <option value="">Select device</option>
              {devices.map((d) => (
                <option key={d.imei} value={d.imei}>
                  {d.imei}
                </option>
              ))}
            </select>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50" style={{ height: '400px' }}>
            {selectedImei ? (
              locationLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center space-y-4">
                    <Loading type="spinner" size="lg" />
                    <div className="text-slate-700 font-medium text-sm">Loading location data...</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  <PremiumJourneyMap path={locationPath} className="w-full h-full" />
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3 p-8">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-1">No device selected</div>
                    <div className="text-slate-500 text-xs">Select a device to view location history</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Speed Distribution</h3>
                <p className="text-slate-600 text-sm mt-1">Vehicle speed ranges</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <EnhancedBarChart
                data={speedChart}
                bars={[{ dataKey: 'count', name: 'Count' }]}
                height={280}
                layout="vertical"
                animated={true}
                colorVariant="monochrome"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Geographic Distribution</h3>
                <p className="text-slate-600 text-sm mt-1">Device distribution by region</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <EnhancedPieChart
                data={geoPie}
                height={280}
                innerRadius={60}
                outerRadius={100}
                animated={true}
                colorCombination={0}
                paddingAngle={2}
              />
            </div>
          </div>
        </div>

        {/* Clean Tables */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Analytics</h2>
              <p className="text-slate-600 text-sm mt-1">Latest data from all devices</p>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {stats.recentCount} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">IMEI</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Speed</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Latitude</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Longitude</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalytics.length > 0 ? (
                  recentAnalytics.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-slate-900">
                          {item.imei}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">
                          {item.speed} km/h
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-slate-700">
                          {Number(item.latitude).toFixed(4)}°
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-slate-700">
                          {Number(item.longitude).toFixed(4)}°
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">
                      No recent analytics data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Devices Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Devices</h2>
              <p className="text-slate-600 text-sm mt-1">Connected IoT devices</p>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {stats.devicesCount} active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">IMEI</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Geo ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.length > 0 ? (
                  devices.map((device, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-slate-900">
                          {device.imei}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">
                          {device.geoid || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500 text-sm">
                      No devices available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
