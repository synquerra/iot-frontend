// src/components/analytics/DeviceActivityTimeline.jsx
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export default function DeviceActivityTimeline({ 
  analyticsData, 
  loading = false 
}) {
  // Process hourly activity data
  const hourlyActivity = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return [];

    // Group data by hour
    const hourlyMap = {};
    
    analyticsData.forEach(record => {
      const timestamp = new Date(record.deviceTimestamp || record.timestamp);
      const hour = timestamp.getHours();
      
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          count: 0,
          avgSpeed: 0,
          totalSpeed: 0,
          distance: 0
        };
      }
      
      hourlyMap[hour].count++;
      hourlyMap[hour].totalSpeed += Number(record.speed || 0);
      hourlyMap[hour].distance += Number(record.speed || 0) * 0.016; // Approximate distance
    });

    // Calculate averages and format data
    const result = [];
    for (let i = 0; i < 24; i++) {
      if (hourlyMap[i]) {
        result.push({
          hour: hourlyMap[i].hour,
          activity: hourlyMap[i].count,
          avgSpeed: Math.round(hourlyMap[i].totalSpeed / hourlyMap[i].count),
          distance: Math.round(hourlyMap[i].distance * 10) / 10
        });
      } else {
        result.push({
          hour: `${i.toString().padStart(2, '0')}:00`,
          activity: 0,
          avgSpeed: 0,
          distance: 0
        });
      }
    }

    return result;
  }, [analyticsData]);

  // Calculate peak hours
  const peakHours = useMemo(() => {
    if (hourlyActivity.length === 0) return { peak: 'N/A', lowest: 'N/A', totalActivity: 0 };

    const sorted = [...hourlyActivity].sort((a, b) => b.activity - a.activity);
    const totalActivity = hourlyActivity.reduce((sum, h) => sum + h.activity, 0);

    return {
      peak: sorted[0].hour,
      peakCount: sorted[0].activity,
      lowest: sorted[sorted.length - 1].hour,
      lowestCount: sorted[sorted.length - 1].activity,
      totalActivity
    };
  }, [hourlyActivity]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!analyticsData || analyticsData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="text-gray-500 font-medium">No activity data available</div>
        <div className="text-gray-400 text-sm mt-1">Activity timeline will appear here</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peak Hour */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#ffc107] rounded flex items-center justify-center text-white text-2xl">
              <i className="fas fa-sun"></i>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Peak Hour</div>
              <div className="text-xl font-bold text-gray-900">{peakHours.peak}</div>
              <div className="text-xs text-gray-500">{peakHours.peakCount} activities</div>
            </div>
          </div>
        </div>

        {/* Total Activity */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#007bff] rounded flex items-center justify-center text-white text-2xl">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Total Activity</div>
              <div className="text-xl font-bold text-gray-900">{peakHours.totalActivity}</div>
              <div className="text-xs text-gray-500">Data points today</div>
            </div>
          </div>
        </div>

        {/* Lowest Hour */}
        <div className="bg-white rounded shadow">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 w-16 h-16 bg-[#17a2b8] rounded flex items-center justify-center text-white text-2xl">
              <i className="fas fa-moon"></i>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase">Quiet Hour</div>
              <div className="text-xl font-bold text-gray-900">{peakHours.lowest}</div>
              <div className="text-xs text-gray-500">{peakHours.lowestCount} activities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-700">24-Hour Activity Timeline</h5>
            <p className="text-xs text-gray-500 mt-1">Device activity distribution throughout the day</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={hourlyActivity}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#007bff" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28a745" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#28a745" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="hour" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                stroke="#9ca3af"
                interval={1}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#9ca3af"
                label={{ value: 'Activity Count', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#9ca3af"
                label={{ value: 'Avg Speed (km/h)', angle: 90, position: 'insideRight', style: { fill: '#6b7280' } }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="activity" 
                stroke="#007bff" 
                fillOpacity={1} 
                fill="url(#colorActivity)"
                name="Activity Count"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgSpeed" 
                stroke="#28a745" 
                strokeWidth={2}
                dot={{ fill: '#28a745', r: 3 }}
                name="Avg Speed (km/h)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap Summary */}
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-700">Activity Intensity Heatmap</h5>
          <p className="text-xs text-gray-500 mt-1">Visual representation of hourly activity levels</p>
        </div>
        <div className="grid grid-cols-12 gap-1">
          {hourlyActivity.map((hour, index) => {
            const maxActivity = Math.max(...hourlyActivity.map(h => h.activity));
            const intensity = maxActivity > 0 ? (hour.activity / maxActivity) * 100 : 0;
            
            let bgColor = 'bg-gray-100';
            if (intensity > 75) bgColor = 'bg-[#dc3545]';
            else if (intensity > 50) bgColor = 'bg-[#ffc107]';
            else if (intensity > 25) bgColor = 'bg-[#17a2b8]';
            else if (intensity > 0) bgColor = 'bg-[#28a745]/30';

            return (
              <div
                key={index}
                className={`${bgColor} rounded p-2 text-center transition-all hover:scale-110 cursor-pointer`}
                title={`${hour.hour}: ${hour.activity} activities`}
              >
                <div className="text-xs font-semibold text-gray-700">{index}</div>
                <div className="text-xs text-gray-600 mt-1">{hour.activity}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>No Activity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#28a745]/30 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#17a2b8] rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#ffc107] rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#dc3545] rounded"></div>
            <span>Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
