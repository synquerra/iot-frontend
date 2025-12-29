/**
 * QueryOptimizer - Optimizes GraphQL queries to reduce response size
 * 
 * This utility helps prevent API response truncation by:
 * 1. Removing unnecessary fields based on context
 * 2. Estimating response sizes before execution
 * 3. Providing field selection optimization
 * 4. Analyzing query complexity
 */

export class QueryOptimizer {
  constructor() {
    // Field weights for response size estimation (bytes per field)
    this.fieldWeights = {
      // Core identification fields (small)
      id: 50,
      imei: 20,
      topic: 30,
      type: 20,
      
      // Numeric fields (small)
      latitude: 15,
      longitude: 15,
      speed: 10,
      battery: 10,
      signal: 10,
      interval: 10,
      geoid: 15,
      packet: 10,
      alert: 10,
      
      // Timestamp fields (medium)
      timestamp: 30,
      deviceTimestamp: 30,
      deviceRawTimestamp: 30,
      
      // Raw data fields (large - these cause truncation)
      rawPacket: 500,
      rawImei: 100,
      rawAlert: 200,
      rawTemperature: 50,
      
      // Health/analytics fields (medium)
      gpsScore: 15,
      movement: 100,
      movementStats: 200,
      temperatureHealthIndex: 15,
      temperatureStatus: 50,
      score: 15,
      expectedPackets: 15,
      receivedPackets: 15,
      largestGapSec: 15,
      dropouts: 100
    };
    
    // Context-based field priorities
    this.contextFields = {
      dashboard: {
        essential: ['id', 'imei', 'latitude', 'longitude', 'timestamp', 'deviceTimestamp', 'battery', 'signal'],
        optional: ['speed', 'alert', 'type', 'interval'],
        exclude: ['rawPacket', 'rawImei', 'rawAlert', 'rawTemperature', 'geoid', 'packet']
      },
      
      details: {
        essential: ['id', 'imei', 'latitude', 'longitude', 'timestamp', 'deviceTimestamp', 'speed', 'battery', 'signal', 'alert'],
        optional: ['type', 'interval', 'geoid', 'packet', 'rawTemperature'],
        exclude: ['rawPacket', 'rawImei', 'rawAlert']
      },
      
      analytics: {
        essential: ['id', 'imei', 'timestamp', 'deviceTimestamp', 'latitude', 'longitude', 'speed', 'battery'],
        optional: ['signal', 'alert', 'type', 'interval', 'rawTemperature'],
        exclude: ['rawPacket', 'rawImei', 'rawAlert', 'geoid', 'packet']
      },
      
      map: {
        essential: ['id', 'imei', 'latitude', 'longitude', 'timestamp', 'deviceTimestamp'],
        optional: ['speed', 'battery', 'alert'],
        exclude: ['rawPacket', 'rawImei', 'rawAlert', 'rawTemperature', 'signal', 'type', 'interval', 'geoid', 'packet']
      },
      
      health: {
        essential: ['gpsScore', 'movement', 'temperatureHealthIndex', 'temperatureStatus'],
        optional: ['movementStats'],
        exclude: []
      },
      
      uptime: {
        essential: ['score', 'expectedPackets', 'receivedPackets', 'largestGapSec'],
        optional: ['dropouts'],
        exclude: []
      }
    };
    
    // Maximum recommended response sizes (bytes)
    this.maxResponseSizes = {
      dashboard: 500000,    // 500KB for dashboard
      details: 1000000,     // 1MB for details view
      analytics: 2000000,   // 2MB for analytics
      map: 300000,          // 300KB for map view
      health: 50000,        // 50KB for health data
      uptime: 50000         // 50KB for uptime data
    };
  }

  /**
   * Optimize a GraphQL query based on context and constraints
   * @param {string} query - Original GraphQL query
   * @param {Object} context - Query context information
   * @returns {string} - Optimized GraphQL query
   */
  optimizeQuery(query, context = {}) {
    const {
      viewType = 'dashboard',
      maxResponseSize = null,
      requiredFields = [],
      optionalFields = [],
      excludeFields = []
    } = context;

    console.log(`🔧 Optimizing query for context: ${viewType}`);
    
    // Get field configuration for this context
    const fieldConfig = this.contextFields[viewType] || this.contextFields.dashboard;
    
    // Determine which fields to include
    const fieldsToInclude = this._selectFields(fieldConfig, {
      requiredFields,
      optionalFields,
      excludeFields,
      maxResponseSize: maxResponseSize || this.maxResponseSizes[viewType]
    });
    
    // Rebuild the query with selected fields
    const optimizedQuery = this._rebuildQuery(query, fieldsToInclude);
    
    // Log optimization results
    const originalSize = this.estimateResponseSize(query);
    const optimizedSize = this.estimateResponseSize(optimizedQuery);
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`📊 Query optimization results:`);
    console.log(`   Original estimated size: ${this._formatBytes(originalSize)}`);
    console.log(`   Optimized estimated size: ${this._formatBytes(optimizedSize)}`);
    console.log(`   Size reduction: ${reduction}%`);
    console.log(`   Fields included: ${fieldsToInclude.length}`);
    
