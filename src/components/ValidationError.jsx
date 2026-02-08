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
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <i className="fas fa-exclamation-circle text-xl text-red-600"></i>
        </div>
        <div className="flex-1">
          <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
            <i className="fas fa-times-circle"></i>
            Validation Errors
          </h4>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span className="font-medium">{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationError;
