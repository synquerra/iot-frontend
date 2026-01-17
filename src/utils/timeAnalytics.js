// src/utils/timeAnalytics.js

/**
 * Generate activity heatmap data (7 days x 24 hours)
 * 
 * @param {Array} analyticsData - Analytics data points
 * @returns {Array} Heatmap data with activity intensity per hour/day
 */
export function generateActivityHeatmap(analyticsData) {
  if (!analyticsData || analyticsData.length === 0) {
    // Return empty heatmap structure
    return Array.from({ length: 7 }, (_, day) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      dayIndex: day,
      hours: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: 0,
        intensity: 0
      }))
    }));
  }

  // Initialize heatmap structure
  const heatmap = Array.from({ length: 7 }, (_, day) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
    dayIndex: day,
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
      intensity: 0
    }))
  }));

  // Count data points per hour/day
  analyticsData.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (isNaN(timestamp.getTime())) return;

    const day = timestamp.getDay(); // 0-6 (Sun-Sat)
    const hour = timestamp.getHours(); // 0-23

    heatmap[day].hours[hour].count++;
  });

  // Calculate intensity (0-100) based on max count
  const maxCount = Math.max(...heatmap.flatMap(d => d.hours.map(h => h.count)));
  
  if (maxCount > 0) {
    heatmap.forEach(day => {
      day.hours.forEach(hour => {
        hour.intensity = Math.round((hour.count / maxCount) * 100);
      });
    });
  }

  return heatmap;
}

/**
 * Calculate peak activity hours
 * 
 * @param {Array} analyticsData - Analytics data points
 * @returns {Array} Top peak hours with activity counts
 */
export function calculatePeakHours(analyticsData) {
  if (!analyticsData || analyticsData.length === 0) return [];

  // Count activity per hour (0-23)
  const hourCounts = Array(24).fill(0);

  analyticsData.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (isNaN(timestamp.getTime())) return;

    const hour = timestamp.getHours();
    hourCounts[hour]++;
  });

  // Create array of {hour, count} and sort by count
  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 peak hours

  return peakHours.map(h => ({
    ...h,
    label: formatHour(h.hour),
    percentage: hourCounts.reduce((sum, c) => sum + c, 0) > 0
      ? Math.round((h.count / hourCounts.reduce((sum, c) => sum + c, 0)) * 100)
      : 0
  }));
}

/**
 * Get daily usage patterns
 * 
 * @param {Array} analyticsData - Analytics data points
 * @returns {Object} Daily pattern statistics
 */
export function getDailyPatterns(analyticsData) {
  if (!analyticsData || analyticsData.length === 0) {
    return {
      byDay: [],
      busiestDay: null,
      quietestDay: null,
      avgPerDay: 0
    };
  }

  // Count activity per day of week
  const dayCounts = Array(7).fill(0);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  analyticsData.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (isNaN(timestamp.getTime())) return;

    const day = timestamp.getDay();
    dayCounts[day]++;
  });

  const byDay = dayCounts.map((count, index) => ({
    day: dayNames[index],
    dayShort: dayNames[index].slice(0, 3),
    dayIndex: index,
    count,
    percentage: analyticsData.length > 0 
      ? Math.round((count / analyticsData.length) * 100)
      : 0
  }));

  const maxCount = Math.max(...dayCounts);
  const minCount = Math.min(...dayCounts.filter(c => c > 0));
  
  const busiestDay = byDay.find(d => d.count === maxCount);
  const quietestDay = byDay.find(d => d.count === minCount);
  const avgPerDay = Math.round(analyticsData.length / 7);

  return {
    byDay,
    busiestDay,
    quietestDay,
    avgPerDay
  };
}

/**
 * Compare two time periods
 * 
 * @param {Array} period1Data - Analytics data for period 1
 * @param {Array} period2Data - Analytics data for period 2
 * @returns {Object} Comparison statistics
 */
export function compareTimePeriods(period1Data, period2Data) {
  const period1Count = period1Data?.length || 0;
  const period2Count = period2Data?.length || 0;

  const change = period2Count - period1Count;
  const percentChange = period1Count > 0 
    ? Math.round((change / period1Count) * 100)
    : 0;

  // Calculate average activity per day
  const period1AvgPerDay = calculateAveragePerDay(period1Data);
  const period2AvgPerDay = calculateAveragePerDay(period2Data);

  // Calculate peak hours for each period
  const period1Peaks = calculatePeakHours(period1Data);
  const period2Peaks = calculatePeakHours(period2Data);

  return {
    period1: {
      count: period1Count,
      avgPerDay: period1AvgPerDay,
      peakHours: period1Peaks
    },
    period2: {
      count: period2Count,
      avgPerDay: period2AvgPerDay,
      peakHours: period2Peaks
    },
    change,
    percentChange,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
  };
}

/**
 * Calculate average daily distance traveled
 * 
 * @param {Array} analyticsData - Analytics data points
 * @returns {number} Average distance per day in km
 */
