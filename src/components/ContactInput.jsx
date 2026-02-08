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
  onBlur,
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
        className="text-gray-800 text-sm font-bold block mb-2 flex items-center gap-2"
      >
        <i className="fas fa-phone text-green-600"></i>
        {label}
        <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded ml-auto font-semibold">Required</span>
      </label>
      <input
        id={inputId}
        type="tel"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        style={{ color: '#1f2937', backgroundColor: 'white' }}
        className={cn(
          "w-full bg-white border-2 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 font-medium shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
          error 
            ? "border-red-400 bg-red-50" 
            : "border-gray-200",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100"
        )}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        required
      />
      {error ? (
        <p 
          id={errorId}
          className="text-red-600 text-sm mt-2 flex items-center gap-1"
          role="alert"
        >
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </p>
      ) : (
        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
          <i className="fas fa-info-circle text-blue-500"></i>
          Enter phone number with country code (e.g., +1234567890)
        </p>
      )}
    </div>
  );
}
