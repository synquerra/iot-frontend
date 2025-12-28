/**
 * Interactive states utilities for consistent hover, focus, and active states
 * Provides standardized interaction patterns across all components
 */

import { cn } from './cn.js';
import { duration, easing } from './animations.js';
import { semanticColors } from '../tokens/colors.js';

/**
 * Base interactive state classes
 */
export const interactiveBase = {
  // Transition properties for smooth interactions
  transition: `transition-all duration-300 ease-out`,
  
  // Transform properties for hover effects
  transform: 'transform-gpu',
  
  // Focus ring properties
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
  
  // Cursor properties
  cursor: 'cursor-pointer',
  
  // Selection properties
  select: 'select-none',
};

/**
 * Hover state variations
 */
export const hoverStates = {
  // Subtle hover effects
  subtle: {
    scale: 'hover:scale-[1.01]',
    opacity: 'hover:opacity-90',
    brightness: 'hover:brightness-110',
  },
  
  // Medium hover effects
  medium: {
    scale: 'hover:scale-[1.02]',
    lift: 'hover:-translate-y-1',
    shadow: 'hover:shadow-lg hover:shadow-black/25',
    brightness: 'hover:brightness-125',
  },
  
  // Strong hover effects
  strong: {
    scale: 'hover:scale-[1.05]',
    lift: 'hover:-translate-y-2',
    shadow: 'hover:shadow-xl hover:shadow-black/30',
    glow: 'hover:drop-shadow-glow',
  },
  
  // Color-based hover effects
  color: {
    primary: 'hover:bg-violet-600/90 hover:border-violet-500',
    secondary: 'hover:bg-slate-700/90 hover:border-slate-600',
    success: 'hover:bg-green-600/90 hover:border-green-500',
    warning: 'hover:bg-amber-600/90 hover:border-amber-500',
    error: 'hover:bg-red-600/90 hover:border-red-500',
    info: 'hover:bg-blue-600/90 hover:border-blue-500',
  },
  
  // Glassmorphism hover effects
  glass: {
    blur: 'hover:backdrop-blur-2xl',
    opacity: 'hover:bg-white/20',
    border: 'hover:border-white/30',
    shadow: 'hover:shadow-2xl hover:shadow-current/20',
  },
};

/**
 * Focus state variations
 */
export const focusStates = {
  // Default focus ring
  default: cn(
    interactiveBase.focusRing,
    'focus:ring-violet-500/50'
  ),
  
  // Color-specific focus rings
  primary: cn(
    interactiveBase.focusRing,
    'focus:ring-violet-500/50'
  ),
  
  secondary: cn(
    interactiveBase.focusRing,
    'focus:ring-slate-500/50'
  ),
  
  success: cn(
    interactiveBase.focusRing,
    'focus:ring-green-500/50'
  ),
  
  warning: cn(
    interactiveBase.focusRing,
    'focus:ring-amber-500/50'
  ),
  
  error: cn(
    interactiveBase.focusRing,
    'focus:ring-red-500/50'
  ),
  
  info: cn(
    interactiveBase.focusRing,
    'focus:ring-blue-500/50'
  ),
  
  // High contrast focus for accessibility
  highContrast: cn(
    interactiveBase.focusRing,
    'focus:ring-white focus:ring-4'
  ),
  
  // Subtle focus for cards and containers
  subtle: cn(
    'focus:outline-none focus:ring-1 focus:ring-white/20 focus:ring-offset-0'
  ),
};

/**
 * Active state variations
 */
export const activeStates = {
  // Scale down on press
  press: 'active:scale-[0.98]',
  
  // Color changes on press
  darken: 'active:brightness-90',
  
  // Shadow changes on press
  inset: 'active:shadow-inner',
  
  // Combined active effects
  button: 'active:scale-[0.98] active:brightness-90',
  card: 'active:scale-[0.99] active:shadow-inner',
};

/**
 * Interactive state presets for common components
 */
