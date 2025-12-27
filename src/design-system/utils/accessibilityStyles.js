/**
 * Accessibility Styles and CSS Utilities
 * Provides CSS-in-JS and utility classes for accessibility features
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { motionAccessibility } from './accessibility.js';

// CSS for reduced motion support
export const reducedMotionCSS = `
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    /* Disable specific animations that might cause vestibular disorders */
    .animate-spin,
    .animate-ping,
    .animate-pulse,
    .animate-bounce {
      animation: none !important;
    }
    
    /* Reduce parallax and transform effects */
    .parallax,
    .transform-gpu {
      transform: none !important;
    }
  }
`;

// CSS for high contrast mode support
export const highContrastCSS = `
  @media (prefers-contrast: high) {
    /* Increase contrast for all elements */
    * {
      filter: contrast(150%) brightness(110%);
    }
    
    /* High contrast borders */
    .border,
    .border-t,
    .border-r,
    .border-b,
    .border-l {
      border-color: currentColor !important;
      border-width: 2px !important;
    }
    
    /* High contrast focus rings */
    .focus\\:ring-2:focus {
      --tw-ring-color: currentColor !important;
      --tw-ring-width: 3px !important;
    }
    
    /* High contrast text */
    .text-muted,
    .text-gray-500,
    .text-gray-400 {
      color: currentColor !important;
      opacity: 0.8 !important;
    }
    
    /* High contrast backgrounds */
    .bg-gray-50,
    .bg-gray-100 {
      background-color: white !important;
      color: black !important;
    }
    
    .bg-gray-800,
    .bg-gray-900 {
      background-color: black !important;
      color: white !important;
    }
  }
`;

// CSS for color-blind friendly patterns
export const colorBlindFriendlyCSS = `
  /* Pattern-based indicators for color-blind users */
  .pattern-success {
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      currentColor 2px,
      currentColor 4px
    );
  }
  
  .pattern-warning {
    background-image: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 3px,
      currentColor 3px,
      currentColor 6px
    );
  }
  
  .pattern-error {
    background-image: radial-gradient(
      circle at 2px 2px,
      currentColor 1px,
      transparent 1px
    );
    background-size: 8px 8px;
  }
  
  .pattern-info {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 2px,
      currentColor 2px,
      currentColor 4px
    );
  }
`;

// CSS for focus management
export const focusManagementCSS = `
  /* Enhanced focus indicators */
  .focus-visible:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  
  /* Skip links */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--color-primary, #7c3aed);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
    transition: top 0.3s;
  }
  
  .skip-link:focus {
    top: 6px;
  }
  
  /* Focus trap container */
  .focus-trap {
    position: relative;
  }
  
  .focus-trap::before,
  .focus-trap::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
`;

// CSS for screen reader support
export const screenReaderCSS = `
  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .sr-only-focusable:focus,
  .sr-only-focusable:active {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
  
  /* Announce changes to screen readers */
  .sr-announce {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

// Combined accessibility CSS
export const accessibilityCSS = `
  ${reducedMotionCSS}
  ${highContrastCSS}
  ${colorBlindFriendlyCSS}
  ${focusManagementCSS}
  ${screenReaderCSS}
`;

// Utility functions for generating CSS classes
export const accessibilityClasses = {
  // Reduced motion classes
  motion: {
    reduce: 'motion-reduce:transition-none motion-reduce:animate-none',
    safe: 'motion-safe:transition-all motion-safe:duration-300',
    respectPreference: 'transition-all duration-300 motion-reduce:transition-none',
  },

  // High contrast classes
  contrast: {
    high: 'contrast-more:contrast-150 contrast-more:brightness-110',
    normal: 'contrast-normal',
    auto: 'contrast-auto',
  },

  // Focus management classes
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
    visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    trap: 'focus-trap',
  },

  // Screen reader classes
  screenReader: {
    only: 'sr-only',
    focusable: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50',
    announce: 'sr-announce',
  },

  // Color-blind friendly patterns
  patterns: {
    success: 'pattern-success',
    warning: 'pattern-warning',
    error: 'pattern-error',
    info: 'pattern-info',
  },

  // Touch target sizes (44px minimum for accessibility)
  touchTarget: {
    minimum: 'min-h-[44px] min-w-[44px]',
    comfortable: 'min-h-[48px] min-w-[48px]',
    large: 'min-h-[56px] min-w-[56px]',
  },

  // Text size classes for accessibility
  text: {
    readable: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed',
    extraLarge: 'text-xl leading-relaxed',
  },
};

// CSS-in-JS styles for React components
export const accessibilityStyles = {
  // Reduced motion styles
  reducedMotion: {
    transition: 'none',
    animation: 'none',
    transform: 'none',
  },

  // High contrast styles
  highContrast: {
    filter: 'contrast(150%) brightness(110%)',
    border: '2px solid currentColor',
  },

  // Focus styles
  focusRing: {
    outline: '2px solid currentColor',
    outlineOffset: '2px',
  },

  // Screen reader only
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },

  // Skip link
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: '6px',
    background: 'var(--color-primary, #7c3aed)',
    color: 'white',
    padding: '8px',
    textDecoration: 'none',
    borderRadius: '4px',
    zIndex: '1000',
    transition: 'top 0.3s',
  },

  skipLinkFocus: {
    top: '6px',
  },
};

// Tailwind CSS plugin configuration for accessibility
export const accessibilityTailwindPlugin = {
  // Custom utilities
  utilities: {
    '.sr-only': accessibilityStyles.srOnly,
    '.sr-only-focusable:focus': {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: 'inherit',
      margin: 'inherit',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
    },
    '.skip-link': accessibilityStyles.skipLink,
    '.skip-link:focus': accessibilityStyles.skipLinkFocus,
    '.focus-ring': accessibilityStyles.focusRing,
    '.reduced-motion': accessibilityStyles.reducedMotion,
    '.high-contrast': accessibilityStyles.highContrast,
  },

  // Custom components
  components: {
    '.accessible-button': {
      minHeight: '44px',
      minWidth: '44px',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      lineHeight: '1.5',
      borderRadius: '0.375rem',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: 'currentColor',
        boxShadow: '0 0 0 2px currentColor',
      },
      '&:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
    '.accessible-input': {
      minHeight: '44px',
      padding: '0.75rem',
      fontSize: '1rem',
      lineHeight: '1.5',
      border: '2px solid #d1d5db',
      borderRadius: '0.375rem',
      '&:focus': {
        outline: 'none',
        borderColor: '#7c3aed',
        boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)',
      },
      '&:invalid': {
        borderColor: '#ef4444',
      },
    },
  },
};

// Function to inject accessibility CSS into the document
export const injectAccessibilityCSS = () => {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById('accessibility-styles');
  if (existingStyle) return; // Already injected

  const style = document.createElement('style');
  style.id = 'accessibility-styles';
  style.textContent = accessibilityCSS;
  document.head.appendChild(style);
};

// Function to remove accessibility CSS from the document
export const removeAccessibilityCSS = () => {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById('accessibility-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
};

export default {
  css: accessibilityCSS,
  classes: accessibilityClasses,
  styles: accessibilityStyles,
  tailwindPlugin: accessibilityTailwindPlugin,
  inject: injectAccessibilityCSS,
  remove: removeAccessibilityCSS,
};