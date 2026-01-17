// src/components/analytics/FuelEfficiencyChart.jsx
import React, { useMemo } from 'react';
import { Card } from '../../design-system/components/Card';
import { EnhancedBarChart } from '../LazyCharts';
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

  if (loading) {
    return (
      <Card variant="glass" colorScheme="amber" padding="lg">
        <Card.Content>
          <div className="h-64 bg-white/10 rounded-lg animate-pulse"></div>
        </Card.Content>
      </Card>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <Card variant="glass" colorScheme="amber" padding="lg">
        <Card.Content>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-amber-200 font-medium">No fuel data</div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Fuel Efficiency</h3>
          <p className="text-amber-200/80 text-sm">Estimated consumption per trip</p>
        </div>
        <div className="text-amber-200/70 text-xs">
          Showing {Math.min(trips.length, 10)} most recent trips
        </div>
      </div>

      <Card variant="glass" colorScheme="amber" padding="lg">
        <Card.Content>
          <div className="h-64">
            <EnhancedBarChart
              data={chartData}
              xKey="name"
              bars={[
                { key: 'fuel', name: 'Fuel (L)', color: '#f59e0b' }
              ]}
              height={250}
            />
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" colorScheme="amber" padding="md">
          <Card.Content>
            <div className="text-center">
              <div className="text-amber-200/80 text-xs font-medium mb-2">Avg Fuel/Trip</div>
              <div className="text-white text-2xl font-bold">
                {(chartData.reduce((sum, d) => sum + d.fuel, 0) / chartData.length).toFixed(2)} L
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="md">
          <Card.Content>
            <div className="text-center">
              <div className="text-amber-200/80 text-xs font-medium mb-2">Best Efficiency</div>
              <div className="text-white text-2xl font-bold">
                {Math.min(...chartData.map(d => d.efficiency)).toFixed(2)} L/100km
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="md">
          <Card.Content>
            <div className="text-center">
              <div className="text-amber-200/80 text-xs font-medium mb-2">Worst Efficiency</div>
              <div className="text-white text-2xl font-bold">
                {Math.max(...chartData.map(d => d.efficiency)).toFixed(2)} L/100km
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
