/**
 * Chart Color Configuration and Utilities
 * Provides vibrant 12+ color palette, gradients, and chart-specific styling
 */

import { semanticColors, spectrumColors, gradients } from '../tokens/colors.js';

// Enhanced 12+ color palette for charts with high contrast
export const chartColorPalette = [
  spectrumColors.violet[500],    // #8b5cf6
  spectrumColors.blue[500],      // #3b82f6
  spectrumColors.cyan[500],      // #06b6d4
  spectrumColors.teal[500],      // #14b8a6
  spectrumColors.green[500],     // #22c55e
  spectrumColors.lime[500],      // #84cc16
  spectrumColors.yellow[500],    // #eab308
  spectrumColors.amber[500],     // #f59e0b
  spectrumColors.orange[500],    // #f97316
  spectrumColors.red[500],       // #ef4444
  spectrumColors.pink[500],      // #ec4899
  spectrumColors.purple[500],    // #a855f7
];

// Subtle variants for secondary data or backgrounds
export const chartColorPaletteSubtle = [
  spectrumColors.violet.subtle,  // #a78bfa
  spectrumColors.blue.subtle,    // #60a5fa
  spectrumColors.cyan.subtle,    // #22d3ee
  spectrumColors.teal.subtle,    // #2dd4bf
  spectrumColors.green.subtle,   // #4ade80
  spectrumColors.lime.subtle,    // #a3e635
  spectrumColors.yellow.subtle,  // #facc15
  spectrumColors.amber.subtle,   // #fbbf24
  spectrumColors.orange.subtle,  // #fb923c
  spectrumColors.red.subtle,     // #f87171
  spectrumColors.pink.subtle,    // #f472b6
  spectrumColors.purple.subtle,  // #c084fc
];

// Gradient fills for area charts and backgrounds
export const chartGradientFills = [
  'linear-gradient(180deg, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.05) 100%)',  // violet
  'linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.05) 100%)',   // blue
  'linear-gradient(180deg, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0.05) 100%)',     // cyan
  'linear-gradient(180deg, rgba(20, 184, 166, 0.4) 0%, rgba(20, 184, 166, 0.05) 100%)',   // teal
  'linear-gradient(180deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.05) 100%)',     // green
  'linear-gradient(180deg, rgba(132, 204, 22, 0.4) 0%, rgba(132, 204, 22, 0.05) 100%)',   // lime
  'linear-gradient(180deg, rgba(234, 179, 8, 0.4) 0%, rgba(234, 179, 8, 0.05) 100%)',     // yellow
  'linear-gradient(180deg, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.05) 100%)',   // amber
  'linear-gradient(180deg, rgba(249, 115, 22, 0.4) 0%, rgba(249, 115, 22, 0.05) 100%)',   // orange
  'linear-gradient(180deg, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.05) 100%)',     // red
  'linear-gradient(180deg, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.05) 100%)',   // pink
  'linear-gradient(180deg, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.05) 100%)',   // purple
];

// Complementary color combinations for pie charts
export const pieChartColorCombinations = [
  // Primary combination - cool to warm spectrum
  [
    spectrumColors.violet[500],
    spectrumColors.blue[500],
    spectrumColors.cyan[500],
    spectrumColors.teal[500],
    spectrumColors.green[500],
    spectrumColors.lime[500],
  ],
  // Secondary combination - warm spectrum
  [
    spectrumColors.yellow[500],
    spectrumColors.amber[500],
    spectrumColors.orange[500],
    spectrumColors.red[500],
    spectrumColors.pink[500],
    spectrumColors.purple[500],
  ],
  // Balanced combination - alternating cool/warm
  [
    spectrumColors.violet[500],
    spectrumColors.orange[500],
    spectrumColors.blue[500],
    spectrumColors.red[500],
    spectrumColors.teal[500],
    spectrumColors.amber[500],
  ],
];

// Enhanced chart configuration with modern styling
export const modernChartConfig = {
  // Grid styling
  grid: {
    stroke: '#334155',
    strokeDasharray: '3 3',
    strokeOpacity: 0.3,
  },
  
  // Axis styling
  axis: {
    tick: { 
      fill: '#cbd5e1', 
      fontSize: 12,
      fontWeight: 500,
    },
    axisLine: { 
      stroke: '#475569',
      strokeWidth: 1,
    },
    tickLine: {
      stroke: '#475569',
      strokeWidth: 1,
    },
  },
  
  // Tooltip styling with glassmorphism effect
  tooltip: {
    contentStyle: {
      background: 'rgba(26, 35, 50, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '12px',
      color: '#f8fafc',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      padding: '12px 16px',
    },
    cursor: {
      stroke: spectrumColors.violet[400],
      strokeWidth: 2,
      strokeDasharray: '5 5',
    },
  },
  
  // Legend styling
  legend: {
    wrapperStyle: {
      color: '#cbd5e1',
      fontSize: '13px',
      fontWeight: '500',
      paddingTop: '16px',
    },
    iconType: 'circle',
  },
  
  // Animation configuration
  animation: {
    animationBegin: 0,
    animationDuration: 800,
    animationEasing: 'ease-out',
  },
};

