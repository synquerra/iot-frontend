/**
 * Design System Entry Point
 * Exports all design tokens, components, and utilities for use throughout the application
 */

// Components
export { Button } from './components/Button.jsx';
export { Card } from './components/Card.jsx';
export { Input } from './components/Input.jsx';
export { Loading } from './components/Loading.jsx';
export { Table, TableContainer } from './components/Table.jsx';
export { KpiCard, PerformanceKpiCard, GrowthKpiCard, StatusKpiCard } from './components/KpiCard.jsx';
export {
  EnhancedLineChart,
  EnhancedAreaChart,
  EnhancedBarChart,
  EnhancedPieChart,
  PerformanceTrendChart,
  UsageTrendChart,
  RegionalDistributionChart,
  DeviceTypeChart,
} from './components/EnhancedCharts.jsx';

// Accessibility components
export {
  AccessibleWrapper,
  withAccessibility,
  AccessibleText,
  AccessibleButton,
  AccessibleStatusIndicator,
} from './components/AccessibleWrapper.jsx';

// Design tokens
export { 
  baseColors, 
  semanticColors, 
  colorTokens, 
  tailwindColors,
  spectrumColors,
  gradients,
  getColorIntensity,
  getColorScale,
  getGradient,
  getChartColors,
  getChartGradients,
} from './tokens/colors.js';

// Accessible color tokens
export {
  accessibleColorCombinations,
  highContrastColors,
  colorBlindFriendlyColors,
  accessibleColorUtils,
  accessibleColorSystem,
} from './tokens/accessibleColors.js';

export { 
  fontFamily, 
  fontSize, 
  fontWeight, 
  letterSpacing, 
  typographyScale, 
  tailwindTypography 
} from './tokens/typography.js';

export { 
  spacing, 
  componentSpacing, 
  borderRadius, 
  boxShadow, 
  tailwindSpacing 
} from './tokens/spacing.js';

// Chart utilities
export {
  chartColorPalette,
  chartColorPaletteSubtle,
  chartGradientFills,
  pieChartColorCombinations,
  modernChartConfig,
  kpiColorSchemes,
  getChartColors as getChartColorsUtil,
  getChartGradients as getChartGradientsUtil,
  getPieChartColors,
  getKpiColorScheme,
  chartHoverEffects,
  chartAnimations,
} from './utils/chartColors.js';

// Utilities
export { cn } from './utils/cn.js';

// Accessibility utilities
export {
  default as accessibilityUtils,
  WCAG_LEVELS,
  COLOR_BLIND_MATRICES,
  ALTERNATIVE_INDICATORS,
  HIGH_CONTRAST_COLORS,
  COLOR_BLIND_FRIENDLY_PALETTE,
  motionAccessibility,
  focusManagement,
} from './utils/accessibility.js';

export {
  accessibilityCSS,
  accessibilityClasses,
  accessibilityStyles,
  accessibilityTailwindPlugin,
  injectAccessibilityCSS,
  removeAccessibilityCSS,
} from './utils/accessibilityStyles.js';

export { 
  duration, 
  easing, 
  transitions, 
  keyframes, 
  animationClasses, 
  createTransition, 
  createAnimation, 
  tailwindAnimations 
} from './utils/animations.js';

export { 
  breakpoints, 
  breakpointValues, 
  mediaQueries, 
  containerMaxWidths, 
  gridSystem, 
  responsiveSpacing, 
  getBreakpointValue, 
  isBreakpointActive, 
  getCurrentBreakpoint, 
  responsive, 
  responsivePatterns, 
  tailwindResponsive 
} from './utils/responsive.js';

export { 
  responsiveColors,
  contrastUtils,
  responsiveColorConfig,
  responsiveTailwindClasses,
} from './utils/responsiveColors.js';

// Accessibility hooks
export {
  useAccessibility,
  useColorContrast,
  useAlternativeIndicators,
  useMotionAccessibility,
  useFocusManagement,
  useHighContrast,
} from './hooks/useAccessibility.js';

export { 
  useResponsiveColors,
  useResponsiveColorVariables,
  useBreakpoint,
  useTouchFeedback,
} from './hooks/useResponsiveColors.js';

// Re-export Tailwind configuration from separate file
export { designSystemConfig } from './tailwind.config.js';