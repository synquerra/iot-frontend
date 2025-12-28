import React, { useState, useEffect, forwardRef } from 'react';
import { Input } from '../../design-system/components/Input';

/**
 * ValidatedInput Component
 * 
 * Extends the existing Input component with real-time validation capabilities.
 * Supports validation rules, visual validation states, and configurable validation triggers.
 */

const ValidatedInput = forwardRef(
  (
    {
      validationRules = [],
      validateOnBlur = true,
      validateOnChange = false,
      showValidationIcon = true,
      value = '',
      onChange,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    const [validationState, setValidationState] = useState({
      isValid: true,
      errors: [],
      warnings: [],
      touched: false
    });

    // Validate the current value against all rules
    const validateValue = (inputValue) => {
      const errors = [];
      const warnings = [];
      let isValid = true;

      validationRules.forEach(rule => {
        const isRulePassed = rule.test(inputValue);
        
        if (!isRulePassed) {
          if (rule.type === 'error') {
            errors.push(rule.message);
            isValid = false;
          } else if (rule.type === 'warning') {
            warnings.push(rule.message);
          }
        }
      });

      return {
        isValid,
        errors,
        warnings,
        touched: validationState.touched
      };
    };

    // Handle input change
    const handleChange = (e) => {
      const newValue = e.target.value;
      
      // Call parent onChange
      if (onChange) {
        onChange(e);
      }

      // Validate on change if enabled
      if (validateOnChange && validationState.touched) {
        const newValidationState = validateValue(newValue);
        setValidationState(newValidationState);
      }
    };

    // Handle input blur
    const handleBlur = (e) => {
      const newValue = e.target.value;
      
      // Call parent onBlur
      if (onBlur) {
        onBlur(e);
      }

      // Mark as touched and validate on blur if enabled
      if (validateOnBlur) {
        const newValidationState = {
          ...validateValue(newValue),
          touched: true
        };
        setValidationState(newValidationState);
      } else {
        setValidationState(prev => ({ ...prev, touched: true }));
      }
    };

    // Validate when value changes externally (controlled component)
    useEffect(() => {
      if (validationState.touched && (validateOnChange || validateOnBlur)) {
        const newValidationState = validateValue(value);
        setValidationState(prev => ({ ...newValidationState, touched: prev.touched }));
      }
    }, [value, validationRules, validateOnChange, validateOnBlur, validationState.touched]);

    // Determine the visual state for the Input component
    const getInputProps = () => {
      const baseProps = {
        ...props,
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        ref,
        className
      };

      // Only show validation states if the field has been touched
      if (!validationState.touched) {
        return baseProps;
      }

      // Show error state if there are errors
      if (validationState.errors.length > 0) {
        return {
          ...baseProps,
          error: validationState.errors[0], // Show first error
          rightIcon: showValidationIcon ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-status-error"
            >
              <path
                d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8.75 11.25H7.25V9.75H8.75V11.25ZM8.75 8.25H7.25V4.75H8.75V8.25Z"
                fill="currentColor"
              />
            </svg>
          ) : undefined
        };
      }

      // Show warning state if there are warnings
      if (validationState.warnings.length > 0) {
        return {
          ...baseProps,
          warning: validationState.warnings[0], // Show first warning
          rightIcon: showValidationIcon ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-status-warning"
            >
              <path
                d="M8 1.5L14.5 13H1.5L8 1.5ZM8.75 11.25H7.25V9.75H8.75V11.25ZM8.75 8.25H7.25V6.75H8.75V8.25Z"
                fill="currentColor"
              />
            </svg>
          ) : undefined
        };
      }

      // Show success state if valid and has content
      if (validationState.isValid && value.trim().length > 0) {
        return {
          ...baseProps,
          success: 'Valid input',
          rightIcon: showValidationIcon ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-status-success"
            >
              <path
                d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM6.75 10.75L3.5 7.5L4.56 6.44L6.75 8.63L11.44 3.94L12.5 5L6.75 10.75Z"
                fill="currentColor"
              />
            </svg>
          ) : undefined
        };
      }

      return baseProps;
    };

    return <Input {...getInputProps()} />;
  }
);

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;