// src/components/analytics/TripHistoryTimeline.jsx
import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { cn } from '../../design-system/utils/cn';
import { formatDistance, formatDuration } from '../../utils/tripAnalytics';

export default function TripHistoryTimeline({ trips, onTripSelect, loading = false }) {
  const [selectedTripId, setSelectedTripId] = useState(null);

  if (loading) {
    return (
      <Card variant="glass" colorScheme="purple" padding="lg">
        <Card.Content>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/10 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <Card variant="glass" colorScheme="purple" padding="lg">
        <Card.Content>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-purple-200 font-medium">No trip history</div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  const handleTripClick = (trip) => {
    setSelectedTripId(trip.id);
    if (onTripSelect) {
      onTripSelect(trip);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Trip History</h3>
        <div className="text-purple-200/80 text-sm">{trips.length} trips</div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {trips.map((trip, index) => {
          const isSelected = selectedTripId === trip.id;
          const startTime = new Date(trip.startTime);
          const endTime = new Date(trip.endTime);

          return (
            <Card
              key={trip.id}
              variant="glass"
              colorScheme={isSelected ? "purple" : "slate"}
              padding="md"
              hover={true}
              className={cn(
                "cursor-pointer transition-all duration-200",
                isSelected && "ring-2 ring-purple-400/50 scale-[1.02]"
              )}
              onClick={() => handleTripClick(trip)}
            >
              <Card.Content>
                <div className="flex items-start gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isSelected ? "bg-purple-500/30 border-2 border-purple-400" : "bg-white/10 border border-white/20"
                    )}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    {index < trips.length - 1 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-purple-400/50 to-transparent mt-2"></div>
                    )}
                  </div>

                  {/* Trip details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-white font-medium text-sm">
                          {startTime.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs font-medium">
                          {formatDistance(trip.distance)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-white/60 text-xs mb-1">Start Time</div>
                        <div className="text-white font-medium">{startTime.toLocaleTimeString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs mb-1">End Time</div>
                        <div className="text-white font-medium">{endTime.toLocaleTimeString()}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs mb-1">Duration</div>
                        <div className="text-white font-medium">{formatDuration(trip.duration)}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs mb-1">Avg Speed</div>
                        <div className="text-white font-medium">{trip.avgSpeed.toFixed(1)} km/h</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white/60 mb-1">Max Speed</div>
                            <div className="text-white font-bold">{trip.maxSpeed.toFixed(1)} km/h</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white/60 mb-1">Points</div>
                            <div className="text-white font-bold">{trip.points.length}</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white/60 mb-1">Device</div>
                            <div className="text-white font-bold text-[10px]">{trip.deviceImei.slice(-4)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
