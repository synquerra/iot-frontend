import React, { useState, useEffect } from "react";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMetrics, setCurrentMetrics] = useState({
    totalDevices: 4180,
    activeDevices: 3935,
    totalThroughput: 4200,
    avgLatency: 125,
    errorRate: 2.8,
    uptime: 99.7,
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "performance", label: "Performance", icon: "⚡" },
    { id: "devices", label: "Devices", icon: "📱" },
    { id: "regions", label: "Regions", icon: "🌍" },
    { id: "trends", label: "Trends", icon: "📈" }
  ];

  const performanceScore = Math.round((currentMetrics.uptime + (100 - currentMetrics.errorRate * 10)) / 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading 
          type="spinner" 
          size="xl" 
          color="blue"
          text="Loading analytics data..." 
          textPosition="bottom"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20 border border-blue-500/30 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-6 right-6 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                Analytics Dashboard
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed max-w-2xl">
                Comprehensive analytics and performance metrics for your device network
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Performance Score</div>
                <div className="text-green-300 text-xl font-bold">{performanceScore}/100</div>
                <div className="text-blue-200/70 text-xs">Excellent</div>
              </div>
              <Button
                variant="glass"
                colorScheme="teal"
                size="lg"
                onClick={() => window.location.reload()}
                className="backdrop-blur-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card variant="glass" colorScheme="slate" padding="sm" className="backdrop-blur-xl">
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-blue-500/80 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-blue-200/80 text-sm font-medium mb-1">Total Devices</div>
                <div className="text-white text-2xl font-bold mb-2">{currentMetrics.totalDevices.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-200/70 text-xs">+12% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="green" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-green-200/80 text-sm font-medium mb-1">Active Devices</div>
                <div className="text-white text-2xl font-bold mb-2">{currentMetrics.activeDevices.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200/70 text-xs">{((currentMetrics.activeDevices / currentMetrics.totalDevices) * 100).toFixed(1)}% online</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="cyan" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-cyan-200/80 text-sm font-medium mb-1">Throughput</div>
                <div className="text-white text-2xl font-bold mb-2">{currentMetrics.totalThroughput.toLocaleString()}k</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200/70 text-xs">requests/hour</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-amber-200/80 text-sm font-medium mb-1">Avg Latency</div>
                <div className="text-white text-2xl font-bold mb-2">{currentMetrics.avgLatency}ms</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">+5ms from baseline</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="red" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-red-200/80 text-sm font-medium mb-1">Error Rate</div>
                <div className="text-white text-2xl font-bold mb-2">{currentMetrics.errorRate}%</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-red-200/70 text-xs">-0.3% improvement</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-purple-200/80 text-sm font-medium mb-1">Uptime</div>
                <div className="text-white text-2xl font-bold mb-2">{currentMetrics.uptime}%</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-200/70 text-xs">Excellent</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="glass" colorScheme="blue" padding="lg">
              <Card.Content>
                <h3 className="text-blue-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
                Performance Trends
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200/80">Throughput</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-400 transition-all duration-300" style={{ width: '84%' }}></div>
                    </div>
                    <span className="text-white font-bold">84%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200/80">Response Time</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-400 transition-all duration-300" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-white font-bold">92%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200/80">Reliability</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div className="h-2 rounded-full bg-purple-400 transition-all duration-300" style={{ width: '97%' }}></div>
                    </div>
                    <span className="text-white font-bold">97%</span>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card variant="glass" colorScheme="green" padding="lg">
            <Card.Content>
              <h3 className="text-green-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                System Health
              </h3>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-6xl font-bold text-white mb-4">{performanceScore}</div>
                <div className="text-green-200 text-lg uppercase tracking-wide mb-4">Excellent</div>
                <div className="w-full max-w-xs bg-green-800/30 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-200 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${performanceScore}%` }}
                  />
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="purple" padding="lg">
            <Card.Content>
              <h3 className="text-purple-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-purple-200/80 text-sm font-medium mb-2">CPU Usage</div>
                  <div className="text-white text-2xl font-bold mb-2">45%</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-400 transition-all duration-300" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-purple-200/80 text-sm font-medium mb-2">Memory</div>
                  <div className="text-white text-2xl font-bold mb-2">62%</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-400 transition-all duration-300" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-purple-200/80 text-sm font-medium mb-2">Network I/O</div>
                  <div className="text-white text-2xl font-bold mb-2">38%</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-400 transition-all duration-300" style={{ width: '38%' }}></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-purple-200/80 text-sm font-medium mb-2">Disk Usage</div>
                  <div className="text-white text-2xl font-bold mb-2">71%</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-amber-400 transition-all duration-300" style={{ width: '71%' }}></div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "devices" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="cyan" padding="lg">
            <Card.Content>
              <h3 className="text-cyan-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Device Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-cyan-200/80 text-sm font-medium mb-2">Sensors</div>
                  <div className="text-white text-2xl font-bold">1,881</div>
                  <div className="text-cyan-300 text-xs mt-1">45%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-cyan-200/80 text-sm font-medium mb-2">Gateways</div>
                  <div className="text-white text-2xl font-bold">1,045</div>
                  <div className="text-cyan-300 text-xs mt-1">25%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-cyan-200/80 text-sm font-medium mb-2">Controllers</div>
                  <div className="text-white text-2xl font-bold">836</div>
                  <div className="text-cyan-300 text-xs mt-1">20%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-cyan-200/80 text-sm font-medium mb-2">Monitors</div>
                  <div className="text-white text-2xl font-bold">418</div>
                  <div className="text-cyan-300 text-xs mt-1">10%</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "regions" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="teal" padding="lg">
            <Card.Content>
              <h3 className="text-teal-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Regional Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'North America', devices: 1250, active: 1180, percentage: 30 },
                  { name: 'Asia Pacific', devices: 1450, active: 1380, percentage: 35 },
                  { name: 'Europe', devices: 980, active: 920, percentage: 23 },
                  { name: 'South America', devices: 320, active: 290, percentage: 8 },
                  { name: 'Africa', devices: 180, active: 165, percentage: 4 }
                ].map((region) => (
                  <div key={region.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{region.name}</div>
                      <div className="text-teal-200/70 text-sm">{region.devices} devices • {region.active} active</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-white/20 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-teal-400 transition-all duration-300"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                      <span className="text-white font-bold w-12 text-right">{region.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="amber" padding="lg">
            <Card.Content>
              <h3 className="text-amber-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Usage Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-amber-200/80 text-sm font-medium">Data Transfer (TB)</h4>
                  {[
                    { month: 'Jan', value: 2.4 },
                    { month: 'Feb', value: 2.8 },
                    { month: 'Mar', value: 3.2 },
                    { month: 'Apr', value: 3.8 },
                    { month: 'May', value: 4.2 },
                    { month: 'Jun', value: 4.6 }
                  ].map((item) => (
                    <div key={item.month} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${(item.value / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-bold w-12 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-amber-200/80 text-sm font-medium">API Calls (M)</h4>
                  {[
                    { month: 'Jan', value: 1.8 },
                    { month: 'Feb', value: 2.1 },
                    { month: 'Mar', value: 2.4 },
                    { month: 'Apr', value: 2.9 },
                    { month: 'May', value: 3.2 },
                    { month: 'Jun', value: 3.5 }
                  ].map((item) => (
                    <div key={item.month} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-white/20 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-400 transition-all duration-300"
                            style={{ width: `${(item.value / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-bold w-12 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Footer */}
      <Card variant="glass" colorScheme="slate" padding="lg">
        <Card.Content>
          <div className="text-center">
            <p className="text-white/70">
              Analytics data is updated every 5 minutes. Last updated:{' '}
              <span className="text-white font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
