import React, { useState } from 'react'
import { Card, Button, Input, Select } from '../design-system/components'

export default function Alerts(){
  const [filterLevel, setFilterLevel] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const alerts = [
    {
      id: 1,
      level: 'high',
      message: 'sensor-12 temperature spike',
      timestamp: '5m ago',
      device: 'sensor-12',
      status: 'active'
    },
    {
      id: 2,
      level: 'info',
      message: 'maintenance scheduled',
      timestamp: 'Oct 10',
      device: 'system',
      status: 'scheduled'
    },
    {
      id: 3,
      level: 'warning',
      message: 'device-07 battery low',
      timestamp: '15m ago',
      device: 'device-07',
      status: 'active'
    },
    {
      id: 4,
      level: 'info',
      message: 'firmware update available',
      timestamp: '1h ago',
      device: 'system',
      status: 'pending'
    }
  ]

  const getLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-status-error'
      case 'warning': return 'text-status-warning'
      case 'info': return 'text-status-info'
      default: return 'text-text-secondary'
    }
  }

  const getLevelBadge = (level) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (level) {
      case 'high': return `${baseClasses} bg-status-error/10 text-status-error border border-status-error/20`
      case 'warning': return `${baseClasses} bg-status-warning/10 text-status-warning border border-status-warning/20`
      case 'info': return `${baseClasses} bg-status-info/10 text-status-info border border-status-info/20`
      default: return `${baseClasses} bg-surface-secondary text-text-secondary`
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesLevel = filterLevel === 'all' || alert.level === filterLevel
    const matchesSearch = searchQuery === '' || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.device.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLevel && matchesSearch
  })

  return (
    <div className="space-y-6">
      <Card variant="default" padding="lg">
        <Card.Header>
          <Card.Title>Alerts & Notifications</Card.Title>
          <Card.Description>
            Monitor system alerts, warnings, and important notifications
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            <div className="sm:w-48">
              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                placeholder="Filter by level"
              >
                <option value="all">All Levels</option>
                <option value="high">High Priority</option>
                <option value="warning">Warnings</option>
                <option value="info">Information</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface-secondary border border-border-primary hover:border-border-secondary transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={getLevelBadge(alert.level)}>
                      {alert.level.toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">
                        {alert.message}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Device: {alert.device} • {alert.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                    {alert.status === 'active' && (
                      <Button variant="secondary" size="sm">
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-text-secondary mb-2">No alerts found</div>
                <div className="text-sm text-text-tertiary">
                  {searchQuery || filterLevel !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'All systems are running normally'
                  }
                </div>
              </div>
            )}
          </div>
        </Card.Content>
        
        <Card.Footer>
          <Button variant="secondary">
            Mark All as Read
          </Button>
          <Button variant="ghost" className="ml-2">
            Export Logs
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
