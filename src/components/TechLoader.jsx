import React from 'react';
import { cn } from '../design-system/utils/cn';

/**
 * Technical IoT-themed Loader Component
 * Features animated circuit board, data flow, and IoT device icons
 */
export const TechLoader = ({ 
  size = 'md', 
  text = 'Loading...', 
  textPosition = 'bottom',
  className 
}) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {textPosition === 'top' && text && (
        <div className={cn('text-gray-700 font-medium', textSizes[size])}>
          {text}
        </div>
      )}
      
      {/* IoT Circuit Loader */}
      <div className={cn('relative', sizes[size])}>
        {/* Outer rotating ring with circuit pattern */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Circuit board ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="opacity-60"
            />
            
            {/* Connection nodes */}
            <circle cx="50" cy="5" r="3" fill="#007bff" className="animate-pulse" />
            <circle cx="95" cy="50" r="3" fill="#28a745" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            <circle cx="50" cy="95" r="3" fill="#ffc107" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
            <circle cx="5" cy="50" r="3" fill="#dc3545" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#007bff" />
                <stop offset="50%" stopColor="#17a2b8" />
                <stop offset="100%" stopColor="#28a745" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Middle rotating ring - reverse direction */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              className="opacity-50"
            />
            
            {/* Data flow indicators */}
            <circle cx="50" cy="15" r="2" fill="#17a2b8" className="animate-ping" />
            <circle cx="85" cy="50" r="2" fill="#6f42c1" className="animate-ping" style={{ animationDelay: '0.3s' }} />
            <circle cx="50" cy="85" r="2" fill="#fd7e14" className="animate-ping" style={{ animationDelay: '0.6s' }} />
            <circle cx="15" cy="50" r="2" fill="#e83e8c" className="animate-ping" style={{ animationDelay: '0.9s' }} />
            
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6f42c1" />
                <stop offset="50%" stopColor="#17a2b8" />
                <stop offset="100%" stopColor="#007bff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Center IoT device icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pulsing background */}
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping" />
            
            {/* IoT Device Icon */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 relative z-10">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse" />
              
              {/* Signal waves */}
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                d="M8 12c0-2.21 1.79-4 4-4"
                className="animate-pulse"
                style={{ animationDelay: '0.1s' }}
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                d="M16 12c0 2.21-1.79 4-4 4"
                className="animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
            </svg>
          </div>
        </div>

        {/* Corner data indicators */}
        <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {textPosition === 'bottom' && text && (
        <div className={cn('text-gray-700 font-medium', textSizes[size])}>
          {text}
        </div>
      )}
    </div>
  );
};

/**
 * Alternative: Code/Data Flow Loader
 * Shows binary data streaming effect
 */
export const CodeFlowLoader = ({ 
  size = 'md', 
  text = 'Processing...', 
  className 
}) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizes[size])}>
        {/* Binary code streams */}
        <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/20 to-purple-900/20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xs font-mono text-blue-500 opacity-50 whitespace-nowrap animate-scroll-up"
              style={{
                left: `${i * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s',
              }}
            >
              {Array.from({ length: 10 }, () => Math.random() > 0.5 ? '1' : '0').join('')}
            </div>
          ))}
        </div>

        {/* Center chip icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-blue-600">
            <rect x="8" y="8" width="8" height="8" fill="currentColor" className="animate-pulse" />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4M8 4v4M12 4v4M16 4v4M8 16v4M12 16v4M16 16v4"
            />
          </svg>
        </div>
      </div>

      {text && (
        <div className="text-gray-700 font-medium text-sm">
          {text}
        </div>
      )}

      <style jsx>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        .animate-scroll-up {
          animation: scroll-up linear infinite;
        }
      `}</style>
    </div>
  );
};

/**
 * Alternative: Network/Connection Loader
 * Shows network nodes connecting
 */
export const NetworkLoader = ({ 
  size = 'md', 
  text = 'Connecting...', 
  className 
}) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizes[size])}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Connection lines */}
          <line x1="50" y1="50" x2="20" y2="20" stroke="#007bff" strokeWidth="1" className="animate-pulse" />
          <line x1="50" y1="50" x2="80" y2="20" stroke="#28a745" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
          <line x1="50" y1="50" x2="80" y2="80" stroke="#ffc107" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <line x1="50" y1="50" x2="20" y2="80" stroke="#dc3545" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          
          {/* Network nodes */}
          <circle cx="50" cy="50" r="8" fill="#007bff" className="animate-pulse" />
          <circle cx="20" cy="20" r="5" fill="#007bff" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
          <circle cx="80" cy="20" r="5" fill="#28a745" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="80" cy="80" r="5" fill="#ffc107" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="20" cy="80" r="5" fill="#dc3545" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
          
          {/* Data packets moving along lines */}
          <circle cx="35" cy="35" r="2" fill="#17a2b8" className="animate-ping" />
          <circle cx="65" cy="35" r="2" fill="#6f42c1" className="animate-ping" style={{ animationDelay: '0.3s' }} />
          <circle cx="65" cy="65" r="2" fill="#fd7e14" className="animate-ping" style={{ animationDelay: '0.6s' }} />
          <circle cx="35" cy="65" r="2" fill="#e83e8c" className="animate-ping" style={{ animationDelay: '0.9s' }} />
        </svg>
      </div>

      {text && (
        <div className="text-gray-700 font-medium text-sm">
          {text}
        </div>
      )}
    </div>
  );
};

export default TechLoader;