export const interactivePresets = {
  // Button interactions
  button: {
    primary: cn(
      interactiveBase.transition,
      interactiveBase.transform,
      interactiveBase.cursor,
      interactiveBase.select,
      hoverStates.medium.scale,
      hoverStates.medium.shadow,
      hoverStates.color.primary,
      focusStates.primary,
      activeStates.button
    ),
    
    secondary: cn(
      interactiveBase.transition,
      interactiveBase.transform,
      interactiveBase.cursor,
      interactiveBase.select,
      hoverStates.medium.scale,
      hoverStates.medium.shadow,
      hoverStates.color.secondary,
      focusStates.secondary,
      activeStates.button
    ),
    
    ghost: cn(
      interactiveBase.transition,
      interactiveBase.transform,
      interactiveBase.cursor,
      interactiveBase.select,
      hoverStates.subtle.opacity,
      hoverStates.subtle.brightness,
      focusStates.subtle,
      activeStates.press
    ),
  },
  
  // Card interactions
  card: {
    default: cn(
      interactiveBase.transition,
      interactiveBase.transform,
      interactiveBase.cursor,
      hoverStates.medium.lift,
      hoverStates.medium.shadow,
      focusStates.subtle,
      activeStates.card
    ),
    
    glass: cn(
      interactiveBase.transition,
      interactiveBase.transform,
      interactiveBase.cursor,
      hoverStates.medium.lift,
      hoverStates.glass.blur,
      hoverStates.glass.opacity,
      hoverStates.glass.border,
      hoverStates.glass.shadow,
      focusStates.subtle,
      activeStates.card
    ),
    
    subtle: cn(
      interactiveBase.transition,
      interactiveBase.transform,
      interactiveBase.cursor,
      hoverStates.subtle.scale,
      hoverStates.subtle.brightness,
      focusStates.subtle,
      'active:scale-[0.995]'
    ),
  },
  
  // Input interactions
  input: {
    default: cn(
      interactiveBase.transition,
      'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20',
      'hover:border-slate-400'
    ),
    
    error: cn(
      interactiveBase.transition,
      'focus:border-red-500 focus:ring-1 focus:ring-red-500/20',
      'hover:border-red-400'
    ),
    
    success: cn(
      interactiveBase.transition,
      'focus:border-green-500 focus:ring-1 focus:ring-green-500/20',
      'hover:border-green-400'
    ),
  },
  
  // Table row interactions
  tableRow: {
    default: cn(
      interactiveBase.transition,
      'hover:bg-white/5 hover:backdrop-blur-sm',
      focusStates.subtle
    ),
    
    clickable: cn(
      interactiveBase.transition,
      interactiveBase.cursor,
      'hover:bg-white/10 hover:backdrop-blur-sm',
      focusStates.subtle,
      'active:bg-white/5'
    ),
  },
  
  // Navigation interactions
  navigation: {
    link: cn(
      interactiveBase.transition,
      interactiveBase.cursor,
      'hover:text-violet-300 hover:bg-white/10',
      focusStates.subtle,
      'active:text-violet-400'
    ),
    
    button: cn(
      interactiveBase.transition,
      interactiveBase.cursor,
      hoverStates.subtle.scale,
      'hover:bg-white/10',
      focusStates.subtle,
      activeStates.press
    ),
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  // Tab navigation
  tabIndex: {
    interactive: 'tabindex="0"',
    skip: 'tabindex="-1"',
  },
  
  // ARIA attributes for keyboard navigation
  aria: {
    button: 'role="button"',
    link: 'role="link"',
    tab: 'role="tab"',
    tabpanel: 'role="tabpanel"',
    menuitem: 'role="menuitem"',
  },
  
  // Keyboard event handlers
  keyHandlers: {
    // Enter and Space for button-like elements
    buttonKeys: (callback) => ({
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          callback(e);
        }
      },
    }),
    
    // Arrow keys for navigation
    arrowKeys: (callbacks) => ({
      onKeyDown: (e) => {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            callbacks.up?.(e);
            break;
          case 'ArrowDown':
            e.preventDefault();
            callbacks.down?.(e);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            callbacks.left?.(e);
            break;
          case 'ArrowRight':
            e.preventDefault();
            callbacks.right?.(e);
            break;
        }
      },
    }),
    
    // Escape key for closing modals/dropdowns
    escapeKey: (callback) => ({
      onKeyDown: (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          callback(e);
        }
      },
    }),
  },
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  // Focus trap for modals
  trapFocus: (containerRef) => {
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements?.length) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  },
  
  // Restore focus after modal closes
  restoreFocus: (previousActiveElement) => {
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  },
  
  // Focus first error in form
  focusFirstError: (formRef) => {
    const firstError = formRef.current?.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.focus();
    }
  },
};

/**
 * Timing constants for consistent interactions
 */
export const interactionTiming = {
  // Hover delays
  hoverDelay: {
    fast: 100,
    normal: 200,
    slow: 300,
  },
  
  // Focus delays
  focusDelay: {
    immediate: 0,
    fast: 50,
    normal: 100,
  },
  
  // Animation durations
  animation: {
    fast: duration.fast,
    normal: duration.normal,
    slow: duration.slow,
  },
  
  // Debounce delays for interactions
  debounce: {
    search: 300,
    resize: 150,
    scroll: 100,
  },
};

/**
 * Utility functions for creating interactive components
 */

/**
 * Create interactive props for a component
 * @param {string} preset - Preset name from interactivePresets
 * @param {object} options - Additional options
 * @returns {object} Props object with interactive classes and handlers
 */
export const createInteractiveProps = (preset, options = {}) => {
  const {
    onClick,
    onKeyDown,
    disabled = false,
    tabIndex = 0,
    role = 'button',
    ariaLabel,
    className = '',
  } = options;
  
  const presetClasses = interactivePresets[preset.split('.')[0]]?.[preset.split('.')[1]] || '';
  
  return {
    className: cn(
      presetClasses,
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      className
    ),
    onClick: disabled ? undefined : onClick,
    onKeyDown: disabled ? undefined : (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e);
      }
      onKeyDown?.(e);
    },
    tabIndex: disabled ? -1 : tabIndex,
    role,
    'aria-label': ariaLabel,
    'aria-disabled': disabled,
  };
};

/**
 * Create hover props with custom timing
 * @param {function} onHover - Hover callback
 * @param {function} onLeave - Leave callback
 * @param {number} delay - Hover delay in ms
 * @returns {object} Props object with hover handlers
 */
export const createHoverProps = (onHover, onLeave, delay = interactionTiming.hoverDelay.normal) => {
  let hoverTimeout;
  
  return {
    onMouseEnter: () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(onHover, delay);
    },
    onMouseLeave: () => {
      clearTimeout(hoverTimeout);
      onLeave?.();
    },
  };
};

// Export all utilities
export default {
  base: interactiveBase,
  hover: hoverStates,
  focus: focusStates,
  active: activeStates,
  presets: interactivePresets,
  keyboard: keyboardNavigation,
  focusManagement,
  timing: interactionTiming,
  createProps: createInteractiveProps,
  createHover: createHoverProps,
};