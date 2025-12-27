/**
 * Enhanced color tokens with comprehensive spectrum colors, gradients, and semantic mappings
 * Maintains existing colors while adding vibrant colorful design system
 */

// Base colors from existing config (maintained for backward compatibility)
export const baseColors = {
  bg: '#071021',
  card: '#0f1b2a', 
  muted: '#9aa7b2',
  accent: '#5eead4',
  primary: '#7c3aed',
};

// Comprehensive 12+ spectrum color palette with intensity variants
export const spectrumColors = {
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',   // Base vibrant
    600: '#7c3aed',   // Existing primary
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
    subtle: '#a78bfa',    // 400 level for subtle variant
    vibrant: '#8b5cf6',   // 500 level for vibrant variant
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // Base vibrant
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
    subtle: '#60a5fa',    // 400 level
    vibrant: '#3b82f6',   // 500 level
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',   // Base vibrant
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
    subtle: '#22d3ee',    // 400 level
    vibrant: '#06b6d4',   // 500 level
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',   // Existing accent color
    400: '#2dd4bf',
    500: '#14b8a6',   // Base vibrant
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
    subtle: '#2dd4bf',    // 400 level
    vibrant: '#14b8a6',   // 500 level
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',   // Base vibrant
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
    subtle: '#4ade80',    // 400 level
    vibrant: '#22c55e',   // 500 level
  },
  lime: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',   // Base vibrant
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
    950: '#1a2e05',
    subtle: '#a3e635',    // 400 level
    vibrant: '#84cc16',   // 500 level
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',   // Base vibrant
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
    subtle: '#facc15',    // 400 level
    vibrant: '#eab308',   // 500 level
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',   // Base vibrant
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
    subtle: '#fbbf24',    // 400 level
    vibrant: '#f59e0b',   // 500 level
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',   // Base vibrant
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
    subtle: '#fb923c',    // 400 level
    vibrant: '#f97316',   // 500 level
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',   // Base vibrant
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
    subtle: '#f87171',    // 400 level
    vibrant: '#ef4444',   // 500 level
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',   // Base vibrant
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
    subtle: '#f472b6',    // 400 level
    vibrant: '#ec4899',   // 500 level
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',   // Base vibrant
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
    subtle: '#c084fc',    // 400 level
    vibrant: '#a855f7',   // 500 level
  },
};

// Gradient combinations for backgrounds and accents
export const gradients = {
  primary: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  secondary: 'linear-gradient(135deg, #1a2332 0%, #243142 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  rainbow: 'linear-gradient(135deg, #ec4899 0%, #a855f7 25%, #3b82f6 50%, #22c55e 75%, #f59e0b 100%)',
  sunset: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)',
  ocean: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #7c3aed 100%)',
  forest: 'linear-gradient(135deg, #84cc16 0%, #22c55e 50%, #14b8a6 100%)',
  aurora: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)',
  cosmic: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #ec4899 100%)',
};

