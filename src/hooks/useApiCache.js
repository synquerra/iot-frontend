// src/hooks/useApiCache.js
import { useState, useEffect, useCallback, useRef } from 'react';

// Simple in-memory cache with TTL support
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  generateKey(fn, args) {
    return `${fn.name}_${JSON.stringify(args)}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data, ttl = 5 * 60 * 1000) { // Default 5 minutes TTL
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // Exact key match
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // Pattern match
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Request deduplication
  async dedupedRequest(key, requestFn) {
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request promise
    const requestPromise = requestFn()
      .finally(() => {
        // Clean up pending request when done
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }
}

// Global cache instance
const globalCache = new ApiCache();

/**
 * Custom hook for API data management with caching and enhanced error handling
 * @param {Function} apiFn - The API function to call
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Configuration options
 */
export function useApiCache(apiFn, dependencies = [], options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default TTL
    enabled = true,
    optimisticUpdates = false,
    retryOptions = { maxRetries: 3, retryDelay: 1000, exponentialBackoff: true },
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const mountedRef = useRef(true);
  const cacheKey = globalCache.generateKey(apiFn, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = globalCache.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );

      // Use request deduplication with retry options and timeout
      const result = await Promise.race([
        globalCache.dedupedRequest(cacheKey, async () => {
          const response = await apiFn(...dependencies, retryOptions);
          return response;
        }),
        timeoutPromise
      ]);

      if (!mountedRef.current) return;

      // Cache the result
      globalCache.set(cacheKey, result, ttl);
      
      setData(result);
      setLastFetch(Date.now());
      setRetryCount(0); // Reset retry count on success
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      if (!mountedRef.current) return;

      // Enhanced error handling
      const enhancedError = {
        ...err,
        timestamp: new Date().toISOString(),
        retryCount: retryCount + 1,
        isRetryable: err.retryable !== false,
        userMessage: getUserFriendlyErrorMessage(err)
      };

      setError(enhancedError);
      setRetryCount(prev => prev + 1);
      
      if (onError) {
        onError(enhancedError);
      }
      
      throw enhancedError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFn, cacheKey, enabled, ttl, retryOptions, retryCount, onSuccess, onError, ...dependencies]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optimistic update function
  const optimisticUpdate = useCallback((updateFn) => {
    if (!optimisticUpdates) return;

    setData(prevData => {
      const newData = updateFn(prevData);
      // Update cache optimistically
      globalCache.set(cacheKey, newData, ttl);
      return newData;
    });
  }, [cacheKey, ttl, optimisticUpdates]);

  // Manual refresh function with retry logic
  const refresh = useCallback(async () => {
    try {
      return await fetchData(true);
    } catch (error) {
      // For manual refresh, we might want to show a user notification
      console.error('Manual refresh failed:', error);
      throw error;
    }
  }, [fetchData]);

  // Invalidate cache for this key
  const invalidate = useCallback(() => {
    globalCache.invalidate(cacheKey);
  }, [cacheKey]);

  // Retry function for failed requests
  const retry = useCallback(async () => {
    if (!error || !error.isRetryable) {
      console.warn('Cannot retry: error is not retryable or no error exists');
      return;
    }
    
    return await refresh();
  }, [error, refresh]);

  return {
    data,
    loading,
    error,
    lastFetch,
    retryCount,
    refresh,
    retry,
    invalidate,
    optimisticUpdate,
    // Helper flags
    hasData: data !== null,
    canRetry: error && error.isRetryable,
    isRetrying: loading && retryCount > 0
  };
}

/**
 * Generate user-friendly error messages
 */
function getUserFriendlyErrorMessage(error) {
  if (!error) return 'An unknown error occurred';
  
  // Network errors
  if (error.name === 'NetworkError') {
    if (error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error.statusCode >= 500) {
      return 'Server is temporarily unavailable. Please try again in a few moments.';
    }
    if (error.statusCode === 404) {
      return 'The requested data could not be found.';
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'You are not authorized to access this data. Please log in again.';
    }
    return 'Network error occurred. Please check your connection and try again.';
  }
  
  // API errors
  if (error.name === 'ApiError') {
    if (error.message.includes('truncated')) {
      return 'Data transfer was incomplete. Please try refreshing.';
    }
    if (error.message.includes('JSON')) {
      return 'Received invalid data from server. Please try again.';
    }
    return error.message || 'An error occurred while fetching data.';
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return error.message || 'Invalid data provided.';
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }
  
  // Generic fallback
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Hook for managing multiple API calls with caching
 */
export function useMultipleApiCache(apiCalls, options = {}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrors({});

    const results = {};
    const errorResults = {};

    await Promise.allSettled(
      Object.entries(apiCalls).map(async ([key, { apiFn, dependencies = [], ttl }]) => {
        try {
          const cacheKey = globalCache.generateKey(apiFn, dependencies);
          
          // Check cache first
          if (!forceRefresh) {
            const cachedData = globalCache.get(cacheKey);
            if (cachedData) {
              results[key] = cachedData;
              return;
            }
          }

          // Fetch with deduplication
          const result = await globalCache.dedupedRequest(cacheKey, () => apiFn(...dependencies));
          globalCache.set(cacheKey, result, ttl || 5 * 60 * 1000);
          results[key] = result;
        } catch (error) {
          errorResults[key] = error;
        }
      })
    );

    setErrors(errorResults);
    setLoading(false);

    return { results, errors: errorResults };
  }, [apiCalls]);

  const refresh = useCallback(() => {
    return fetchAll(true);
  }, [fetchAll]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    errors,
    refresh,
    fetchAll
  };
}

// Utility functions for cache management
export const cacheUtils = {
  // Clear all cache
  clearAll: () => globalCache.clear(),
  
  // Invalidate by pattern
  invalidatePattern: (pattern) => globalCache.invalidate(pattern),
  
  // Get cache stats
  getStats: () => ({
    size: globalCache.cache.size,
    pendingRequests: globalCache.pendingRequests.size
  })
};