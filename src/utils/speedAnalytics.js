/**
 * Speed Analytics Utility
 * 
 * Provides comprehensive speed data analysis for the Dashboard,
 * including categorization, statistical calculations, and data quality assessment.
 */

/**
 * Speed category configuration with meaningful labels and visual properties
 */
export const SPEED_CATEGORIES = [
  {
    id: 'stationary',
    label: 'Stationary',
    range: '0-5 km/h',
    min: 0,
    max: 5,
    color: '#64748b', // Slate
    gradient: ['#64748b', '#475569'],
    icon: '🅿️',
    description: 'Parked or idle vehicles'
  },
  {
    id: 'slow',
    label: 'Slow',
    range: '5-30 km/h',
    min: 5,
    max: 30,
    color: '#22c55e', // Green
    gradient: ['#22c55e', '#16a34a'],
    icon: '🚶',
    description: 'Urban traffic, residential areas'
  },
  {
    id: 'moderate',
    label: 'Moderate',
    range: '30-60 km/h',
    min: 30,
    max: 60,
    color: '#f59e0b', // Amber
    gradient: ['#f59e0b', '#d97706'],
    icon: '🚗',
    description: 'City driving, arterial roads'
  },
  {
    id: 'fast',
    label: 'Fast',
    range: '60-90 km/h',
    min: 60,
    max: 90,
    color: '#f97316', // Orange
    gradient: ['#f97316', '#ea580c'],
    icon: '🏎️',
    description: 'Highway speeds'
  },
  {
    id: 'very-fast',
    label: 'Very Fast',
    range: '90+ km/h',
    min: 90,
    max: Infinity,
    color: '#ef4444', // Red
    gradient: ['#ef4444', '#dc2626'],
    icon: '🚀',
    description: 'High-speed highway'
  }
];

/**
 * Extract and validate speed values from analytics data
 * 
 * @param {Array} analytics - Array of analytics objects with speed property
 * @returns {Array<number>} Array of valid speed values
 */
export function extractValidSpeeds(analytics) {
  if (!Array.isArray(analytics)) {
    console.warn('extractValidSpeeds: analytics is not an array');
    return [];
  }

  return analytics
    .map(item => {
      // Handle various speed formats
      const speed = item?.speed;
      
      if (speed === null || speed === undefined) {
        return null;
      }

      const numSpeed = Number(speed);
      
      // Validate: must be a number, non-negative, and reasonable (<500 km/h)
      if (isNaN(numSpeed) || numSpeed < 0 || numSpeed > 500) {
        return null;
      }

      return numSpeed;
    })
    .filter(speed => speed !== null);
}

/**
 * Calculate comprehensive speed statistics
 * 
 * @param {Array<number>} speeds - Array of valid speed values
 * @returns {Object} Statistical metrics including average, median, percentiles, etc.
 */