// Enhanced semantic color system with spectrum color integration
export const semanticColors = {
  surface: {
    primary: '#0f1b2a',    // Main card background (existing card color)
    secondary: '#1a2332',   // Elevated surfaces
    tertiary: '#243142',    // Highest elevation
    background: '#071021',  // Main background (existing bg color)
  },
  text: {
    primary: '#f8fafc',     // Primary text
    secondary: '#cbd5e1',   // Secondary text
    tertiary: '#64748b',    // Muted text (darker than existing muted)
    muted: '#9aa7b2',       // Existing muted color
    inverse: '#0f172a',     // Text on light backgrounds
  },
  border: {
    primary: '#334155',     // Default borders
    secondary: '#475569',   // Hover borders
    accent: '#5eead4',      // Focus/active borders (existing accent)
    muted: '#1e293b',       // Subtle borders
  },
  status: {
    success: spectrumColors.green[500],     // Success states
    successSubtle: spectrumColors.green.subtle,
    warning: spectrumColors.amber[500],     // Warning states
    warningSubtle: spectrumColors.amber.subtle,
    error: spectrumColors.red[500],         // Error states
    errorSubtle: spectrumColors.red.subtle,
    info: spectrumColors.blue[500],         // Info states
    infoSubtle: spectrumColors.blue.subtle,
  },
  interactive: {
    primary: spectrumColors.violet[600],     // Primary buttons (existing primary)
    primaryHover: spectrumColors.violet[700], // Primary hover state
    primarySubtle: spectrumColors.violet.subtle,
    secondary: '#1a2332',   // Secondary buttons
    secondaryHover: '#243142', // Secondary hover state
    accent: spectrumColors.teal[300],      // Accent elements (existing accent)
    accentHover: spectrumColors.teal[400], // Accent hover state
    accentSubtle: spectrumColors.teal.subtle,
  },
  chart: {
    // 12+ distinct colors for data visualization
    palette: [
      spectrumColors.violet[500],
      spectrumColors.blue[500],
      spectrumColors.cyan[500],
      spectrumColors.teal[500],
      spectrumColors.green[500],
      spectrumColors.lime[500],
      spectrumColors.yellow[500],
      spectrumColors.amber[500],
      spectrumColors.orange[500],
      spectrumColors.red[500],
      spectrumColors.pink[500],
      spectrumColors.purple[500],
    ],
    // Subtle variants for secondary data
    paletteSubtle: [
      spectrumColors.violet.subtle,
      spectrumColors.blue.subtle,
      spectrumColors.cyan.subtle,
      spectrumColors.teal.subtle,
      spectrumColors.green.subtle,
      spectrumColors.lime.subtle,
      spectrumColors.yellow.subtle,
      spectrumColors.amber.subtle,
      spectrumColors.orange.subtle,
      spectrumColors.red.subtle,
      spectrumColors.pink.subtle,
      spectrumColors.purple.subtle,
    ],
    // Gradient fills for area charts
    gradientFills: [
      'linear-gradient(180deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.05) 100%)',
      'linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.05) 100%)',
      'linear-gradient(180deg, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.05) 100%)',
      'linear-gradient(180deg, rgba(20, 184, 166, 0.3) 0%, rgba(20, 184, 166, 0.05) 100%)',
      'linear-gradient(180deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.05) 100%)',
      'linear-gradient(180deg, rgba(132, 204, 22, 0.3) 0%, rgba(132, 204, 22, 0.05) 100%)',
    ],
  },
};

// Combined color system for comprehensive access
export const colorTokens = {
  ...baseColors,
  spectrum: spectrumColors,
  gradients,
  semantic: semanticColors,
};

// Tailwind-compatible color configuration
export const tailwindColors = {
  // Maintain existing colors for backward compatibility
  bg: baseColors.bg,
  card: baseColors.card,
  muted: baseColors.muted,
  accent: baseColors.accent,
  primary: baseColors.primary,
  
  // Add full spectrum colors
  violet: spectrumColors.violet,
  blue: spectrumColors.blue,
  cyan: spectrumColors.cyan,
  teal: spectrumColors.teal,
  green: spectrumColors.green,
  lime: spectrumColors.lime,
  yellow: spectrumColors.yellow,
  amber: spectrumColors.amber,
  orange: spectrumColors.orange,
  red: spectrumColors.red,
  pink: spectrumColors.pink,
  purple: spectrumColors.purple,
  
  // Add semantic colors
  surface: semanticColors.surface,
  text: semanticColors.text,
  border: semanticColors.border,
  status: semanticColors.status,
  interactive: semanticColors.interactive,
  chart: semanticColors.chart,
};

// Color intensity helper functions
export const getColorIntensity = (colorName, intensity = 'vibrant') => {
  const color = spectrumColors[colorName];
  if (!color) return null;
  
  return intensity === 'subtle' ? color.subtle : color.vibrant;
};

export const getColorScale = (colorName, scale = 500) => {
  const color = spectrumColors[colorName];
  if (!color) return null;
  
  return color[scale] || color.vibrant;
};

// Gradient helper functions
export const getGradient = (gradientName) => {
  return gradients[gradientName] || gradients.primary;
};

// Chart color helper functions
export const getChartColors = (count = 12, intensity = 'vibrant') => {
  const palette = intensity === 'subtle' 
    ? semanticColors.chart.paletteSubtle 
    : semanticColors.chart.palette;
  
  return palette.slice(0, count);
};

export const getChartGradients = (count = 6) => {
  return semanticColors.chart.gradientFills.slice(0, count);
};