// src/components/analytics/TripSummaryCard.jsx
import React from 'react';
import { Card } from '../../design-system/components/Card';
import { KpiCard } from '../../design-system/components/KpiCard';
import { formatDistance, formatDuration } from '../../utils/tripAnalytics';

export default function TripSummaryCard({ tripStats, loading = false }) {
  if (loading) {
    return (
      <Card variant="glass" colorScheme="blue" padding="lg" className="animate-pulse">
        <Card.Content>
          <div className="h-32 bg-white/10 rounded-lg"></div>
        </Card.Content>
      </Card>
    );
  }

  if (!tripStats || tripStats.totalTrips === 0) {
    return (
      <Card variant="glass" colorScheme="blue" padding="lg">
        <Card.Content>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="text-blue-200 font-medium">No trips detected</div>
            <div className="text-blue-200/70 text-sm mt-1">
              Select a device with movement data
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Trip Summary</h3>
          <p className="text-blue-200/80 text-sm">Aggregate statistics</p>
        </div>
        <div className="px-4 py-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <div className="text-blue-200/80 text-xs font-medium">Total Trips</div>
          <div className="text-white text-2xl font-bold">{tripStats.totalTrips}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Distance"
          value={formatDistance(tripStats.totalDistance)}
          subtitle="All trips"
          colorScheme="cyan"
          size="md"
        />
        <KpiCard
          title="Total Duration"
          value={formatDuration(tripStats.totalDuration)}
          subtitle="Time in motion"
          colorScheme="teal"
          size="md"
        />

        <KpiCard
          title="Avg Speed"
          value={`${tripStats.avgSpeed} km/h`}
          subtitle="Across trips"
          colorScheme="blue"
          size="md"
        />
        <KpiCard
          title="Est. Fuel"
          value={`${tripStats.totalFuel} L`}
          subtitle="Total consumption"
          colorScheme="amber"
          size="md"
        />
      </div>

      <Card variant="glass" colorScheme="blue" padding="md">
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-blue-200/80 text-xs font-medium mb-1">Avg Distance</div>
              <div className="text-white text-lg font-bold">{formatDistance(tripStats.avgDistance)}</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-blue-200/80 text-xs font-medium mb-1">Avg Duration</div>
              <div className="text-white text-lg font-bold">{formatDuration(tripStats.avgDuration)}</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-blue-200/80 text-xs font-medium mb-1">Max Speed</div>
              <div className="text-white text-lg font-bold">{tripStats.maxSpeed} km/h</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-blue-200/80 text-xs font-medium mb-1">Avg Fuel/Trip</div>
              <div className="text-white text-lg font-bold">
                {tripStats.totalTrips > 0 ? (tripStats.totalFuel / tripStats.totalTrips).toFixed(2) : 0} L
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
