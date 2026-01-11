import React from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Notification component for displaying success and error messages
 * @param {Object} props
 * @param {'success' | 'error' | ''} props.type - Type of notification
 * @param {string} props.message - Message to display
 * @param {Function} props.onDismiss - Callback when dismiss button is clicked
 */
export function Notification({ type, message, onDismiss }) {
  if (!message) return null;
  
  const isSuccess = type === 'success';
  const colorClasses = isSuccess
    ? 'bg-green-500/20 border-green-400/50 text-green-200'
    : 'bg-red-500/20 border-red-400/50 text-red-200';
  
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border flex items-start gap-3",
        colorClasses
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">
        {isSuccess ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {!isSuccess && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-300 hover:text-red-100 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
