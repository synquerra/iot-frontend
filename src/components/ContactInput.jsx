import React from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * ContactInput Component
 * 
 * A reusable input component for phone number fields in the contact management section.
 * Features:
 * - Proper ARIA attributes for accessibility
 * - Error state styling with blue theme
 * - Required field indicator
 * - Error message display with icon
 * - Disabled state support
 * 
 * @param {Object} props
 * @param {string} props.label - Label text for the input
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.error - Error message to display (if any)
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.placeholder - Placeholder text
 */
export function ContactInput({ 
  label, 
  value, 
  onChange, 
  error, 
  disabled,
  placeholder 
}) {
  // Generate a unique ID for accessibility
  const inputId = `contact-input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label 
        htmlFor={inputId}
        className="text-blue-200/80 text-sm font-medium block mb-3"
      >
        {label}
        <span className="text-red-400 ml-1">*</span>
      </label>
      <input
        id={inputId}
        type="tel"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/10 border rounded-lg px-4 py-3 text-white",
          "focus:bg-white/15 focus:outline-none transition-colors",
          error 
            ? "border-red-400/60 focus:border-red-400" 
            : "border-white/20 focus:border-blue-400/60",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p 
          id={errorId}
          className="text-red-400 text-sm mt-2 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
