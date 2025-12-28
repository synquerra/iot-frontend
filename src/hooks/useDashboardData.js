// src/hooks/useDashboardData.js
import { useState, useCallback, useMemo } from 'react';
import { useApiCache, useMultipleApiCache } from './useApiCache';
import {
  getAnalyticsCount,
  getAnalyticsPaginated,
  getAllAnalytics,
  getAnalyticsByImei,
} from "../utils/analytics";
import { listDevices } from "../utils/device";

/**
 * Custom hook for managing dashboard data with caching and optimizations
 */
export function useDashboardData() {
  const [selectedImei, setSelectedImei] = useState("");
  const [locationPath, setLocationPath] = useState([]);

  // Cache dashboard data with different TTL for different data types
  const dashboardApiCalls = useMemo(() => ({
    analyticsCount: {
      apiFn: getAnalyticsCount,
      dependencies: [],
      ttl: 2 * 60 * 1000 // 2 minutes for counts
    },
    recentAnalytics: {
      apiFn: getAnalyticsPaginated,
      dependencies: [0, 10],
      ttl: 1 * 60 * 1000 // 1 minute for recent data
    },
    devices: {
      apiFn: listDevices,
      dependencies: [],
      ttl: 5 * 60 * 1000 // 5 minutes for device list
    },
    allAnalytics: {
      apiFn: getAllAnalytics,
      dependencies: [],
      ttl: 3 * 60 * 1000 // 3 minutes for all analytics
    }
  }), []);

  const { loading, errors, refresh: refreshAll } = useMultipleApiCache(dashboardApiCalls);

  // Individual data hooks for more granular control
  const { 
    data: totalAnalytics, 
    loading: countLoading,
    refresh: refreshCount 
  } = useApiCache(getAnalyticsCount, [], { ttl: 2 * 60 * 1000 });

  const { 
    data: recentAnalytics, 
    loading: recentLoading,
    refresh: refreshRecent 
  } = useApiCache(getAnalyticsPaginated, [0, 10], { ttl: 1 * 60 * 1000 });

  const { 
    data: devicesResponse, 
    loading: devicesLoading,
    refresh: refreshDevices 
  } = useApiCache(listDevices, [], { ttl: 5 * 60 * 1000 });

  const { 
    data: allAnalytics, 
    loading: allAnalyticsLoading,
    refresh: refreshAllAnalytics 
  } = useApiCache(getAllAnalytics, [], { ttl: 3 * 60 * 1000 });

  // Location data with shorter TTL for real-time updates
  const { 
    data: locationData, 
    loading: locationLoading,
    refresh: refreshLocation,
    optimisticUpdate: updateLocationOptimistically 
  } = useApiCache(
    getAnalyticsByImei, 
    [selectedImei], 
    { 
      ttl: 30 * 1000, // 30 seconds for location data
      enabled: !!selectedImei,
      optimisticUpdates: true 
    }
  );

  // Processed data with memoization
  const processedData = useMemo(() => {
    const devices = Array.isArray(devicesResponse?.devices)
      ? devicesResponse.devices
      : Array.isArray(devicesResponse?.full)
      ? devicesResponse.full
      : [];

    const analytics = Array.isArray(recentAnalytics) ? recentAnalytics : [];
    const allData = Array.isArray(allAnalytics) ? allAnalytics : [];

    // Process speed chart data
    const speedChart = (() => {
      const ranges = {
        "0 - 20": 0,
        "20 - 40": 0,
        "40 - 60": 0,
        "60 - 80": 0,
        "80+": 0,
      };

      allData.forEach((a) => {
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

    // Process geographic distribution
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

    // Process location path
    const processedLocationPath = Array.isArray(locationData) 
      ? locationData
          .map((p) => ({
            lat: Number(p.latitude),
            lng: Number(p.longitude),
            time: p.timestampIso || p.timestamp,
          }))
          .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
      : [];

    return {
      totalAnalytics: Number(totalAnalytics) || 0,
      recentAnalytics: analytics,
      devices: devices.slice(0, 10),
      speedChart,
      geoPie,
      locationPath: processedLocationPath,
      stats: {
        devicesCount: devices.length,
        recentCount: analytics.length,
        totalAnalytics: Number(totalAnalytics) || 0
      }
    };
  }, [totalAnalytics, recentAnalytics, devicesResponse, allAnalytics, locationData]);

  // Load location history with caching
  const loadHistory = useCallback(async (imei) => {
    if (!imei) {
      setSelectedImei("");
      setLocationPath([]);
      return;
    }

    setSelectedImei(imei);
    
    try {
      // This will use the cached data if available
      await refreshLocation();
    } catch (e) {
      console.error("path error:", e);
      setLocationPath([]);
    }
  }, [refreshLocation]);

  // Optimistic update for real-time data
  const addOptimisticAnalytics = useCallback((newData) => {
    updateLocationOptimistically(prevData => {
      if (!Array.isArray(prevData)) return [newData];
      return [newData, ...prevData];
    });
  }, [updateLocationOptimistically]);

  // Comprehensive refresh function
  const refreshDashboard = useCallback(async () => {
    try {
      await Promise.all([
        refreshCount(),
        refreshRecent(),
        refreshDevices(),
        refreshAllAnalytics()
      ]);
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      throw error;
    }
  }, [refreshCount, refreshRecent, refreshDevices, refreshAllAnalytics]);

  // Loading states
  const isLoading = loading || countLoading || recentLoading || devicesLoading || allAnalyticsLoading;
  const isLocationLoading = locationLoading;

  // Error handling
  const hasErrors = Object.keys(errors).length > 0;
  const errorMessage = hasErrors 
    ? Object.values(errors).map(e => e.message).join(', ')
    : null;

  return {
    // Data
    ...processedData,
    selectedImei,
    
    // Loading states
    loading: isLoading,
    locationLoading: isLocationLoading,
    
    // Error handling
    error: errorMessage,
    errors,
    
    // Actions
    loadHistory,
    refreshDashboard,
    addOptimisticAnalytics,
    
    // Individual refresh functions
    refreshCount,
    refreshRecent,
    refreshDevices,
    refreshAllAnalytics,
    refreshLocation
  };
}