import React, { useState, useEffect } from 'react'
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
import { sendDeviceCommand } from '../utils/deviceCommandAPI'
import { validateParams } from '../utils/deviceCommandValidation'
import { Notification } from '../components/Notification'
import { fetchDeviceCommands, parseDeviceCommands } from '../utils/deviceCommandsAPI'
import { fetchDeviceConfig, parseDeviceConfig, getConfigAcknowledgments } from '../utils/deviceConfigAPI'

export default function Settings() {
  const navigate = useNavigate()
  const { email, uniqueId, userType, imeis, firstName, middleName, lastName, mobile, clearUserContext } = useUserContext()
  const [activeTab, setActiveTab] = useState('account')

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

  // Command History state management
  const [commandHistory, setCommandHistory] = useState([])
  const [configAcknowledgments, setConfigAcknowledgments] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)

  // IMEI mode detection logic
  // Filter out invalid IMEIs from the array
  const validImeis = (imeis || []).filter(imei => imei && imei.trim() !== '');
  const imeiCount = validImeis.length;
  // Calculate mode flags
  const hasNoDevices = imeiCount === 0;
  const hasSingleDevice = imeiCount === 1;
  const hasMultipleDevices = imeiCount > 1;

  // Auto-populate IMEI for single device users
  useEffect(() => {
    if (activeTab === 'device-command' && hasSingleDevice) {
      setDeviceCommand(prev => ({
        ...prev,
        imei: validImeis[0]
      }));
    }
  }, [activeTab, hasSingleDevice, validImeis]);

  // Fetch command history when IMEI is selected
  useEffect(() => {
    const fetchCommandHistory = async () => {
      const currentImei = deviceCommand.imei?.trim();
      console.log('fetchCommandHistory called with IMEI:', currentImei);
      
      if (!currentImei || currentImei.length === 0) {
        console.log('No IMEI provided, clearing history');
        setCommandHistory([]);
        setConfigAcknowledgments([]);
        return;
      }

      setHistoryLoading(true);
      setHistoryError(null);

      try {
        console.log('Fetching command history and config for IMEI:', currentImei);
        
        // Fetch both command history and config acknowledgments in parallel
        const [commands, configs] = await Promise.all([
          fetchDeviceCommands(currentImei, 10),
          fetchDeviceConfig(currentImei, 10)
        ]);

        console.log('Fetched commands:', commands);
        console.log('Fetched configs:', configs);

        const parsedCommands = parseDeviceCommands(commands);
        const parsedAcks = getConfigAcknowledgments(configs);
        
        console.log('Parsed commands:', parsedCommands);
        console.log('Parsed acknowledgments:', parsedAcks);

        setCommandHistory(parsedCommands);
        setConfigAcknowledgments(parsedAcks);
      } catch (error) {
        console.error('Error fetching command history:', error);
        setHistoryError('Failed to load command history. Please try again.');
        setCommandHistory([]);
        setConfigAcknowledgments([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (activeTab === 'device-command') {
      fetchCommandHistory();
    }
  }, [deviceCommand.imei, activeTab]);

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
    const trimmedImei = imei?.trim() || '';
    if (!trimmedImei || trimmedImei.length === 0) {
      // Different message for dropdown vs text input
      if (hasMultipleDevices) {
        return 'Please select a device from the dropdown';
      }
      return 'IMEI is required. Please enter a valid device IMEI';
    }
    return '';
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

  const refreshCommandHistory = async () => {
    const currentImei = deviceCommand.imei?.trim();
    if (!currentImei || currentImei.length === 0) return;

    try {
      const [commands, configs] = await Promise.all([
        fetchDeviceCommands(currentImei, 10),
        fetchDeviceConfig(currentImei, 10)
      ]);

      setCommandHistory(parseDeviceCommands(commands));
      setConfigAcknowledgments(getConfigAcknowledgments(configs));
    } catch (error) {
      console.error('Error refreshing command history:', error);
    }
  };

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

      // Sub-task 8.2 & 8.3: Clear deviceCommand state (preserve IMEI for single device, clear for multiple)
      setDeviceCommand({
        imei: hasSingleDevice ? validImeis[0] : '', // Keep IMEI for single device, clear for multiple
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

      // Refresh command history after successful command submission
      setTimeout(() => {
        refreshCommandHistory();
      }, 2000); // Wait 2 seconds for the command to be processed

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

      {/* Device Command Tab */}
      {activeTab === 'device-command' && (
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
                    {hasSingleDevice ? (
                      <input
                        type="text"
                        value={validImeis[0]}
                        readOnly
                        disabled
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border text-white",
                          "border-white/20 cursor-not-allowed opacity-70",
                          "focus:outline-none"
                        )}
                        aria-label="Device IMEI (auto-filled)"
                        aria-describedby="imei-help"
                      />
                    ) : hasMultipleDevices ? (
                      <select
                        value={deviceCommand.imei}
                        onChange={handleImeiChange}
                        onBlur={handleImeiBlur}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-xl border text-white",
                          "focus:bg-white/20 focus:outline-none transition-all duration-300",
                          imeiError 
                            ? "border-red-400/60 focus:border-red-400/80" 
                            : "border-white/30 focus:border-orange-300/60"
                        )}
                        aria-invalid={!!imeiError}
                        aria-describedby={imeiError ? "imei-error" : "imei-help"}
                      >
                        <option value="" className="bg-gray-800 text-white">
                          Select a device...
                        </option>
                        {validImeis.map((imei) => (
                          <option key={imei} value={imei} className="bg-gray-800 text-white">
                            {imei}
                          </option>
                        ))}
                      </select>
                    ) : hasNoDevices ? (
                      <>
                        <input
                          type="text"
                          value=""
                          readOnly
                          disabled
                          placeholder="No devices assigned"
                          className={cn(
                            "w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border text-white",
                            "border-white/20 cursor-not-allowed opacity-70 placeholder-white/50",
                            "focus:outline-none"
                          )}
                          aria-label="Device IMEI (no devices assigned)"
                        />
                        <p className="text-orange-200 text-sm font-medium mt-2">
                          No devices are assigned to your account. Please contact your administrator to assign devices.
                        </p>
                      </>
                    ) : (
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
                    )}
                    {/* Error message - shown when validation fails */}
                    {imeiError && (
                      <p id="imei-error" className="text-red-300 text-sm font-medium" role="alert">
                        {imeiError}
                      </p>
                    )}
                    {/* Help text - only shown when no error is present and not in no-device mode */}
                    {!hasNoDevices && !imeiError && (
                      <p id="imei-help" className="text-orange-100/70 text-xs">
                        {hasSingleDevice && "Your device IMEI (automatically filled)"}
                        {hasMultipleDevices && "Select the device you want to send commands to"}
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

                  {/* Send Command Button */}
                  <div className="mt-6">
                    <button 
                      onClick={handleSubmit}
                      disabled={commandLoading || hasNoDevices || !!imeiError || Object.values(paramErrors).some(error => error !== '')}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {commandLoading ? 'Sending...' : 'Send Command'}
                    </button>
                  </div>
                </div>

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

                {/* Command History Section */}
                {deviceCommand.imei && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span>📋</span>
                        Command History
                      </h3>
                      <button
                        onClick={refreshCommandHistory}
                        disabled={historyLoading}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300 border border-white/20 disabled:opacity-50"
                      >
                        {historyLoading ? '🔄 Loading...' : '🔄 Refresh'}
                      </button>
                    </div>

                    {historyLoading && !commandHistory.length ? (
                      <div className="text-center py-8 text-orange-100/70">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full mb-2"></div>
                        <p>Loading command history...</p>
                      </div>
                    ) : historyError ? (
                      <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-4 text-red-100">
                        <p className="font-medium">⚠️ {historyError}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                      {/* Sent Commands */}
                      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <span>📤</span>
                          Sent Commands (Last 10)
                        </h4>
                        {commandHistory.length > 0 ? (
                          <div className="space-y-2">
                            {commandHistory.map((cmd) => (
                              <div
                                key={cmd.id}
                                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-200"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-white font-semibold">{cmd.command}</span>
                                      <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        cmd.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
                                        cmd.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30' :
                                        'bg-gray-500/20 text-gray-200 border border-gray-400/30'
                                      )}>
                                        {cmd.status}
                                      </span>
                                    </div>
                                    {cmd.payload && Object.keys(cmd.payload).length > 0 && (
                                      <div className="text-orange-100/70 text-sm mt-1">
                                        <span className="font-medium">Parameters:</span>
                                        <div className="ml-2 mt-1 space-y-0.5">
                                          {Object.entries(cmd.payload).map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                              <span className="text-orange-200">{key}:</span> {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right text-xs text-orange-100/60 whitespace-nowrap">
                                    {new Date(cmd.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-orange-100/60 text-sm text-center py-4">
                            No commands sent yet
                          </p>
                        )}
                      </div>

                      {/* Device Acknowledgments */}
                      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <span>✅</span>
                          Device Acknowledgments (Last 10)
                        </h4>
                        {configAcknowledgments.length > 0 ? (
                          <div className="space-y-2">
                            {configAcknowledgments.map((ack) => (
                              <div
                                key={ack.id}
                                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-200"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-green-300 text-lg">✓</span>
                                      <span className="text-white font-medium">{ack.rawBody}</span>
                                    </div>
                                    <div className="text-orange-100/60 text-xs">
                                      Topic: {ack.topic}
                                    </div>
                                  </div>
                                  <div className="text-right text-xs text-orange-100/60 whitespace-nowrap">
                                    {new Date(ack.deviceTimestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-orange-100/60 text-sm text-center py-4">
                            No acknowledgments received yet
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                )}
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
