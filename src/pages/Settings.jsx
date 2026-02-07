import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../utils/auth'
import { useUserContext } from '../contexts/UserContext'
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
  const { email, uniqueId, userType, imeis, firstName, middleName, lastName, mobile, clearUserContext } = useUserContext()
  const [activeTab, setActiveTab] = useState('account')

  // Helper function to format user type
  const formatUserType = (userType) => {
    const typeMap = {
      'ADMIN': 'Administrator',
      'PARENTS': 'Parent'
    }
    // Use hasOwnProperty to avoid prototype pollution
    if (Object.prototype.hasOwnProperty.call(typeMap, userType)) {
      return typeMap[userType]
    }
    return userType || 'Unknown'
  }

  // Helper function to format IMEI list
  const formatImeiList = (imeis) => {
    if (!imeis || imeis.length === 0) {
      return 'No devices assigned'
    }
    if (imeis.length === 1) {
      return `1 device: ${imeis[0]}`
    }
    return `${imeis.length} devices: ${imeis.join(', ')}`
  }

  // Helper function to format full name
  const formatFullName = (firstName, middleName, lastName) => {
    const parts = [firstName, middleName, lastName].filter(part => part && part.trim() !== '')
    return parts.length > 0 ? parts.join(' ') : 'Not available'
  }

  const handleLogout = () => {
    console.log('Logging out...')
    // Clear UserContext state
    clearUserContext()
    // Clear persistent storage and tokens
    logoutUser()
    navigate('/login')
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' }
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
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Soft gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
          
          {/* Subtle floating glow effects */}
          <div className="absolute top-6 left-6 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl" />
          <div className="absolute bottom-6 right-6 w-32 h-32 bg-purple-400/8 rounded-full blur-3xl" />
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
      {activeTab === 'account' && (
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
                      profile details
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Full Name</label>
                    <input
                      type="text"
                      value={formatFullName(firstName, middleName, lastName)}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your complete name</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Email Address</label>
                    <input
                      type="email"
                      value={email || 'Not available'}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your registered email address</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Mobile Number</label>
                    <input
                      type="text"
                      value={mobile || 'Not available'}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your contact number</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">User ID</label>
                    <input
                      type="text"
                      value={uniqueId || 'Not available'}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your unique account identifier</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">First Name</label>
                    <input
                      type="text"
                      value={firstName || 'Not available'}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your first name</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Middle Name</label>
                    <input
                      type="text"
                      value={middleName || 'Not available'}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your middle name</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Last Name</label>
                    <input
                      type="text"
                      value={lastName || 'Not available'}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your last name</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Account Type</label>
                    <input
                      type="text"
                      value={formatUserType(userType)}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Your account role in the system</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white font-semibold text-sm">Assigned Devices</label>
                    <input
                      type="text"
                      value={formatImeiList(imeis)}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 rounded-xl backdrop-blur-xl border text-white",
                        "bg-white/10 border-white/20 cursor-not-allowed opacity-80",
                        "focus:outline-none"
                      )}
                    />
                    <p className="text-blue-100/70 text-xs">Devices linked to your account</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
        )}
      <SectionDivider 
        variant="gradient" 
        colorScheme="indigo" 
        spacing="lg" 
        animated={true}
      />
    </div>
  )
}
