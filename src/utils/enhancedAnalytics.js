// src/utils/enhancedAnalytics.js

import { ResponseValidator } from './responseValidator.js';
import { PaginationManager } from './paginationManager.js';
import { QueryOptimizer } from './queryOptimizer.js';
import { 
  getAnalyticsPaginated, 
  getAnalyticsCount,
  extractTimestamp,
  normalize,
  sortPackets,
  sendQuery 
} from './analytics.js';

/**
 * EnhancedAnalyticsAPI - Safe analytics data fetching with truncation handling
 */
export class EnhancedAnalyticsAPI {
  constructor(options = {}) {
    this.validator = new ResponseValidator(options.validation);
    this.paginationManager = new PaginationManager(options.pagination);
    this.queryOptimizer = new QueryOptimizer();
    this.maxRetries = options.maxRetries || 3;
    this.fallbackPageSize = options.fallbackPageSize || 500;
  }

  /**
   * Safely get all analytics data with automatic pagination
   */
  async getAllAnalyticsSafe(options = {}) {
    const {
      pageSize = 1000,
      maxPages = 50,
      onProgress = null,
      includeRawData = false
    } = options;

    console.log("🚀 Starting safe analytics fetch with pagination");

    try {
      // First, get total count to estimate progress
      let totalCount = 0;
      try {
        totalCount = await getAnalyticsCount();
        console.log(`📊 Total analytics records: ${totalCount}`);
      } catch (error) {
        console.warn("Could not get total count:", error.message);
      }

      // Create paginated query function
      const paginatedQuery = async (skip, limit) => {
        console.log(`🔍 Fetching analytics: skip=${skip}, limit=${limit}`);
        
        const data = await getAnalyticsPaginated(skip, limit);
        
        // Validate response
        const validation = this.validator.validateResponse(data);
        if (!validation.isValid) {
          console.warn("Response validation failed:", validation.errors);
          if (validation.isTruncated) {
            throw new Error("Response was truncated");
          }
        }
        
        return data;
      };

      // Enhanced progress callback
      const progressCallback = onProgress ? (progress) => {
        const enhancedProgress = {
          ...progress,
          totalEstimated: totalCount,
          completionPercentage: totalCount > 0 ? (progress.totalItems / totalCount) * 100 : null
        };
        onProgress(enhancedProgress);
      } : null;

      // Fetch with pagination
      const results = await this.paginationManager.fetchPaginated(paginatedQuery, {
        pageSize,
        maxPages,
        onProgress: progressCallback,
        validateResponse: (data) => this.validator.validateResponse(data)
      });

      console.log(`✅ Successfully fetched ${results.length} analytics records`);
      return results;

    } catch (error) {
      console.error("❌ Error in getAllAnalyticsSafe:", error.message);
      
      // Try fallback with smaller page size
      if (error.message.includes('truncated') && pageSize > this.fallbackPageSize) {
        console.log(`🔄 Retrying with fallback page size: ${this.fallbackPageSize}`);
        return this.getAllAnalyticsSafe({
          ...options,
          pageSize: this.fallbackPageSize
        });
      }
      
      throw error;
    }
  }

