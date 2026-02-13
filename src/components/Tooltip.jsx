import React, { useState } from 'react';

/**
 * Tooltip Component
 * 
 * Displays helpful information when user hovers over an element.
 * 
 * @param {string} content - The tooltip text to display
 * @param {string} position - Position of tooltip: 'top', 'bottom', 'left', 'right' (default: 'top')
 * @param {ReactNode} children - The element that triggers the tooltip
 */
export default function Tooltip({ content, position = 'top', children }) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}
          style={{ minWidth: '200px', maxWidth: '300px' }}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg">
            {content}
            <div 
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Info Icon with Tooltip
 * 
 * A small info icon that shows a tooltip on hover.
 * Perfect for adding help text next to section titles.
 */
export function InfoTooltip({ content, position = 'top' }) {
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-gray-400 hover:text-gray-600 cursor-help transition-colors">
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
      </span>
    </Tooltip>
  );
}
