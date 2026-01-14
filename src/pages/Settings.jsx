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
import { sendDeviceCommand } from '../utils/deviceCommandAPI'
import { validateParams } from '../utils/deviceCommandValidation'
import { Notification } from '../components/Notification'

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [displayName, setDisplayName] = useState('John Doe')
  const [email, setEmail] = useState('john.doe@example.com')
  const [isLoading, setIsLoading] = useState(false)

  // Device Command state management
  const [deviceCommand, setDeviceCommand] = useState({
    imei: '',
    command: '',
    params: {}
  })
  const [commandLoading, setCommandLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [imeiError, setImeiError] = useState('')
  const [paramErrors, setParamErrors] = useState({})

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

  const commandOptions = [
    { value: '', label: 'Select a command...' },
    { value: 'STOP_SOS', label: 'Stop SOS Mode' },
    { value: 'QUERY_NORMAL', label: 'Query Normal Status' },
    { value: 'QUERY_DEVICE_SETTINGS', label: 'Query Device Settings' },
    { value: 'DEVICE_SETTINGS', label: 'Update Device Settings' },
    { value: 'CALL_ENABLE', label: 'Enable Calls' },
    { value: 'CALL_DISABLE', label: 'Disable Calls' },
    { value: 'LED_ON', label: 'Turn LED On' },
    { value: 'LED_OFF', label: 'Turn LED Off' },
    { value: 'AMBIENT_ENABLE', label: 'Enable Ambient Monitoring' },
    { value: 'AMBIENT_DISABLE', label: 'Disable Ambient Monitoring' },
    { value: 'AMBIENT_STOP', label: 'Stop Ambient Monitoring' },
    { value: 'AIRPLANE_ENABLE', label: 'Enable Airplane Mode' },
    { value: 'GPS_DISABLE', label: 'Disable GPS' }
  ]

  const handleCommandChange = (e) => {
    setDeviceCommand({
      ...deviceCommand,
      command: e.target.value,
      params: {} // Reset params when command changes
    })
    // Clear parameter errors when command changes
    setParamErrors({})
  }

  const validateParameter = (paramName, value) => {
    // Only validate if value is provided (non-empty)
    if (!value || value.trim() === '') {
      return ''
    }

    // Create a params object with just this parameter for validation
    const testParams = { [paramName]: value.trim() }
    
    // Use the existing validateParams function from deviceCommandValidation
    const result = validateParams('DEVICE_SETTINGS', testParams)
    
    if (!result.valid) {
      return result.error
    }
    
    return ''
  }

  const handleParameterChange = (paramName, value) => {
    setDeviceCommand({
      ...deviceCommand,
      params: { ...deviceCommand.params, [paramName]: value }
    })
    
    // Clear error when user starts typing
    if (paramErrors[paramName]) {
      setParamErrors({
        ...paramErrors,
        [paramName]: ''
      })
    }
  }

  const handleParameterBlur = (paramName) => {
    const value = deviceCommand.params[paramName]
    const error = validateParameter(paramName, value)
    
    if (error) {
      setParamErrors({
        ...paramErrors,
        [paramName]: error
      })
    }
  }

  const validateImei = (imei) => {
    const trimmedImei = imei.trim()
    if (!trimmedImei || trimmedImei.length === 0) {
      return 'IMEI is required. Please enter a valid device IMEI'
    }
    return ''
  }

  const handleImeiChange = (e) => {
    const newImei = e.target.value
    setDeviceCommand({ ...deviceCommand, imei: newImei })
    // Clear error when user starts typing
    if (imeiError) {
      setImeiError('')
    }
  }

  const handleImeiBlur = () => {
    const error = validateImei(deviceCommand.imei)
    setImeiError(error)
  }

  const handleSubmit = async () => {
    // Sub-task 7.1: Validate IMEI before submission
    const imeiValidationError = validateImei(deviceCommand.imei)
    if (imeiValidationError) {
      setImeiError(imeiValidationError)
      setNotification({
        type: 'error',
        message: imeiValidationError
      })
      return
    }

    // Validate command is selected
    if (!deviceCommand.command) {
      setNotification({
        type: 'error',
        message: 'Command type is required. Please select a command type'
      })
      return
    }

    // Sub-task 7.2: Validate DEVICE_SETTINGS parameters before submission
    if (deviceCommand.command === 'DEVICE_SETTINGS') {
      const newParamErrors = {}
      let hasErrors = false

      // Validate each parameter that has a value
      Object.keys(deviceCommand.params).forEach(paramName => {
        const value = deviceCommand.params[paramName]
        if (value && value.trim() !== '') {
          const error = validateParameter(paramName, value)
          if (error) {
            newParamErrors[paramName] = error
            hasErrors = true
          }
        }
      })

      if (hasErrors) {
        setParamErrors(newParamErrors)
        setNotification({
          type: 'error',
          message: 'Please fix the parameter validation errors before submitting'
        })
        return
      }
    }

    // Sub-task 6.1: Set commandLoading to true
    setCommandLoading(true)

    try {
      const trimmedImei = deviceCommand.imei.trim()
      
      // Sub-task 6.1: Build params object (only include non-empty DEVICE_SETTINGS params)
      const params = {}
      if (deviceCommand.command === 'DEVICE_SETTINGS') {
        // Only include non-empty parameter values
        Object.keys(deviceCommand.params).forEach(key => {
          const value = deviceCommand.params[key]
          if (value && value.trim() !== '') {
            params[key] = value.trim()
          }
        })
      }

      // Sub-task 6.1: Call sendDeviceCommand(imei, command, params)
      const response = await sendDeviceCommand(trimmedImei, deviceCommand.command, params)

      // Sub-task 6.2: Handle successful response
      // Display success notification with message
      setNotification({
        type: 'success',
        message: response.message || 'Command sent successfully. The command has been sent to the device'
      })

      // Sub-task 6.2: Clear deviceCommand state (reset imei, command, params)
      setDeviceCommand({
        imei: '',
        command: '',
        params: {}
      })

      // Clear IMEI error on successful submission
      setImeiError('')
      
      // Clear parameter errors on successful submission
      setParamErrors({})

      // Sub-task 6.2: Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null)
      }, 5000)

    } catch (error) {
      // Sub-task 6.3: Handle error response
      // Check error.code for VALIDATION_ERROR, NETWORK_ERROR, API_ERROR
      let errorMessage = 'An error occurred'

      if (error.code === 'VALIDATION_ERROR') {
        errorMessage = `Validation Error: ${error.message}`
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network Error: Please check your connection and try again'
      } else if (error.code === 'API_ERROR') {
        errorMessage = `API Error: ${error.message}`
        // Include error details in notification if available
        if (error.details && error.details.statusCode) {
          errorMessage += ` (Status: ${error.details.statusCode})`
        }
      } else {
        errorMessage = error.message || 'An unexpected error occurred'
      }

      // Sub-task 6.3: Display appropriate error notification with message
      setNotification({
        type: 'error',
        message: errorMessage
      })

      // Sub-task 6.3: Keep form data intact for correction (no state reset)
    } finally {
      // Sub-task 6.1: Set commandLoading to false in finally block
      setCommandLoading(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'device-command', label: 'Device Command', icon: '📡' }
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
      </HierarchySection>

      {/* Device Command Tab */}
      <HierarchySection level={1} colorScheme="orange" spacing="lg">
        {activeTab === 'device-command' && (
          <ContentSection variant="glass" colorScheme="orange" padding="lg" spacing="md" bordered={true} elevated={true}>
            <Card 
              variant="glass" 
              padding="lg" 
              colorScheme="orange" 
              glowEffect={true}
              className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-orange-600/25 via-amber-600/20 to-yellow-600/25 border border-orange-400/40"
            >
              <Card.Header>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <span className="text-2xl">📡</span>
                  </div>
                  <div>
                    <Card.Title className="text-white text-xl font-bold">Device Commands</Card.Title>
                    <Card.Description className="text-orange-100/80">
                      Send commands to your IoT devices using their IMEI identifier
                    </Card.Description>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-6">
                  {/* IMEI Input Field */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Device IMEI</label>
                    <input
                      type="text"
                      value={deviceCommand.imei}
                      onChange={handleImeiChange}
                      onBlur={handleImeiBlur}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                        imeiError 
                          ? "border-red-400/60 focus:border-red-400/80" 
                          : "border-white/30 focus:border-orange-300/60"
                      )}
                      placeholder="Enter 15-digit IMEI"
                      aria-invalid={!!imeiError}
                      aria-describedby={imeiError ? "imei-error" : undefined}
                    />
                    {imeiError && (
                      <p id="imei-error" className="text-red-300 text-sm font-medium" role="alert">
                        {imeiError}
                      </p>
                    )}
                  </div>

                  {/* Command Type Selector */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm">Command Type</label>
                    <select
                      value={deviceCommand.command}
                      onChange={handleCommandChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/30 text-white focus:bg-white/20 focus:border-orange-300/60 focus:outline-none transition-all duration-300"
                    >
                      {commandOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conditional Parameter Inputs for DEVICE_SETTINGS */}
                  {deviceCommand.command === 'DEVICE_SETTINGS' && (
                    <div className="space-y-4 pt-4 border-t border-white/20">
                      <h3 className="text-white font-semibold text-base">Optional Parameters</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NormalSendingInterval */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">Normal Sending Interval</label>
                          <input
                            type="text"
                            value={deviceCommand.params.NormalSendingInterval || ''}
                            onChange={(e) => handleParameterChange('NormalSendingInterval', e.target.value)}
                            onBlur={() => handleParameterBlur('NormalSendingInterval')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.NormalSendingInterval
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 60"
                            aria-invalid={!!paramErrors.NormalSendingInterval}
                            aria-describedby={paramErrors.NormalSendingInterval ? "normal-sending-interval-error" : "normal-sending-interval-help"}
                          />
                          {paramErrors.NormalSendingInterval ? (
                            <p id="normal-sending-interval-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.NormalSendingInterval}
                            </p>
                          ) : (
                            <p id="normal-sending-interval-help" className="text-orange-100/70 text-xs">Interval in seconds for normal data transmission</p>
                          )}
                        </div>

                        {/* SOSSendingInterval */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">SOS Sending Interval</label>
                          <input
                            type="text"
                            value={deviceCommand.params.SOSSendingInterval || ''}
                            onChange={(e) => handleParameterChange('SOSSendingInterval', e.target.value)}
                            onBlur={() => handleParameterBlur('SOSSendingInterval')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.SOSSendingInterval
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 10"
                            aria-invalid={!!paramErrors.SOSSendingInterval}
                            aria-describedby={paramErrors.SOSSendingInterval ? "sos-sending-interval-error" : "sos-sending-interval-help"}
                          />
                          {paramErrors.SOSSendingInterval ? (
                            <p id="sos-sending-interval-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.SOSSendingInterval}
                            </p>
                          ) : (
                            <p id="sos-sending-interval-help" className="text-orange-100/70 text-xs">Interval in seconds for SOS mode data transmission</p>
                          )}
                        </div>

                        {/* NormalScanningInterval */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">Normal Scanning Interval</label>
                          <input
                            type="text"
                            value={deviceCommand.params.NormalScanningInterval || ''}
                            onChange={(e) => handleParameterChange('NormalScanningInterval', e.target.value)}
                            onBlur={() => handleParameterBlur('NormalScanningInterval')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.NormalScanningInterval
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 30"
                            aria-invalid={!!paramErrors.NormalScanningInterval}
                            aria-describedby={paramErrors.NormalScanningInterval ? "normal-scanning-interval-error" : "normal-scanning-interval-help"}
                          />
                          {paramErrors.NormalScanningInterval ? (
                            <p id="normal-scanning-interval-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.NormalScanningInterval}
                            </p>
                          ) : (
                            <p id="normal-scanning-interval-help" className="text-orange-100/70 text-xs">Interval in seconds for GPS scanning in normal mode</p>
                          )}
                        </div>

                        {/* AirplaneInterval */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">Airplane Interval</label>
                          <input
                            type="text"
                            value={deviceCommand.params.AirplaneInterval || ''}
                            onChange={(e) => handleParameterChange('AirplaneInterval', e.target.value)}
                            onBlur={() => handleParameterBlur('AirplaneInterval')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.AirplaneInterval
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 120"
                            aria-invalid={!!paramErrors.AirplaneInterval}
                            aria-describedby={paramErrors.AirplaneInterval ? "airplane-interval-error" : "airplane-interval-help"}
                          />
                          {paramErrors.AirplaneInterval ? (
                            <p id="airplane-interval-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.AirplaneInterval}
                            </p>
                          ) : (
                            <p id="airplane-interval-help" className="text-orange-100/70 text-xs">Interval in seconds for airplane mode operations</p>
                          )}
                        </div>

                        {/* TemperatureLimit */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">Temperature Limit</label>
                          <input
                            type="text"
                            value={deviceCommand.params.TemperatureLimit || ''}
                            onChange={(e) => handleParameterChange('TemperatureLimit', e.target.value)}
                            onBlur={() => handleParameterBlur('TemperatureLimit')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.TemperatureLimit
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 50"
                            aria-invalid={!!paramErrors.TemperatureLimit}
                            aria-describedby={paramErrors.TemperatureLimit ? "temperature-limit-error" : "temperature-limit-help"}
                          />
                          {paramErrors.TemperatureLimit ? (
                            <p id="temperature-limit-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.TemperatureLimit}
                            </p>
                          ) : (
                            <p id="temperature-limit-help" className="text-orange-100/70 text-xs">Temperature threshold in degrees Celsius</p>
                          )}
                        </div>

                        {/* SpeedLimit */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">Speed Limit</label>
                          <input
                            type="text"
                            value={deviceCommand.params.SpeedLimit || ''}
                            onChange={(e) => handleParameterChange('SpeedLimit', e.target.value)}
                            onBlur={() => handleParameterBlur('SpeedLimit')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.SpeedLimit
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 80"
                            aria-invalid={!!paramErrors.SpeedLimit}
                            aria-describedby={paramErrors.SpeedLimit ? "speed-limit-error" : "speed-limit-help"}
                          />
                          {paramErrors.SpeedLimit ? (
                            <p id="speed-limit-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.SpeedLimit}
                            </p>
                          ) : (
                            <p id="speed-limit-help" className="text-orange-100/70 text-xs">Speed threshold in km/h</p>
                          )}
                        </div>

                        {/* LowbatLimit */}
                        <div className="space-y-2">
                          <label className="text-white font-semibold text-sm">Low Battery Limit</label>
                          <input
                            type="text"
                            value={deviceCommand.params.LowbatLimit || ''}
                            onChange={(e) => handleParameterChange('LowbatLimit', e.target.value)}
                            onBlur={() => handleParameterBlur('LowbatLimit')}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white placeholder-white/70 focus:bg-white/20 focus:outline-none transition-all duration-300",
                              paramErrors.LowbatLimit
                                ? "border-red-400/60 focus:border-red-400/80"
                                : "border-white/30 focus:border-orange-300/60"
                            )}
                            placeholder="e.g., 20"
                            aria-invalid={!!paramErrors.LowbatLimit}
                            aria-describedby={paramErrors.LowbatLimit ? "lowbat-limit-error" : "lowbat-limit-help"}
                          />
                          {paramErrors.LowbatLimit ? (
                            <p id="lowbat-limit-error" className="text-red-300 text-sm font-medium" role="alert">
                              {paramErrors.LowbatLimit}
                            </p>
                          ) : (
                            <p id="lowbat-limit-help" className="text-orange-100/70 text-xs">Battery percentage threshold (0-100)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>

              <Card.Footer>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSubmit}
                    disabled={commandLoading || !!imeiError || Object.values(paramErrors).some(error => error !== '')}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commandLoading ? 'Sending...' : 'Send Command'}
                  </button>
                </div>
              </Card.Footer>
            </Card>

            {/* Notification Component */}
            {notification && (
              <div className="mt-4">
                <Notification
                  type={notification.type}
                  message={notification.message}
                  onDismiss={() => setNotification(null)}
                />
              </div>
            )}
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
