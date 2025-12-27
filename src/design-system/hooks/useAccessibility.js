/**
 * React Hook for Accessibility Features
 * Provides comprehensive accessibility utilities and user preference detection
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import accessibilityUtils, { motionAccessibility, focusManagement } from '../utils/accessibility.js';

/**
 * Main accessibility hook
 * Provides comprehensive accessibility utilities and user preferences
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    colorBlindMode: 'none',
    fontSize: 'normal',
  });

  // Update preferences based on system settings
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePreferences = () => {
      setPreferences({
        reducedMotion: accessibilityUtils.prefersReducedMotion(),
        highContrast: accessibilityUtils.prefersHighContrast(),
        colorBlindMode: localStorage.getItem('colorBlindMode') || 'none',
        fontSize: localStorage.getItem('fontSize') || 'normal',
      });
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = () => updatePreferences();
    const handleHighContrastChange = () => updatePreferences();

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Listen for storage changes (for color blind mode and font size)
    const handleStorageChange = (e) => {
      if (e.key === 'colorBlindMode' || e.key === 'fontSize') {
        updatePreferences();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Memoized accessibility utilities
  const utils = useMemo(() => ({
    // Contrast checking
    checkContrast: accessibilityUtils.checkContrast,
    getAccessibleTextColor: accessibilityUtils.getAccessibleTextColor,
    
    // Color blindness support
    simulateColorBlindness: (color) => 
      accessibilityUtils.simulateColorBlindness(color, preferences.colorBlindMode),
    areColorsDistinguishable: (color1, color2) => 
      accessibilityUtils.areColorsDistinguishable(color1, color2, preferences.colorBlindMode),
    getColorBlindFriendlyColor: accessibilityUtils.getColorBlindFriendlyColor,
    
    // Alternative indicators
    getAlternativeIndicator: accessibilityUtils.getAlternativeIndicator,
    generateColorAriaAttributes: accessibilityUtils.generateColorAriaAttributes,
    
    // High contrast support
    getHighContrastVariant: accessibilityUtils.getHighContrastVariant,
    
    // Motion preferences
    getAnimationDuration: motionAccessibility.getAnimationDuration,
    getTransitionClasses: motionAccessibility.getTransitionClasses,
    shouldEnableAnimations: () => !preferences.reducedMotion,
    
    // Focus management
    getFocusRingClasses: focusManagement.getFocusRingClasses,
    trapFocus: focusManagement.trapFocus,
  }), [preferences]);

  // Functions to update preferences
  const setColorBlindMode = useCallback((mode) => {
    localStorage.setItem('colorBlindMode', mode);
    setPreferences(prev => ({ ...prev, colorBlindMode: mode }));
  }, []);

  const setFontSize = useCallback((size) => {
    localStorage.setItem('fontSize', size);
    setPreferences(prev => ({ ...prev, fontSize: size }));
  }, []);

  return {
    preferences,
    utils,
    setColorBlindMode,
    setFontSize,
    
    // Convenience flags
    isReducedMotion: preferences.reducedMotion,
    isHighContrast: preferences.highContrast,
    isColorBlind: preferences.colorBlindMode !== 'none',
    colorBlindType: preferences.colorBlindMode,
  };
}

/**
 * Hook for color contrast validation
 * Validates color combinations against WCAG standards
 */
export function useColorContrast() {
  const validateContrast = useCallback((foreground, background, level = 'AA', textSize = 'normal') => {
    return accessibilityUtils.checkContrast(foreground, background, level, textSize);
  }, []);

  const getAccessibleColor = useCallback((backgroundColor, level = 'AA', textSize = 'normal') => {
    return accessibilityUtils.getAccessibleTextColor(backgroundColor, level, textSize);
  }, []);

  const validatePalette = useCallback((colors, backgrounds) => {
    return accessibilityUtils.validatePaletteAccessibility(colors, backgrounds);
  }, []);

  return {
    validateContrast,
    getAccessibleColor,
    validatePalette,
  };
}

/**
 * Hook for alternative indicators
 * Provides non-color ways to convey information
 */
