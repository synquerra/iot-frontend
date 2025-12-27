/**
 * Enhanced Chart Components with Colorful Design
 * Provides vibrant, modern chart components with animations and hover effects
 */

import React from 'react';
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
} from 'recharts';
import {
  modernChartConfig,
  getChartColors,
  getChartGradients,
  getPieChartColors,
  chartAnimations,
} from '../utils/chartColors';

// Enhanced Line Chart with colorful styling
export const EnhancedLineChart = ({
  data,
  lines = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animated = true,
  colorVariant = 'vibrant',
  className,
  ...props
}) => {
  const colors = getChartColors(lines.length, colorVariant);

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} {...props}>
          {showGrid && <CartesianGrid {...modernChartConfig.grid} />}
          
          <XAxis {...modernChartConfig.axis} />
          <YAxis {...modernChartConfig.axis} />
          
          {showTooltip && <Tooltip {...modernChartConfig.tooltip} />}
          {showLegend && <Legend {...modernChartConfig.legend} />}
          
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={colors[index % colors.length]}
              strokeWidth={3}
              dot={{
                fill: colors[index % colors.length],
                strokeWidth: 2,
                r: 5,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
              activeDot={{
                r: 7,
                fill: colors[index % colors.length],
                stroke: '#fff',
                strokeWidth: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
              name={line.name || line.dataKey}
              {...(animated && chartAnimations.entrance.line)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Area Chart with gradient fills
export const EnhancedAreaChart = ({
  data,
  areas = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animated = true,
  stacked = false,
  colorVariant = 'vibrant',
  className,
  ...props
}) => {
  const colors = getChartColors(areas.length, colorVariant);
  const gradients = getChartGradients(areas.length);

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} {...props}>
          {/* Define gradients */}
          <defs>
            {areas.map((area, index) => (
              <linearGradient
                key={`gradient-${area.dataKey}`}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>

          {showGrid && <CartesianGrid {...modernChartConfig.grid} />}
          
          <XAxis {...modernChartConfig.axis} />
          <YAxis {...modernChartConfig.axis} />
          
          {showTooltip && <Tooltip {...modernChartConfig.tooltip} />}
          {showLegend && <Legend {...modernChartConfig.legend} />}
          
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stackId={stacked ? "1" : area.dataKey}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              fill={`url(#gradient-${area.dataKey})`}
              name={area.name || area.dataKey}
              {...(animated && chartAnimations.entrance.area)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Bar Chart with colorful styling
export const EnhancedBarChart = ({
  data,
  bars = [],
  height = 300,
  layout = 'vertical', // 'vertical' or 'horizontal'
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animated = true,
  colorVariant = 'vibrant',
  className,
  ...props
}) => {
  const colors = getChartColors(bars.length, colorVariant);

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} {...props}>
          {showGrid && <CartesianGrid {...modernChartConfig.grid} />}
          
          {layout === 'horizontal' ? (
            <>
              <XAxis type="number" {...modernChartConfig.axis} />
              <YAxis type="category" dataKey="name" {...modernChartConfig.axis} width={100} />
            </>
          ) : (
            <>
              <XAxis {...modernChartConfig.axis} />
              <YAxis {...modernChartConfig.axis} />
            </>
          )}
          
          {showTooltip && <Tooltip {...modernChartConfig.tooltip} />}
          {showLegend && <Legend {...modernChartConfig.legend} />}
          
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={colors[index % colors.length]}
              radius={layout === 'horizontal' ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              stroke={colors[index % colors.length]}
              strokeWidth={0}
              name={bar.name || bar.dataKey}
              {...(animated && chartAnimations.entrance.bar)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Pie Chart with complementary colors
export const EnhancedPieChart = ({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = true,
  showTooltip = true,
  animated = true,
  colorCombination = 0,
  paddingAngle = 2,
  className,
  ...props
}) => {
  const colors = getPieChartColors(data.length, colorCombination);

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart {...props}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            stroke="#1e293b"
            strokeWidth={2}
            {...(animated && chartAnimations.entrance.pie)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                }}
              />
            ))}
          </Pie>
          
          {showTooltip && <Tooltip {...modernChartConfig.tooltip} />}
          {showLegend && <Legend {...modernChartConfig.legend} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Multi-series Line Chart for performance trends
export const PerformanceTrendChart = ({
  data,
  metrics = ['throughput', 'latency', 'errors'],
  height = 400,
  className,
  ...props
}) => {
  const lines = metrics.map(metric => ({
    dataKey: metric,
    name: metric.charAt(0).toUpperCase() + metric.slice(1),
  }));

  return (
    <EnhancedLineChart
      data={data}
      lines={lines}
      height={height}
      className={className}
      {...props}
    />
  );
};

// Stacked Area Chart for usage trends
export const UsageTrendChart = ({
  data,
  metrics = ['dataTransfer', 'apiCalls'],
  height = 400,
  className,
  ...props
}) => {
  const areas = metrics.map(metric => ({
    dataKey: metric,
    name: metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
  }));

  return (
    <EnhancedAreaChart
      data={data}
      areas={areas}
      height={height}
      stacked={true}
      className={className}
      {...props}
    />
  );
};

// Regional Distribution Bar Chart
export const RegionalDistributionChart = ({
  data,
  metrics = ['devices', 'active'],
  height = 400,
  className,
  ...props
}) => {
  const bars = metrics.map(metric => ({
    dataKey: metric,
    name: metric.charAt(0).toUpperCase() + metric.slice(1) + ' Devices',
  }));

  return (
    <EnhancedBarChart
      data={data}
      bars={bars}
      height={height}
      layout="horizontal"
      className={className}
      {...props}
    />
  );
};

// Device Type Distribution Pie Chart
export const DeviceTypeChart = ({
  data,
  height = 400,
  className,
  ...props
}) => {
  return (
    <EnhancedPieChart
      data={data}
      height={height}
      innerRadius={60}
      outerRadius={120}
      className={className}
      {...props}
    />
  );
};

export default {
  EnhancedLineChart,
  EnhancedAreaChart,
  EnhancedBarChart,
  EnhancedPieChart,
  PerformanceTrendChart,
  UsageTrendChart,
  RegionalDistributionChart,
  DeviceTypeChart,
};