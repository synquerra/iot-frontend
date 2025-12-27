/**
 * Design System Entry Point
 * Exports all design tokens and utilities for use throughout the application
 */

// Design tokens
export { 
  baseColors, 
  semanticColors, 
  colorTokens, 
  tailwindColors 
} from './tokens/colors.js';

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

// Utilities
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

// Re-export Tailwind configuration from separate file
export { designSystemConfig } from './tailwind.config.js';