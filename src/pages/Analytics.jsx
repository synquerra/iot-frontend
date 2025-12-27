import React, { useState, useEffect } from 'react'
import { Card } from '../design-system/components/Card'
import { KpiCard } from '../design-system/components/KpiCard'
import {
  SectionDivider,
  GradientHeader,
  ContentSection,
  HierarchySection
} from '../design-system/components/LayoutComponents'
import {
  EnhancedLineChart,
  EnhancedAreaChart,
  EnhancedBarChart,
  EnhancedPieChart,
  PerformanceTrendChart,
  UsageTrendChart,
  RegionalDistributionChart,
  DeviceTypeChart,
} from '../design-system/components/EnhancedCharts'

// Sample data for analytics charts with enhanced color coding
const performanceData = [
  { time: '00:00', throughput: 3200, latency: 120, errors: 2 },
  { time: '04:00', throughput: 2800, latency: 95, errors: 1 },
  { time: '08:00', throughput: 4500, latency: 140, errors: 5 },
  { time: '12:00', throughput: 5200, latency: 160, errors: 8 },
  { time: '16:00', throughput: 4800, latency: 135, errors: 3 },
  { time: '20:00', throughput: 3600, latency: 110, errors: 2 },
]

const deviceTypeData = [
  { name: 'Sensors', value: 45 },
  { name: 'Gateways', value: 25 },
  { name: 'Controllers', value: 20 },
  { name: 'Monitors', value: 10 },
]

const regionData = [
  { name: 'North America', devices: 1250, active: 1180 },
  { name: 'Europe', devices: 980, active: 920 },
  { name: 'Asia Pacific', devices: 1450, active: 1380 },
  { name: 'South America', devices: 320, active: 290 },
  { name: 'Africa', devices: 180, active: 165 },
]

const usageData = [
  { month: 'Jan', dataTransfer: 2.4, apiCalls: 1.8 },
  { month: 'Feb', dataTransfer: 2.8, apiCalls: 2.1 },
  { month: 'Mar', dataTransfer: 3.2, apiCalls: 2.4 },
  { month: 'Apr', dataTransfer: 3.8, apiCalls: 2.9 },
  { month: 'May', dataTransfer: 4.2, apiCalls: 3.2 },
  { month: 'Jun', dataTransfer: 4.6, apiCalls: 3.5 },
]

