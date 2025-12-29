import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../utils/auth'
import { Card, Input, Select, Button } from '../design-system/components'
import {
  SectionDivider,
  GradientHeader,
  ContentSection,
  HierarchySection
} from "../design-system/components/LayoutComponents"
import { cn } from "../design-system/utils/cn"

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [displayName, setDisplayName] = useState('John Doe')
  const [email, setEmail] = useState('john.doe@example.com')
  const [darkMode, setDarkMode] = useState(true)
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    alerts: true
  })
  const [privacy, setPrivacy] = useState({
    analytics: true,
    location: false,
    sharing: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleLogout = () => {
    console.log('Logging out...')
    logoutUser()
    navigate('/login')
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ]

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Design */}
      <GradientHeader
        title="Application Settings"
        subtitle="Manage your account, preferences, and system configuration"
        colorScheme="indigo"
        size="lg"
        className="relative overflow-hidden"
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/15 animate-pulse" />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          
          {/* Floating glow effects */}
          <div className="absolute top-6 left-6 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-8 right-8 w-24 h-24 bg-purple-400/15 rounded-full blur-2xl animate-pulse delay-700" />
          <div className="absolute bottom-6 right-6 w-40 h-40 bg-pink-400/12 rounded-full blur-3xl animate-pulse delay-1400" />
        </div>
      </GradientHeader>

      {/* Enhanced Tab Navigation */}
      <ContentSection variant="glass" colorScheme="indigo" padding="md" spacing="sm" bordered={true}>
        <div className="flex flex-wrap gap-2 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300',
                'hover:scale-105 hover:shadow-lg backdrop-blur-sm',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-xl shadow-indigo-500/30 border border-indigo-400/50'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
              )}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </ContentSection>

      {/* Tab Content */}
      <HierarchySection level={1} colorScheme="indigo" spacing="lg">
        {activeTab === 'account' && (
          <ContentSection variant="glass" colorScheme="blue" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="blue" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-blue-600/25 via-indigo-600/20 to-purple-600/25 border border-blue-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">Account Information</Card.Title>
                    <Card.Description className="text-blue-100/80">
                      Manage your personal account details and profile information
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 focus:bg-white/20 focus:border-blue-300/60 focus:outline-none transition-all duration-300"
                      placeholder="Your display name"
                    />
                    <p className="text-blue-100/70 text-xs">This is how your name will appear to other users</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 focus:bg-white/20 focus:border-blue-300/60 focus:outline-none transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-blue-100/70 text-xs">We'll use this email for important notifications</p>
                  </div>
                </div>
              </Card.Content>
              
              <Card.Footer>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                    Cancel
                  </button>
                </div>
              </Card.Footer>
            </Card>
          </ContentSection>
        )}

        {activeTab === 'preferences' && (
          <ContentSection variant="glass" colorScheme="purple" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="purple" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-purple-600/25 via-pink-600/20 to-rose-600/25 border border-purple-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">User Preferences</Card.Title>
                    <Card.Description className="text-purple-100/80">
                      Customize your application experience and interface settings
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-8">
                  {/* Theme Settings */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                        <span className="text-lg">🌙</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">Dark Mode</div>
                        <div className="text-sm text-purple-100/70">
                          Toggle between light and dark UI theme
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                  
                  {/* Timezone Settings */}
                  <div className="space-y-3">
                    <label className="text-white font-semibold text-sm flex items-center gap-2">
                      <span className="text-lg">🌍</span>
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white focus:bg-white/20 focus:border-purple-300/60 focus:outline-none transition-all duration-300"
                    >
                      <option value="Asia/Kolkata" className="bg-slate-900 text-white">Asia/Kolkata (IST)</option>
                      <option value="UTC" className="bg-slate-900 text-white">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York" className="bg-slate-900 text-white">America/New_York (EST/EDT)</option>
                      <option value="Europe/London" className="bg-slate-900 text-white">Europe/London (GMT/BST)</option>
                      <option value="Asia/Tokyo" className="bg-slate-900 text-white">Asia/Tokyo (JST)</option>
                      <option value="Australia/Sydney" className="bg-slate-900 text-white">Australia/Sydney (AEST/AEDT)</option>
                    </select>
                    <p className="text-purple-100/70 text-xs">Select your local timezone for accurate timestamps</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </ContentSection>
        )}

        {activeTab === 'notifications' && (
          <ContentSection variant="glass" colorScheme="green" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="green" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-green-600/25 via-teal-600/20 to-cyan-600/25 border border-green-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-teal-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">Notification Settings</Card.Title>
                    <Card.Description className="text-green-100/80">
                      Configure how and when you receive notifications
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/30 to-teal-500/30 flex items-center justify-center">
                          <span className="text-lg">
                            {key === 'email' ? '📧' : key === 'push' ? '📱' : key === 'sms' ? '💬' : '🚨'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white capitalize">{key} Notifications</div>
                          <div className="text-sm text-green-100/70">
                            {key === 'email' ? 'Receive notifications via email' :
                             key === 'push' ? 'Browser push notifications' :
                             key === 'sms' ? 'SMS text message alerts' :
                             'Critical system alerts'}
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-teal-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </ContentSection>
        )}

        {activeTab === 'security' && (
          <ContentSection variant="glass" colorScheme="red" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="red" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-red-600/25 via-rose-600/20 to-pink-600/25 border border-red-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-rose-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">Security & Privacy</Card.Title>
                    <Card.Description className="text-red-100/80">
                      Manage your account security and privacy preferences
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-8">
                  {/* Privacy Settings */}
                  <div className="space-y-6">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <span className="text-xl">🛡️</span>
                      Privacy Controls
                    </h3>
                    {Object.entries(privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/30 to-rose-500/30 flex items-center justify-center">
                            <span className="text-lg">
                              {key === 'analytics' ? '📊' : key === 'location' ? '📍' : '🤝'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-white capitalize">{key} Data</div>
                            <div className="text-sm text-red-100/70">
                              {key === 'analytics' ? 'Allow usage analytics collection' :
                               key === 'location' ? 'Share location data for features' :
                               'Enable data sharing with partners'}
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-rose-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Logout Section */}
                  <div className="pt-6 border-t border-white/20">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                      <span className="text-xl">🚪</span>
                      Session Management
                    </h3>
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">Sign Out</div>
                          <div className="text-sm text-red-100/70">
                            End your current session and return to login
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </ContentSection>
        )}
      </HierarchySection>

      {/* Section Divider */}
      <SectionDivider 
        variant="gradient" 
        colorScheme="indigo" 
        spacing="lg" 
        animated={true}
      />
    </div>
  )
}
