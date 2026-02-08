import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../utils/auth'
import { useUserContext } from '../contexts/UserContext'
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
    clearUserContext()
    logoutUser()
    navigate('/login')
  }

  const tabs = [
    { id: 'account', label: 'Account Information', icon: 'fa-user' },
    { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
    { id: 'preferences', label: 'Preferences', icon: 'fa-cog' }
  ]

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      {/* AdminLTE Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-gray-500 text-sm">Account Type</div>
                <div className="text-blue-600 text-xl font-bold">{formatUserType(userType)}</div>
                <div className="text-gray-500 text-xs">User Role</div>
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
                  'px-4 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                )}
              >
                <i className={cn("fas", tab.icon)}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'account' ? 'Account' : tab.id === 'security' ? 'Security' : 'Preferences'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'account' && (
        <div className="space-y-4 md:space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 rounded-t-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                Profile Information
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">Your personal details and account information</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-id-card text-blue-600"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formatFullName(firstName, middleName, lastName)}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Your complete name
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-envelope text-blue-600"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email || 'Not available'}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Your registered email address
                  </p>
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-phone text-blue-600"></i>
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={mobile || 'Not available'}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Your contact number
                  </p>
                </div>
                
                {/* User ID */}
                <div className="space-y-2">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-fingerprint text-blue-600"></i>
                    User ID
                  </label>
                  <input
                    type="text"
                    value={uniqueId || 'Not available'}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Your unique account identifier
                  </p>
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-user-tag text-blue-600"></i>
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={formatUserType(userType)}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Your account role in the system
                  </p>
                </div>

                {/* Assigned Devices */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-mobile-alt text-blue-600"></i>
                    Assigned Devices
                  </label>
                  <input
                    type="text"
                    value={formatImeiList(imeis)}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 text-gray-800 font-medium cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    Devices linked to your account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4 md:space-y-6">
          {/* Security Settings Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 rounded-t-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-white"></i>
                </div>
                Security Settings
              </h3>
              <p className="text-green-100 text-xs sm:text-sm mt-1">Manage your account security and authentication</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-lock text-4xl text-gray-400"></i>
                </div>
                <p className="text-gray-700 text-lg font-semibold mb-2">Security Settings</p>
                <p className="text-gray-500 text-sm">Password change and security options coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-4 md:space-y-6">
          {/* Preferences Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-4 rounded-t-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-cog text-white"></i>
                </div>
                Preferences
              </h3>
              <p className="text-purple-100 text-xs sm:text-sm mt-1">Customize your application experience</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-sliders-h text-4xl text-gray-400"></i>
                </div>
                <p className="text-gray-700 text-lg font-semibold mb-2">User Preferences</p>
                <p className="text-gray-500 text-sm">Customization options coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