  /**
   * Safely get analytics by IMEI with query optimization
   * This method uses the QueryOptimizer to prevent truncation
   */
  async getAnalyticsByImeiOptimized(imei, options = {}) {
    const {
      viewType = 'map', // Default to map context for location data
      maxRetries = 3,
      onProgress = null
    } = options;

    console.log(`🎯 Starting optimized IMEI analytics fetch for: ${imei} (context: ${viewType})`);

    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        // Create optimized query for this context
        const optimizedQuery = this.queryOptimizer.createOptimizedQuery('getAnalyticsByImei', {
          viewType,
          imei
        });

        // Analyze the query before sending
        const analysis = this.queryOptimizer.analyzeQueryComplexity(optimizedQuery);
        console.log(`📊 Query analysis - Size: ${(analysis.estimatedSize / 1024).toFixed(2)}KB, Fields: ${analysis.totalFields}`);

        // Log any recommendations
        if (analysis.recommendations.length > 0) {
          console.log("💡 Query recommendations:");
          analysis.recommendations.forEach(rec => {
            console.log(`   ${rec.type.toUpperCase()}: ${rec.message}`);
          });
        }

        // Send the optimized query
        const result = await sendQuery(optimizedQuery);
        const data = result.analyticsDataByImei || [];

        // Validate response
        const validation = this.validator.validateResponse(data);
        if (!validation.isValid) {
          console.warn("Response validation failed:", validation.errors);
          if (validation.isTruncated) {
            throw new Error("Response was truncated despite optimization");
          }
        }

        // Normalize and sort the data
        const cleaned = normalize(data);
        const sorted = sortPackets(cleaned);

        console.log(`✅ Successfully fetched ${sorted.length} optimized records for IMEI: ${imei}`);
        
        if (onProgress) {
          onProgress({
            status: 'completed',
            totalItems: sorted.length,
            optimization: {
              context: viewType,
              estimatedSize: analysis.estimatedSize,
              fieldsIncluded: analysis.totalFields
            }
          });
        }

        return sorted;

      } catch (error) {
        attempt++;
        lastError = error;
        
        console.error(`❌ Attempt ${attempt} failed for IMEI ${imei}:`, error.message);

        if (attempt < maxRetries) {
          // Try with more aggressive optimization
          if (error.message.includes('truncated')) {
            console.log(`🔄 Retrying with more aggressive optimization (attempt ${attempt + 1})`);
            
            // Switch to more restrictive context
            const fallbackContexts = {
              'details': 'dashboard',
              'analytics': 'map',
              'dashboard': 'map',
              'map': 'map' // Already most restrictive
            };
            
            options.viewType = fallbackContexts[viewType] || 'map';
            
            // Add a small delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          } else {
            // For non-truncation errors, don't retry
            break;
          }
        }
      }
    }

    // If all retries failed, fall back to the chunked approach
    console.log("🔄 All optimization attempts failed, falling back to chunked approach");
    return this.getAnalyticsByImeiSafe(imei, options);
  }

  /**
   * Safely get analytics by IMEI with chunking
   */
  async getAnalyticsByImeiSafe(imei, options = {}) {
    const {
      chunkSize = 1000,
      maxChunks = 20,
      onProgress = null
    } = options;

    console.log(`🚀 Starting safe IMEI analytics fetch for: ${imei}`);

    try {
      // Create a modified query function that works with our pagination
      // Since the original getAnalyticsByImei doesn't support pagination,
      // we'll need to implement a workaround
      const results = await this.getAnalyticsByImeiChunked(imei, {
        chunkSize,
        maxChunks,
        onProgress
      });

      console.log(`✅ Successfully fetched ${results.length} records for IMEI: ${imei}`);
      return results;

    } catch (error) {
      console.error(`❌ Error fetching analytics for IMEI ${imei}:`, error.message);
      
      // Try fallback with smaller chunk size
      if (error.message.includes('truncated') && chunkSize > 100) {
        console.log(`🔄 Retrying with smaller chunk size: ${Math.floor(chunkSize / 2)}`);
        return this.getAnalyticsByImeiSafe(imei, {
          ...options,
          chunkSize: Math.floor(chunkSize / 2)
        });
      }
      
      throw error;
    }
  }

  /**
   * Get analytics by IMEI using time-based chunking
   * Since the API doesn't support pagination for IMEI queries,
   * we'll implement time-based chunking as a workaround
   */
  async getAnalyticsByImeiChunked(imei, options = {}) {
    const {
      chunkSize = 1000,
      maxChunks = 20,
      onProgress = null
    } = options;

    console.log(`📦 Fetching IMEI analytics in chunks for: ${imei}`);

    try {
      // First, try to get all data and see if it works
      const { getAnalyticsByImei } = await import('./analytics.js');
      
      console.log("🔍 Attempting full IMEI fetch first...");
      const fullData = await getAnalyticsByImei(imei);
      
      // Validate the response
      const validation = this.validator.validateResponse(fullData);
      
      if (validation.isValid && !validation.isTruncated) {
        console.log(`✅ Full IMEI fetch successful: ${fullData.length} records`);
        return fullData;
      }
      
      if (validation.isTruncated) {
        console.warn("⚠️ Full IMEI fetch was truncated, falling back to chunked approach");
        throw new Error("Response was truncated");
      }
      
      return fullData;
      
    } catch (error) {
      if (error.message.includes('truncated')) {
        console.log("🔄 Implementing time-based chunking fallback...");
        return this.getAnalyticsByImeiWithTimeChunking(imei, options);
      }
      throw error;
    }
  }

  /**
   * Fallback method: Get analytics by IMEI using time-based chunking
   */
  async getAnalyticsByImeiWithTimeChunking(imei, options = {}) {
    const {
      onProgress = null,
      daysPerChunk = 7 // Fetch 7 days at a time
    } = options;

    console.log(`⏰ Using time-based chunking for IMEI: ${imei}`);

    // This is a conceptual implementation - the actual API would need
    // to support date range queries for this to work
    const results = [];
    const now = new Date();
    const startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago
    
    let currentDate = new Date(startDate);
    let chunkCount = 0;
    const maxChunks = Math.ceil(90 / daysPerChunk);

    while (currentDate < now && chunkCount < maxChunks) {
      const endDate = new Date(currentDate.getTime() + (daysPerChunk * 24 * 60 * 60 * 1000));
      
      try {
        console.log(`📅 Fetching chunk ${chunkCount + 1}: ${currentDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
        
        // Note: This would require API support for date range queries
        // For now, we'll fall back to the original method with smaller expectations
        const { getAnalyticsByImei } = await import('./analytics.js');
        const chunkData = await getAnalyticsByImei(imei);
        
        // Filter by date range (client-side filtering as fallback)
        const filteredData = chunkData.filter(item => {
          const itemDate = extractTimestamp(item);
          return itemDate && itemDate >= currentDate && itemDate < endDate;
        });
        
        results.push(...filteredData);
        
        if (onProgress) {
          onProgress({
            currentChunk: chunkCount + 1,
            totalChunks: maxChunks,
            itemsThisChunk: filteredData.length,
            totalItems: results.length,
            dateRange: {
              start: currentDate.toISOString().split('T')[0],
              end: endDate.toISOString().split('T')[0]
            }
          });
        }
        
        chunkCount++;
        currentDate = endDate;
        
        // If we got the full dataset on first try, break
        if (chunkCount === 1 && chunkData.length < 1000) {
          console.log("📊 Small dataset detected, using full result");
          return chunkData;
        }
        
      } catch (error) {
        console.error(`❌ Error in time chunk ${chunkCount + 1}:`, error.message);
        break;
      }
    }

    // Remove duplicates and sort
    const uniqueResults = this.removeDuplicates(results, 'id');
    return sortPackets(uniqueResults);
  }

  /**
   * Remove duplicate records based on a key
   */
  removeDuplicates(array, key) {
    const seen = new Set();
    return array.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  }

  /**
   * Get recent analytics with safe pagination
   */
  async getRecentAnalyticsSafe(limit = 10, options = {}) {
    console.log(`🕒 Fetching recent analytics (limit: ${limit})`);
    
    try {
      const data = await getAnalyticsPaginated(0, limit);
      
      // Validate response
      const validation = this.validator.validateResponse(data);
      if (!validation.isValid) {
        console.warn("Recent analytics validation failed:", validation.errors);
        if (validation.isTruncated) {
          throw new Error("Response was truncated");
        }
      }
      
      return data;
      
    } catch (error) {
      console.error("❌ Error fetching recent analytics:", error.message);
      
      // Try with smaller limit
      if (error.message.includes('truncated') && limit > 5) {
        console.log(`🔄 Retrying with smaller limit: ${Math.floor(limit / 2)}`);
        return this.getRecentAnalyticsSafe(Math.floor(limit / 2), options);
      }
      
      throw error;
    }
  }

  /**
   * Health check for analytics API
   */
  async healthCheck() {
    console.log("🏥 Performing analytics API health check");
    
    const health = {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Basic count query
      const startTime = Date.now();
      const count = await getAnalyticsCount();
      const countTime = Date.now() - startTime;
      
      health.tests.count = {
        status: 'pass',
        responseTime: countTime,
        result: count
      };

      // Test 2: Small paginated query
      const paginatedStart = Date.now();
      const smallData = await getAnalyticsPaginated(0, 5);
      const paginatedTime = Date.now() - paginatedStart;
      
      const validation = this.validator.validateResponse(smallData);
      
      health.tests.pagination = {
        status: validation.isValid ? 'pass' : 'fail',
        responseTime: paginatedTime,
        validation: validation,
        recordCount: Array.isArray(smallData) ? smallData.length : 0
      };

      // Overall status
      const allTestsPassed = Object.values(health.tests).every(test => test.status === 'pass');
      health.status = allTestsPassed ? 'healthy' : 'degraded';

    } catch (error) {
      health.status = 'unhealthy';
      health.error = error.message;
    }

    console.log(`🏥 Health check completed: ${health.status}`);
    return health;
  }
}

// Convenience functions for backward compatibility
export async function getAllAnalyticsSafe(options = {}) {
  const api = new EnhancedAnalyticsAPI();
  return api.getAllAnalyticsSafe(options);
}

export async function getAnalyticsByImeiSafe(imei, options = {}) {
  const api = new EnhancedAnalyticsAPI();
  return api.getAnalyticsByImeiSafe(imei, options);
}

export async function getAnalyticsByImeiOptimized(imei, options = {}) {
  const api = new EnhancedAnalyticsAPI();
  return api.getAnalyticsByImeiOptimized(imei, options);
}

export async function getRecentAnalyticsSafe(limit = 10, options = {}) {
  const api = new EnhancedAnalyticsAPI();
  return api.getRecentAnalyticsSafe(limit, options);
}