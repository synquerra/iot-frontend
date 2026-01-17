// src/utils/deviceHealth.js

/**
 * Calculate overall device health score based on multiple metrics
 * 
 * @param {Object} device - Device object
 * @param {Array} recentAnalytics - Recent analytics data for the device
 * @returns {Object} Health score with breakdown
 */
export function calculateHealthScore(device, recentAnalytics = []) {
  if (!device) {
    return {
      overall: 0,
      breakdown: {
        battery: 0,
        connectivity: 0,
        dataQuality: 0,
        uptime: 0
      },
      status: 'unknown',
      alerts: []
    };
  }

  const scores = {
    battery: calculateBatteryScore(recentAnalytics),
    connectivity: calculateConnectivityScore(device, recentAnalytics),
    dataQuality: calculateDataQualityScore(recentAnalytics),
    uptime: calculateUptimeScore(device)
  };

  const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
  
  // Generate alerts based on scores
  const alerts = [];
  if (scores.battery < 30) alerts.push({ type: 'battery', severity: 'high', message: 'Low battery level' });
  if (scores.connectivity < 50) alerts.push({ type: 'connectivity', severity: 'medium', message: 'Poor connectivity' });
  if (scores.dataQuality < 40) alerts.push({ type: 'data', severity: 'medium', message: 'Data quality issues' });
  if (scores.uptime < 60) alerts.push({ type: 'uptime', severity: 'high', message: 'Low uptime' });

  return {
    overall: Math.round(overall),
    breakdown: {
      battery: Math.round(scores.battery),
      connectivity: Math.round(scores.connectivity),
      dataQuality: Math.round(scores.dataQuality),
      uptime: Math.round(scores.uptime)
    },
    status: overall >= 80 ? 'excellent' : overall >= 60 ? 'good' : overall >= 40 ? 'fair' : 'poor',
    alerts
  };
}

/**
 * Calculate battery health score
 * @private
 */
function calculateBatteryScore(analytics) {
  if (!analytics || analytics.length === 0) return 75; // Default score

  // Check if battery data is available
  const batteryData = analytics.filter(a => a.battery !== undefined && a.battery !== null);
  
  if (batteryData.length === 0) return 75; // No battery data, assume good

  // Get average battery level
  const avgBattery = batteryData.reduce((sum, a) => sum + Number(a.battery || 0), 0) / batteryData.length;
  
  // Score based on battery level
  if (avgBattery >= 80) return 100;
  if (avgBattery >= 60) return 90;
  if (avgBattery >= 40) return 70;
  if (avgBattery >= 20) return 40;
  return 20;
}

/**
 * Calculate connectivity health score
 * @private
 */
function calculateConnectivityScore(device, analytics) {
  if (!analytics || analytics.length === 0) return 50;

  // Check data transmission frequency
  const now = new Date();
  const recentData = analytics.filter(a => {
    const timestamp = new Date(a.deviceTimestamp || a.timestamp);
    const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Last 24 hours
  });

  if (recentData.length === 0) return 20; // No recent data

  // Calculate expected vs actual data points
  const interval = Number(device.interval || 60); // seconds
  const expectedPoints = (24 * 60 * 60) / interval;
  const actualPoints = recentData.length;
  const ratio = actualPoints / expectedPoints;

  if (ratio >= 0.9) return 100;
  if (ratio >= 0.7) return 80;
  if (ratio >= 0.5) return 60;
  if (ratio >= 0.3) return 40;
  return 20;
}

/**
 * Calculate data quality score
 * @private
 */
