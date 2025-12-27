/**
 * Animation utilities for consistent transitions and effects
 * Provides timing functions, durations, and common animation patterns
 */

// Animation durations
export const duration = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
};

// Easing functions
export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',      // ease-out
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',   // ease-in-out
  sharp: 'cubic-bezier(0.4, 0, 1, 1)',          // ease-in
  gentle: 'cubic-bezier(0, 0, 0.2, 1)',         // ease-out gentle
};

// Common transition properties
export const transitions = {
  // Basic transitions
  all: `all ${duration.normal} ${easing.default}`,
  colors: `color ${duration.fast} ${easing.default}, background-color ${duration.fast} ${easing.default}, border-color ${duration.fast} ${easing.default}`,
  opacity: `opacity ${duration.fast} ${easing.default}`,
  transform: `transform ${duration.normal} ${easing.default}`,
  
  // Interactive element transitions
  button: `all ${duration.fast} ${easing.default}`,
  input: `border-color ${duration.fast} ${easing.default}, box-shadow ${duration.fast} ${easing.default}`,
  card: `transform ${duration.normal} ${easing.gentle}, box-shadow ${duration.normal} ${easing.gentle}`,
  
  // Layout transitions
  height: `height ${duration.normal} ${easing.smooth}`,
  width: `width ${duration.normal} ${easing.smooth}`,
  spacing: `margin ${duration.normal} ${easing.default}, padding ${duration.normal} ${easing.default}`,
};

// Animation keyframes for common effects
export const keyframes = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  slideUp: {
    '0%': { transform: 'translateY(16px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideDown: {
    '0%': { transform: 'translateY(-16px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideLeft: {
    '0%': { transform: 'translateX(16px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  slideRight: {
    '0%': { transform: 'translateX(-16px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  scaleIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  scaleOut: {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(0.95)', opacity: '0' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  glow: {
    '0%, 100%': { 
      boxShadow: '0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.1)' 
    },
    '50%': { 
      boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)' 
    },
  },
};

// Animation classes for common effects
export const animationClasses = {
  // Entrance animations
  fadeIn: {
    animation: `fadeIn ${duration.normal} ${easing.default}`,
    animationFillMode: 'both',
  },
  slideUp: {
    animation: `slideUp ${duration.normal} ${easing.default}`,
    animationFillMode: 'both',
  },
  slideDown: {
    animation: `slideDown ${duration.normal} ${easing.default}`,
    animationFillMode: 'both',
  },
  scaleIn: {
    animation: `scaleIn ${duration.normal} ${easing.default}`,
    animationFillMode: 'both',
  },
  
  // Loading animations
  pulse: {
    animation: `pulse ${duration.slower} ${easing.default} infinite`,
  },
  spin: {
    animation: `spin 1s linear infinite`,
  },
  
  // Hover effects (CSS-in-JS style)
  hoverLift: {
    transition: transitions.transform,
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  hoverScale: {
    transition: transitions.transform,
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
};

// Utility functions for creating animations
export const createTransition = (properties, duration = 'normal', easing = 'default') => {
  const durationValue = duration[duration] || duration;
  const easingValue = easing[easing] || easing;
  
  if (Array.isArray(properties)) {
    return properties.map(prop => `${prop} ${durationValue} ${easingValue}`).join(', ');
  }
  
  return `${properties} ${durationValue} ${easingValue}`;
};

export const createAnimation = (keyframe, duration = 'normal', easing = 'default', options = {}) => {
  const durationValue = duration[duration] || duration;
  const easingValue = easing[easing] || easing;
  const { iterations = 1, direction = 'normal', fillMode = 'both' } = options;
  
  return `${keyframe} ${durationValue} ${easingValue} ${iterations} ${direction} ${fillMode}`;
};

// Tailwind-compatible animation configuration
export const tailwindAnimations = {
  keyframes,
  animation: {
    'fade-in': `fadeIn ${duration.normal} ${easing.default}`,
    'slide-up': `slideUp ${duration.normal} ${easing.default}`,
    'slide-down': `slideDown ${duration.normal} ${easing.default}`,
    'slide-left': `slideLeft ${duration.normal} ${easing.default}`,
    'slide-right': `slideRight ${duration.normal} ${easing.default}`,
    'scale-in': `scaleIn ${duration.normal} ${easing.default}`,
    'pulse': `pulse ${duration.slower} ${easing.default} infinite`,
    'spin': 'spin 1s linear infinite',
    'glow': `glow 2s ${easing.default} infinite`,
  },
  transitionDuration: {
    fast: duration.fast,
    normal: duration.normal,
    slow: duration.slow,
    slower: duration.slower,
  },
  transitionTimingFunction: easing,
  dropShadow: {
    'glow': [
      '0 0 5px rgba(139, 92, 246, 0.5)',
      '0 0 10px rgba(139, 92, 246, 0.3)',
      '0 0 15px rgba(139, 92, 246, 0.1)',
    ],
    'glow-blue': [
      '0 0 5px rgba(59, 130, 246, 0.5)',
      '0 0 10px rgba(59, 130, 246, 0.3)',
      '0 0 15px rgba(59, 130, 246, 0.1)',
    ],
    'glow-teal': [
      '0 0 5px rgba(20, 184, 166, 0.5)',
      '0 0 10px rgba(20, 184, 166, 0.3)',
      '0 0 15px rgba(20, 184, 166, 0.1)',
    ],
    'glow-green': [
      '0 0 5px rgba(34, 197, 94, 0.5)',
      '0 0 10px rgba(34, 197, 94, 0.3)',
      '0 0 15px rgba(34, 197, 94, 0.1)',
    ],
    'glow-amber': [
      '0 0 5px rgba(245, 158, 11, 0.5)',
      '0 0 10px rgba(245, 158, 11, 0.3)',
      '0 0 15px rgba(245, 158, 11, 0.1)',
    ],
    'glow-red': [
      '0 0 5px rgba(239, 68, 68, 0.5)',
      '0 0 10px rgba(239, 68, 68, 0.3)',
      '0 0 15px rgba(239, 68, 68, 0.1)',
    ],
    'glow-pink': [
      '0 0 5px rgba(236, 72, 153, 0.5)',
      '0 0 10px rgba(236, 72, 153, 0.3)',
      '0 0 15px rgba(236, 72, 153, 0.1)',
    ],
    'glow-purple': [
      '0 0 5px rgba(168, 85, 247, 0.5)',
      '0 0 10px rgba(168, 85, 247, 0.3)',
      '0 0 15px rgba(168, 85, 247, 0.1)',
    ],
  },
};