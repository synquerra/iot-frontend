// src/components/analytics/FuelEfficiencyChart.jsx
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { estimateFuelConsumption } from '../../utils/tripAnalytics';

export default function FuelEfficiencyChart({ trips, loading = false }) {
  const chartData = useMemo(() => {
    if (!trips || trips.length === 0) return [];

    return trips.slice(0, 10).map((trip, index) => {
      const fuel = estimateFuelConsumption(trip.distance, trip.avgSpeed);
      const efficiency = trip.distance > 0 ? (fuel / trip.distance) * 100 : 0;

      return {
        name: `Trip ${index + 1}`,
        fuel: parseFloat(fuel.toFixed(2)),
        distance: parseFloat(trip.distance.toFixed(2)),
        efficiency: parseFloat(efficiency.toFixed(2)),
        avgSpeed: parseFloat(trip.avgSpeed.toFixed(1))
      };
    });
  }, [trips]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgFuel: 0,
        totalFuel: 0,
        bestEfficiency: 0,
        worstEfficiency: 0
      };
    }

    return {
      avgFuel: chartData.reduce((sum, d) => sum + d.fuel, 0) / chartData.length,
      totalFuel: chartData.reduce((sum, d) => sum + d.fuel, 0),
      bestEfficiency: Math.min(...chartData.map(d => d.efficiency)),
      worstEfficiency: Math.max(...chartData.map(d => d.efficiency))
    };
  }, [chartData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="text-gray-500 font-medium">No fuel data available</div>
        <div className="text-gray-400 text-sm mt-1">Fuel consumption will be calculated from trip data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fuel Consumption Chart */}
      <div className="bg-white border border-gray-200 rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-sm font-semibold text-gray-700">Fuel Consumption per Trip</h5>
            <p className="text-xs text-gray-500 mt-1">Estimated consumption in liters</p>
          </div>
          <span className="text-xs text-gray-500">Last {chartData.length} trips</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#9ca3af"
                label={{ value: 'Fuel (L)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
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
              <Bar 
                dataKey="fuel" 
                fill="#28a745"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Fuel */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Fuel</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalFuel.toFixed(2)} L</div>
              <div className="text-xs text-gray-500 mt-1">All trips combined</div>
            </div>
            <div className="w-12 h-12 bg-[#28a745]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-gas-pump text-[#28a745] text-xl"></i>
            </div>
          </div>
        </div>

        {/* Average Fuel per Trip */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Avg per Trip</div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgFuel.toFixed(2)} L</div>
              <div className="text-xs text-gray-500 mt-1">Average consumption</div>
            </div>
            <div className="w-12 h-12 bg-[#17a2b8]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-[#17a2b8] text-xl"></i>
            </div>
          </div>
        </div>

        {/* Best Efficiency */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Best Efficiency</div>
              <div className="text-2xl font-bold text-gray-900">{stats.bestEfficiency.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">L/100km</div>
            </div>
            <div className="w-12 h-12 bg-[#ffc107]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-trophy text-[#ffc107] text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
