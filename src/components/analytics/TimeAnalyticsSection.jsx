// src/components/analytics/TimeAnalyticsSection.jsx
import React, { useMemo, useState } from 'react';
import { ContentSection, SectionDivider } from '../../design-system/components/LayoutComponents';
import { Card } from '../../design-system/components/Card';
import { KpiCard } from '../../design-system/components/KpiCard';
import { cn } from '../../design-system/utils/cn';
import {
  generateActivityHeatmap,
  calculatePeakHours,
  getDailyPatterns,
  getHourlyDistribution
} from '../../utils/timeAnalytics';

export default function TimeAnalyticsSection({ 
  analyticsData, 
  loading = false 
}) {
  const [selectedCell, setSelectedCell] = useState(null);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    return generateActivityHeatmap(analyticsData);
  }, [analyticsData]);

  // Calculate peak hours
  const peakHours = useMemo(() => {
    return calculatePeakHours(analyticsData);
  }, [analyticsData]);

  // Get daily patterns
  const dailyPatterns = useMemo(() => {
    return getDailyPatterns(analyticsData);
  }, [analyticsData]);

  // Get hourly distribution
  const hourlyDist = useMemo(() => {
    return getHourlyDistribution(analyticsData);
  }, [analyticsData]);

  if (loading) {
    return (
      <ContentSection variant="accent" colorScheme="purple" padding="lg">
        <Card variant="glass" colorScheme="purple" padding="lg">
          <Card.Content>
            <div className="h-96 bg-white/10 rounded-lg animate-pulse"></div>
          </Card.Content>
        </Card>
      </ContentSection>
    );
  }

  if (!analyticsData || analyticsData.length === 0) {
    return (
      <ContentSection variant="accent" colorScheme="purple" padding="lg">
        <Card variant="glass" colorScheme="purple" padding="lg">
          <Card.Content>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-purple-200 font-medium">No time data available</div>
            </div>
          </Card.Content>
        </Card>
      </ContentSection>
    );
  }

  const getIntensityColor = (intensity) => {
    if (intensity === 0) return 'bg-white/5';
    if (intensity < 25) return 'bg-purple-500/20';
    if (intensity < 50) return 'bg-purple-500/40';
    if (intensity < 75) return 'bg-purple-500/60';
    return 'bg-purple-500/80';
  };

  return (
    <ContentSection variant="accent" colorScheme="purple" padding="lg" spacing="md" bordered={true} elevated={true}>
      <Card 
        variant="glass" 
        padding="lg" 
        colorScheme="purple" 
        glowEffect={true}
        className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-purple-600/25 via-pink-600/20 to-fuchsia-600/25 border border-purple-400/40"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/8 via-transparent to-pink-500/8 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-purple-400/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-8 right-6 w-40 h-40 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Card.Header className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex-1">
              <Card.Title className="text-white text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Time-based Analytics
              </Card.Title>
              <Card.Description className="text-purple-100/80 mt-1">
                Activity patterns, peak hours, and usage trends over time
              </Card.Description>
            </div>
          </div>
        </Card.Header>

        <Card.Content className="pt-6 relative z-10 space-y-8">
          {/* Peak Hours KPIs */}
          {peakHours.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {peakHours.map((peak, idx) => (
                <KpiCard
                  key={peak.hour}
                  title={`#${idx + 1} Peak Hour`}
                  value={peak.label}
                  subtitle={`${peak.count} activities`}
                  colorScheme="purple"
                  size="sm"
                />
              ))}
            </div>
          )}

          <SectionDivider variant="gradient" colorScheme="pink" spacing="md" animated={true} />

          {/* Activity Heatmap */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Activity Heatmap</h3>
              <div className="flex items-center gap-2 text-xs text-purple-200/80">
                <span>Low</span>
                <div className="flex gap-1">
                  {[0, 25, 50, 75, 100].map(intensity => (
                    <div
                      key={intensity}
                      className={cn('w-4 h-4 rounded', getIntensityColor(intensity))}
                    />
                  ))}
                </div>
                <span>High</span>
              </div>
            </div>

            <Card variant="glass" colorScheme="purple" padding="md">
              <Card.Content>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Hour labels */}
                    <div className="flex mb-2">
                      <div className="w-16"></div>
                      <div className="flex-1 grid grid-cols-24 gap-1">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div key={i} className="text-center text-[10px] text-purple-200/60">
                            {i % 3 === 0 ? i : ''}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Heatmap rows */}
                    {heatmapData.map((dayData) => (
                      <div key={dayData.day} className="flex items-center mb-1">
                        <div className="w-16 text-xs text-purple-200/80 font-medium">
                          {dayData.day}
                        </div>
                        <div className="flex-1 grid grid-cols-24 gap-1">
                          {dayData.hours.map((hourData) => (
                            <div
                              key={hourData.hour}
                              className={cn(
                                'aspect-square rounded cursor-pointer transition-all duration-200',
                                getIntensityColor(hourData.intensity),
                                'hover:ring-2 hover:ring-purple-300 hover:scale-110'
                              )}
                              title={`${dayData.day} ${hourData.hour}:00 - ${hourData.count} activities`}
                              onClick={() => setSelectedCell({ day: dayData.day, hour: hourData.hour, count: hourData.count })}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCell && (
                  <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                    <div className="text-white text-sm">
                      <span className="font-bold">{selectedCell.day}</span> at{' '}
                      <span className="font-bold">{selectedCell.hour}:00</span>
                      {' '}- {selectedCell.count} activities
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          <SectionDivider variant="dotted" colorScheme="fuchsia" spacing="md" animated={true} />

          {/* Daily Patterns */}
          {dailyPatterns.byDay && dailyPatterns.byDay.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Daily Patterns</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Day distribution */}
                <Card variant="glass" colorScheme="purple" padding="md">
                  <Card.Content>
                    <h4 className="text-white font-semibold mb-4">Activity by Day</h4>
                    <div className="space-y-2">
                      {dailyPatterns.byDay.map((day) => (
                        <div key={day.day} className="flex items-center gap-3">
                          <div className="w-16 text-xs text-purple-200/80">{day.dayShort}</div>
                          <div className="flex-1 bg-white/10 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                              style={{ width: `${day.percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                              {day.count}
                            </div>
                          </div>
                          <div className="w-12 text-xs text-purple-200/80 text-right">
                            {day.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>

                {/* Summary stats */}
                <Card variant="glass" colorScheme="purple" padding="md">
                  <Card.Content>
                    <h4 className="text-white font-semibold mb-4">Summary</h4>
                    <div className="space-y-4">
                      {dailyPatterns.busiestDay && (
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-purple-200/80 text-xs mb-1">Busiest Day</div>
                          <div className="text-white text-lg font-bold">{dailyPatterns.busiestDay.day}</div>
                          <div className="text-purple-300 text-sm">{dailyPatterns.busiestDay.count} activities</div>
                        </div>
                      )}
                      {dailyPatterns.quietestDay && (
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-purple-200/80 text-xs mb-1">Quietest Day</div>
                          <div className="text-white text-lg font-bold">{dailyPatterns.quietestDay.day}</div>
                          <div className="text-purple-300 text-sm">{dailyPatterns.quietestDay.count} activities</div>
                        </div>
                      )}
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-purple-200/80 text-xs mb-1">Avg Per Day</div>
                        <div className="text-white text-lg font-bold">{dailyPatterns.avgPerDay}</div>
                        <div className="text-purple-300 text-sm">activities</div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>
    </ContentSection>
  );
}
