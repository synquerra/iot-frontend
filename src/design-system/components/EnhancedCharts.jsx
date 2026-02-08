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

// Enhanced Bar Chart with colorful styling and improved interactivity
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

  // Enhanced custom tooltip with glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl p-4 shadow-2xl shadow-black/50">
          <div className="text-white font-bold text-sm mb-2 border-b border-slate-700/50 pb-2">
            {layout === 'horizontal' ? `Category: ${label}` : `Speed Range: ${label}`}
          </div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div 
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: entry.color,
                  boxShadow: `0 0 8px ${entry.color}50`
                }}
              />
              <span className="text-slate-200 text-sm font-medium">
                {entry.name}: 
              </span>
              <span className="text-white font-bold text-sm">
                {entry.value}
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">
              Click to view details
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

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
              <XAxis {...modernChartConfig.axis} angle={-45} textAnchor="end" height={80} />
              <YAxis {...modernChartConfig.axis} />
            </>
          )}
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend {...modernChartConfig.legend} />}
          
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={colors[index % colors.length]}
              radius={layout === 'horizontal' ? [0, 8, 8, 0] : [8, 8, 0, 0]}
              stroke={colors[index % colors.length]}
              strokeWidth={0}
              name={bar.name || bar.dataKey}
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
                transition: 'all 0.3s ease-out',
              }}
              onMouseEnter={(data, index) => {
                // Enhanced hover effect
                if (data && data.target) {
                  data.target.style.filter = 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.3)) brightness(1.1) saturate(1.2)';
                  data.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(data, index) => {
                // Reset hover effect
                if (data && data.target) {
                  data.target.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))';
                  data.target.style.transform = 'scale(1)';
                }
              }}
              {...(animated && chartAnimations.entrance.bar)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Pie Chart with complementary colors and improved interactivity
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

  // Enhanced custom tooltip with glassmorphism
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / payload.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
      
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl p-4 shadow-2xl shadow-black/50">
          <div className="text-white font-bold text-sm mb-2 border-b border-slate-700/50 pb-2">
            {data.name}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ 
                backgroundColor: data.color,
                boxShadow: `0 0 12px ${data.color}50`
              }}
            />
            <span className="text-slate-200 text-sm font-medium">
              Value: 
            </span>
            <span className="text-white font-bold text-sm">
              {data.value}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-4" />
            <span className="text-slate-200 text-sm font-medium">
              Percentage: 
            </span>
            <span className="text-white font-bold text-sm">
              {percentage}%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">
              Click segment for details
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced custom label with better positioning
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Hide labels for very small segments

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold drop-shadow-lg"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
            labelLine={false}
            label={<CustomLabel />}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            stroke="#1e293b"
            strokeWidth={2}
            onMouseEnter={(data, index) => {
              // Enhanced hover effect for pie segments
              const element = document.querySelector(`[data-key="cell-${index}"]`);
              if (element) {
                element.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.15) saturate(1.3)';
                element.style.transform = 'scale(1.05)';
                element.style.transformOrigin = 'center';
              }
            }}
            onMouseLeave={(data, index) => {
              // Reset hover effect
              const element = document.querySelector(`[data-key="cell-${index}"]`);
              if (element) {
                element.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))';
                element.style.transform = 'scale(1)';
              }
            }}
            {...(animated && chartAnimations.entrance.pie)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                data-key={`cell-${index}`}
                fill={colors[index % colors.length]}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
                  transition: 'all 0.3s ease-out',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend 
              {...modernChartConfig.legend}
              iconType="circle"
              wrapperStyle={{
                ...modernChartConfig.legend.wrapperStyle,
                paddingTop: '20px',
              }}
            />
          )}
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