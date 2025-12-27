/**
 * Design System Tailwind Configuration
 * Separate config file to avoid circular dependencies
 */

// Import design tokens directly
import { tailwindColors } from './tokens/colors.js';
import { tailwindTypography } from './tokens/typography.js';
import { tailwindSpacing } from './tokens/spacing.js';
import { tailwindAnimations } from './utils/animations.js';
import { tailwindResponsive } from './utils/responsive.js';

// Combined Tailwind configuration for design system
export const designSystemConfig = {
  colors: tailwindColors,
  ...tailwindTypography,
  ...tailwindSpacing,
  ...tailwindAnimations,
  ...tailwindResponsive,
};

// Export individual color utilities for component usage
export { 
  spectrumColors, 
  gradients, 
  semanticColors, 
  getColorIntensity, 
  getColorScale, 
  getGradient, 
  getChartColors, 
  getChartGradients 
} from './tokens/colors.js';