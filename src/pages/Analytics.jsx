import React, { useState, useEffect } from 'react'
import { Card } from '../design-system/components/Card'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Sample data for analytics charts
const performanceData = [
  { time: '00:00', throughput: 3200, latency: 120, errors: 2 },
  { time: '04:00', throughput: 2800, latency: 95, errors: 1 },
  { time: '08:00', throughput: 4500, latency: 140, errors: 5 },
  { time: '12:00', throughput: 5200, latency: 160, errors: 8 },
  { time: '16:00', throughput: 4800, latency: 135, errors: 3 },
  { time: '20:00', throughput: 3600, latency: 110, errors: 2 },
]

const deviceTypeData = [
  { name: 'Sensors', value: 45, color: '#3b82f6' },
  { name: 'Gateways', value: 25, color: '#10b981' },
  { name: 'Controllers', value: 20, color: '#f59e0b' },
  { name: 'Monitors', value: 10, color: '#ef4444' },
]

const regionData = [
  { region: 'North America', devices: 1250, active: 1180 },
  { region: 'Europe', devices: 980, active: 920 },
  { region: 'Asia Pacific', devices: 1450, active: 1380 },
  { region: 'South America', devices: 320, active: 290 },
  { region: 'Africa', devices: 180, active: 165 },
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

  // Chart styling configuration for consistency
  const chartConfig = {
    grid: {
      stroke: '#334155',
      strokeDasharray: '3 3',
    },
    axis: {
      tick: { fill: '#cbd5e1', fontSize: 12 },
      axisLine: { stroke: '#475569' },
    },
    tooltip: {
      contentStyle: {
        background: '#1a2332',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f8fafc',
        fontSize: '14px',
      },
    },
    legend: {
      wrapperStyle: {
        color: '#cbd5e1',
        fontSize: '12px',
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card variant="default" padding="lg">
        <Card.Header>
          <Card.Title>Analytics Dashboard</Card.Title>
          <Card.Description>
            Comprehensive analytics and performance metrics for your device network
          </Card.Description>
        </Card.Header>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card variant="elevated" padding="md" hover>
          <Card.Content className="py-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">Total Devices</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentMetrics.totalDevices.toLocaleString()}
              </p>
              <p className="text-xs text-status-success">+12% from last month</p>
            </div>
          </Card.Content>
        </Card>

        <Card variant="elevated" padding="md" hover>
          <Card.Content className="py-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">Active Devices</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentMetrics.activeDevices.toLocaleString()}
              </p>
              <p className="text-xs text-status-success">
                {((currentMetrics.activeDevices / currentMetrics.totalDevices) * 100).toFixed(1)}% online
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card variant="elevated" padding="md" hover>
          <Card.Content className="py-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">Throughput</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentMetrics.totalThroughput.toLocaleString()}k
              </p>
              <p className="text-xs text-status-info">requests/hour</p>
            </div>
          </Card.Content>
        </Card>

        <Card variant="elevated" padding="md" hover>
          <Card.Content className="py-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">Avg Latency</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentMetrics.avgLatency}ms
              </p>
              <p className="text-xs text-status-warning">+5ms from baseline</p>
            </div>
          </Card.Content>
        </Card>

        <Card variant="elevated" padding="md" hover>
          <Card.Content className="py-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">Error Rate</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentMetrics.errorRate}%
              </p>
              <p className="text-xs text-status-success">-0.3% improvement</p>
            </div>
          </Card.Content>
        </Card>

        <Card variant="elevated" padding="md" hover>
          <Card.Content className="py-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">Uptime</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentMetrics.uptime}%
              </p>
              <p className="text-xs text-status-success">Excellent</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <Card variant="default" padding="lg">
          <Card.Header>
            <Card.Title>Performance Trends</Card.Title>
            <Card.Description>
              System performance metrics over the last 24 hours
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid {...chartConfig.grid} />
                  <XAxis dataKey="time" {...chartConfig.axis} />
                  <YAxis yAxisId="left" {...chartConfig.axis} />
                  <YAxis yAxisId="right" orientation="right" {...chartConfig.axis} />
                  <Tooltip {...chartConfig.tooltip} />
                  <Legend {...chartConfig.legend} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="throughput"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Throughput (k)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="latency"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Latency (ms)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Device Type Distribution */}
        <Card variant="default" padding="lg">
          <Card.Header>
            <Card.Title>Device Type Distribution</Card.Title>
            <Card.Description>
              Breakdown of connected devices by type
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="#334155"
                    strokeWidth={1}
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartConfig.tooltip} />
                  <Legend {...chartConfig.legend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Regional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Device Distribution */}
        <Card variant="default" padding="lg">
          <Card.Header>
            <Card.Title>Regional Distribution</Card.Title>
            <Card.Description>
              Device deployment and activity by geographic region
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} layout="horizontal">
                  <CartesianGrid {...chartConfig.grid} />
                  <XAxis type="number" {...chartConfig.axis} />
                  <YAxis type="category" dataKey="region" {...chartConfig.axis} width={100} />
                  <Tooltip {...chartConfig.tooltip} />
                  <Legend {...chartConfig.legend} />
                  <Bar
                    dataKey="devices"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    name="Total Devices"
                  />
                  <Bar
                    dataKey="active"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    name="Active Devices"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Usage Trends */}
        <Card variant="default" padding="lg">
          <Card.Header>
            <Card.Title>Usage Trends</Card.Title>
            <Card.Description>
              Data transfer and API usage over the last 6 months
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <CartesianGrid {...chartConfig.grid} />
                  <XAxis dataKey="month" {...chartConfig.axis} />
                  <YAxis {...chartConfig.axis} />
                  <Tooltip {...chartConfig.tooltip} />
                  <Legend {...chartConfig.legend} />
                  <Area
                    type="monotone"
                    dataKey="dataTransfer"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Data Transfer (TB)"
                  />
                  <Area
                    type="monotone"
                    dataKey="apiCalls"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="API Calls (M)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Summary Footer */}
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
    </div>
  )
}