export function useAlternativeIndicators() {
  const getIndicator = useCallback((type, value, format = 'icon') => {
    return accessibilityUtils.getAlternativeIndicator(type, value, format);
  }, []);

  const getAriaAttributes = useCallback((type, value, color) => {
    return accessibilityUtils.generateColorAriaAttributes(type, value, color);
  }, []);

  const getStatusIndicator = useCallback((status, includeColor = true) => {
    const indicator = getIndicator('status', status);
    const ariaAttributes = getAriaAttributes('status', status, '');
    
    return {
      ...indicator,
      ...ariaAttributes,
      className: includeColor ? `text-${status}` : '',
    };
  }, [getIndicator, getAriaAttributes]);

  const getPriorityIndicator = useCallback((priority, includeColor = true) => {
    const indicator = getIndicator('priority', priority);
    const ariaAttributes = getAriaAttributes('priority', priority, '');
    
    return {
      ...indicator,
      ...ariaAttributes,
      className: includeColor ? `text-${priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'green'}-500` : '',
    };
  }, [getIndicator, getAriaAttributes]);

  const getTrendIndicator = useCallback((trend, includeColor = true) => {
    const indicator = getIndicator('trend', trend);
    const ariaAttributes = getAriaAttributes('trend', trend, '');
    
    return {
      ...indicator,
      ...ariaAttributes,
      className: includeColor ? `text-${trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray'}-500` : '',
    };
  }, [getIndicator, getAriaAttributes]);

  return {
    getIndicator,
    getAriaAttributes,
    getStatusIndicator,
    getPriorityIndicator,
    getTrendIndicator,
  };
}

/**
 * Hook for motion accessibility
 * Handles reduced motion preferences and animation control
 */
export function useMotionAccessibility() {
  const { preferences } = useAccessibility();

  const getAnimationProps = useCallback((defaultDuration = 300, defaultEasing = 'ease-in-out') => {
    if (preferences.reducedMotion) {
      return {
        duration: 0,
        easing: 'linear',
        disabled: true,
      };
    }
    
    return {
      duration: defaultDuration,
      easing: defaultEasing,
      disabled: false,
    };
  }, [preferences.reducedMotion]);

  const getTransitionClasses = useCallback((defaultClasses = 'transition-all duration-300') => {
    return preferences.reducedMotion ? 'transition-none' : defaultClasses;
  }, [preferences.reducedMotion]);

  const shouldAnimate = useCallback(() => {
    return !preferences.reducedMotion;
  }, [preferences.reducedMotion]);

  return {
    isReducedMotion: preferences.reducedMotion,
    getAnimationProps,
    getTransitionClasses,
    shouldAnimate,
  };
}

/**
 * Hook for focus management
 * Provides focus trap and focus ring utilities
 */
export function useFocusManagement() {
  const { preferences } = useAccessibility();

  const getFocusClasses = useCallback((colorScheme = 'violet') => {
    return focusManagement.getFocusRingClasses(colorScheme);
  }, []);

  const createFocusTrap = useCallback((element) => {
    if (!element) return () => {};
    return focusManagement.trapFocus(element);
  }, []);

  const getSkipLinkClasses = useCallback(() => {
    const baseClasses = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 p-2 rounded';
    const colorClasses = preferences.highContrast 
      ? 'bg-white text-black border-2 border-black'
      : 'bg-violet-600 text-white';
    
    return `${baseClasses} ${colorClasses}`;
  }, [preferences.highContrast]);

  return {
    getFocusClasses,
    createFocusTrap,
    getSkipLinkClasses,
  };
}

/**
 * Hook for high contrast mode
 * Provides high contrast color variants and utilities
 */
export function useHighContrast() {
  const { preferences } = useAccessibility();

  const getHighContrastColor = useCallback((colorName) => {
    if (!preferences.highContrast) return null;
    return accessibilityUtils.getHighContrastVariant(colorName);
  }, [preferences.highContrast]);

  const getHighContrastClasses = useCallback((normalClasses, highContrastClasses) => {
    return preferences.highContrast ? highContrastClasses : normalClasses;
  }, [preferences.highContrast]);

  const applyHighContrastStyles = useCallback((element) => {
    if (!element || !preferences.highContrast) return;

    // Apply high contrast styles to element
    element.style.filter = 'contrast(150%) brightness(110%)';
    element.style.border = '1px solid white';
  }, [preferences.highContrast]);

  return {
    isHighContrast: preferences.highContrast,
    getHighContrastColor,
    getHighContrastClasses,
    applyHighContrastStyles,
  };
}

export default useAccessibility;