/**
 * Accessible Wrapper Component
 * Provides comprehensive accessibility enhancements for any child component
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../utils/cn.js';
import { useAccessibility, useMotionAccessibility, useFocusManagement } from '../hooks/useAccessibility.js';

/**
 * AccessibleWrapper - Enhances any component with accessibility features
 */
export const AccessibleWrapper = forwardRef(({
  children,
  className,
  
  // Accessibility props
  role,
  ariaLabel,
  ariaDescribedBy,
  ariaLabelledBy,
  ariaLive,
  ariaAtomic,
  
  // Color accessibility
  colorScheme = 'violet',
  highContrastMode = false,
  colorBlindFriendly = false,
  
  // Motion accessibility
  reduceMotion = false,
  animationDuration = 300,
  
  // Focus management
  focusable = false,
  focusTrap = false,
  skipLink = false,
  skipLinkText = 'Skip to main content',
  
  // Alternative indicators
  statusIndicator,
  priorityIndicator,
  trendIndicator,
  
  // Additional props
  as: Component = 'div',
  ...props
}, ref) => {
  const internalRef = useRef(null);
  const elementRef = ref || internalRef;
  
  const { preferences, utils } = useAccessibility();
  const { getTransitionClasses } = useMotionAccessibility();
  const { getFocusClasses, createFocusTrap, getSkipLinkClasses } = useFocusManagement();

  // Apply focus trap if requested
  useEffect(() => {
    if (focusTrap && elementRef.current) {
      return createFocusTrap(elementRef.current);
    }
  }, [focusTrap, createFocusTrap]);

  // Determine accessibility mode
  const accessibilityMode = highContrastMode || preferences.highContrast ? 'highContrast' :
                           colorBlindFriendly || preferences.colorBlindMode !== 'none' ? 'colorBlind' :
                           'normal';

  // Get appropriate classes based on accessibility preferences
  const getAccessibilityClasses = () => {
    const classes = [];
    
    // High contrast mode
    if (accessibilityMode === 'highContrast') {
      classes.push('contrast-150', 'brightness-110');
    }
    
    // Reduced motion
    if (reduceMotion || preferences.reducedMotion) {
      classes.push('motion-reduce:transition-none', 'motion-reduce:animate-none');
    } else {
      classes.push(getTransitionClasses(`transition-all duration-${animationDuration}`));
    }
    
    // Focus management
    if (focusable) {
      classes.push(getFocusClasses(colorScheme));
    }
    
    return classes.join(' ');
  };

  // Generate ARIA attributes
  const getAriaAttributes = () => {
    const attributes = {};
    
    if (role) attributes.role = role;
    if (ariaLabel) attributes['aria-label'] = ariaLabel;
    if (ariaDescribedBy) attributes['aria-describedby'] = ariaDescribedBy;
    if (ariaLabelledBy) attributes['aria-labelledby'] = ariaLabelledBy;
    if (ariaLive) attributes['aria-live'] = ariaLive;
    if (ariaAtomic) attributes['aria-atomic'] = ariaAtomic;
    
    // Add status indicators
    if (statusIndicator) {
      const indicator = utils.getAlternativeIndicator('status', statusIndicator);
      attributes['aria-label'] = attributes['aria-label'] ? 
        `${attributes['aria-label']} - ${indicator.ariaLabel}` : 
        indicator.ariaLabel;
    }
    
    if (priorityIndicator) {
      const indicator = utils.getAlternativeIndicator('priority', priorityIndicator);
      attributes['aria-label'] = attributes['aria-label'] ? 
        `${attributes['aria-label']} - ${indicator.ariaLabel}` : 
        indicator.ariaLabel;
    }
    
    if (trendIndicator) {
      const indicator = utils.getAlternativeIndicator('trend', trendIndicator);
      attributes['aria-label'] = attributes['aria-label'] ? 
        `${attributes['aria-label']} - ${indicator.ariaLabel}` : 
        indicator.ariaLabel;
    }
    
    return attributes;
  };

  // Render status indicators
  const renderIndicators = () => {
    const indicators = [];
    
    if (statusIndicator) {
      const indicator = utils.getAlternativeIndicator('status', statusIndicator);
      indicators.push(
        <span
          key="status"
          className="sr-only"
          aria-hidden="true"
        >
          {indicator.ariaLabel}
        </span>
      );
    }
    
    if (priorityIndicator) {
      const indicator = utils.getAlternativeIndicator('priority', priorityIndicator);
      indicators.push(
        <span
          key="priority"
          className="sr-only"
          aria-hidden="true"
        >
          {indicator.ariaLabel}
        </span>
      );
    }
    
    if (trendIndicator) {
      const indicator = utils.getAlternativeIndicator('trend', trendIndicator);
      indicators.push(
        <span
          key="trend"
          className="sr-only"
          aria-hidden="true"
        >
          {indicator.ariaLabel}
        </span>
      );
    }
    
    return indicators;
  };

  // Render skip link if requested
  const renderSkipLink = () => {
    if (!skipLink) return null;
    
    return (
      <a
        href="#main-content"
        className={getSkipLinkClasses()}
      >
        {skipLinkText}
      </a>
    );
  };

  const accessibilityClasses = getAccessibilityClasses();
  const ariaAttributes = getAriaAttributes();
  const indicators = renderIndicators();
  const skipLinkElement = renderSkipLink();

  return (
    <>
      {skipLinkElement}
      <Component
        ref={elementRef}
        className={cn(accessibilityClasses, className)}
        {...ariaAttributes}
        {...props}
      >
        {indicators}
        {children}
      </Component>
    </>
  );
});

