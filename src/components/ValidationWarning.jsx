import React from 'react';

/**
 * ValidationWarning Component
 * Displays validation warnings with amber color scheme
 * 
 * @param {Object} props
 * @param {Array<{field: string, message: string, code: string}>} props.warnings - Array of warning objects
 */
const ValidationWarning = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-amber-300 font-medium mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Warnings
          </h4>
          <ul className="text-amber-200 text-sm space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationWarning;
