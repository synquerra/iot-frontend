import React from 'react';
import { cn } from '../../design-system/utils/cn';

/**
 * AuthLayout Component
 * 
 * Provides consistent layout wrapper for authentication pages with:
 * - Consistent background gradient matching login page
 * - Responsive design with proper mobile scaling
 * - Accessibility landmarks and structure
 * - Optional help text section
 */

const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  showHelp = false,
  helpContent,
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-2 sm:p-4",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row shadow-2xl rounded-xl lg:rounded-2xl overflow-hidden bg-white max-h-[95vh] lg:max-h-none">
          {/* Left Panel - Brand/Info Section - Hidden on mobile/tablet */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 p-6 xl:p-10 flex-col justify-center text-white relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-teal-600/20 animate-pulse"></div>
            
            {/* Decorative elements with animation */}
            <div className="absolute top-0 right-0 w-48 xl:w-64 h-48 xl:h-64 bg-white/10 rounded-full -mr-24 xl:-mr-32 -mt-24 xl:-mt-32 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 xl:w-48 h-32 xl:h-48 bg-white/10 rounded-full -ml-16 xl:-ml-24 -mb-16 xl:-mb-24 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            
            {/* Floating tech icons with smooth animation */}
            <div className="absolute top-20 right-20 w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg animate-bounce" style={{animationDuration: '3s'}}>
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute bottom-32 right-16 w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3s'}}>
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute top-1/2 left-10 w-6 h-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4s'}}>
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <div className="relative z-10">
              {/* Logo/Icon - IoT Device with glow effect */}
              <div className="mb-3 xl:mb-4">
                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 shadow-2xl border border-white/20 hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 xl:w-7 xl:h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white/90 flex items-center gap-1">
                  <span className="text-sm">🚀</span> Live IoT Tracking Platform
                </p>
              </div>

              {/* Main Heading with gradient text */}
              <h1 className="text-xl xl:text-2xl font-bold mb-2 leading-tight bg-gradient-to-r from-white via-white to-cyan-100 bg-clip-text text-transparent drop-shadow-lg">
                Monitor Your IoT Devices In Real-Time
              </h1>
              
              {/* Description */}
              <p className="text-xs xl:text-sm text-white/90 mb-3 xl:mb-4 leading-relaxed">
                Enterprise-grade IoT tracking and analytics platform.
              </p>

              {/* Features with glassmorphism cards */}
              <div className="space-y-1.5 xl:space-y-2 mb-4 xl:mb-6">
                <div className="group flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-1.5 xl:p-2 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="w-7 h-7 xl:w-8 xl:h-8 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">Real-Time Tracking</h3>
                    <p className="text-xs text-white/70">Live GPS monitoring</p>
                  </div>
                </div>
                
                <div className="group flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-1.5 xl:p-2 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="w-7 h-7 xl:w-8 xl:h-8 bg-gradient-to-br from-teal-400/30 to-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">Advanced Analytics</h3>
                    <p className="text-xs text-white/70">Data insights</p>
                  </div>
                </div>

                <div className="group flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-1.5 xl:p-2 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="w-7 h-7 xl:w-8 xl:h-8 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">Smart Alerts</h3>
                    <p className="text-xs text-white/70">Instant notifications</p>
                  </div>
                </div>

                <div className="group flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-1.5 xl:p-2 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="w-7 h-7 xl:w-8 xl:h-8 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-xs">IoT Device Control</h3>
                    <p className="text-xs text-white/70">Remote management</p>
                  </div>
                </div>
              </div>

              {/* Stats with glassmorphism and hover effects */}
              <div className="grid grid-cols-3 gap-2 xl:gap-3">
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-2 text-center hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="flex justify-center mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <svg className="w-3 h-3 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg xl:text-xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">500+</div>
                  <div className="text-xs text-white/80">Organizations</div>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-2 text-center hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="flex justify-center mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-400/30 to-green-500/30 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <svg className="w-3 h-3 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg xl:text-xl font-bold bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">10K+</div>
                  <div className="text-xs text-white/80">Active Devices</div>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-xl p-2 text-center hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/10 shadow-lg cursor-pointer">
                  <div className="flex justify-center mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <svg className="w-3 h-3 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg xl:text-xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-xs text-white/80">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form Section - Full width on mobile/tablet */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-6 xl:p-10 flex items-center justify-center bg-white overflow-y-auto">
            <div className="w-full max-w-md">
              {/* Mobile Logo - Only visible on mobile/tablet */}
              <div className="lg:hidden mb-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Synquerra IoT Platform</p>
              </div>
              
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AuthLayout };