AccessibleWrapper.displayName = 'AccessibleWrapper';

/**
 * Higher-order component for adding accessibility features
 */
export function withAccessibility(WrappedComponent, defaultOptions = {}) {
  const AccessibleComponent = forwardRef((props, ref) => {
    const {
      accessibilityOptions = {},
      ...restProps
    } = props;

    const options = { ...defaultOptions, ...accessibilityOptions };

    return (
      <AccessibleWrapper
        ref={ref}
        {...options}
      >
        <WrappedComponent {...restProps} />
      </AccessibleWrapper>
    );
  });

  AccessibleComponent.displayName = `withAccessibility(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AccessibleComponent;
}

/**
 * Accessible Text Component
 * Ensures text meets contrast requirements
 */
export const AccessibleText = forwardRef(({
  children,
  className,
  backgroundColor,
  level = 'AA',
  size = 'normal',
  as: Component = 'span',
  ...props
}, ref) => {
  const { utils } = useAccessibility();
  
  // Get accessible text color if background is provided
  const textColor = backgroundColor ? 
    utils.getAccessibleTextColor(backgroundColor, level, size) : 
    null;

  const textColorClass = textColor ? 
    `text-[${textColor}]` : 
    '';

  return (
    <Component
      ref={ref}
      className={cn(textColorClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
});

AccessibleText.displayName = 'AccessibleText';

/**
 * Accessible Button Component
 * Enhanced button with full accessibility support
 */
export const AccessibleButton = forwardRef(({
  children,
  className,
  variant = 'primary',
  colorScheme = 'violet',
  size = 'medium',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  ariaLabel,
  ...props
}, ref) => {
  const { preferences, utils } = useAccessibility();
  const { getTransitionClasses } = useMotionAccessibility();
  const { getFocusClasses } = useFocusManagement();

  // Get accessible button colors
  const getButtonClasses = () => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-md',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      getFocusClasses(colorScheme),
      getTransitionClasses('transition-all duration-200'),
    ];

    // Size classes
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg',
    };
    baseClasses.push(sizeClasses[size] || sizeClasses.medium);

    // Variant classes with accessibility considerations
    if (preferences.highContrast) {
      baseClasses.push(
        'bg-white text-black border-2 border-black',
        'hover:bg-gray-200 active:bg-gray-300'
      );
    } else {
      const variantClasses = {
        primary: `bg-${colorScheme}-600 text-white hover:bg-${colorScheme}-700 active:bg-${colorScheme}-800`,
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
        outline: `border-2 border-${colorScheme}-600 text-${colorScheme}-600 hover:bg-${colorScheme}-50 active:bg-${colorScheme}-100`,
      };
      baseClasses.push(variantClasses[variant] || variantClasses.primary);
    }

    return baseClasses.join(' ');
  };

  const buttonClasses = getButtonClasses();

  return (
    <button
      ref={ref}
      className={cn(buttonClasses, className)}
      disabled={disabled || loading}
      aria-label={ariaLabel || (loading ? loadingText : undefined)}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">{loadingText}</span>
        </>
      ) : null}
      {children}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Accessible Status Indicator
 * Shows status with both color and alternative indicators
 */
export const AccessibleStatusIndicator = ({
  status,
  showIcon = true,
  showText = true,
  className,
  ...props
}) => {
  const { utils } = useAccessibility();
  
  const indicator = utils.getAlternativeIndicator('status', status);
  const ariaAttributes = utils.generateColorAriaAttributes('status', status, '');

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      {...ariaAttributes}
      {...props}
    >
      {showIcon && (
        <span
          className={`text-${status === 'success' ? 'green' : 
                           status === 'warning' ? 'amber' : 
                           status === 'error' ? 'red' : 'blue'}-500`}
          aria-hidden="true"
        >
          {indicator.icon}
        </span>
      )}
      {showText && (
        <span className="capitalize">
          {status}
        </span>
      )}
    </span>
  );
};

export default AccessibleWrapper;