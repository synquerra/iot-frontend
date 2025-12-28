import React, { useState, useEffect, forwardRef } from 'react';
import ValidatedInput from './ValidatedInput';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';
import { 
  analyzePasswordStrength, 
  createPasswordValidationRules,
  getStrengthDisplay 
} from './passwordRequirements';

/**
 * PasswordInput Component
 * 
 * A specialized input component for password fields with security features:
 * - Password visibility toggle with proper accessibility
 * - Real-time password strength calculation and indicator
 * - Visual requirements checklist using the password requirements system
 * - Secure input handling with comprehensive validation
 */

// Main PasswordInput component
const PasswordInput = forwardRef(
  (
    {
      showStrengthIndicator = true,
      showVisibilityToggle = true,
      showRequirementsChecklist = true,
      strengthRequirements = [],
      enforceMinimumStandards = true,
      allowWeakPasswords = false,
      value = '',
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [analysis, setAnalysis] = useState(analyzePasswordStrength(''));

    // Analyze password strength when password changes
    useEffect(() => {
      const newAnalysis = analyzePasswordStrength(value);
      setAnalysis(newAnalysis);
    }, [value]);

    // Toggle password visibility
    const toggleVisibility = () => {
      setIsVisible(!isVisible);
    };

    // Create validation rules using the requirements system
    const validationRules = createPasswordValidationRules({
      enforceMinimumStandards,
      allowWeakPasswords,
      customRequirements: strengthRequirements
    });

    // Visibility toggle icon
    const VisibilityIcon = () => (
      <button
        type="button"
        onClick={toggleVisibility}
        className="text-text-tertiary hover:text-text-secondary transition-colors duration-200 focus:outline-none focus:text-text-secondary"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {isVisible ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 8C2.5 8 4.5 4 8 4C11.5 4 13.5 8 13.5 8C13.5 8 11.5 12 8 12C4.5 12 2.5 8 2.5 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 8C2.5 8 4.5 4 8 4C11.5 4 13.5 8 13.5 8C13.5 8 11.5 12 8 12C4.5 12 2.5 8 2.5 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 2L14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );

    return (
      <div className="space-y-0">
        <ValidatedInput
          {...props}
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          validationRules={validationRules}
          validateOnChange={true}
          validateOnBlur={true}
          rightIcon={showVisibilityToggle ? <VisibilityIcon /> : undefined}
          className={className}
          autoComplete="new-password"
        />
        
        {(showStrengthIndicator || showRequirementsChecklist) && value && (
          <div className="mt-3">
            <PasswordRequirementsChecklist 
              password={value}
              showStrengthBar={showStrengthIndicator}
              showWarnings={true}
              showSuggestions={true}
              compact={false}
            />
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;