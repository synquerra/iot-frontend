// src/components/analytics/TripAnalyticsSection.jsx
import React, { useMemo, useState } from 'react';
import { ContentSection, SectionDivider } from '../../design-system/components/LayoutComponents';
import { Card } from '../../design-system/components/Card';
import TripSummaryCard from './TripSummaryCard';
import TripHistoryTimeline from './TripHistoryTimeline';
import FuelEfficiencyChart from './FuelEfficiencyChart';
import { detectTrips, getTripStatistics, calculateIdleTime } from '../../utils/tripAnalytics';

export default function TripAnalyticsSection({ 
  analyticsData, 
  selectedDevice, 
  loading = false 
}) {
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Detect trips from analytics data
  const trips = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return [];
    return detectTrips(analyticsData);
  }, [analyticsData]);

  // Calculate trip statistics
  const tripStats = useMemo(() => {
    return getTripStatistics(trips);
  }, [trips]);

  // Calculate idle time
  const idleTimeStats = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return null;
    return calculateIdleTime(analyticsData);
  }, [analyticsData]);

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
  };

  return (
    <ContentSection 
      variant="accent" 
      colorScheme="blue" 
      padding="lg" 
      spacing="md" 
      bordered={true} 
      elevated={true}
    >
      <Card 
        variant="glass" 
        padding="lg" 
        colorScheme="blue" 
        glowEffect={true}
        hover={false}
        className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-blue-600/25 via-cyan-600/20 to-teal-600/25 border border-blue-400/40"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/8 via-transparent to-cyan-500/8 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-blue-400/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-8 right-6 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card.Header className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex-1">
              <Card.Title className="text-white text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Trip Analytics
              </Card.Title>
              <Card.Description className="text-blue-100/80 mt-1">
                Comprehensive journey analysis with distance, duration, and fuel estimates
              </Card.Description>
            </div>
            
            {selectedDevice && (
              <div className="px-4 py-2 bg-white/15 backdrop-blur-xl rounded-lg border border-white/30">
                <div className="text-blue-200/80 text-xs font-medium">Device</div>
                <div className="text-white text-sm font-bold">{selectedDevice}</div>
              </div>
            )}
          </div>
        </Card.Header>

        <Card.Content className="pt-6 relative z-10 space-y-8">
          {/* Trip Summary */}
          <TripSummaryCard tripStats={tripStats} loading={loading} />

          <SectionDivider variant="gradient" colorScheme="cyan" spacing="md" animated={true} />

          {/* Idle Time Stats */}
          {idleTimeStats && idleTimeStats.totalTime > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass" colorScheme="green" padding="md">
                  <Card.Content>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-green-200/80 text-xs font-medium">Moving Time</div>
                        <div className="text-white text-xl font-bold">
                          {Math.floor(idleTimeStats.movingTime / 60)} min
                        </div>
                        <div className="text-green-300 text-xs">{idleTimeStats.movingPercentage}%</div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card variant="glass" colorScheme="amber" padding="md">
                  <Card.Content>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-amber-200/80 text-xs font-medium">Idle Time</div>
                        <div className="text-white text-xl font-bold">
                          {Math.floor(idleTimeStats.idleTime / 60)} min
                        </div>
                        <div className="text-amber-300 text-xs">{idleTimeStats.idlePercentage}%</div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card variant="glass" colorScheme="blue" padding="md">
                  <Card.Content>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-200/80 text-xs font-medium">Total Time</div>
                        <div className="text-white text-xl font-bold">
                          {Math.floor(idleTimeStats.totalTime / 60)} min
                        </div>
                        <div className="text-blue-300 text-xs">100%</div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>

              <SectionDivider variant="gradient" colorScheme="purple" spacing="md" animated={true} />
            </>
          )}

          {/* Trip History and Fuel Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TripHistoryTimeline 
              trips={trips} 
              onTripSelect={handleTripSelect}
              loading={loading}
            />
            <FuelEfficiencyChart trips={trips} loading={loading} />
          </div>

          {/* Selected Trip Details */}
          {selectedTrip && (
            <>
              <SectionDivider variant="dotted" colorScheme="teal" spacing="md" animated={true} />
              
              <Card variant="glass" colorScheme="teal" padding="lg">
                <Card.Header>
                  <Card.Title className="text-white text-lg font-bold">
                    Selected Trip Details
                  </Card.Title>
                </Card.Header>
                <Card.Content className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-teal-200/80 text-xs font-medium mb-1">Start</div>
                      <div className="text-white text-sm font-bold">
                        {new Date(selectedTrip.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-teal-200/80 text-xs font-medium mb-1">End</div>
                      <div className="text-white text-sm font-bold">
                        {new Date(selectedTrip.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-teal-200/80 text-xs font-medium mb-1">Data Points</div>
                      <div className="text-white text-sm font-bold">{selectedTrip.points.length}</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-teal-200/80 text-xs font-medium mb-1">Device</div>
                      <div className="text-white text-sm font-bold">{selectedTrip.deviceImei}</div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </>
          )}
        </Card.Content>
      </Card>
    </ContentSection>
  );
}