export function calculateSpeedStatistics(speeds) {
  if (!Array.isArray(speeds) || speeds.length === 0) {
    return {
      average: 0,
      median: 0,
      percentile90: 0,
      standardDeviation: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }

  const sorted = [...speeds].sort((a, b) => a - b);
  const count = speeds.length;

  // Calculate average
  const sum = speeds.reduce((acc, speed) => acc + speed, 0);
  const average = sum / count;

  // Calculate median
  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];

  // Calculate 90th percentile
  const p90Index = Math.ceil(count * 0.9) - 1;
  const percentile90 = sorted[Math.max(0, p90Index)];

  // Calculate standard deviation
  const variance = speeds.reduce((acc, speed) => 
    acc + Math.pow(speed - average, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);

  // Min and max
  const min = sorted[0];
  const max = sorted[count - 1];

  return {
    average: Number(average.toFixed(2)),
    median: Number(median.toFixed(2)),
    percentile90: Number(percentile90.toFixed(2)),
    standardDeviation: Number(standardDeviation.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    count
  };
}

/**
 * Compute speed distribution across defined categories
 * 
 * @param {Array<number>} speeds - Array of valid speed values
 * @returns {Array<Object>} Array of category objects with counts and percentages
 */
export function computeSpeedCategories(speeds) {
  if (!Array.isArray(speeds) || speeds.length === 0) {
    return SPEED_CATEGORIES.map(category => ({
      ...category,
      count: 0,
      percentage: 0
    }));
  }

  const totalCount = speeds.length;

  // Count speeds in each category
  const categoryCounts = SPEED_CATEGORIES.map(category => {
    const count = speeds.filter(speed => 
      speed >= category.min && speed < category.max
    ).length;

    const percentage = (count / totalCount) * 100;

    return {
      ...category,
      count,
      percentage: Number(percentage.toFixed(2))
    };
  });

  return categoryCounts;
}

/**
 * Generate quality warnings based on data analysis
 * 
 * @param {number} stationaryPct - Percentage of stationary readings
 * @param {number} unrealisticPct - Percentage of unrealistic speeds
 * @param {number} invalidPct - Percentage of invalid data
 * @returns {Array<Object>} Array of warning objects
 */
function generateQualityWarnings(stationaryPct, unrealisticPct, invalidPct) {
  const warnings = [];

  if (stationaryPct > 50) {
    warnings.push({
      level: 'warning',
      message: 'High percentage of stationary readings - check GPS accuracy',
      icon: '⚠️'
    });
  }

  if (unrealisticPct > 1) {
    warnings.push({
      level: 'error',
      message: 'Unrealistic speed values detected - verify sensor calibration',
      icon: '❌'
    });
  }

  if (invalidPct > 10) {
    warnings.push({
      level: 'warning',
      message: 'Significant data quality issues - check device connectivity',
      icon: '⚠️'
    });
  }

  if (warnings.length === 0) {
    warnings.push({
      level: 'success',
      message: 'Data quality is good',
      icon: '✅'
    });
  }

  return warnings;
}

/**
 * Assess quality of speed data
 * 
 * @param {Array<number>} validSpeeds - Array of valid speed values
 * @param {number} totalRecords - Total number of records in original dataset
 * @returns {Object} Data quality indicators and warnings
 */
export function assessDataQuality(validSpeeds, totalRecords) {
  if (totalRecords === 0) {
    return {
      invalidCount: 0,
      invalidPercentage: 0,
      stationaryCount: 0,
      stationaryPercentage: 0,
      unrealisticCount: 0,
      unrealisticPercentage: 0,
      qualityScore: 0,
      warnings: [{
        level: 'info',
        message: 'No data available',
        icon: 'ℹ️'
      }]
    };
  }

  const invalidCount = totalRecords - validSpeeds.length;
  const invalidPercentage = (invalidCount / totalRecords) * 100;

  // Check for stationary vehicles (potential GPS issues)
  const stationaryCount = validSpeeds.filter(s => s < 1).length;
  const stationaryPercentage = validSpeeds.length > 0 
    ? (stationaryCount / validSpeeds.length) * 100 
    : 0;

  // Check for unrealistic speeds (>200 km/h for typical vehicles)
  const unrealisticCount = validSpeeds.filter(s => s > 200).length;
  const unrealisticPercentage = validSpeeds.length > 0
    ? (unrealisticCount / validSpeeds.length) * 100
    : 0;

  // Calculate overall quality score (0-100)
  let qualityScore = 100;
  qualityScore -= Math.min(invalidPercentage, 20); // Max 20 point deduction
  qualityScore -= Math.min(unrealisticPercentage * 2, 10); // Max 10 point deduction
  qualityScore -= Math.min(stationaryPercentage * 0.2, 10); // Max 10 point deduction for high stationary

  return {
    invalidCount,
    invalidPercentage: Number(invalidPercentage.toFixed(2)),
    stationaryCount,
    stationaryPercentage: Number(stationaryPercentage.toFixed(2)),
    unrealisticCount,
    unrealisticPercentage: Number(unrealisticPercentage.toFixed(2)),
    qualityScore: Math.max(0, Math.round(qualityScore)),
    warnings: generateQualityWarnings(stationaryPercentage, unrealisticPercentage, invalidPercentage)
  };
}

/**
 * Process speed data from analytics and compute comprehensive distribution
 * 
 * Main entry point for speed analysis. Extracts speeds, calculates statistics,
 * computes category distribution, and assesses data quality.
 * 
 * @param {Array} analytics - Array of analytics objects
 * @returns {Object} Processed speed data with categories, statistics, and quality indicators
 */
export function processSpeedDistribution(analytics) {
  if (!Array.isArray(analytics)) {
    console.warn('processSpeedDistribution: analytics is not an array');
    return {
      categories: SPEED_CATEGORIES.map(cat => ({ ...cat, count: 0, percentage: 0 })),
      statistics: {
        average: 0,
        median: 0,
        percentile90: 0,
        standardDeviation: 0,
        min: 0,
        max: 0,
        count: 0
      },
      dataQuality: {
        invalidCount: 0,
        invalidPercentage: 0,
        stationaryCount: 0,
        stationaryPercentage: 0,
        unrealisticCount: 0,
        unrealisticPercentage: 0,
        qualityScore: 0,
        warnings: []
      },
      totalRecords: 0,
      validRecords: 0
    };
  }

  // Extract and validate speed values
  const speeds = extractValidSpeeds(analytics);

  // Calculate statistics
  const statistics = calculateSpeedStatistics(speeds);

  // Compute category distribution
  const categories = computeSpeedCategories(speeds);

  // Assess data quality
  const dataQuality = assessDataQuality(speeds, analytics.length);

  return {
    categories,
    statistics,
    dataQuality,
    totalRecords: analytics.length,
    validRecords: speeds.length
  };
}

/**
 * Transform speed categories into chart-ready format
 * 
 * @param {Array} categories - Speed category distribution from computeSpeedCategories
 * @returns {Array} Chart data with enhanced properties for visualization
 */
export function transformToChartData(categories) {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map(category => ({
    name: category.label,
    count: category.count,
    percentage: category.percentage,
    range: category.range,
    color: category.color,
    gradient: category.gradient,
    icon: category.icon,
    description: category.description,
    // Additional properties for enhanced tooltips
    displayName: `${category.icon} ${category.label}`,
    fullLabel: `${category.label} (${category.range})`
  }));
}

/**
 * Get quality color based on score
 * 
 * @param {number} score - Quality score (0-100)
 * @returns {string} Color code for the quality indicator
 */
export function getQualityColor(score) {
  if (score >= 90) return '#22c55e'; // Green
  if (score >= 70) return '#f59e0b'; // Amber
  if (score >= 50) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Calculate trend indicator for speed metrics
 * 
 * @param {number} currentValue - Current metric value
 * @param {number} previousValue - Previous metric value (optional)
 * @returns {Object} Trend object with direction and percentage change
 */
export function calculateTrend(currentValue, previousValue = null) {
  if (previousValue === null || previousValue === 0) {
    return {
      direction: 'stable',
      change: 0,
      icon: '➡️'
    };
  }

  const change = ((currentValue - previousValue) / previousValue) * 100;
  const absChange = Math.abs(change);

  if (absChange < 5) {
    return {
      direction: 'stable',
      change: Number(change.toFixed(1)),
      icon: '➡️'
    };
  }

  if (change > 0) {
    return {
      direction: 'up',
      change: Number(change.toFixed(1)),
      icon: '📈'
    };
  }

  return {
    direction: 'down',
    change: Number(change.toFixed(1)),
    icon: '📉'
  };
}

export default {
  SPEED_CATEGORIES,
  extractValidSpeeds,
  calculateSpeedStatistics,
  computeSpeedCategories,
  assessDataQuality,
  processSpeedDistribution,
  transformToChartData,
  getQualityColor,
  calculateTrend
};
