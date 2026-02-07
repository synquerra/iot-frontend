import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { sendDeviceCommand } from "../utils/deviceCommandAPI";
import { validateParams } from "../utils/deviceCommandValidation";
import { fetchDeviceCommands, parseDeviceCommands } from "../utils/deviceCommandsAPI";
import { fetchDeviceConfig, getConfigAcknowledgments } from "../utils/deviceConfigAPI";
import { ContactInput } from "../components/ContactInput";
import { Notification } from "../components/Notification";

export default function DeviceSettings() {
  const { imei: routeImei } = useParams();
  const navigate = useNavigate();
  
  // Use route IMEI or default for testing
  const imei = routeImei || "862942074957887";

  const [notification, setNotification] = useState({
    type: '', // 'success' | 'error' | ''
    message: ''
  });

  // Device command state management
  const [deviceCommand, setDeviceCommand] = useState({
    command: '',      // Selected command type
    params: {}        // Parameter key-value pairs
  });

  const [commandLoading, setCommandLoading] = useState(false);
  const [paramErrors, setParamErrors] = useState({});

  // Command history state
  const [commandHistory, setCommandHistory] = useState([]);
  const [configAcknowledgments, setConfigAcknowledgments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Command options array with all 14 command types
  const commandOptions = [
    { value: '', label: 'Select a command...' },
    { value: 'SET_CONTACTS', label: 'Emergency Contacts' },
    { value: 'STOP_SOS', label: 'Stop SOS Mode' },
    { value: 'QUERY_NORMAL', label: 'Query Normal Status' },
    { value: 'QUERY_DEVICE_SETTINGS', label: 'Query Device Settings' },
    { value: 'DEVICE_SETTINGS', label: 'Device Settings' },
    { value: 'CALL_ENABLE', label: 'Enable Call' },
    { value: 'CALL_DISABLE', label: 'Disable Call' },
    { value: 'LED_ON', label: 'Turn LED On' },
    { value: 'LED_OFF', label: 'Turn LED Off' },
    { value: 'AMBIENT_ENABLE', label: 'Enable Ambient Mode' },
    { value: 'AMBIENT_DISABLE', label: 'Disable Ambient Mode' },
    { value: 'AMBIENT_STOP', label: 'Stop Ambient Mode' },
    { value: 'AIRPLANE_ENABLE', label: 'Enable Airplane Mode' },
    { value: 'GPS_DISABLE', label: 'Disable GPS' }
  ];

  /**
   * Effect: Fetch command history on mount
   * Fetches command history when component mounts with valid IMEI
   */
  useEffect(() => {
    const fetchCommandHistory = async () => {
      if (!imei) return;
      
      setHistoryLoading(true);
      setHistoryError(null);
      
      try {
        const [commands, configs] = await Promise.all([
          fetchDeviceCommands(imei, 10),
          fetchDeviceConfig(imei, 10)
        ]);
        
        setCommandHistory(parseDeviceCommands(commands));
        setConfigAcknowledgments(getConfigAcknowledgments(configs));
      } catch (error) {
        setHistoryError('Failed to load command history');
        setCommandHistory([]);
        setConfigAcknowledgments([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    fetchCommandHistory();
  }, [imei]);

  /**
   * Handles command type selection change
   * Clears parameters and errors when command changes
   */
  const handleCommandChange = (e) => {
    setDeviceCommand({
      command: e.target.value,
      params: {}  // Clear all parameters when command changes
    });
    setParamErrors({});
  };

  /**
   * Handles parameter value change
   * Updates parameter value in state and clears error for that parameter
   */
  const handleParameterChange = (paramName, value) => {
    setDeviceCommand(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [paramName]: value
      }
    }));
    
    // Clear error for this parameter when user starts typing
    setParamErrors(prev => ({
      ...prev,
      [paramName]: ''
    }));
  };

  /**
   * Handles parameter blur event
   * Triggers validation for the parameter
   */
  const handleParameterBlur = (paramName) => {
    const value = deviceCommand.params[paramName];
    const error = validateParameter(paramName, value);
    
    setParamErrors(prev => ({
      ...prev,
      [paramName]: error
    }));
  };

  /**
   * Validates a single parameter value
   * Returns empty string if value is empty (optional parameters)
   * Returns error message if validation fails, empty string if valid
   */
  const validateParameter = (paramName, value) => {
    // Empty values are valid (all parameters are optional)
    if (!value || value.trim() === '') {
      return '';
    }
    
    // Contact field validation
    if (paramName === 'phonenum1' || paramName === 'phonenum2' || paramName === 'controlroomnum') {
      // Contact fields must be non-empty and not just whitespace when provided
      // Since we already checked for empty/whitespace above, non-empty values are valid
      return '';
    }
    
    // DEVICE_SETTINGS parameter validation
    // Create a params object with just this parameter for validation
    const params = { [paramName]: value };
    const result = validateParams('DEVICE_SETTINGS', params);
    
    if (!result.valid) {
      return result.error;
    }
    
    return '';
  };

  /**
   * Fetches updated command history
   * Updates commandHistory and configAcknowledgments state
   * Handles errors silently (logs to console)
   */
  const refreshCommandHistory = async () => {
    if (!imei) return;
    
    setIsRefreshing(true);
    
    try {
      const [commands, configs] = await Promise.all([
        fetchDeviceCommands(imei, 10),
        fetchDeviceConfig(imei, 10)
      ]);
      
      setCommandHistory(parseDeviceCommands(commands));
      setConfigAcknowledgments(getConfigAcknowledgments(configs));
      setHistoryError(null); // Clear any previous errors
    } catch (error) {
      // Handle errors silently - log to console
      console.error('Failed to refresh command history:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Handles device command submission
   * Validates IMEI, command type, and parameters, then sends command to device
   */
  const handleSubmit = async () => {
    // Step 1: Validate Route_IMEI exists
    if (!imei || imei.trim() === '') {
      setNotification({
        type: 'error',
        message: 'IMEI is required. Please enter a valid device IMEI'
      });
      return;
    }

    // Step 2: Validate command type is selected
    if (!deviceCommand.command || deviceCommand.command === '') {
      setNotification({
        type: 'error',
        message: 'Command type is required. Please select a command type'
      });
      return;
    }

    // Step 3: Determine which parameters to include based on command type
    const contactFields = ['phonenum1', 'phonenum2', 'controlroomnum'];
    let paramsToValidate = {};
    
    if (deviceCommand.command === 'SET_CONTACTS') {
      // For SET_CONTACTS: only include contact parameters
      paramsToValidate = Object.entries(deviceCommand.params)
        .filter(([key]) => contactFields.includes(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    } else {
      // For other commands: exclude contact parameters
      paramsToValidate = Object.entries(deviceCommand.params)
        .filter(([key]) => !contactFields.includes(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    }

    // Step 4: Validate all non-empty parameters
    const nonEmptyParams = Object.entries(paramsToValidate)
      .filter(([_, value]) => value && value.trim() !== '');
    
    // Validate each non-empty parameter
    for (const [paramName, value] of nonEmptyParams) {
      const error = validateParameter(paramName, value);
      if (error) {
        setParamErrors(prev => ({
          ...prev,
          [paramName]: error
        }));
        setNotification({
          type: 'error',
          message: `Validation error: ${error}`
        });
        return;
      }
    }

    // Step 5: Set commandLoading state during API call
    setCommandLoading(true);
    setNotification({ type: '', message: '' });

    try {
      // Step 6: Prepare command-specific parameters (non-empty only)
      const commandParams = Object.entries(paramsToValidate)
        .filter(([_, value]) => value && value.trim() !== '')
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      // Step 7: Call sendDeviceCommand with imei, command, and command-specific params
      await sendDeviceCommand(imei, deviceCommand.command, commandParams);

      // Step 8: Display success notification on success
      setNotification({
        type: 'success',
        message: 'Command sent successfully. The command has been sent to the device'
      });

      // Step 9: Clear form (command and params) on success
      setDeviceCommand({
        command: '',
        params: {}  // Clear all parameters
      });
      setParamErrors({});

      // Step 10: Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);

      // Step 11: Auto-refresh command history after 2 seconds
      setTimeout(() => {
        refreshCommandHistory();
      }, 2000);

    } catch (error) {
      // Step 12: Handle errors - Display error notification with details on failure
      // Preserve form data on failure (deviceCommand state is not modified)
      let errorMessage = 'Failed to send command';

      if (error.code === 'VALIDATION_ERROR') {
        errorMessage = `Validation Error: ${error.message}`;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network Error: Please check your connection and try again';
      } else if (error.code === 'API_ERROR') {
        const statusCode = error.details?.statusCode || 'unknown';
        errorMessage = `API Error: ${error.message} (Status: ${statusCode})`;
      }

      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      // Step 13: Clear loading state
      setCommandLoading(false);
    }
  };

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
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/devices')}
                  className="text-blue-200 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Devices
                </Button>
                <div className="w-1 h-6 bg-blue-400/50 rounded-full"></div>
                <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                  Device Management
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                Device Commands
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed mb-3">
                Send commands and configure settings for your device
              </p>
              <div className="flex items-center gap-2">
                <span className="text-blue-200/70 text-sm">IMEI:</span>
                <span className="font-mono text-blue-100 text-lg font-semibold bg-blue-500/20 px-3 py-1 rounded-lg">
                  {imei || "N/A"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">IMEI Number</div>
                <div className="text-white text-lg font-mono font-bold">{imei || "N/A"}</div>
                <div className="text-blue-200/70 text-xs">Device Identifier</div>
              </div>
              <div className="w-px h-16 bg-blue-400/30"></div>
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Device Status</div>
                <div className="text-green-300 text-xl font-bold">Online</div>
                <div className="text-blue-200/70 text-xs">Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Command Section */}
      <Card variant="glass" colorScheme="orange" padding="lg">
        <Card.Content>
          <h3 className="text-orange-300 text-lg font-semibold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Device Commands
          </h3>

          {/* Notification Display */}
          {notification.message && (
            <div className="mb-6">
              <Notification
                type={notification.type}
                message={notification.message}
                onDismiss={() => setNotification({ type: '', message: '' })}
              />
            </div>
          )}

          <div className="space-y-6">
            {/* Command Type Selector */}
            <div className="space-y-2">
              <label className="text-white font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Command Type
              </label>
              <select
                value={deviceCommand.command}
                onChange={handleCommandChange}
                disabled={commandLoading}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-white/10 backdrop-blur-xl",
                  "border border-white/30",
                  "text-white placeholder-white/50",
                  "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:bg-white/15"
                )}
              >
                {commandOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    className="bg-gray-800 text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-orange-100/70 text-xs">
                Select a command to send to the device
              </p>
            </div>

            {/* Contact Fields - Visible ONLY for SET_CONTACTS command */}
            {deviceCommand.command === 'SET_CONTACTS' && (
              <div className="space-y-4 pt-4 border-t border-white/20">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Emergency Contacts (Optional)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ContactInput
                    label="Primary Contact"
                    value={deviceCommand.params.phonenum1 || ''}
                    onChange={(e) => handleParameterChange('phonenum1', e.target.value)}
                    onBlur={() => handleParameterBlur('phonenum1')}
                    error={paramErrors.phonenum1}
                    disabled={commandLoading}
                    placeholder="e.g., +1234567890"
                  />
                  
                  <ContactInput
                    label="Secondary Contact"
                    value={deviceCommand.params.phonenum2 || ''}
                    onChange={(e) => handleParameterChange('phonenum2', e.target.value)}
                    onBlur={() => handleParameterBlur('phonenum2')}
                    error={paramErrors.phonenum2}
                    disabled={commandLoading}
                    placeholder="e.g., +1234567890"
                  />
                  
                  <ContactInput
                    label="Control Room Contact"
                    value={deviceCommand.params.controlroomnum || ''}
                    onChange={(e) => handleParameterChange('controlroomnum', e.target.value)}
                    onBlur={() => handleParameterBlur('controlroomnum')}
                    error={paramErrors.controlroomnum}
                    disabled={commandLoading}
                    placeholder="e.g., +1234567890"
                  />
                </div>
              </div>
            )}

            {/* Parameter Inputs - Conditional rendering for DEVICE_SETTINGS */}
            {deviceCommand.command === 'DEVICE_SETTINGS' && (
              <div className="space-y-4 pt-4 border-t border-white/20">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Device Settings Parameters (Optional)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NormalSendingInterval */}
                  <div className="space-y-2">
                    <label htmlFor="normalSendingInterval" className="text-white font-semibold text-sm">
                      Normal Sending Interval
                    </label>
                    <input
                      id="normalSendingInterval"
                      type="text"
                      value={deviceCommand.params.NormalSendingInterval || ''}
                      onChange={(e) => handleParameterChange('NormalSendingInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('NormalSendingInterval')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.NormalSendingInterval ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 60"
                    />
                    {paramErrors.NormalSendingInterval ? (
                      <p className="text-red-300 text-sm">{paramErrors.NormalSendingInterval}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Interval in seconds for normal data transmission</p>
                    )}
                  </div>

                  {/* SOSSendingInterval */}
                  <div className="space-y-2">
                    <label htmlFor="sosSendingInterval" className="text-white font-semibold text-sm">
                      SOS Sending Interval
                    </label>
                    <input
                      id="sosSendingInterval"
                      type="text"
                      value={deviceCommand.params.SOSSendingInterval || ''}
                      onChange={(e) => handleParameterChange('SOSSendingInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('SOSSendingInterval')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.SOSSendingInterval ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 10"
                    />
                    {paramErrors.SOSSendingInterval ? (
                      <p className="text-red-300 text-sm">{paramErrors.SOSSendingInterval}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Interval in seconds for SOS mode data transmission</p>
                    )}
                  </div>

                  {/* NormalScanningInterval */}
                  <div className="space-y-2">
                    <label htmlFor="normalScanningInterval" className="text-white font-semibold text-sm">
                      Normal Scanning Interval
                    </label>
                    <input
                      id="normalScanningInterval"
                      type="text"
                      value={deviceCommand.params.NormalScanningInterval || ''}
                      onChange={(e) => handleParameterChange('NormalScanningInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('NormalScanningInterval')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.NormalScanningInterval ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 30"
                    />
                    {paramErrors.NormalScanningInterval ? (
                      <p className="text-red-300 text-sm">{paramErrors.NormalScanningInterval}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Interval in seconds for GPS scanning in normal mode</p>
                    )}
                  </div>

                  {/* AirplaneInterval */}
                  <div className="space-y-2">
                    <label htmlFor="airplaneInterval" className="text-white font-semibold text-sm">
                      Airplane Interval
                    </label>
                    <input
                      id="airplaneInterval"
                      type="text"
                      value={deviceCommand.params.AirplaneInterval || ''}
                      onChange={(e) => handleParameterChange('AirplaneInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('AirplaneInterval')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.AirplaneInterval ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 120"
                    />
                    {paramErrors.AirplaneInterval ? (
                      <p className="text-red-300 text-sm">{paramErrors.AirplaneInterval}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Interval in seconds for airplane mode operations</p>
                    )}
                  </div>

                  {/* TemperatureLimit */}
                  <div className="space-y-2">
                    <label htmlFor="temperatureLimit" className="text-white font-semibold text-sm">
                      Temperature Limit
                    </label>
                    <input
                      id="temperatureLimit"
                      type="text"
                      value={deviceCommand.params.TemperatureLimit || ''}
                      onChange={(e) => handleParameterChange('TemperatureLimit', e.target.value)}
                      onBlur={() => handleParameterBlur('TemperatureLimit')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.TemperatureLimit ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 50"
                    />
                    {paramErrors.TemperatureLimit ? (
                      <p className="text-red-300 text-sm">{paramErrors.TemperatureLimit}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Temperature threshold in degrees Celsius</p>
                    )}
                  </div>

                  {/* SpeedLimit */}
                  <div className="space-y-2">
                    <label htmlFor="speedLimit" className="text-white font-semibold text-sm">
                      Speed Limit
                    </label>
                    <input
                      id="speedLimit"
                      type="text"
                      value={deviceCommand.params.SpeedLimit || ''}
                      onChange={(e) => handleParameterChange('SpeedLimit', e.target.value)}
                      onBlur={() => handleParameterBlur('SpeedLimit')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.SpeedLimit ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 80"
                    />
                    {paramErrors.SpeedLimit ? (
                      <p className="text-red-300 text-sm">{paramErrors.SpeedLimit}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Speed threshold in km/h</p>
                    )}
                  </div>

                  {/* LowbatLimit */}
                  <div className="space-y-2">
                    <label htmlFor="lowbatLimit" className="text-white font-semibold text-sm">
                      Low Battery Limit
                    </label>
                    <input
                      id="lowbatLimit"
                      type="text"
                      value={deviceCommand.params.LowbatLimit || ''}
                      onChange={(e) => handleParameterChange('LowbatLimit', e.target.value)}
                      onBlur={() => handleParameterBlur('LowbatLimit')}
                      disabled={commandLoading}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-xl",
                        "border",
                        paramErrors.LowbatLimit ? "border-red-400/60" : "border-white/30",
                        "text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      placeholder="e.g., 20"
                    />
                    {paramErrors.LowbatLimit ? (
                      <p className="text-red-300 text-sm">{paramErrors.LowbatLimit}</p>
                    ) : (
                      <p className="text-orange-100/70 text-xs">Battery percentage threshold (0-100)</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="glass"
              colorScheme="orange"
              size="md"
              onClick={handleSubmit}
              disabled={commandLoading || Object.values(paramErrors).some(error => error !== '')}
              className="min-w-[180px]"
            >
              {commandLoading ? (
                <Loading type="spinner" size="sm" color="white" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Send Command
                </>
              )}
            </Button>
          </div>

          {/* Command History Section */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-orange-300 text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Command History
              </h4>
              
              {/* Refresh Button */}
              <Button
                variant="outline"
                colorScheme="orange"
                size="sm"
                onClick={refreshCommandHistory}
                disabled={isRefreshing || historyLoading}
                className="min-w-[120px]"
              >
                {isRefreshing ? (
                  <>
                    <Loading type="spinner" size="sm" color="orange" />
                    <span className="ml-2">Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
            </div>

            {/* Loading State */}
            {historyLoading && (
              <div className="flex items-center justify-center py-12">
                <Loading type="spinner" size="lg" color="orange" />
                <span className="ml-3 text-orange-100/70">Loading command history...</span>
              </div>
            )}

            {/* Error State */}
            {historyError && !historyLoading && (
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h5 className="text-red-300 font-semibold mb-1">Error Loading History</h5>
                    <p className="text-red-200/80 text-sm">{historyError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* History Content - Only show when not loading and no error */}
            {!historyLoading && !historyError && (
              <>
                {/* Sent Commands Section */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 mb-6">
                  <h5 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                    📤 Sent Commands (Last 10)
                  </h5>
                  
                  {commandHistory.length === 0 ? (
                    <div className="text-center py-8 text-orange-100/70">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">No commands sent yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {commandHistory.map((cmd) => {
                        // Determine status badge color
                        const statusColors = {
                          PUBLISHED: 'bg-green-500/20 text-green-300 border-green-400/30',
                          PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
                          FAILED: 'bg-red-500/20 text-red-300 border-red-400/30',
                          default: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        };
                        const statusClass = statusColors[cmd.status] || statusColors.default;

                        return (
                          <div 
                            key={cmd.id} 
                            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-white font-semibold">{cmd.command}</span>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium border",
                                  statusClass
                                )}>
                                  {cmd.status}
                                </span>
                              </div>
                              <span className="text-orange-100/60 text-xs">
                                {new Date(cmd.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            {cmd.payload && Object.keys(cmd.payload).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <p className="text-orange-100/70 text-xs mb-1">Parameters:</p>
                                <div className="bg-black/20 rounded p-2 font-mono text-xs text-orange-100/80">
                                  {JSON.stringify(cmd.payload, null, 2)}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Device Acknowledgments Section */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6">
                  <h5 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                    ✅ Device Acknowledgments (Last 10)
                  </h5>
                  
                  {configAcknowledgments.length === 0 ? (
                    <div className="text-center py-8 text-orange-100/70">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">No acknowledgments received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {configAcknowledgments.map((ack) => (
                        <div 
                          key={ack.id} 
                          className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">✓</span>
                              <span className="text-white font-medium">{ack.rawBody}</span>
                            </div>
                            <span className="text-orange-100/60 text-xs">
                              {new Date(ack.deviceTimestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-orange-100/70 text-xs">
                              <span className="font-semibold">Topic:</span> {ack.topic}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
