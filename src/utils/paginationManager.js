// src/utils/paginationManager.js

/**
 * PaginationManager - Handles large datasets through paginated requests
 */
export class PaginationManager {
  constructor(options = {}) {
    this.defaultPageSize = options.defaultPageSize || 1000;
    this.maxPageSize = options.maxPageSize || 5000;
    this.maxPages = options.maxPages || 100;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Fetch data using automatic pagination
   */
  async fetchPaginated(queryFunction, options = {}) {
    const {
      pageSize = this.defaultPageSize,
      maxPages = this.maxPages,
      sortOrder = 'desc',
      sortField = 'timestamp',
      onProgress = null,
      validateResponse = null
    } = options;

    const results = [];
    let currentPage = 0;
    let hasMoreData = true;
    let totalFetched = 0;

    console.log(`🔄 Starting paginated fetch - Page size: ${pageSize}, Max pages: ${maxPages}`);

    while (hasMoreData && currentPage < maxPages) {
      try {
        const skip = currentPage * pageSize;
        
        console.log(`📄 Fetching page ${currentPage + 1}, skip: ${skip}, limit: ${pageSize}`);
        
        // Call the query function with pagination parameters
        const pageData = await this.retryWithBackoff(
          () => queryFunction(skip, pageSize),
          this.retryAttempts
        );

        // Validate response if validator provided
        if (validateResponse) {
          const validation = validateResponse(pageData);
          if (!validation.isValid) {
            console.warn(`⚠️ Page ${currentPage + 1} validation failed:`, validation.errors);
            if (validation.isTruncated) {
              throw new Error(`Page ${currentPage + 1} response was truncated`);
            }
          }
        }

        const pageResults = Array.isArray(pageData) ? pageData : [];
        results.push(...pageResults);
        totalFetched += pageResults.length;

        // Check if we have more data
        hasMoreData = pageResults.length === pageSize;
        
        console.log(`✅ Page ${currentPage + 1} completed: ${pageResults.length} items (Total: ${totalFetched})`);

        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            currentPage: currentPage + 1,
            totalPages: hasMoreData ? '?' : currentPage + 1,
            itemsThisPage: pageResults.length,
            totalItems: totalFetched,
            hasMoreData
          });
        }

        currentPage++;

        // Small delay to prevent overwhelming the server
        if (hasMoreData && currentPage < maxPages) {
          await this.delay(100);
        }

      } catch (error) {
        console.error(`❌ Error fetching page ${currentPage + 1}:`, error.message);
        
        // If it's a truncation error, try with smaller page size
        if (error.message.includes('truncated') && pageSize > 100) {
          console.log(`🔄 Retrying with smaller page size: ${Math.floor(pageSize / 2)}`);
          return this.fetchPaginated(queryFunction, {
            ...options,
            pageSize: Math.floor(pageSize / 2)
          });
        }
        
        throw error;
      }
    }

    console.log(`🎉 Pagination completed: ${totalFetched} total items across ${currentPage} pages`);
    
    // Sort results if needed
    if (sortField && results.length > 0) {
      results.sort((a, b) => {
        const aVal = this.getNestedValue(a, sortField);
        const bVal = this.getNestedValue(b, sortField);
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    }

    return results;
  }

  /**
   * Fetch data in chunks for a specific IMEI
   */
  async fetchInChunks(queryFunction, imei, options = {}) {
    const {
      chunkSize = this.defaultPageSize,
      maxChunks = this.maxPages,
      onProgress = null
    } = options;

    console.log(`🔄 Starting chunked fetch for IMEI: ${imei}`);

    // First, try to get total count if possible
    let totalEstimate = null;
    try {
      // This would need to be implemented in the analytics API
      // totalEstimate = await getAnalyticsCountByImei(imei);
    } catch (error) {
      console.log("Could not get total count estimate");
    }

    const results = [];
    let currentChunk = 0;
    let hasMoreData = true;
    let totalFetched = 0;

    while (hasMoreData && currentChunk < maxChunks) {
      try {
        const skip = currentChunk * chunkSize;
        
        console.log(`📦 Fetching chunk ${currentChunk + 1} for ${imei}, skip: ${skip}, limit: ${chunkSize}`);
        
        // For IMEI-specific queries, we'll need to modify the query function
        // to support pagination parameters
        const chunkData = await this.retryWithBackoff(
          () => queryFunction(imei, skip, chunkSize),
          this.retryAttempts
        );

        const chunkResults = Array.isArray(chunkData) ? chunkData : [];
        results.push(...chunkResults);
        totalFetched += chunkResults.length;

        // Check if we have more data
        hasMoreData = chunkResults.length === chunkSize;
        
        console.log(`✅ Chunk ${currentChunk + 1} completed: ${chunkResults.length} items (Total: ${totalFetched})`);

        // Call progress callback if provided
        if (onProgress) {
          const progress = {
            currentChunk: currentChunk + 1,
            totalChunks: totalEstimate ? Math.ceil(totalEstimate / chunkSize) : '?',
            itemsThisChunk: chunkResults.length,
            totalItems: totalFetched,
            hasMoreData,
            completionPercentage: totalEstimate ? (totalFetched / totalEstimate) * 100 : null
          };
          onProgress(progress);
        }

        currentChunk++;

        // Small delay between chunks
        if (hasMoreData && currentChunk < maxChunks) {
          await this.delay(150);
        }

      } catch (error) {
        console.error(`❌ Error fetching chunk ${currentChunk + 1} for ${imei}:`, error.message);
        
        // If it's a truncation error, try with smaller chunk size
        if (error.message.includes('truncated') && chunkSize > 100) {
          console.log(`🔄 Retrying with smaller chunk size: ${Math.floor(chunkSize / 2)}`);
          return this.fetchInChunks(queryFunction, imei, {
            ...options,
            chunkSize: Math.floor(chunkSize / 2)
          });
        }
        
        throw error;
      }
    }

    console.log(`🎉 Chunked fetch completed for ${imei}: ${totalFetched} total items across ${currentChunk} chunks`);
    return results;
  }

  /**
   * Retry function with exponential backoff
   */
  async retryWithBackoff(fn, maxAttempts = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Calculate optimal chunk size based on response patterns
   */
  calculateOptimalChunkSize(averageItemSize, targetResponseSize = 1024 * 1024) { // 1MB target
    if (!averageItemSize || averageItemSize <= 0) {
      return this.defaultPageSize;
    }
    
    const optimalSize = Math.floor(targetResponseSize / averageItemSize);
    return Math.max(10, Math.min(optimalSize, this.maxPageSize));
  }

  /**
   * Estimate total pages based on sample
   */
  estimateTotalPages(sampleSize, samplePageSize, totalCount) {
    if (!totalCount || totalCount <= 0) {
      return null;
    }
    
    const estimatedPageSize = samplePageSize || this.defaultPageSize;
    return Math.ceil(totalCount / estimatedPageSize);
  }
}

/**
 * Convenience function for simple pagination
 */
export async function fetchWithPagination(queryFunction, options = {}) {
  const manager = new PaginationManager();
  return manager.fetchPaginated(queryFunction, options);
}

/**
 * Convenience function for chunked fetching
 */
export async function fetchInChunks(queryFunction, identifier, options = {}) {
  const manager = new PaginationManager();
  return manager.fetchInChunks(queryFunction, identifier, options);
}