export function calculateAverageDailyDistance(analyticsData) {
  if (!analyticsData || analyticsData.length === 0) return 0;

  // Group data by date
  const dateGroups = {};

  analyticsData.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (isNaN(timestamp.getTime())) return;

    const dateKey = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dateGroups[dateKey]) {
      dateGroups[dateKey] = [];
    }
    dateGroups[dateKey].push(point);
  });

  // Calculate distance for each day
  const dailyDistances = Object.values(dateGroups).map(dayData => {
    return calculateDayDistance(dayData);
  });

  const totalDistance = dailyDistances.reduce((sum, d) => sum + d, 0);
  const avgDistance = dailyDistances.length > 0 
    ? totalDistance / dailyDistances.length
    : 0;

  return Math.round(avgDistance * 100) / 100;
}

/**
 * Get weekly trends (week-over-week comparison)
 * 
 * @param {Array} analyticsData - Analytics data points
 * @returns {Array} Weekly trend data
 */
export function getWeeklyTrends(analyticsData) {
  if (!analyticsData || analyticsData.length === 0) return [];

  // Group data by week
  const weekGroups = {};

  analyticsData.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (isNaN(timestamp.getTime())) return;

    const weekKey = getWeekKey(timestamp);
    
    if (!weekGroups[weekKey]) {
      weekGroups[weekKey] = {
        weekKey,
        startDate: getWeekStart(timestamp),
        data: []
      };
    }
    weekGroups[weekKey].data.push(point);
  });

  // Convert to array and sort by date
  const weeks = Object.values(weekGroups)
    .sort((a, b) => a.startDate - b.startDate)
    .map(week => ({
      weekKey: week.weekKey,
      startDate: week.startDate,
      endDate: new Date(week.startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
      count: week.data.length,
      avgPerDay: Math.round(week.data.length / 7),
      distance: calculateDayDistance(week.data)
    }));

  // Calculate week-over-week changes
  weeks.forEach((week, index) => {
    if (index > 0) {
      const prevWeek = weeks[index - 1];
      week.change = week.count - prevWeek.count;
      week.percentChange = prevWeek.count > 0
        ? Math.round((week.change / prevWeek.count) * 100)
        : 0;
    } else {
      week.change = 0;
      week.percentChange = 0;
    }
  });

  return weeks;
}

/**
 * Get hourly distribution data
 * 
 * @param {Array} analyticsData - Analytics data points
 * @returns {Array} Hourly distribution
 */
export function getHourlyDistribution(analyticsData) {
  if (!analyticsData || analyticsData.length === 0) {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: formatHour(hour),
      count: 0,
      percentage: 0
    }));
  }

  const hourCounts = Array(24).fill(0);

  analyticsData.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (isNaN(timestamp.getTime())) return;

    const hour = timestamp.getHours();
    hourCounts[hour]++;
  });

  const total = hourCounts.reduce((sum, c) => sum + c, 0);

  return hourCounts.map((count, hour) => ({
    hour,
    label: formatHour(hour),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
}

// Helper functions

function formatHour(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${period}`;
}

function calculateAveragePerDay(data) {
  if (!data || data.length === 0) return 0;

  const dates = new Set();
  data.forEach(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    if (!isNaN(timestamp.getTime())) {
      dates.add(timestamp.toISOString().split('T')[0]);
    }
  });

  return dates.size > 0 ? Math.round(data.length / dates.size) : 0;
}

function calculateDayDistance(dayData) {
  if (!dayData || dayData.length < 2) return 0;

  // Simple distance calculation using haversine
  let totalDistance = 0;
  
  for (let i = 1; i < dayData.length; i++) {
    const prev = dayData[i - 1];
    const curr = dayData[i];

    if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
      // Simplified distance calculation (would use haversine in production)
      const latDiff = Math.abs(curr.latitude - prev.latitude);
      const lngDiff = Math.abs(curr.longitude - prev.longitude);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
      totalDistance += distance;
    }
  }

  return totalDistance;
}

function getWeekKey(date) {
  const weekStart = getWeekStart(date);
  return weekStart.toISOString().split('T')[0];
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get time range statistics
 * 
 * @param {Array} analyticsData - Analytics data points
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Time range statistics
 */
export function getTimeRangeStats(analyticsData, startDate, endDate) {
  if (!analyticsData || analyticsData.length === 0) {
    return {
      totalPoints: 0,
      avgPerDay: 0,
      peakDay: null,
      peakHour: null,
      dateRange: { start: startDate, end: endDate }
    };
  }

  const filteredData = analyticsData.filter(point => {
    const timestamp = new Date(point.deviceTimestamp || point.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });

  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const avgPerDay = daysDiff > 0 ? Math.round(filteredData.length / daysDiff) : 0;

  const dailyPatterns = getDailyPatterns(filteredData);
  const peakHours = calculatePeakHours(filteredData);

  return {
    totalPoints: filteredData.length,
    avgPerDay,
    peakDay: dailyPatterns.busiestDay,
    peakHour: peakHours[0] || null,
    dateRange: { start: startDate, end: endDate },
    dailyPatterns,
    peakHours
  };
}