// KPI card color coding based on value significance
export const kpiColorSchemes = {
  // Performance metrics
  performance: {
    excellent: {
      background: `linear-gradient(135deg, ${spectrumColors.green[500]}15, ${spectrumColors.green[600]}25)`,
      border: spectrumColors.green[400],
      text: spectrumColors.green[400],
      accent: spectrumColors.green[500],
    },
    good: {
      background: `linear-gradient(135deg, ${spectrumColors.blue[500]}15, ${spectrumColors.blue[600]}25)`,
      border: spectrumColors.blue[400],
      text: spectrumColors.blue[400],
      accent: spectrumColors.blue[500],
    },
    warning: {
      background: `linear-gradient(135deg, ${spectrumColors.amber[500]}15, ${spectrumColors.amber[600]}25)`,
      border: spectrumColors.amber[400],
      text: spectrumColors.amber[400],
      accent: spectrumColors.amber[500],
    },
    critical: {
      background: `linear-gradient(135deg, ${spectrumColors.red[500]}15, ${spectrumColors.red[600]}25)`,
      border: spectrumColors.red[400],
      text: spectrumColors.red[400],
      accent: spectrumColors.red[500],
    },
  },
  
  // Growth metrics
  growth: {
    positive: {
      background: `linear-gradient(135deg, ${spectrumColors.green[500]}15, ${spectrumColors.teal[500]}15)`,
      border: spectrumColors.green[400],
      text: spectrumColors.green[400],
      accent: spectrumColors.green[500],
    },
    neutral: {
      background: `linear-gradient(135deg, ${spectrumColors.blue[500]}15, ${spectrumColors.cyan[500]}15)`,
      border: spectrumColors.blue[400],
      text: spectrumColors.blue[400],
      accent: spectrumColors.blue[500],
    },
    negative: {
      background: `linear-gradient(135deg, ${spectrumColors.red[500]}15, ${spectrumColors.pink[500]}15)`,
      border: spectrumColors.red[400],
      text: spectrumColors.red[400],
      accent: spectrumColors.red[500],
    },
  },
  
  // Status metrics
  status: {
    active: {
      background: `linear-gradient(135deg, ${spectrumColors.green[500]}15, ${spectrumColors.lime[500]}15)`,
      border: spectrumColors.green[400],
      text: spectrumColors.green[400],
      accent: spectrumColors.green[500],
    },
    inactive: {
      background: `linear-gradient(135deg, ${spectrumColors.red[500]}15, ${spectrumColors.orange[500]}15)`,
      border: spectrumColors.red[400],
      text: spectrumColors.red[400],
      accent: spectrumColors.red[500],
    },
    pending: {
      background: `linear-gradient(135deg, ${spectrumColors.amber[500]}15, ${spectrumColors.yellow[500]}15)`,
      border: spectrumColors.amber[400],
      text: spectrumColors.amber[400],
      accent: spectrumColors.amber[500],
    },
  },
};

// Utility functions for chart colors
export const getChartColors = (count = 12, variant = 'vibrant') => {
  const palette = variant === 'subtle' ? chartColorPaletteSubtle : chartColorPalette;
  
  if (count <= palette.length) {
    return palette.slice(0, count);
  }
  
  // If more colors needed, cycle through the palette
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
};

export const getChartGradients = (count = 6) => {
  if (count <= chartGradientFills.length) {
    return chartGradientFills.slice(0, count);
  }
  
  // If more gradients needed, cycle through available ones
  const gradients = [];
  for (let i = 0; i < count; i++) {
    gradients.push(chartGradientFills[i % chartGradientFills.length]);
  }
  return gradients;
};

export const getPieChartColors = (count, combinationIndex = 0) => {
  const combination = pieChartColorCombinations[combinationIndex % pieChartColorCombinations.length];
  return getChartColors(count, 'vibrant').slice(0, count);
};

export const getKpiColorScheme = (type, value, thresholds = {}) => {
  const schemes = kpiColorSchemes[type] || kpiColorSchemes.performance;
  
  if (typeof value === 'number' && thresholds) {
    if (value >= (thresholds.excellent || 90)) return schemes.excellent || schemes.positive || schemes.active;
    if (value >= (thresholds.good || 70)) return schemes.good || schemes.neutral;
    if (value >= (thresholds.warning || 50)) return schemes.warning || schemes.pending;
    return schemes.critical || schemes.negative || schemes.inactive;
  }
  
  // Default to first available scheme
  return Object.values(schemes)[0];
};

// Enhanced hover effects for chart elements
export const chartHoverEffects = {
  bar: {
    filter: 'brightness(1.1) saturate(1.2)',
    transition: 'all 0.2s ease-out',
  },
  line: {
    strokeWidth: 3,
    filter: 'drop-shadow(0 0 8px currentColor)',
    transition: 'all 0.2s ease-out',
  },
  pie: {
    transform: 'scale(1.05)',
    filter: 'brightness(1.1) saturate(1.2)',
    transition: 'all 0.2s ease-out',
  },
  area: {
    fillOpacity: 0.8,
    filter: 'brightness(1.1)',
    transition: 'all 0.2s ease-out',
  },
};

// Animated transition configurations
export const chartAnimations = {
  // Entrance animations
  entrance: {
    bar: {
      animationBegin: 0,
      animationDuration: 1000,
      animationEasing: 'ease-out',
    },
    line: {
      animationBegin: 200,
      animationDuration: 1200,
      animationEasing: 'ease-out',
    },
    pie: {
      animationBegin: 0,
      animationDuration: 1000,
      animationEasing: 'ease-out',
    },
    area: {
      animationBegin: 100,
      animationDuration: 1000,
      animationEasing: 'ease-out',
    },
  },
  
  // Update animations
  update: {
    animationDuration: 600,
    animationEasing: 'ease-in-out',
  },
};

export default {
  chartColorPalette,
  chartColorPaletteSubtle,
  chartGradientFills,
  pieChartColorCombinations,
  modernChartConfig,
  kpiColorSchemes,
  getChartColors,
  getChartGradients,
  getPieChartColors,
  getKpiColorScheme,
  chartHoverEffects,
  chartAnimations,
};