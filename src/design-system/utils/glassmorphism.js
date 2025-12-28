/**
 * Glassmorphism styling utilities for modern UI effects
 * Provides consistent glass-like transparency and backdrop effects
 */

import { cn } from './cn.js';

/**
 * Base glassmorphism effect classes
 */
export const glassmorphismBase = {
  // Core glassmorphism properties
  backdrop: 'backdrop-blur-xl backdrop-saturate-150',
  border: 'border border-white/10',
  shadow: 'shadow-xl shadow-black/20',
  
  // Background variations
  background: {
    subtle: 'bg-white/5',
    medium: 'bg-white/10',
    strong: 'bg-white/15',
    dark: 'bg-black/20',
  },
  
  // Border variations
  borders: {
    subtle: 'border-white/5',
    medium: 'border-white/10',
    strong: 'border-white/20',
    accent: 'border-white/30',
  },
  
  // Shadow variations
  shadows: {
    subtle: 'shadow-lg shadow-black/10',
    medium: 'shadow-xl shadow-black/20',
    strong: 'shadow-2xl shadow-black/30',
    colored: 'shadow-xl shadow-current/20',
  },
};

/**
 * Glassmorphism preset combinations
 */
export const glassmorphismPresets = {
  // Light glassmorphism for cards and containers
  card: cn(
    glassmorphismBase.backdrop,
    glassmorphismBase.background.medium,
    glassmorphismBase.borders.medium,
    glassmorphismBase.shadows.medium,
    'rounded-xl'
  ),
  
  // Subtle glassmorphism for overlays
  overlay: cn(
    glassmorphismBase.backdrop,
    glassmorphismBase.background.subtle,
    glassmorphismBase.borders.subtle,
    glassmorphismBase.shadows.subtle
  ),
  
  // Strong glassmorphism for modals and popups
  modal: cn(
    glassmorphismBase.backdrop,
    glassmorphismBase.background.strong,
    glassmorphismBase.borders.strong,
    glassmorphismBase.shadows.strong,
    'rounded-2xl'
  ),
  
  // Navigation glassmorphism
  navigation: cn(
    'backdrop-blur-md backdrop-saturate-150',
    glassmorphismBase.background.dark,
    glassmorphismBase.borders.subtle,
    'shadow-lg shadow-black/25'
  ),
  
  // Button glassmorphism
  button: cn(
    'backdrop-blur-sm backdrop-saturate-150',
    glassmorphismBase.background.medium,
    glassmorphismBase.borders.medium,
    'shadow-md shadow-black/15'
  ),
  
  // Input glassmorphism
  input: cn(
    'backdrop-blur-sm backdrop-saturate-150',
    glassmorphismBase.background.subtle,
    glassmorphismBase.borders.medium,
    'shadow-inner shadow-black/10'
  ),
};

/**
 * Generate glassmorphism classes with custom opacity
 * @param {number} opacity - Background opacity (0-1)
 * @param {string} blur - Blur intensity ('sm', 'md', 'lg', 'xl', '2xl', '3xl')
 * @param {string} border - Border opacity ('subtle', 'medium', 'strong', 'accent')
 * @param {string} shadow - Shadow intensity ('subtle', 'medium', 'strong', 'colored')
 * @returns {string} Combined glassmorphism classes
 */
export const createGlassmorphism = ({
  opacity = 0.1,
  blur = 'xl',
  border = 'medium',
  shadow = 'medium',
  rounded = 'xl',
} = {}) => {
  const opacityValue = Math.max(0, Math.min(1, opacity));
  const backgroundClass = `bg-white/${Math.round(opacityValue * 100)}`;
  
  return cn(
    `backdrop-blur-${blur}`,
    'backdrop-saturate-150',
    backgroundClass,
    glassmorphismBase.borders[border] || glassmorphismBase.borders.medium,
    glassmorphismBase.shadows[shadow] || glassmorphismBase.shadows.medium,
    rounded && `rounded-${rounded}`
  );
};

/**
 * Glassmorphism with color tinting
 * @param {string} color - CSS color value or Tailwind color class
 * @param {number} opacity - Color opacity (0-1)
 * @param {object} options - Additional glassmorphism options
 * @returns {string} Glassmorphism classes with color tint
 */
