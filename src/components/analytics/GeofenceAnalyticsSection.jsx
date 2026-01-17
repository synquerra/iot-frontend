// src/components/analytics/GeofenceAnalyticsSection.jsx
import React, { useMemo, useState } from 'react';
import { ContentSection, SectionDivider } from '../../design-system/components/LayoutComponents';
import { Card } from '../../design-system/components/Card';
import { KpiCard } from '../../design-system/components/KpiCard';
import { cn } from '../../design-system/utils/cn';
import {
  detectGeofenceEvents,
  calculateTimeInZone,
  getMostVisitedZones,
  getGeofenceStatistics,
  formatDuration
} from '../../utils/geofenceAnalytics';

export default function GeofenceAnalyticsSection({ 
  analyticsData,
  geofences = [],
  loading = false 
}) {
  const [selectedGeofence, setSelectedGeofence] = useState(null);

  // Detect geofence events
  const events = useMemo(() => {
    if (!analyticsData || !geofences || geofences.length === 0) return [];
    return detectGeofenceEvents(analyticsData, geofences);
  }, [analyticsData, geofences]);

  // Get statistics
  const statistics = useMemo(() => {
    return getGeofenceStatistics(events, geofences);
  }, [events, geofences]);

  // Get most visited zones
  const mostVisited = useMemo(() => {
    return getMostVisitedZones(events);
  }, [events]);

  // Calculate time in each zone
  const zoneTimeData = useMemo(() => {
    if (!analyticsData || !geofences || geofences.length === 0) return [];
    
    return geofences.map(geofence => ({
      geofence,
      timeStats: calculateTimeInZone(analyticsData, geofence)
    }));
  }, [analyticsData, geofences]);

  if (loading) {
    return (
      <ContentSection variant="accent" colorScheme="teal" padding="lg">
        <Card variant="glass" colorScheme="teal" padding="lg">
          <Card.Content>
            <div className="h-96 bg-white/10 rounded-lg animate-pulse"></div>
          </Card.Content>
        </Card>
      </ContentSection>
    );
  }

  if (!geofences || geofences.length === 0) {
    return (
      <ContentSection variant="accent" colorScheme="teal" padding="lg">
        <Card variant="glass" colorScheme="teal" padding="lg">
          <Card.Content>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="text-teal-200 font-medium">No geofences configured</div>
              <div className="text-teal-200/70 text-sm mt-1">
                Create geofences to track zone activity
              </div>
            </div>
          </Card.Content>
        </Card>
      </ContentSection>
    );
  }

  return (
    <ContentSection variant="accent" colorScheme="teal" padding="lg" spacing="md" bordered={true} elevated={true}>
      <Card 
        variant="glass" 
        padding="lg" 
        colorScheme="teal" 
        glowEffect={true}
        className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-teal-600/25 via-cyan-600/20 to-emerald-600/25 border border-teal-400/40"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/8 via-transparent to-cyan-500/8 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-teal-400/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-8 right-6 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card.Header className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex-1">
              <Card.Title className="text-white text-2xl font-bold bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
                Geofence Analytics
              </Card.Title>
              <Card.Description className="text-teal-100/80 mt-1">
                Zone activity tracking, entry/exit events, and time spent analysis
              </Card.Description>
            </div>
            
            <div className="px-4 py-2 bg-white/15 backdrop-blur-xl rounded-lg border border-white/30">
              <div className="text-teal-200/80 text-xs font-medium">Active Zones</div>
              <div className="text-white text-sm font-bold">{geofences.length}</div>
            </div>
          </div>
        </Card.Header>

        <Card.Content className="pt-6 relative z-10 space-y-8">
          {/* Statistics KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Events"
              value={statistics.totalEvents}
              subtitle="All zone activities"
              colorScheme="teal"
              size="md"
            />
            <KpiCard
              title="Zone Entries"
              value={statistics.totalEntries}
              subtitle="Devices entered zones"
              colorScheme="cyan"
              size="md"
            />
            <KpiCard
              title="Zone Exits"
              value={statistics.totalExits}
              subtitle="Devices left zones"
              colorScheme="blue"
              size="md"
            />
            <KpiCard
              title="Active Zones"
              value={statistics.activeGeofences}
              subtitle="Zones with activity"
              colorScheme="emerald"
              size="md"
            />
          </div>

          <SectionDivider variant="gradient" colorScheme="cyan" spacing="md" animated={true} />

          {/* Most Visited Zones */}
          {mostVisited.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Most Visited Zones</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mostVisited.slice(0, 6).map((zone, index) => (
                    <Card
                      key={zone.geofence.id}
                      variant="glass"
                      colorScheme="teal"
                      padding="md"
                      hover={true}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedGeofence(zone.geofence)}
                    >
                      <Card.Content>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                              <span className="text-teal-300 font-bold text-sm">#{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm">{zone.geofence.name}</div>
                              <div className="text-teal-200/70 text-xs">{zone.geofence.type}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-teal-200/80 text-xs">Visits</span>
                            <span className="text-white font-bold text-lg">{zone.visits}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-teal-200/80 text-xs">Last Visit</span>
                            <span className="text-white text-xs">
                              {new Date(zone.lastVisit).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              </div>

              <SectionDivider variant="dotted" colorScheme="emerald" spacing="md" animated={true} />
            </>
          )}

          {/* Time in Zone Analysis */}
          {zoneTimeData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Time Spent in Zones</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {zoneTimeData.map(({ geofence, timeStats }) => (
                  <Card
                    key={geofence.id}
                    variant="glass"
                    colorScheme="teal"
                    padding="md"
                    hover={true}
                  >
                    <Card.Content>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-white font-bold">{geofence.name}</div>
                          <div className="text-teal-200/70 text-xs">{geofence.id}</div>
                        </div>
                        <div className="px-3 py-1 bg-teal-500/20 rounded-lg border border-teal-400/30">
                          <span className="text-teal-200 text-xs font-medium">{geofence.type}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-teal-200/80 text-xs mb-1">Total Time</div>
                          <div className="text-white font-bold text-sm">
                            {formatDuration(timeStats.totalTime)}
                          </div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-teal-200/80 text-xs mb-1">Visits</div>
                          <div className="text-white font-bold text-sm">{timeStats.visits}</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-teal-200/80 text-xs mb-1">Avg/Visit</div>
                          <div className="text-white font-bold text-sm">
                            {formatDuration(timeStats.avgTimePerVisit)}
                          </div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                          <div className="text-teal-200/80 text-xs mb-1">Longest</div>
                          <div className="text-white font-bold text-sm">
                            {formatDuration(timeStats.longestVisit)}
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          {statistics.recentEvents && statistics.recentEvents.length > 0 && (
            <>
              <SectionDivider variant="gradient" colorScheme="teal" spacing="md" animated={true} />
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Recent Events</h3>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {statistics.recentEvents.map((event, index) => (
                    <Card
                      key={event.id || index}
                      variant="glass"
                      colorScheme={event.type === 'entry' ? 'green' : 'amber'}
                      padding="sm"
                    >
                      <Card.Content>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            event.type === 'entry' ? 'bg-green-500/20' : 'bg-amber-500/20'
                          )}>
                            <svg className={cn(
                              'w-5 h-5',
                              event.type === 'entry' ? 'text-green-300' : 'text-amber-300'
                            )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {event.type === 'entry' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              )}
                            </svg>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                event.type === 'entry' 
                                  ? 'bg-green-500/20 text-green-200' 
                                  : 'bg-amber-500/20 text-amber-200'
                              )}>
                                {event.type.toUpperCase()}
                              </span>
                              <span className="text-white font-medium text-sm truncate">
                                {event.geofence.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/70">
                              <span>Device: {event.deviceImei?.slice(-4) || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(event.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card.Content>
      </Card>
    </ContentSection>
  );
}
