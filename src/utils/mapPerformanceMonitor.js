/**
 * MapPerformanceMonitor
 * 
 * Tracks and logs performance metrics for map components.
 * Monitors loading times, data processing, and rendering performance.
 * Logs warnings when performance targets are missed.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

class MapPerformanceMonitor {
  constructor() {
    this.metrics = {
      initialRenderStart: 0,
      initialRenderEnd: 0,
      dataFetchStart: 0,
      dataFetchEnd: 0,
      pathSimplificationStart: 0,
      pathSimplificationEnd: 0,
      totalPoints: 0,
      renderedPoints: 0,
      markerCount: 0,
      mapType: 'unknown',
    };

    // Performance targets (in milliseconds)
    this.targets = {
      initialRender: 2000,
      dataFetch: 1000,
      pathSimplification: 500,
    };
  }

  /**
   * Start tracking initial render time
   * Requirements: 6.1
   */
  startInitialRender() {
    this.metrics.initialRenderStart = performance.now();
  }

  /**
   * End tracking initial render time and log results
   * Requirements: 6.1, 6.3
   */
  endInitialRender() {
    this.metrics.initialRenderEnd = performance.now();
    const duration = this.metrics.initialRenderEnd - this.metrics.initialRenderStart;
    
    console.log(`Map initial render: ${duration.toFixed(2)}ms`);
    
    if (duration > this.targets.initialRender) {
      console.warn(
        `Map render exceeded target (${this.targets.initialRender}ms): ${duration.toFixed(2)}ms`
      );
    }
    
    return duration;
  }

  /**
   * Start tracking data fetch time
   * Requirements: 6.2
   */
  startDataFetch() {
    this.metrics.dataFetchStart = performance.now();
  }

  /**
   * End tracking data fetch time and log results
   * Requirements: 6.2, 6.3
   */
  endDataFetch(dataSize = 0) {
    this.metrics.dataFetchEnd = performance.now();
    this.metrics.totalPoints = dataSize;
    
    const duration = this.metrics.dataFetchEnd - this.metrics.dataFetchStart;
    
    console.log(`Location data fetched: ${dataSize} points in ${duration.toFixed(2)}ms`);
    
    if (duration > this.targets.dataFetch) {
      console.warn(
        `Data fetch exceeded target (${this.targets.dataFetch}ms): ${duration.toFixed(2)}ms`
      );
    }
    
    return duration;
  }

  /**
   * Start tracking path simplification time
   * Requirements: 6.2
   */
  startPathSimplification() {
    this.metrics.pathSimplificationStart = performance.now();
  }

  /**
   * End tracking path simplification time and log results
   * Requirements: 6.2, 6.3
   */
  endPathSimplification(originalPoints = 0, simplifiedPoints = 0) {
    this.metrics.pathSimplificationEnd = performance.now();
    this.metrics.totalPoints = originalPoints;
    this.metrics.renderedPoints = simplifiedPoints;
    
    const duration = this.metrics.pathSimplificationEnd - this.metrics.pathSimplificationStart;
    
    console.log(
      `Path simplified: ${originalPoints} → ${simplifiedPoints} points in ${duration.toFixed(2)}ms`
    );
    
    if (duration > this.targets.pathSimplification) {
      console.warn(
        `Path simplification exceeded target (${this.targets.pathSimplification}ms): ${duration.toFixed(2)}ms`
      );
    }
    
    return duration;
  }

  /**
   * Set the number of rendered markers
   * Requirements: 6.4
   */
  setMarkerCount(count) {
    this.metrics.markerCount = count;
    console.log(`Map markers rendered: ${count}`);
  }

  /**
   * Set the map type being used
   * Requirements: 6.4
   */
  setMapType(type) {
    this.metrics.mapType = type;
  }

  /**
   * Set total and rendered point counts
   * Requirements: 6.4
   */
  setPointCounts(totalPoints, renderedPoints) {
    this.metrics.totalPoints = totalPoints;
    this.metrics.renderedPoints = renderedPoints;
  }

  /**
   * Get the current render time
   * Requirements: 6.1
   */
  getRenderTime() {
    if (this.metrics.initialRenderEnd === 0) {
      return 0;
    }
    return this.metrics.initialRenderEnd - this.metrics.initialRenderStart;
  }

  /**
   * Get the current data fetch time
   * Requirements: 6.2
   */
  getDataFetchTime() {
    if (this.metrics.dataFetchEnd === 0) {
      return 0;
    }
    return this.metrics.dataFetchEnd - this.metrics.dataFetchStart;
  }

  /**
   * Get the current path simplification time
   * Requirements: 6.2
   */
  getPathSimplificationTime() {
    if (this.metrics.pathSimplificationEnd === 0) {
      return 0;
    }
    return this.metrics.pathSimplificationEnd - this.metrics.pathSimplificationStart;
  }

  /**
   * Log all collected metrics in a formatted table
   * Requirements: 6.1, 6.2, 6.3, 6.4
   */
  logMetrics() {
    const renderTime = this.getRenderTime();
    const dataFetchTime = this.getDataFetchTime();
    const pathSimplificationTime = this.getPathSimplificationTime();
    
    const reductionPercent = this.metrics.totalPoints > 0
      ? ((1 - this.metrics.renderedPoints / this.metrics.totalPoints) * 100).toFixed(1)
      : '0.0';

    console.log('\n=== Map Performance Metrics ===');
    console.table({
      'Map Type': this.metrics.mapType,
      'Initial Render': `${renderTime.toFixed(2)}ms`,
      'Data Fetch': dataFetchTime > 0 ? `${dataFetchTime.toFixed(2)}ms` : 'N/A',
      'Path Simplification': pathSimplificationTime > 0 ? `${pathSimplificationTime.toFixed(2)}ms` : 'N/A',
      'Total Points': this.metrics.totalPoints,
      'Rendered Points': this.metrics.renderedPoints,
      'Marker Count': this.metrics.markerCount,
      'Point Reduction': `${reductionPercent}%`,
    });
    console.log('================================\n');

    // Check if any targets were missed
    const warnings = [];
    if (renderTime > this.targets.initialRender) {
      warnings.push(`Initial render: ${renderTime.toFixed(2)}ms (target: ${this.targets.initialRender}ms)`);
    }
    if (dataFetchTime > this.targets.dataFetch && dataFetchTime > 0) {
      warnings.push(`Data fetch: ${dataFetchTime.toFixed(2)}ms (target: ${this.targets.dataFetch}ms)`);
    }
    if (pathSimplificationTime > this.targets.pathSimplification && pathSimplificationTime > 0) {
      warnings.push(`Path simplification: ${pathSimplificationTime.toFixed(2)}ms (target: ${this.targets.pathSimplification}ms)`);
    }

    if (warnings.length > 0) {
      console.warn('Performance targets missed:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      initialRenderStart: 0,
      initialRenderEnd: 0,
      dataFetchStart: 0,
      dataFetchEnd: 0,
      pathSimplificationStart: 0,
      pathSimplificationEnd: 0,
      totalPoints: 0,
      renderedPoints: 0,
      markerCount: 0,
      mapType: 'unknown',
    };
  }

  /**
   * Get all metrics as an object
   * Requirements: 6.1, 6.2, 6.4
   */
  getMetrics() {
    return {
      renderTime: this.getRenderTime(),
      dataFetchTime: this.getDataFetchTime(),
      pathSimplificationTime: this.getPathSimplificationTime(),
      totalPoints: this.metrics.totalPoints,
      renderedPoints: this.metrics.renderedPoints,
      markerCount: this.metrics.markerCount,
      mapType: this.metrics.mapType,
      reductionPercent: this.metrics.totalPoints > 0
        ? ((1 - this.metrics.renderedPoints / this.metrics.totalPoints) * 100)
        : 0,
    };
  }
}

export default MapPerformanceMonitor;
