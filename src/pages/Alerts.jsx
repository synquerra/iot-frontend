import React, { useState } from 'react'
import { Card, Button, Input, Select } from '../design-system/components'
import {
  SectionDivider,
  GradientHeader,
  ContentSection,
  HierarchySection
} from "../design-system/components/LayoutComponents"
import { cn } from "../design-system/utils/cn"

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('active')
  const [filterLevel, setFilterLevel] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const alerts = [
    {
      id: 1,
      level: 'high',
      message: 'Device sensor-12 temperature spike detected',
      timestamp: '5m ago',
      device: 'sensor-12',
      status: 'active',
      description: 'Temperature exceeded 85°C threshold',
      location: 'Warehouse A - Section 3'
    },
    {
      id: 2,
      level: 'info',
      message: 'Scheduled maintenance window starting',
      timestamp: 'Oct 10',
      device: 'system',
      status: 'scheduled',
      description: 'System maintenance from 2:00 AM to 4:00 AM',
      location: 'All Systems'
    },
    {
      id: 3,
      level: 'warning',
      message: 'Device device-07 battery level critical',
      timestamp: '15m ago',
      device: 'device-07',
      status: 'active',
      description: 'Battery level below 15%, replacement needed',
      location: 'Field Station B'
    },
    {
      id: 4,
      level: 'info',
      message: 'Firmware update available for IoT devices',
      timestamp: '1h ago',
      device: 'system',
      status: 'pending',
      description: 'Version 2.1.4 includes security patches',
      location: 'All Devices'
    },
    {
      id: 5,
      level: 'high',
      message: 'Network connectivity lost for device-15',
      timestamp: '2m ago',
      device: 'device-15',
      status: 'active',
      description: 'Device offline for more than 10 minutes',
      location: 'Remote Site C'
    }
  ]

  const tabs = [
    { id: 'active', label: 'Active Alerts', icon: '🚨', count: alerts.filter(a => a.status === 'active').length },
    { id: 'history', label: 'Alert History', icon: '📋', count: alerts.length },
    { id: 'settings', label: 'Alert Settings', icon: '⚙️', count: null },
    { id: 'rules', label: 'Alert Rules', icon: '📏', count: 3 }
  ]

  const getLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-300'
      case 'warning': return 'text-amber-300'
      case 'info': return 'text-blue-300'
      default: return 'text-slate-300'
    }
  }

  const getLevelBadge = (level) => {
    const baseClasses = 'px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm border transition-all duration-200 hover:scale-105'
    switch (level) {
      case 'high': return `${baseClasses} bg-red-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/20`
      case 'warning': return `${baseClasses} bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/20`
      case 'info': return `${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/20`
      default: return `${baseClasses} bg-slate-500/20 text-slate-300 border-slate-500/40`
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm border transition-all duration-200'
    switch (status) {
      case 'active': return `${baseClasses} bg-red-500/20 text-red-300 border-red-500/40 animate-pulse`
      case 'scheduled': return `${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/40`
      case 'pending': return `${baseClasses} bg-amber-500/20 text-amber-300 border-amber-500/40`
      default: return `${baseClasses} bg-slate-500/20 text-slate-300 border-slate-500/40`
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesLevel = filterLevel === 'all' || alert.level === filterLevel
    const matchesSearch = searchQuery === '' || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'history' || 
      (activeTab === 'active' && alert.status === 'active')
    return matchesLevel && matchesSearch && matchesTab
  })

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Design */}
      <GradientHeader
        title="Alerts & Notifications"
        subtitle="Monitor system alerts, warnings, and critical notifications in real-time"
        colorScheme="red"
        size="lg"
        className="relative overflow-hidden"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/15 via-orange-500/10 to-yellow-500/15 animate-pulse" />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          
          {/* Floating glow effects */}
          <div className="absolute top-6 left-6 w-32 h-32 bg-red-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-8 right-8 w-24 h-24 bg-orange-400/15 rounded-full blur-2xl animate-pulse delay-700" />
          <div className="absolute bottom-6 right-6 w-40 h-40 bg-yellow-400/12 rounded-full blur-3xl animate-pulse delay-1400" />
        </div>
      </GradientHeader>

      {/* Enhanced Tab Navigation */}
      <ContentSection variant="glass" colorScheme="red" padding="md" spacing="sm" bordered={true}>
        <div className="flex flex-wrap gap-2 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300',
                'hover:scale-105 hover:shadow-lg backdrop-blur-sm',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white shadow-xl shadow-red-500/30 border border-red-400/50'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
              )}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </ContentSection>

      {/* Tab Content */}
      <HierarchySection level={1} colorScheme="red" spacing="lg">
        {(activeTab === 'active' || activeTab === 'history') && (
          <ContentSection variant="glass" colorScheme="orange" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="orange" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-orange-600/25 via-red-600/20 to-pink-600/25 border border-orange-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">{activeTab === 'active' ? '🚨' : '📋'}</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">
                      {activeTab === 'active' ? 'Active Alerts' : 'Alert History'}
                    </Card.Title>
                    <Card.Description className="text-orange-100/80">
                      {activeTab === 'active' 
                        ? 'Current system alerts requiring attention' 
                        : 'Complete history of all system alerts and notifications'
                      }
                    </Card.Description>
                  </div>
                </div>

                {/* Enhanced Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search alerts, devices, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 focus:bg-white/20 focus:border-orange-300/60 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div className="lg:w-48">
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white focus:bg-white/20 focus:border-orange-300/60 focus:outline-none transition-all duration-300"
                    >
                      <option value="all" className="bg-slate-900 text-white">All Levels</option>
                      <option value="high" className="bg-slate-900 text-white">🚨 High Priority</option>
                      <option value="warning" className="bg-slate-900 text-white">⚠️ Warnings</option>
                      <option value="info" className="bg-slate-900 text-white">ℹ️ Information</option>
                    </select>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-4">
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {/* Alert Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Alert Header */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className={getLevelBadge(alert.level)}>
                                  {alert.level.toUpperCase()}
                                </div>
                                <div className={getStatusBadge(alert.status)}>
                                  {alert.status.toUpperCase()}
                                </div>
                                <div className="text-white/60 text-sm font-medium">
                                  {alert.timestamp}
                                </div>
                              </div>
                              
                              {/* Alert Message */}
                              <div>
                                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-orange-200 transition-colors duration-300">
                                  {alert.message}
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                  {alert.description}
                                </p>
                              </div>
                              
                              {/* Alert Details */}
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/60">📱</span>
                                  <span className="text-white/80 font-medium">Device:</span>
                                  <span className="text-orange-200 font-semibold">{alert.device}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white/60">📍</span>
                                  <span className="text-white/80 font-medium">Location:</span>
                                  <span className="text-orange-200 font-semibold">{alert.location}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                              <button className="px-4 py-2 bg-white/15 backdrop-blur-xl border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 text-sm">
                                View Details
                              </button>
                              {alert.status === 'active' && (
                                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30 text-sm">
                                  Acknowledge
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/25 to-red-500/25 flex items-center justify-center backdrop-blur-md border border-white/30">
                        <span className="text-3xl">🔍</span>
                      </div>
                      <div className="text-white text-xl font-bold mb-2">No alerts found</div>
                      <div className="text-white/70 text-sm max-w-md mx-auto">
                        {searchQuery || filterLevel !== 'all' 
                          ? 'Try adjusting your search or filter criteria to find relevant alerts'
                          : activeTab === 'active' 
                            ? 'All systems are running normally with no active alerts'
                            : 'No alert history available at this time'
                        }
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>
              
              <Card.Footer>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30">
                      Mark All as Read
                    </button>
                    <button className="px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                      Export Logs
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span>Real-time monitoring</span>
                    </div>
                    <span>•</span>
                    <span>{filteredAlerts.length} alerts shown</span>
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </ContentSection>
        )}

        {activeTab === 'settings' && (
          <ContentSection variant="glass" colorScheme="blue" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="blue" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-blue-600/25 via-indigo-600/20 to-purple-600/25 border border-blue-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">Alert Settings</Card.Title>
                    <Card.Description className="text-blue-100/80">
                      Configure alert thresholds, notification preferences, and system behavior
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-8">
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <span className="text-xl">🔔</span>
                      Notification Preferences
                    </h3>
                    
                    {['Email Notifications', 'SMS Alerts', 'Push Notifications', 'Slack Integration'].map((setting, index) => (
                      <div key={setting} className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center">
                            <span className="text-lg">
                              {index === 0 ? '📧' : index === 1 ? '📱' : index === 2 ? '🔔' : '💬'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-white">{setting}</div>
                            <div className="text-sm text-blue-100/70">
                              {index === 0 ? 'Receive alerts via email' :
                               index === 1 ? 'SMS notifications for critical alerts' :
                               index === 2 ? 'Browser push notifications' :
                               'Send alerts to Slack channels'}
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={index < 2}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Alert Thresholds */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      Alert Thresholds
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Temperature Threshold', value: '85°C', unit: '°C' },
                        { label: 'Battery Low Warning', value: '15%', unit: '%' },
                        { label: 'Network Timeout', value: '10min', unit: 'minutes' },
                        { label: 'Data Rate Limit', value: '1000', unit: 'packets/min' }
                      ].map((threshold) => (
                        <div key={threshold.label} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                          <label className="text-white font-semibold text-sm mb-2 block">{threshold.label}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={threshold.value.replace(threshold.unit, '')}
                              className="flex-1 px-3 py-2 rounded-lg bg-white/15 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 focus:bg-white/20 focus:border-blue-300/60 focus:outline-none transition-all duration-300"
                            />
                            <span className="text-white/70 text-sm font-medium">{threshold.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </ContentSection>
        )}

        {activeTab === 'rules' && (
          <ContentSection variant="glass" colorScheme="green" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="green" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-green-600/25 via-teal-600/20 to-cyan-600/25 border border-green-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-teal-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">📏</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">Alert Rules</Card.Title>
                    <Card.Description className="text-green-100/80">
                      Create and manage custom alert rules and automation workflows
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-6">
                  {[
                    {
                      name: 'Critical Temperature Alert',
                      condition: 'Temperature > 85°C',
                      action: 'Send SMS + Email',
                      status: 'active'
                    },
                    {
                      name: 'Device Offline Detection',
                      condition: 'No data for > 10 minutes',
                      action: 'Push notification',
                      status: 'active'
                    },
                    {
                      name: 'Battery Low Warning',
                      condition: 'Battery < 15%',
                      action: 'Email notification',
                      status: 'paused'
                    }
                  ].map((rule, index) => (
                    <div key={rule.name} className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-bold text-lg">{rule.name}</h4>
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold',
                              rule.status === 'active' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            )}>
                              {rule.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="text-green-100/80">
                              <span className="font-semibold">Condition:</span> {rule.condition}
                            </div>
                            <div className="text-green-100/80">
                              <span className="font-semibold">Action:</span> {rule.action}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 bg-white/15 backdrop-blur-xl border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 text-sm">
                            Edit
                          </button>
                          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/30 text-sm">
                            {rule.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 text-white font-semibold text-lg flex items-center justify-center gap-3">
                    <span className="text-2xl">➕</span>
                    Create New Alert Rule
                  </button>
                </div>
              </Card.Content>
            </Card>
          </ContentSection>
        )}
      </HierarchySection>

      {/* Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="red" 
        spacing="lg" 
        animated={true}
      />
    </div>
  )
}