function calculateDataQualityScore(analytics) {
  if (!analytics || analytics.length === 0) return 50;

  let validPoints = 0;
  let totalPoints = analytics.length;

  for (const point of analytics) {
    let isValid = true;

    // Check for valid coordinates
    if (!point.latitude || !point.longitude ||
        isNaN(point.latitude) || isNaN(point.longitude) ||
        Math.abs(point.latitude) < 0.0001 || Math.abs(point.longitude) < 0.0001) {
      isValid = false;
    }

    // Check for valid speed
    if (point.speed === undefined || isNaN(point.speed) || point.speed < 0) {
      isValid = false;
    }

    // Check for valid timestamp
    if (!point.timestamp && !point.deviceTimestamp) {
      isValid = false;
    }

    if (isValid) validPoints++;
  }

  const qualityRatio = validPoints / totalPoints;
  return qualityRatio * 100;
}

/**
 * Calculate uptime score
 * @private
 */
function calculateUptimeScore(device) {
  // Simple uptime calculation based on device status
  // In a real system, this would check actual uptime metrics
  
  const interval = Number(device.interval || 60);
  
  // Lower interval = more active = better uptime
  if (interval < 30) return 100;
  if (interval < 60) return 90;
  if (interval < 120) return 70;
  if (interval < 300) return 50;
  return 30;
}

/**
 * Get battery trend data over time
 * 
 * @param {Array} analytics - Analytics data with battery information
 * @returns {Array} Battery trend data points
 */
export function getBatteryTrend(analytics) {
  if (!analytics || analytics.length === 0) return [];

  const batteryData = analytics
    .filter(a => a.battery !== undefined && a.battery !== null)
    .map(a => ({
      timestamp: new Date(a.deviceTimestamp || a.timestamp),
      battery: Number(a.battery || 0),
      imei: a.imei
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return batteryData;
}

/**
 * Get signal strength indicator
 * 
 * @param {Object} device - Device object
 * @param {Array} recentAnalytics - Recent analytics data
 * @returns {Object} Signal strength information
 */
export function getSignalStrength(device, recentAnalytics = []) {
  // Check for signal strength in analytics data
  const signalData = recentAnalytics.filter(a => a.signal !== undefined && a.signal !== null);
  
  if (signalData.length === 0) {
    // Estimate based on data frequency
    const interval = Number(device.interval || 60);
    let strength = 'good';
    let percentage = 75;
    
    if (interval < 30) {
      strength = 'excellent';
      percentage = 95;
    } else if (interval < 60) {
      strength = 'good';
      percentage = 75;
    } else if (interval < 120) {
      strength = 'fair';
      percentage = 50;
    } else {
      strength = 'poor';
      percentage = 25;
    }
    
    return { strength, percentage, bars: Math.ceil(percentage / 25) };
  }

  // Calculate average signal strength
  const avgSignal = signalData.reduce((sum, a) => sum + Number(a.signal || 0), 0) / signalData.length;
  
  let strength, bars;
  if (avgSignal >= 80) {
    strength = 'excellent';
    bars = 4;
  } else if (avgSignal >= 60) {
    strength = 'good';
    bars = 3;
  } else if (avgSignal >= 40) {
    strength = 'fair';
    bars = 2;
  } else {
    strength = 'poor';
    bars = 1;
  }

  return {
    strength,
    percentage: Math.round(avgSignal),
    bars
  };
}

/**
 * Calculate device uptime percentage
 * 
 * @param {Object} device - Device object
 * @param {Array} analytics - Analytics data
 * @returns {number} Uptime percentage
 */
export function calculateUptime(device, analytics = []) {
  if (!analytics || analytics.length === 0) return 0;

  // Calculate expected vs actual data points over last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  const recentData = analytics.filter(a => {
    const timestamp = new Date(a.deviceTimestamp || a.timestamp);
    return timestamp >= sevenDaysAgo;
  });

  if (recentData.length === 0) return 0;

  const interval = Number(device.interval || 60);
  const expectedPoints = (7 * 24 * 60 * 60) / interval;
  const actualPoints = recentData.length;
  
  const uptime = Math.min((actualPoints / expectedPoints) * 100, 100);
  return Math.round(uptime);
}

/**
 * Get connection quality metrics
 * 
 * @param {Array} analytics - Analytics data
 * @returns {Object} Connection quality metrics
 */
export function getConnectionQuality(analytics) {
  if (!analytics || analytics.length === 0) {
    return {
      packetLoss: 0,
      avgLatency: 0,
      consistency: 0,
      status: 'unknown'
    };
  }

  // Calculate time gaps between data points
  const sortedData = [...analytics].sort((a, b) => {
    const timeA = new Date(a.deviceTimestamp || a.timestamp).getTime();
    const timeB = new Date(b.deviceTimestamp || b.timestamp).getTime();
    return timeA - timeB;
  });

  let totalGaps = 0;
  let largeGaps = 0;
  const gaps = [];

  for (let i = 1; i < sortedData.length; i++) {
    const prevTime = new Date(sortedData[i - 1].deviceTimestamp || sortedData[i - 1].timestamp);
    const currTime = new Date(sortedData[i].deviceTimestamp || sortedData[i].timestamp);
    const gap = (currTime - prevTime) / 1000; // seconds
    
    gaps.push(gap);
    totalGaps++;
    
    // Consider gaps > 5 minutes as potential packet loss
    if (gap > 300) largeGaps++;
  }

  const packetLoss = totalGaps > 0 ? (largeGaps / totalGaps) * 100 : 0;
  const avgLatency = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  
  // Calculate consistency (lower standard deviation = more consistent)
  const mean = avgLatency;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - mean, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (stdDev / mean) * 100);

  let status;
  if (packetLoss < 5 && consistency > 80) status = 'excellent';
  else if (packetLoss < 15 && consistency > 60) status = 'good';
  else if (packetLoss < 30 && consistency > 40) status = 'fair';
  else status = 'poor';

  return {
    packetLoss: Math.round(packetLoss * 10) / 10,
    avgLatency: Math.round(avgLatency),
    consistency: Math.round(consistency),
    status
  };
}

