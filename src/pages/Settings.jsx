import React, { useState } from 'react'
import { Card, Input, Select, Button } from '../design-system/components'

export default function Settings(){
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card variant="default" padding="lg">
        <Card.Header>
          <Card.Title>Account Settings</Card.Title>
          <Card.Description>
            Manage your account information and profile details
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Display Name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              helperText="This is how your name will appear to other users"
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="We'll use this email for important notifications"
            />
          </div>
        </Card.Content>
        
        <Card.Footer>
          <Button 
            variant="primary" 
            loading={isLoading}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button variant="ghost" className="ml-2">
            Cancel
          </Button>
        </Card.Footer>
      </Card>

      <Card variant="default" padding="lg">
        <Card.Header>
          <Card.Title>Preferences</Card.Title>
          <Card.Description>
            Customize your application experience
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-text-primary">Dark Mode</div>
                <div className="text-sm text-text-secondary">
                  Toggle between light and dark UI theme
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
            
            <div className="space-y-2">
              <Select
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                helperText="Select your local timezone for accurate timestamps"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
              </Select>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}
