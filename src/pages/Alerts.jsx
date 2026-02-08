import React, { useState } from 'react'
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
    { id: 'active', label: 'Active Alerts', icon: 'fa-exclamation-triangle', count: alerts.filter(a => a.status === 'active').length },
    { id: 'history', label: 'Alert History', icon: 'fa-history', count: alerts.length },
    { id: 'settings', label: 'Alert Settings', icon: 'fa-cog', count: null },
    { id: 'rules', label: 'Alert Rules', icon: 'fa-ruler', count: 3 }
  ]

  const getLevelBadge = (level) => {
    switch (level) {
      case 'high': 
        return 'bg-red-100 text-red-700 border-red-200'
      case 'warning': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'info': 
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': 
        return 'bg-red-100 text-red-700 border-red-200'
      case 'scheduled': 
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200'
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
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      {/* AdminLTE Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Alerts & Notifications
              </h1>
              <p className="text-gray-600">
                Monitor system alerts, warnings, and critical notifications in real-time
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-gray-500 text-sm">Active Alerts</div>
                <div className="text-red-600 text-xl font-bold">{alerts.filter(a => a.status === 'active').length}</div>
                <div className="text-gray-500 text-xs">Requiring Attention</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                )}
              >
                <i className={cn("fas", tab.icon)}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'active' ? 'Active' : tab.id === 'history' ? 'History' : tab.id === 'settings' ? 'Settings' : 'Rules'}
                </span>
                {tab.count !== null && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    activeTab === tab.id ? "bg-white/20" : "bg-gray-200 text-gray-700"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {(activeTab === 'active' || activeTab === 'history') && (
        <div className="space-y-4 md:space-y-6">
          {/* Alerts List Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-6 py-4 rounded-t-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className={cn("fas", activeTab === 'active' ? 'fa-exclamation-triangle' : 'fa-history', "text-white")}></i>
                </div>
                {activeTab === 'active' ? 'Active Alerts' : 'Alert History'}
              </h3>
              <p className="text-red-100 text-xs sm:text-sm mt-1">
                {activeTab === 'active' 
                  ? 'Current system alerts requiring attention' 
                  : 'Complete history of all system alerts and notifications'
                }
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fas fa-search"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Search alerts, devices, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    style={{ color: '#1f2937', backgroundColor: 'white' }}
                  />
                </div>
                
                <div className="lg:w-48">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    style={{ color: '#1f2937', backgroundColor: 'white' }}
                  >
                    <option value="all" style={{ background: 'white', color: '#1f2937' }}>All Levels</option>
                    <option value="high" style={{ background: 'white', color: '#1f2937' }}>High Priority</option>
                    <option value="warning" style={{ background: 'white', color: '#1f2937' }}>Warnings</option>
                    <option value="info" style={{ background: 'white', color: '#1f2937' }}>Information</option>
                  </select>
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-lg bg-white border-2 border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 p-4 sm:p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Alert Header */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold border-2",
                              getLevelBadge(alert.level)
                            )}>
                              {alert.level.toUpperCase()}
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold border-2",
                              getStatusBadge(alert.status)
                            )}>
                              {alert.status.toUpperCase()}
                            </div>
                            <div className="text-gray-500 text-sm font-medium">
                              {alert.timestamp}
                            </div>
                          </div>
                          
                          {/* Alert Message */}
                          <div>
                            <h3 className="text-gray-800 font-bold text-lg mb-2">
                              {alert.message}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {alert.description}
                            </p>
                          </div>
                          
                          {/* Alert Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-mobile-alt text-gray-400"></i>
                              <span className="text-gray-600 font-medium">Device:</span>
                              <span className="text-gray-800 font-semibold">{alert.device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fas fa-map-marker-alt text-gray-400"></i>
                              <span className="text-gray-600 font-medium">Location:</span>
                              <span className="text-gray-800 font-semibold">{alert.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                          <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm">
                            View Details
                          </button>
                          {alert.status === 'active' && (
                            <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md text-sm">
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <i className="fas fa-search text-4xl text-gray-400"></i>
                    </div>
                    <div className="text-gray-700 text-xl font-bold mb-2">No alerts found</div>
                    <div className="text-gray-500 text-sm max-w-md mx-auto">
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

              {/* Footer Actions */}
              {filteredAlerts.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 mt-6 border-t-2 border-gray-200">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md text-sm">
                      Mark All as Read
                    </button>
                    <button className="w-full sm:w-auto px-6 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm">
                      Export Logs
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Real-time monitoring</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span>{filteredAlerts.length} alerts shown</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4 md:space-y-6">
          {/* Alert Settings Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 rounded-t-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cog text-white"></i>
                </div>
                Alert Settings
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">Configure alert thresholds, notification preferences, and system behavior</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-8">
                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-bell text-blue-600"></i>
                    Notification Preferences
                  </h3>
                  
                  {['Email Notifications', 'SMS Alerts', 'Push Notifications', 'Slack Integration'].map((setting, index) => (
                    <div key={setting} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-gray-50 border-2 border-gray-200 gap-3">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <i className={cn(
                            "fas text-blue-600",
                            index === 0 ? 'fa-envelope' : index === 1 ? 'fa-sms' : index === 2 ? 'fa-bell' : 'fa-comment'
                          )}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800">{setting}</div>
                          <div className="text-sm text-gray-600">
                            {index === 0 ? 'Receive alerts via email' :
                             index === 1 ? 'SMS notifications for critical alerts' :
                             index === 2 ? 'Browser push notifications' :
                             'Send alerts to Slack channels'}
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          defaultChecked={index < 2}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Alert Thresholds */}
                <div className="space-y-4">
                  <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-chart-line text-blue-600"></i>
                    Alert Thresholds
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Temperature Threshold', value: '85', unit: '°C', icon: 'fa-thermometer-half' },
                      { label: 'Battery Low Warning', value: '15', unit: '%', icon: 'fa-battery-quarter' },
                      { label: 'Network Timeout', value: '10', unit: 'minutes', icon: 'fa-clock' },
                      { label: 'Data Rate Limit', value: '1000', unit: 'packets/min', icon: 'fa-tachometer-alt' }
                    ].map((threshold) => (
                      <div key={threshold.label} className="p-4 rounded-lg bg-gray-50 border-2 border-gray-200">
                        <label className="text-gray-800 font-semibold text-sm mb-2 flex items-center gap-2">
                          <i className={cn("fas", threshold.icon, "text-blue-600")}></i>
                          {threshold.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={threshold.value}
                            className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            style={{ color: '#1f2937', backgroundColor: 'white' }}
                          />
                          <span className="text-gray-600 text-sm font-medium">{threshold.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4 md:space-y-6">
          {/* Alert Rules Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 rounded-t-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-ruler text-white"></i>
                </div>
                Alert Rules
              </h3>
              <p className="text-green-100 text-xs sm:text-sm mt-1">Create and manage custom alert rules and automation workflows</p>
            </div>

            <div className="p-4 sm:p-6">
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
                ].map((rule) => (
                  <div key={rule.name} className="p-4 sm:p-6 rounded-lg bg-gray-50 border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-gray-800 font-bold text-lg">{rule.name}</h4>
                          <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-bold border-2',
                            rule.status === 'active' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          )}>
                            {rule.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-600">
                            <span className="font-semibold">Condition:</span> {rule.condition}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold">Action:</span> {rule.action}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm">
                          Edit
                        </button>
                        <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md text-sm">
                          {rule.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full p-4 sm:p-6 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-gray-700 hover:text-green-700 font-semibold text-base sm:text-lg flex items-center justify-center gap-3">
                  <i className="fas fa-plus-circle text-xl sm:text-2xl"></i>
                  <span className="hidden sm:inline">Create New Alert Rule</span>
                  <span className="sm:hidden">New Rule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