/**
 * Predict maintenance needs based on health history
 * 
 * @param {Array} healthHistory - Historical health scores
 * @returns {Object} Maintenance prediction
 */
export function predictMaintenanceNeeds(healthHistory) {
  if (!healthHistory || healthHistory.length < 3) {
    return {
      needsMaintenance: false,
      confidence: 0,
      reason: 'Insufficient data',
      priority: 'low'
    };
  }

  // Analyze trend in health scores
  const recentScores = healthHistory.slice(-10).map(h => h.overall);
  const trend = calculateTrend(recentScores);
  
  // Check for declining health
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const latestScore = recentScores[recentScores.length - 1];
  
  let needsMaintenance = false;
  let confidence = 0;
  let reason = '';
  let priority = 'low';

  if (trend < -5 && latestScore < 60) {
    needsMaintenance = true;
    confidence = 80;
    reason = 'Declining health trend detected';
    priority = 'high';
  } else if (latestScore < 40) {
    needsMaintenance = true;
    confidence = 90;
    reason = 'Critical health score';
    priority = 'critical';
  } else if (avgScore < 50) {
    needsMaintenance = true;
    confidence = 70;
    reason = 'Consistently low health scores';
    priority = 'medium';
  }

  return {
    needsMaintenance,
    confidence,
    reason,
    priority,
    recommendedAction: needsMaintenance ? 'Schedule device inspection' : 'Continue monitoring'
  };
}

/**
 * Calculate trend from array of values
 * @private
 */
function calculateTrend(values) {
  if (values.length < 2) return 0;

  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

/**
 * Format health status to human-readable string
 * 
 * @param {string} status - Health status
 * @returns {Object} Formatted status with color
 */
export function formatHealthStatus(status) {
  const statusMap = {
    excellent: { label: 'Excellent', color: 'green', icon: '✓' },
    good: { label: 'Good', color: 'blue', icon: '✓' },
    fair: { label: 'Fair', color: 'amber', icon: '⚠' },
    poor: { label: 'Poor', color: 'red', icon: '✗' },
    unknown: { label: 'Unknown', color: 'gray', icon: '?' }
  };

  return statusMap[status] || statusMap.unknown;
}
