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
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <i className="fas fa-exclamation-triangle text-xl text-yellow-600"></i>
        </div>
        <div className="flex-1">
          <h4 className="text-yellow-800 font-bold mb-2 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            Warnings
          </h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span className="font-medium">{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationWarning;