    return optimizedQuery;
  }

  /**
   * Estimate response size for a GraphQL query
   * @param {string} query - GraphQL query string
   * @param {number} estimatedRecords - Estimated number of records (default: 1000)
   * @returns {number} - Estimated response size in bytes
   */
  estimateResponseSize(query, estimatedRecords = 1000) {
    const fields = this._extractFields(query);
    let totalFieldWeight = 0;
    
    fields.forEach(field => {
      const weight = this.fieldWeights[field] || 50; // Default weight for unknown fields
      totalFieldWeight += weight;
    });
    
    // Add JSON overhead (brackets, commas, quotes, etc.)
    const jsonOverhead = fields.length * 10; // ~10 bytes per field for JSON structure
    const recordSize = totalFieldWeight + jsonOverhead;
    
    // Total size = (record size * number of records) + array overhead
    const totalSize = (recordSize * estimatedRecords) + 1000; // 1KB for array structure
    
    return totalSize;
  }

  /**
   * Analyze query complexity and provide recommendations
   * @param {string} query - GraphQL query string
   * @returns {Object} - Analysis results with recommendations
   */
  analyzeQueryComplexity(query) {
    const fields = this._extractFields(query);
    const heavyFields = fields.filter(field => (this.fieldWeights[field] || 0) > 100);
    const estimatedSize = this.estimateResponseSize(query);
    
    const analysis = {
      totalFields: fields.length,
      heavyFields: heavyFields,
      estimatedSize: estimatedSize,
      complexity: this._calculateComplexity(fields),
      recommendations: []
    };
    
    // Generate recommendations
    if (heavyFields.length > 0) {
      analysis.recommendations.push({
        type: 'warning',
        message: `Query includes ${heavyFields.length} heavy fields that may cause truncation: ${heavyFields.join(', ')}`
      });
    }
    
    if (estimatedSize > 1000000) { // > 1MB
      analysis.recommendations.push({
        type: 'error',
        message: `Estimated response size (${this._formatBytes(estimatedSize)}) exceeds safe limits. Consider pagination or field reduction.`
      });
    }
    
    if (fields.length > 15) {
      analysis.recommendations.push({
        type: 'info',
        message: `Query requests ${fields.length} fields. Consider reducing to essential fields only.`
      });
    }
    
    return analysis;
  }

  /**
   * Create an optimized query for a specific use case
   * @param {string} queryType - Type of query (getAllAnalytics, getAnalyticsByImei, etc.)
   * @param {Object} options - Optimization options
   * @returns {string} - Optimized GraphQL query
   */
  createOptimizedQuery(queryType, options = {}) {
    const {
      viewType = 'dashboard',
      imei = null,
      topic = null,
      id = null,
      skip = 0,
      limit = 10
    } = options;
    
    const fieldConfig = this.contextFields[viewType] || this.contextFields.dashboard;
    const fields = [...fieldConfig.essential, ...fieldConfig.optional];
    const fieldString = fields.join('\n      ');
    
    switch (queryType) {
      case 'getAllAnalytics':
        return `{
    analyticsData {
      ${fieldString}
    }
  }`;
      
      case 'getAnalyticsByImei':
        return `{
    analyticsDataByImei(imei: "${imei}") {
      ${fieldString}
    }
  }`;
      
      case 'getAnalyticsPaginated':
        return `{
    analyticsDataPaginated(skip: ${skip}, limit: ${limit}) {
      ${fieldString}
    }
  }`;
      
      case 'getAnalyticsByTopic':
        return `{
    analyticsDataByTopic(topic: "${topic}") {
      ${fieldString}
    }
  }`;
      
      case 'getAnalyticsById':
        return `{
    analyticsDataById(id: "${id}") {
      ${fieldString}
    }
  }`;
      
      case 'getAnalyticsHealth':
        const healthFields = this.contextFields.health.essential.join('\n      ');
        return `{
    analyticsHealth(imei: "${imei}") {
      ${healthFields}
    }
  }`;
      
      case 'getAnalyticsUptime':
        const uptimeFields = this.contextFields.uptime.essential.join('\n      ');
        return `{
    analyticsUptime(imei: "${imei}") {
      ${uptimeFields}
    }
  }`;
      
      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }
  }

  // Private helper methods

  /**
   * Select fields based on configuration and constraints
   */
  _selectFields(fieldConfig, constraints) {
    const { requiredFields = [], optionalFields = [], excludeFields = [], maxResponseSize } = constraints;
    
    // Start with essential fields
    let selectedFields = [...fieldConfig.essential];
    
    // Add any explicitly required fields (these override exclusions)
    requiredFields.forEach(field => {
      if (!selectedFields.includes(field)) {
        selectedFields.push(field);
      }
    });
    
    // Remove excluded fields (but preserve required fields)
    selectedFields = selectedFields.filter(field => 
      requiredFields.includes(field) || 
      (!excludeFields.includes(field) && !fieldConfig.exclude.includes(field))
    );
    
    // Add optional fields if size permits
    const availableOptional = [
      ...fieldConfig.optional,
      ...optionalFields
    ].filter(field => 
      !selectedFields.includes(field) && 
      !excludeFields.includes(field) &&
      !fieldConfig.exclude.includes(field)
    );
    
    // Add optional fields while staying under size limit
    for (const field of availableOptional) {
      const testFields = [...selectedFields, field];
      const estimatedSize = this._estimateFieldsSize(testFields);
      
      if (estimatedSize <= maxResponseSize) {
        selectedFields.push(field);
      }
    }
    
    return selectedFields;
  }

  /**
   * Rebuild GraphQL query with selected fields
   */
  _rebuildQuery(originalQuery, fieldsToInclude) {
    // This is a simplified implementation
    // In a production system, you'd want to use a proper GraphQL parser
    
    const fieldString = fieldsToInclude.join('\n      ');
    
    // Extract the query structure and replace fields
    const queryMatch = originalQuery.match(/{\s*(\w+)(?:\([^)]*\))?\s*{/);
    if (!queryMatch) {
      return originalQuery; // Return original if we can't parse it
    }
    
    const queryName = queryMatch[1];
    const argsMatch = originalQuery.match(/{\s*\w+(\([^)]*\))\s*{/);
    const args = argsMatch ? argsMatch[1] : '';
    
    return `{
    ${queryName}${args} {
      ${fieldString}
    }
  }`;
  }

  /**
   * Extract field names from GraphQL query
   */
  _extractFields(query) {
    const fields = [];
    const lines = query.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip lines that are query structure (contain { or })
      if (trimmed && !trimmed.includes('{') && !trimmed.includes('}') && !trimmed.includes('(')) {
        fields.push(trimmed);
      }
    }
    
    return fields;
  }

  /**
   * Calculate query complexity score
   */
  _calculateComplexity(fields) {
    let complexity = 0;
    
    fields.forEach(field => {
      const weight = this.fieldWeights[field] || 50;
      complexity += Math.log(weight + 1); // Logarithmic scaling
    });
    
    return Math.round(complexity);
  }

  /**
   * Estimate size for a set of fields
   */
  _estimateFieldsSize(fields, estimatedRecords = 1000) {
    let totalWeight = 0;
    
    fields.forEach(field => {
      totalWeight += this.fieldWeights[field] || 50;
    });
    
    const jsonOverhead = fields.length * 10;
    const recordSize = totalWeight + jsonOverhead;
    
    return (recordSize * estimatedRecords) + 1000;
  }

  /**
   * Format bytes to human readable string
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create a singleton instance for easy use
export const queryOptimizer = new QueryOptimizer();

// Convenience functions
export function optimizeQuery(query, context) {
  return queryOptimizer.optimizeQuery(query, context);
}

export function estimateResponseSize(query, estimatedRecords) {
  return queryOptimizer.estimateResponseSize(query, estimatedRecords);
}

export function analyzeQueryComplexity(query) {
  return queryOptimizer.analyzeQueryComplexity(query);
}

export function createOptimizedQuery(queryType, options) {
  return queryOptimizer.createOptimizedQuery(queryType, options);
}