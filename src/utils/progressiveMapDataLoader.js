/**
 * Progressive Map Data Loader
 * 
 * Handles progressive loading of location data for map components.
 * Implements chunked fetching, progress callbacks, and data sampling
 * for optimal map rendering performance.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

/**
 * Configuration for progressive data loading
 */
const DEFAULT_CONFIG = {
  chunkSize: 100,           // Points per chunk (Requirement 2.1)
  maxPoints: 1000,          // Maximum points before sampling kicks in
  samplingThreshold: 500,   // Start sampling above this threshold
  samplingRatio: 0.5,       // Sample 50% of points when over threshold
  retryAttempts: 3,
  retryDelay: 1000,         // ms
};

/**
 * Progressive Map Data Loader Class
 * 
 * Loads location data in chunks with progress reporting and automatic
 * sampling for large datasets.
 */
export class ProgressiveMapDataLoader {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Load location data progressively in chunks
   * 
   * @param {Function} fetchFunction - Async function that fetches data (imei) => Promise<LocationPoint[]>
   * @param {string} imei - Device IMEI to fetch data for
   * @param {Object} options - Loading options
   * @param {Function} options.onProgress - Progress callback (progress) => void
   * @param {Function} options.onChunk - Chunk callback (chunk, chunkIndex) => void
   * @param {number} options.chunkSize - Override default chunk size
   * @param {boolean} options.enableSampling - Enable automatic sampling for large datasets
   * @returns {Promise<{data: LocationPoint[], metadata: Object}>}
   * 
   * Requirements: 2.1 (chunked loading), 2.3 (progress indicator)
   */
  async loadLocationDataProgressive(fetchFunction, imei, options = {}) {
    const {
      onProgress = null,
      onChunk = null,
      chunkSize = this.config.chunkSize,
      enableSampling = true,
    } = options;

    const startTime = performance.now();
    let allData = [];
    let chunkIndex = 0;
    let totalFetched = 0;

    try {
      // Report initial loading state
      this._reportProgress(onProgress, {
        status: 'loading',
        progress: 0,
        totalPoints: 0,
        chunksLoaded: 0,
        message: 'Starting data fetch...',
      });

      // Fetch all data first (we'll chunk it for progressive rendering)
      const fullData = await this._fetchWithRetry(fetchFunction, imei);
      
      if (!Array.isArray(fullData) || fullData.length === 0) {
        this._reportProgress(onProgress, {
          status: 'complete',
          progress: 100,
          totalPoints: 0,
          chunksLoaded: 0,
          message: 'No location data available',
        });
        
        return {
          data: [],
          metadata: {
            totalPoints: 0,
            chunksLoaded: 0,
            loadTime: performance.now() - startTime,
            sampled: false,
          },
        };
      }

      // Apply sampling if dataset is large (Requirement 2.2)
      const processedData = enableSampling && fullData.length > this.config.samplingThreshold
        ? this._sampleData(fullData)
        : fullData;

      const wasSampled = processedData.length < fullData.length;
      const totalChunks = Math.ceil(processedData.length / chunkSize);

      // Process data in chunks for progressive rendering
      for (let i = 0; i < processedData.length; i += chunkSize) {
        const chunk = processedData.slice(i, i + chunkSize);
        allData = [...allData, ...chunk];
        chunkIndex++;
        totalFetched += chunk.length;

        // Report progress (Requirement 2.3)
        const progress = Math.min(100, Math.round((totalFetched / processedData.length) * 100));
        this._reportProgress(onProgress, {
          status: 'loading',
          progress,
          totalPoints: totalFetched,
          estimatedTotal: processedData.length,
          chunksLoaded: chunkIndex,
          totalChunks,
          message: `Loading location data (${totalFetched}/${processedData.length} points)...`,
        });

        // Call chunk callback if provided
        if (onChunk) {
          onChunk(chunk, chunkIndex - 1);
        }

        // Small delay to allow UI updates between chunks
        if (i + chunkSize < processedData.length) {
          await this._delay(10);
        }
      }

      // Report completion
      const loadTime = performance.now() - startTime;
      this._reportProgress(onProgress, {
        status: 'complete',
        progress: 100,
        totalPoints: allData.length,
        chunksLoaded: chunkIndex,
        totalChunks,
        message: wasSampled 
          ? `Loaded ${allData.length} points (sampled from ${fullData.length})`
          : `Loaded ${allData.length} points`,
      });

      return {
        data: allData,
        metadata: {
          totalPoints: allData.length,
          originalPoints: fullData.length,
          chunksLoaded: chunkIndex,
          loadTime,
          sampled: wasSampled,
          samplingRatio: wasSampled ? allData.length / fullData.length : 1,
        },
      };

    } catch (error) {
      // Report error state
      this._reportProgress(onProgress, {
        status: 'error',
        progress: 0,
        totalPoints: totalFetched,
        chunksLoaded: chunkIndex,
        message: `Error loading data: ${error.message}`,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Sample data for very large datasets
   * Preserves start and end points, samples intermediate points
   * 
   * @param {Array} data - Full dataset
   * @returns {Array} Sampled dataset
   * 
   * Requirement 2.2: Data sampling for large datasets
   */
  _sampleData(data) {
    if (data.length <= this.config.samplingThreshold) {
      return data;
    }

    const targetSize = Math.min(
      this.config.maxPoints,
      Math.floor(data.length * this.config.samplingRatio)
    );
    const result = [];

    // Always include first point (start)
    result.push(data[0]);

    // Calculate sampling interval
    const interval = Math.floor((data.length - 2) / (targetSize - 2));

    // Sample intermediate points
    for (let i = interval; i < data.length - 1; i += interval) {
      if (result.length < targetSize - 1) {
        result.push(data[i]);
      }
    }

    // Always include last point (end)
    result.push(data[data.length - 1]);

    console.log(`📊 Sampled ${result.length} points from ${data.length} (${((result.length / data.length) * 100).toFixed(1)}%)`);

    return result;
  }

  /**
   * Fetch data with retry logic
   * 
   * @param {Function} fetchFunction - Function to fetch data
   * @param {string} imei - Device IMEI
   * @returns {Promise<Array>} Fetched data
   */
  async _fetchWithRetry(fetchFunction, imei) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const data = await fetchFunction(imei);
        return data;
      } catch (error) {
        lastError = error;
        console.warn(`Fetch attempt ${attempt} failed:`, error.message);

        if (attempt < this.config.retryAttempts) {
          await this._delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw new Error(`Failed to fetch data after ${this.config.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Report progress to callback
   * 
   * @param {Function} callback - Progress callback
   * @param {Object} progress - Progress data
   */
  _reportProgress(callback, progress) {
    if (callback && typeof callback === 'function') {
      callback(progress);
    }
  }

  /**
   * Delay helper
   * 
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Convenience function for loading location data progressively
 * 
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {string} imei - Device IMEI
 * @param {Object} options - Loading options
 * @returns {Promise<{data: Array, metadata: Object}>}
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export async function loadLocationDataProgressive(fetchFunction, imei, options = {}) {
  const loader = new ProgressiveMapDataLoader(options.config);
  return loader.loadLocationDataProgressive(fetchFunction, imei, options);
}

/**
 * Load location data with chunked streaming
 * Alternative approach that yields chunks as they're processed
 * 
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {string} imei - Device IMEI
 * @param {Object} options - Loading options
 * @returns {AsyncGenerator<{chunk: Array, progress: Object}>}
 * 
 * Requirement 2.1: Chunked data fetching
 */
export async function* streamLocationDataChunks(fetchFunction, imei, options = {}) {
  const {
    chunkSize = DEFAULT_CONFIG.chunkSize,
    enableSampling = true,
  } = options;

  const loader = new ProgressiveMapDataLoader({ chunkSize });

  try {
    // Fetch all data
    const fullData = await loader._fetchWithRetry(fetchFunction, imei);

    if (!Array.isArray(fullData) || fullData.length === 0) {
      yield {
        chunk: [],
        progress: {
          status: 'complete',
          progress: 100,
          totalPoints: 0,
          message: 'No location data available',
        },
      };
      return;
    }

    // Apply sampling if needed
    const processedData = enableSampling && fullData.length > DEFAULT_CONFIG.samplingThreshold
      ? loader._sampleData(fullData)
      : fullData;

    const totalChunks = Math.ceil(processedData.length / chunkSize);
    let chunkIndex = 0;

    // Yield chunks progressively
    for (let i = 0; i < processedData.length; i += chunkSize) {
      const chunk = processedData.slice(i, i + chunkSize);
      chunkIndex++;

      const progress = Math.min(100, Math.round(((i + chunk.length) / processedData.length) * 100));

      yield {
        chunk,
        progress: {
          status: i + chunkSize >= processedData.length ? 'complete' : 'loading',
          progress,
          totalPoints: i + chunk.length,
          estimatedTotal: processedData.length,
          chunksLoaded: chunkIndex,
          totalChunks,
          message: `Loading chunk ${chunkIndex}/${totalChunks}...`,
        },
      };

      // Small delay between chunks
      if (i + chunkSize < processedData.length) {
        await loader._delay(10);
      }
    }
  } catch (error) {
    yield {
      chunk: [],
      progress: {
        status: 'error',
        progress: 0,
        message: `Error: ${error.message}`,
        error: error.message,
      },
    };
  }
}

export default ProgressiveMapDataLoader;