export const createColoredGlassmorphism = (color, opacity = 0.1, options = {}) => {
  const baseGlass = createGlassmorphism(options);
  
  // If color is a Tailwind class, use it directly
  if (typeof color === 'string' && color.includes('/')) {
    return cn(baseGlass, `bg-${color}`);
  }
  
  // For custom colors, we'll need to use style attribute
  return {
    className: baseGlass,
    style: {
      backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    },
  };
};

/**
 * Animated glassmorphism effects
 */
export const glassmorphismAnimations = {
  // Hover effects
  hover: {
    scale: 'hover:scale-[1.02] transition-transform duration-300 ease-out',
    glow: 'hover:shadow-2xl hover:shadow-current/30 transition-shadow duration-300',
    blur: 'hover:backdrop-blur-2xl transition-all duration-300',
    opacity: 'hover:bg-white/20 transition-colors duration-300',
  },
  
  // Focus effects
  focus: {
    ring: 'focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent',
    glow: 'focus:shadow-xl focus:shadow-current/40',
    border: 'focus:border-white/40',
  },
  
  // Loading effects
  loading: {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent',
  },
};

/**
 * Utility function to combine glassmorphism with animations
 * @param {string} preset - Glassmorphism preset name
 * @param {array} animations - Array of animation names
 * @returns {string} Combined classes
 */
export const withGlassmorphismAnimations = (preset, animations = []) => {
  const baseClasses = glassmorphismPresets[preset] || preset;
  const animationClasses = animations.map(anim => {
    const [category, effect] = anim.split('.');
    return glassmorphismAnimations[category]?.[effect] || '';
  }).filter(Boolean);
  
  return cn(baseClasses, ...animationClasses);
};

/**
 * Responsive glassmorphism utilities
 */
export const responsiveGlassmorphism = {
  // Mobile-first approach
  mobile: {
    card: cn(glassmorphismPresets.card, 'backdrop-blur-lg'), // Less blur on mobile for performance
    overlay: cn(glassmorphismPresets.overlay, 'backdrop-blur-md'),
  },
  
  // Tablet and up
  tablet: {
    card: cn('md:backdrop-blur-xl md:bg-white/15'),
    overlay: cn('md:backdrop-blur-lg md:bg-white/10'),
  },
  
  // Desktop and up
  desktop: {
    card: cn('lg:backdrop-blur-2xl lg:bg-white/20'),
    overlay: cn('lg:backdrop-blur-xl lg:bg-white/15'),
  },
};

/**
 * Create responsive glassmorphism classes
 * @param {string} basePreset - Base glassmorphism preset
 * @returns {string} Responsive glassmorphism classes
 */
export const createResponsiveGlassmorphism = (basePreset = 'card') => {
  return cn(
    responsiveGlassmorphism.mobile[basePreset] || glassmorphismPresets[basePreset],
    responsiveGlassmorphism.tablet[basePreset],
    responsiveGlassmorphism.desktop[basePreset]
  );
};

/**
 * Glassmorphism theme variants for different contexts
 */
export const glassmorphismThemes = {
  // Light theme glassmorphism
  light: {
    card: cn(
      'backdrop-blur-xl backdrop-saturate-150',
      'bg-white/80 border-gray-200/50',
      'shadow-xl shadow-gray-900/10'
    ),
    overlay: cn(
      'backdrop-blur-lg backdrop-saturate-150',
      'bg-white/60 border-gray-200/30',
      'shadow-lg shadow-gray-900/5'
    ),
  },
  
  // Dark theme glassmorphism (default)
  dark: {
    card: glassmorphismPresets.card,
    overlay: glassmorphismPresets.overlay,
  },
  
  // High contrast theme
  contrast: {
    card: cn(
      'backdrop-blur-xl backdrop-saturate-150',
      'bg-white/25 border-white/40',
      'shadow-2xl shadow-black/40'
    ),
    overlay: cn(
      'backdrop-blur-lg backdrop-saturate-150',
      'bg-white/15 border-white/25',
      'shadow-xl shadow-black/30'
    ),
  },
};

// Export all utilities
export default {
  base: glassmorphismBase,
  presets: glassmorphismPresets,
  create: createGlassmorphism,
  createColored: createColoredGlassmorphism,
  animations: glassmorphismAnimations,
  withAnimations: withGlassmorphismAnimations,
  responsive: responsiveGlassmorphism,
  createResponsive: createResponsiveGlassmorphism,
  themes: glassmorphismThemes,
};