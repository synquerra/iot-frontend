// src/hooks/useTelemetryData.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApiCache } from './useApiCache';
import {
  getAnalyticsByImei,
  getAnalyticsHealth,
  ValidationError,
  ApiError,
  NetworkError
} from "../utils/analytics";

/**
 * Custom hook for managing telemetry data with caching, error handling, and graceful degradation
 * Handles device info, live data, and packet data for the telemetry page
 */
export function useTelemetryData(imei = null) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [partialDataErrors, setPartialDataErrors] = useState({});

  // Normalize IMEI: use default IMEI for testing when none provided
  const normalizedImei = imei || '7984561481678167';
  const isValidImei = !!normalizedImei;

  // Enhanced retry options for telemetry data
  const retryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true
  };

  // Fetch analytics data for the device with caching and enhanced error handling
  const { 
    data: analyticsData, 
    loading: analyticsLoading,
    error: analyticsError,
    refresh: refreshAnalytics,
    retry: retryAnalytics,
    canRetry: canRetryAnalytics,
    hasData: hasAnalyticsData
  } = useApiCache(
    getAnalyticsByImei, 
    [normalizedImei], 
    { 
      ttl: 30 * 1000, // 30 seconds TTL for real-time data
      enabled: isValidImei,
      retryOptions,
      onError: (error) => {
        console.error('Analytics data fetch failed:', error);
        setPartialDataErrors(prev => ({ ...prev, analytics: error }));
      },
      onSuccess: () => {
        // Clear analytics error on success
        setPartialDataErrors(prev => {
          const { analytics, ...rest } = prev;
          return rest;
        });
      }
    }
  );

  // Fetch device health data with caching and graceful degradation
  const { 
    data: healthData, 
    loading: healthLoading,
    error: healthError,
    refresh: refreshHealth,
    retry: retryHealth,
    canRetry: canRetryHealth,
    hasData: hasHealthData
  } = useApiCache(
    getAnalyticsHealth, 
    [normalizedImei], 
    { 
      ttl: 60 * 1000, // 1 minute TTL for health data
      enabled: isValidImei,
      retryOptions,
      onError: (error) => {
        console.warn('Health data fetch failed (non-critical):', error);
        setPartialDataErrors(prev => ({ ...prev, health: error }));
      },
      onSuccess: () => {
        // Clear health error on success
        setPartialDataErrors(prev => {
          const { health, ...rest } = prev;
          return rest;
        });
      }
    }
  );

  // Transform raw analytics data into structured telemetry data with error handling
  const telemetryData = useMemo(() => {
    try {
      // If API failed and we have no data, use fallback demo data
      if ((!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) && analyticsError) {
        console.log('Using fallback demo data due to API failure');
        const fallbackPacket = {
          imei: normalizedImei || '798456148167816',
          latitude: 40.7128,
          longitude: -74.0060,
          speed: 45,
          temperature: 25,
          battery: 85,
          deviceTimestamp: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          packetType: 'N'
        };
        
        return {
          deviceInfo: transformDeviceInfo(fallbackPacket, normalizedImei),
          liveData: transformLiveData(fallbackPacket),
          packetData: transformPacketData([fallbackPacket])
        };
      }

      if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
        return {
          deviceInfo: null,
          liveData: null,
          packetData: null
        };
      }

      // Sort by timestamp to get the latest data first
      const sortedData = [...analyticsData].sort((a, b) => {
        const timeA = new Date(a.deviceTimestamp || a.timestamp || 0).getTime();
        const timeB = new Date(b.deviceTimestamp || b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      const latestPacket = sortedData[0];
      
      // Transform device information with error handling
      const deviceInfo = transformDeviceInfo(latestPacket, normalizedImei);
      
      // Transform live telemetry data with error handling
      const liveData = transformLiveData(latestPacket);
      
      // Transform packet data with error handling
      const packetData = transformPacketData(sortedData);

      return {
        deviceInfo,
        liveData,
        packetData
      };
    } catch (error) {
      console.error('Error transforming telemetry data:', error);
      setPartialDataErrors(prev => ({ ...prev, transformation: error }));
      
      // Return partial data structure to prevent complete failure
      return {
        deviceInfo: normalizedImei ? { 
          imei: normalizedImei, 
          firmware: 'Unknown', 
          status: 'Unknown', 
          lastSeen: 'Unknown',
          isRecent: false 
        } : null,
        liveData: null,
        packetData: null
      };
    }
  }, [analyticsData, normalizedImei]);

  // Comprehensive refresh function with error handling
  const refreshData = useCallback(async () => {
    if (!normalizedImei) {
      const error = new ValidationError('No valid IMEI provided for data refresh');
      setRefreshError(error);
      throw error;
    }

    setIsRefreshing(true);
    setRefreshError(null);
    setPartialDataErrors({});

    const refreshPromises = [];
    const refreshResults = {};

    try {
      // Always try to refresh analytics data (critical)
      refreshPromises.push(
        refreshAnalytics()
          .then(result => {
            refreshResults.analytics = { success: true, data: result };
          })
          .catch(error => {
            refreshResults.analytics = { success: false, error };
            throw error; // Re-throw for critical data
          })
      );

      // Try to refresh health data (non-critical, graceful degradation)
      refreshPromises.push(
        refreshHealth()
          .then(result => {
            refreshResults.health = { success: true, data: result };
          })
          .catch(error => {
            refreshResults.health = { success: false, error };
            console.warn('Health data refresh failed (non-critical):', error);
            // Don't throw for non-critical data
          })
      );

      // Wait for all refresh attempts
      await Promise.allSettled(refreshPromises);

      // Check if critical data refresh succeeded
      if (!refreshResults.analytics?.success) {
        throw refreshResults.analytics?.error || new Error('Failed to refresh critical analytics data');
      }

      console.log('Data refresh completed:', refreshResults);
      
    } catch (error) {
      console.error('Refresh failed:', error);
      const enhancedError = {
        ...error,
        userMessage: getUserFriendlyRefreshErrorMessage(error),
        partialResults: refreshResults
      };
      setRefreshError(enhancedError);
      throw enhancedError;
    } finally {
      setIsRefreshing(false);
    }
  }, [normalizedImei, refreshAnalytics, refreshHealth]);

  // Retry function for failed requests
  const retryFailedRequests = useCallback(async () => {
    const retryPromises = [];
    
    if (canRetryAnalytics && analyticsError) {
      retryPromises.push(retryAnalytics());
    }
    
    if (canRetryHealth && healthError) {
      retryPromises.push(retryHealth().catch(err => {
        console.warn('Health data retry failed (non-critical):', err);
      }));
    }
    
    if (retryPromises.length === 0) {
      console.warn('No failed requests to retry');
      return;
    }
    
    try {
      await Promise.allSettled(retryPromises);
    } catch (error) {
      console.error('Retry failed:', error);
      throw error;
    }
  }, [canRetryAnalytics, analyticsError, retryAnalytics, canRetryHealth, healthError, retryHealth]);

  // Combined loading state
  const loading = analyticsLoading || healthLoading;

  // Primary error (analytics is critical, health is not)
  const primaryError = analyticsError;

  // Data availability check with graceful degradation
  const hasData = telemetryData.deviceInfo !== null;
  const hasPartialData = hasAnalyticsData || hasHealthData;
  const hasErrors = Object.keys(partialDataErrors).length > 0;

  // Error summary for user display
  const errorSummary = useMemo(() => {
    const errors = [];
    
    if (analyticsError) {
      errors.push({
        type: 'critical',
        component: 'telemetry data',
        error: analyticsError,
        canRetry: canRetryAnalytics
      });
    }
    
    if (healthError) {
      errors.push({
        type: 'warning',
        component: 'health data',
        error: healthError,
        canRetry: canRetryHealth
      });
    }
    
    if (refreshError) {
      errors.push({
        type: 'refresh',
        component: 'data refresh',
        error: refreshError,
        canRetry: true
      });
    }
    
    return errors;
  }, [analyticsError, healthError, refreshError, canRetryAnalytics, canRetryHealth]);

  return {
    // Structured data
    data: telemetryData,
    healthData,
    
    // State flags
    loading,
    error: primaryError,
    hasData,
    hasPartialData,
    hasErrors,
    isRefreshing,
    
    // Error details
    errorSummary,
    partialDataErrors,
    
    // Actions
    refreshData,
    retryFailedRequests,
    
    // Retry capabilities
    canRetry: canRetryAnalytics || canRetryHealth,
    canRetryAnalytics,
    canRetryHealth
  };
}

/**
 * Transform device information with error handling
 */
function transformDeviceInfo(packet, imei) {
  try {
    if (!packet) {
      return imei ? {
        imei: imei,
        firmware: 'Unknown',
        status: 'Offline',
        lastSeen: 'Unknown',
        isRecent: false
      } : null;
    }

    return {
      imei: packet.imei || imei || 'Unknown',
      firmware: '516v151', // Static for now, could be extracted from packet data
      status: determineDeviceStatus(packet),
      lastSeen: formatTimestamp(packet.deviceTimestamp || packet.timestamp),
      isRecent: isRecentTimestamp(packet.deviceTimestamp || packet.timestamp)
    };
  } catch (error) {
    console.error('Error transforming device info:', error);
    return imei ? {
      imei: imei,
      firmware: 'Error',
      status: 'Unknown',
      lastSeen: 'Error',
      isRecent: false
    } : null;
  }
}

/**
 * Transform live telemetry data with error handling
 */
function transformLiveData(packet) {
  try {
    if (!packet) return null;

    return {
      latitude: safeNumber(packet.latitude, 0),
      longitude: safeNumber(packet.longitude, 0),
      speed: safeNumber(packet.speed, 0),
      temperature: safeNumber(packet.rawTemperature, 0),
      battery: safeNumber(packet.battery, 0),
      hasHighTemp: safeNumber(packet.rawTemperature, 0) > 50,
      hasHighSpeed: safeNumber(packet.speed, 0) > 100
    };
  } catch (error) {
    console.error('Error transforming live data:', error);
    return {
      latitude: 0,
      longitude: 0,
      speed: 0,
      temperature: 0,
      battery: 0,
      hasHighTemp: false,
      hasHighSpeed: false
    };
  }
}

/**
 * Transform packet data with error handling
 */
function transformPacketData(sortedData) {
  try {
    if (!sortedData || sortedData.length === 0) return null;

    const latestPacket = sortedData[0];

    // Transform normal packet
    const normalPacket = {
      lat: safeNumber(latestPacket.latitude, 0),
      lng: safeNumber(latestPacket.longitude, 0),
      speed: safeNumber(latestPacket.speed, 0),
      temp: safeNumber(latestPacket.rawTemperature, 0),
      battery: safeNumber(latestPacket.battery, 0)
    };

    // Find error packets (packets with alert field)
    const errorPackets = sortedData.filter(packet => packet.alert && packet.alert.trim() !== '');
    const errorPacket = errorPackets.length > 0 ? {
      code: errorPackets[0].alert,
      timestamp: formatTimestamp(errorPackets[0].deviceTimestamp || errorPackets[0].timestamp)
    } : null;

    return {
      normalPacket,
      errorPacket
    };
  } catch (error) {
    console.error('Error transforming packet data:', error);
    return {
      normalPacket: {
        lat: 0,
        lng: 0,
        speed: 0,
        temp: 0,
        battery: 0
      },
      errorPacket: null
    };
  }
}

/**
 * Safe number conversion with fallback
 */
function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/**
 * Determine device status based on the latest packet timestamp
 */
function determineDeviceStatus(packet) {
  if (!packet) return 'Offline';
  
  try {
    const timestamp = packet.deviceTimestamp || packet.timestamp;
    if (!timestamp) return 'Offline';
    
    const lastSeen = new Date(timestamp);
    if (isNaN(lastSeen.getTime())) return 'Offline';
    
    const now = new Date();
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    
    // Consider device online if last packet was within 10 minutes
    return diffMinutes <= 10 ? 'Online' : 'Offline';
  } catch (error) {
    console.error('Error determining device status:', error);
    return 'Unknown';
  }
}

/**
 * Check if timestamp is within the last 5 minutes (considered "recent")
 */
function isRecentTimestamp(timestamp) {
  if (!timestamp) return false;
  
  try {
    const lastSeen = new Date(timestamp);
    if (isNaN(lastSeen.getTime())) return false;
    
    const now = new Date();
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    
    return diffMinutes <= 5;
  } catch (error) {
    console.error('Error checking recent timestamp:', error);
    return false;
  }
}

/**
 * Format timestamp to DD-MM-YYYY HH:MM:SS format
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Format Error';
  }
}

/**
 * Generate user-friendly error messages for refresh operations
 */
function getUserFriendlyRefreshErrorMessage(error) {
  if (!error) return 'Refresh failed for unknown reason';
  
  if (error instanceof ValidationError) {
    return 'Invalid device information provided';
  }
  
  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  if (error instanceof ApiError) {
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return 'Server error occurred. Please try again in a few moments.';
  }
  
  return error.userMessage || error.message || 'Refresh failed. Please try again.';
}