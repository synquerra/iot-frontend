import React from 'react';

/**
 * ValidationError Component
 * Displays validation errors with red color scheme
 * 
 * @param {Object} props
 * @param {Array<{field: string, message: string, code: string}>} props.errors - Array of error objects
 */
const ValidationError = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-red-300 font-medium mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Validation Errors
          </h4>
          <ul className="text-red-200 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationError;