export default function Analytics() {
  const [currentMetrics, setCurrentMetrics] = useState({
    totalDevices: 4180,
    activeDevices: 3935,
    totalThroughput: 4200,
    avgLatency: 125,
    errorRate: 2.8,
    uptime: 99.7,
  })

  // Enhanced chart styling configuration for maximum vibrancy
  const chartConfig = {
    grid: {
      stroke: '#334155',
      strokeDasharray: '3 3',
      strokeOpacity: 0.4,
    },
    axis: {
      tick: { fill: '#cbd5e1', fontSize: 12, fontWeight: 500 },
      axisLine: { stroke: '#475569', strokeWidth: 1 },
      tickLine: { stroke: '#475569', strokeWidth: 1 },
    },
    tooltip: {
      contentStyle: {
        background: 'rgba(26, 35, 50, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(139, 92, 246, 0.6)',
        borderRadius: '12px',
        color: '#f8fafc',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.2)',
        padding: '12px 16px',
      },
      cursor: {
        stroke: '#8b5cf6',
        strokeWidth: 2,
        strokeDasharray: '5 5',
      },
    },
    legend: {
      wrapperStyle: {
        color: '#cbd5e1',
        fontSize: '13px',
        fontWeight: '500',
        paddingTop: '16px',
      },
      iconType: 'circle',
    },
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header with Gradient */}
      <GradientHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive analytics and performance metrics for your device network"
        variant="hero"
        colorScheme="amber"
        size="xl"
        centered={false}
      />

      {/* Colorful Section Divider */}
      <SectionDivider 
        variant="rainbow" 
        spacing="lg" 
        animated={true}
      />

      {/* Key Metrics Cards with Enhanced Visual Hierarchy and Gradient Backgrounds */}
      <HierarchySection level={1} colorScheme="amber" spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Total Devices"
            value={currentMetrics.totalDevices.toLocaleString()}
            subtitle="+12% from last month"
            trend="up"
            trendValue="+12%"
            type="growth"
            colorScheme="blue"
            size="md"
            animated={true}
          />

          <KpiCard
            title="Active Devices"
            value={currentMetrics.activeDevices.toLocaleString()}
            subtitle={`${((currentMetrics.activeDevices / currentMetrics.totalDevices) * 100).toFixed(1)}% online`}
            trend="up"
            type="status"
            colorScheme="green"
            size="md"
            animated={true}
          />

          <KpiCard
            title="Throughput"
            value={`${currentMetrics.totalThroughput.toLocaleString()}k`}
            subtitle="requests/hour"
            type="performance"
            colorScheme="cyan"
            size="md"
            animated={true}
          />

          <KpiCard
            title="Avg Latency"
            value={`${currentMetrics.avgLatency}ms`}
            subtitle="+5ms from baseline"
            trend="up"
            trendValue="+5ms"
            type="performance"
            colorScheme="amber"
            size="md"
            animated={true}
          />

          <KpiCard
            title="Error Rate"
            value={`${currentMetrics.errorRate}%`}
            subtitle="-0.3% improvement"
            trend="down"
            trendValue="-0.3%"
            type="performance"
            colorScheme="red"
            size="md"
            animated={true}
          />

          <KpiCard
            title="Uptime"
            value={`${currentMetrics.uptime}%`}
            subtitle="Excellent"
            type="performance"
            colorScheme="violet"
            size="md"
            animated={true}
          />
        </div>
      </HierarchySection>

      {/* Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="blue" 
        spacing="md" 
        animated={true}
      />

      {/* Performance Charts with Enhanced Colors and Gradient Backgrounds */}
      <ContentSection variant="accent" colorScheme="blue" padding="lg" spacing="lg" bordered={true} elevated={true}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Over Time */}
          <HierarchySection level={2} colorScheme="blue" spacing="md">
            <Card variant="gradient" colorScheme="blue" padding="lg" hover={true} glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Performance Trends</Card.Title>
                <Card.Description className="text-blue-100">
                  System performance metrics over the last 24 hours
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <PerformanceTrendChart
                  data={performanceData}
                  metrics={['throughput', 'latency', 'errors']}
                  height={320}
                  animated={true}
                  colorVariant="vibrant"
                />
              </Card.Content>
            </Card>
          </HierarchySection>

          {/* Device Type Distribution */}
          <HierarchySection level={2} colorScheme="cyan" spacing="md">
            <Card variant="gradient" colorScheme="cyan" padding="lg" hover={true} glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Device Type Distribution</Card.Title>
                <Card.Description className="text-cyan-100">
                  Breakdown of connected devices by type
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <DeviceTypeChart
                  data={deviceTypeData}
                  height={320}
                  innerRadius={60}
                  outerRadius={120}
                  animated={true}
                  colorCombination={0}
                />
              </Card.Content>
            </Card>
          </HierarchySection>
        </div>
      </ContentSection>

      {/* Section Divider */}
      <SectionDivider 
        variant="dotted" 
        colorScheme="teal" 
        spacing="lg" 
        animated={true}
      />

      {/* Additional Colorful Analytics Section */}
      <ContentSection variant="colorful" colorScheme="purple" padding="lg" spacing="lg" bordered={true} elevated={true}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Activity Chart */}
          <HierarchySection level={2} colorScheme="purple" spacing="md">
            <Card variant="glass" padding="lg" hover={true}>
              <Card.Header>
                <Card.Title>Real-time Activity</Card.Title>
                <Card.Description>
                  Live device activity and data flow
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <EnhancedAreaChart
                  data={performanceData.slice(-4)}
                  areas={[{ dataKey: 'throughput', name: 'Activity' }]}
                  height={200}
                  animated={true}
                  colorVariant="vibrant"
                  stacked={false}
                />
              </Card.Content>
            </Card>
          </HierarchySection>

          {/* Error Distribution */}
          <HierarchySection level={2} colorScheme="red" spacing="md">
            <Card variant="colorful" colorScheme="red" padding="lg" hover={true} borderAccent={true}>
              <Card.Header>
                <Card.Title>Error Distribution</Card.Title>
                <Card.Description>
                  Error types and frequency
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <EnhancedPieChart
                  data={[
                    { name: 'Timeout', value: 45 },
                    { name: 'Connection', value: 30 },
                    { name: 'Auth', value: 15 },
                    { name: 'Other', value: 10 },
                  ]}
                  height={200}
                  innerRadius={40}
                  outerRadius={80}
                  animated={true}
                  colorCombination={1}
                />
              </Card.Content>
            </Card>
          </HierarchySection>

          {/* Performance Score */}
          <HierarchySection level={2} colorScheme="green" spacing="md">
            <Card variant="gradient" colorScheme="green" padding="lg" hover={true} glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Performance Score</Card.Title>
                <Card.Description className="text-green-100">
                  Overall system health
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="flex flex-col items-center justify-center h-32">
                  <div className="text-6xl font-bold text-white mb-2">
                    {Math.round((currentMetrics.uptime + (100 - currentMetrics.errorRate * 10)) / 2)}
                  </div>
                  <div className="text-green-200 text-sm uppercase tracking-wide">
                    Excellent
                  </div>
                  <div className="w-full bg-green-800/30 rounded-full h-2 mt-4">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-200 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round((currentMetrics.uptime + (100 - currentMetrics.errorRate * 10)) / 2)}%` }}
                    />
                  </div>
                </div>
              </Card.Content>
            </Card>
          </HierarchySection>
        </div>
      </ContentSection>

      {/* Regional Analytics with Enhanced Visualizations and Gradient Cards */}
      <ContentSection variant="highlighted" colorScheme="teal" padding="lg" spacing="lg" bordered={true}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Device Distribution */}
          <HierarchySection level={2} colorScheme="teal" spacing="md">
            <Card variant="gradient" colorScheme="teal" padding="lg" hover={true} glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Regional Distribution</Card.Title>
                <Card.Description className="text-teal-100">
                  Device deployment and activity by geographic region
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <RegionalDistributionChart
                  data={regionData}
                  metrics={['devices', 'active']}
                  height={320}
                  animated={true}
                  colorVariant="vibrant"
                />
              </Card.Content>
            </Card>
          </HierarchySection>

          {/* Usage Trends */}
          <HierarchySection level={2} colorScheme="green" spacing="md">
            <Card variant="gradient" colorScheme="green" padding="lg" hover={true} glowEffect={true}>
              <Card.Header>
                <Card.Title className="text-white">Usage Trends</Card.Title>
                <Card.Description className="text-green-100">
                  Data transfer and API usage over the last 6 months
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <UsageTrendChart
                  data={usageData}
                  metrics={['dataTransfer', 'apiCalls']}
                  height={320}
                  animated={true}
                  colorVariant="vibrant"
                />
              </Card.Content>
            </Card>
          </HierarchySection>
        </div>
      </ContentSection>

      {/* Final Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="purple" 
        spacing="lg" 
        animated={true}
      />

      {/* Summary Footer with Subtle Background */}
      <ContentSection variant="subtle" colorScheme="purple" padding="lg" bordered={true}>
        <Card variant="outlined" padding="lg">
          <Card.Content>
            <div className="text-center">
              <p className="text-text-secondary">
                Analytics data is updated every 5 minutes. Last updated:{' '}
                <span className="text-text-primary font-medium">
                  {new Date().toLocaleTimeString()}
                </span>
              </p>
            </div>
          </Card.Content>
        </Card>
      </ContentSection>
    </div>
  )
}
