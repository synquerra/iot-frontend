import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { sendDeviceCommand } from "../utils/deviceCommandAPI";
import { validateParams } from "../utils/deviceCommandValidation";
import { fetchDeviceCommands, parseDeviceCommands } from "../utils/deviceCommandsAPI";
import { fetchDeviceConfig, getConfigAcknowledgments } from "../utils/deviceConfigAPI";
import { ContactInput } from "../components/ContactInput";
import { Notification } from "../components/Notification";
import { useUserContext } from "../contexts/UserContext";
import { useDeviceFilter } from "../hooks/useDeviceFilter";
import { listDevicesFiltered } from "../utils/deviceFiltered";

export default function DeviceSettings() {
  const { imei: routeImei } = useParams();
  const navigate = useNavigate();
  
  // User context for role-based logic
  const { isAdmin, userType } = useUserContext();
  
  // Device filtering hook
  const { filterDevices, shouldFilterDevices } = useDeviceFilter();
  
  // State for devices list
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  
  // Use selected IMEI from state or route parameter
  const [selectedImei, setSelectedImei] = useState(routeImei || "");
  const imei = selectedImei;

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
   * Effect: Fetch devices list on mount
   */
  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      try {
        const result = await listDevicesFiltered();
        const devicesList = result.full || result.devices || [];
        setDevices(devicesList);
        
        // Auto-select device for parent with single device
        if (!isAdmin() && devicesList.length === 1 && !routeImei) {
          setSelectedImei(devicesList[0].imei);
        } else if (routeImei) {
          setSelectedImei(routeImei);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };
    
    fetchDevices();
  }, [isAdmin, routeImei]);

  // Apply device filtering
  const filteredDevices = useMemo(() => {
    return filterDevices(devices);
  }, [devices, filterDevices]);

  // Determine if device filter should be shown
  // Show filter if: ADMIN (always) OR Parent with 2+ devices
  const shouldShowDeviceFilter = useMemo(() => {
    if (isAdmin()) {
      return true; // Always show for ADMIN
    }
    // For PARENTS, only show if they have 2 or more devices
    return filteredDevices.length >= 2;
  }, [isAdmin, filteredDevices.length]);

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
          fetchDeviceCommands(imei, 5),
          fetchDeviceConfig(imei, 5)
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
        fetchDeviceCommands(imei, 5),
        fetchDeviceConfig(imei, 5)
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
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      {/* AdminLTE Header */}
      <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate('/devices')}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Devices</span>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  Device Management
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Device Commands
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                Send commands and configure settings for your device
              </p>
              
              {/* Device Selection - Show based on role and device count */}
              {shouldShowDeviceFilter ? (
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 font-semibold text-sm">
                    <i className="fas fa-mobile-alt mr-2 text-blue-600"></i>
                    Select Device:
                  </label>
                  <select
                    value={selectedImei}
                    onChange={(e) => setSelectedImei(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    style={{ minWidth: '250px', background: 'white', color: '#1f2937' }}
                  >
                    <option value="" style={{ background: 'white', color: '#1f2937' }}>Select a device...</option>
                    {filteredDevices.map((device) => (
                      <option key={device.imei} value={device.imei} style={{ background: 'white', color: '#1f2937' }}>
                        {device.imei}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">IMEI:</span>
                  <span className="font-mono text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded">
                    {imei || "N/A"}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-gray-500 text-sm">IMEI Number</div>
                <div className="text-gray-800 text-lg font-mono font-bold">{imei || "N/A"}</div>
                <div className="text-gray-500 text-xs">Device Identifier</div>
              </div>
              <div className="w-px h-16 bg-gray-300"></div>
              <div className="text-right">
                <div className="text-gray-500 text-sm">Device Status</div>
                <div className="text-green-600 text-xl font-bold">
                  {imei ? "Online" : "Not Selected"}
                </div>
                <div className="text-gray-500 text-xs">{imei ? "Connected" : "Select Device"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Command Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 rounded-t-lg">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-terminal text-white"></i>
            </div>
            Device Commands
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">Configure and send commands to your device</p>
        </div>

        <div className="p-4 sm:p-6">
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
            <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
              <label className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-list text-white text-xs"></i>
                </div>
                Command Type
                <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Required</span>
              </label>
              <select
                value={deviceCommand.command}
                onChange={handleCommandChange}
                disabled={commandLoading}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border-2 border-blue-200",
                  "bg-white text-gray-800 font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "transition-all duration-200 shadow-sm",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                )}
                style={{ background: 'white' }}
              >
                {commandOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    style={{ background: 'white', color: '#1f2937' }}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-gray-600 text-xs flex items-center gap-1">
                <i className="fas fa-info-circle text-blue-500"></i>
                Select a command to send to the device
              </p>
            </div>

            {/* Contact Fields - Visible ONLY for SET_CONTACTS command */}
            {deviceCommand.command === 'SET_CONTACTS' && (
              <div className="space-y-4 pt-4 border-t-2 border-blue-100">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-gray-800 font-bold text-base flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-phone text-white text-xs"></i>
                    </div>
                    Emergency Contacts
                    <span className="ml-auto text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-semibold">All Required</span>
                  </h4>
                  <p className="text-gray-600 text-xs ml-10">Configure emergency contact numbers for the device (all 3 contacts are mandatory)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
              <div className="space-y-4 pt-4 border-t-2 border-blue-100">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="text-gray-800 font-bold text-base flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-cog text-white text-xs"></i>
                    </div>
                    Device Settings Parameters
                    <span className="ml-auto text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Optional</span>
                  </h4>
                  <p className="text-gray-600 text-xs ml-10">Configure device operational parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* NormalSendingInterval */}
                  <div className="space-y-2">
                    <label htmlFor="normalSendingInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-clock text-blue-600"></i>
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
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.NormalSendingInterval ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      style={{ color: '#1f2937 !important', backgroundColor: 'white !important' }}
                      placeholder="e.g., 60"
                    />
                    {paramErrors.NormalSendingInterval ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.NormalSendingInterval}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Interval in seconds for normal data transmission
                      </p>
                    )}
                  </div>

                  {/* SOSSendingInterval */}
                  <div className="space-y-2">
                    <label htmlFor="sosSendingInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-exclamation-triangle text-red-600"></i>
                      SOS Sending Interval
                    </label>
                    <input
                      id="sosSendingInterval"
                      type="text"
                      value={deviceCommand.params.SOSSendingInterval || ''}
                      onChange={(e) => handleParameterChange('SOSSendingInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('SOSSendingInterval')}
                      disabled={commandLoading}
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.SOSSendingInterval ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "text-gray-800 placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      placeholder="e.g., 10"
                    />
                    {paramErrors.SOSSendingInterval ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.SOSSendingInterval}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Interval in seconds for SOS mode data transmission
                      </p>
                    )}
                  </div>

                  {/* NormalScanningInterval */}
                  <div className="space-y-2">
                    <label htmlFor="normalScanningInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-satellite-dish text-green-600"></i>
                      Normal Scanning Interval
                    </label>
                    <input
                      id="normalScanningInterval"
                      type="text"
                      value={deviceCommand.params.NormalScanningInterval || ''}
                      onChange={(e) => handleParameterChange('NormalScanningInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('NormalScanningInterval')}
                      disabled={commandLoading}
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.NormalScanningInterval ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "text-gray-800 placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      placeholder="e.g., 30"
                    />
                    {paramErrors.NormalScanningInterval ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.NormalScanningInterval}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Interval in seconds for GPS scanning in normal mode
                      </p>
                    )}
                  </div>

                  {/* AirplaneInterval */}
                  <div className="space-y-2">
                    <label htmlFor="airplaneInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-plane text-indigo-600"></i>
                      Airplane Interval
                    </label>
                    <input
                      id="airplaneInterval"
                      type="text"
                      value={deviceCommand.params.AirplaneInterval || ''}
                      onChange={(e) => handleParameterChange('AirplaneInterval', e.target.value)}
                      onBlur={() => handleParameterBlur('AirplaneInterval')}
                      disabled={commandLoading}
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.AirplaneInterval ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "text-gray-800 placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      placeholder="e.g., 120"
                    />
                    {paramErrors.AirplaneInterval ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.AirplaneInterval}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Interval in seconds for airplane mode operations
                      </p>
                    )}
                  </div>

                  {/* TemperatureLimit */}
                  <div className="space-y-2">
                    <label htmlFor="temperatureLimit" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-thermometer-half text-orange-600"></i>
                      Temperature Limit
                    </label>
                    <input
                      id="temperatureLimit"
                      type="text"
                      value={deviceCommand.params.TemperatureLimit || ''}
                      onChange={(e) => handleParameterChange('TemperatureLimit', e.target.value)}
                      onBlur={() => handleParameterBlur('TemperatureLimit')}
                      disabled={commandLoading}
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.TemperatureLimit ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "text-gray-800 placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      placeholder="e.g., 50"
                    />
                    {paramErrors.TemperatureLimit ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.TemperatureLimit}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Temperature threshold in degrees Celsius
                      </p>
                    )}
                  </div>

                  {/* SpeedLimit */}
                  <div className="space-y-2">
                    <label htmlFor="speedLimit" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-tachometer-alt text-purple-600"></i>
                      Speed Limit
                    </label>
                    <input
                      id="speedLimit"
                      type="text"
                      value={deviceCommand.params.SpeedLimit || ''}
                      onChange={(e) => handleParameterChange('SpeedLimit', e.target.value)}
                      onBlur={() => handleParameterBlur('SpeedLimit')}
                      disabled={commandLoading}
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.SpeedLimit ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "text-gray-800 placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      placeholder="e.g., 80"
                    />
                    {paramErrors.SpeedLimit ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.SpeedLimit}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Speed threshold in km/h
                      </p>
                    )}
                  </div>

                  {/* LowbatLimit */}
                  <div className="space-y-2">
                    <label htmlFor="lowbatLimit" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-battery-quarter text-yellow-600"></i>
                      Low Battery Limit
                    </label>
                    <input
                      id="lowbatLimit"
                      type="text"
                      value={deviceCommand.params.LowbatLimit || ''}
                      onChange={(e) => handleParameterChange('LowbatLimit', e.target.value)}
                      onBlur={() => handleParameterBlur('LowbatLimit')}
                      disabled={commandLoading}
                      style={{ color: '#1f2937', backgroundColor: 'white' }}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border-2",
                        paramErrors.LowbatLimit ? "border-red-400 bg-red-50" : "border-gray-200 bg-white",
                        "text-gray-800 placeholder-gray-400 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "transition-all duration-200 shadow-sm",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                      )}
                      placeholder="e.g., 20"
                    />
                    {paramErrors.LowbatLimit ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {paramErrors.LowbatLimit}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <i className="fas fa-info-circle text-blue-500"></i>
                        Battery percentage threshold (0-100)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t-2 border-gray-100 mt-6">
            <button
              onClick={handleSubmit}
              disabled={commandLoading || Object.values(paramErrors).some(error => error !== '')}
              className={cn(
                "px-8 py-3 rounded-lg font-bold transition-all duration-200 min-w-[200px]",
                "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg",
                "hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:transform-none disabled:shadow-none",
                "flex items-center justify-center gap-2 text-base"
              )}
            >
              {commandLoading ? (
                <>
                  <Loading type="spinner" size="sm" color="white" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-bolt"></i>
                  Send Command
                </>
              )}
            </button>
          </div>

          {/* Command History Section - Only show if device is selected */}
          {imei && (
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <i className="fas fa-history text-white"></i>
                    </div>
                    Command History
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 ml-13">View recent commands and device responses</p>
                  <div className="flex items-center gap-2 mt-2 ml-13">
                    <i className="fas fa-mobile-alt text-blue-600"></i>
                    <span className="text-sm text-gray-700">
                      Showing history for device: 
                      <span className="font-mono font-bold text-blue-600 ml-2 bg-blue-50 px-2 py-1 rounded">{imei}</span>
                    </span>
                  </div>
                </div>
              
              {/* Refresh Button */}
              <button
                onClick={refreshCommandHistory}
                disabled={isRefreshing || historyLoading}
                className={cn(
                  "px-5 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold",
                  "hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md",
                  "min-w-[140px] flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-transparent"
                )}
              >
                {isRefreshing ? (
                  <>
                    <Loading type="spinner" size="sm" color="blue" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-redo"></i>
                    Refresh
                  </>
                )}
              </button>
            </div>

            {/* Loading State */}
            {historyLoading && (
              <div className="flex items-center justify-center py-12">
                <Loading type="spinner" size="lg" color="blue" />
                <span className="ml-3 text-gray-600">Loading command history...</span>
              </div>
            )}

            {/* Error State */}
            {historyError && !historyLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-circle text-red-600 text-xl mt-0.5"></i>
                  <div>
                    <h5 className="text-red-800 font-semibold mb-1">Error Loading History</h5>
                    <p className="text-red-700 text-sm">{historyError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* History Content - Only show when not loading and no error */}
            {!historyLoading && !historyError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sent Commands Section - LEFT SIDE */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md border border-blue-100 p-6">
                  <h5 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow">
                      <i className="fas fa-paper-plane text-white text-sm"></i>
                    </div>
                    Sent Commands
                    <span className="ml-auto text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-semibold">Last 5</span>
                  </h5>
                  
                  {commandHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-inbox text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-sm font-medium">No commands sent yet</p>
                      <p className="text-xs text-gray-400 mt-1">Commands will appear here once sent</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {commandHistory.map((cmd) => {
                        // Determine status badge color
                        const statusColors = {
                          PUBLISHED: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
                          PENDING: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm',
                          FAILED: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm',
                          default: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                        };
                        const statusClass = statusColors[cmd.status] || statusColors.default;

                        return (
                          <div 
                            key={cmd.id} 
                            className="bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-800 font-bold text-base">{cmd.command}</span>
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-xs font-bold",
                                  statusClass
                                )}>
                                  {cmd.status}
                                </span>
                              </div>
                            </div>
                            <span className="text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                              <i className="fas fa-clock mr-1"></i>
                              {new Date(cmd.createdAt).toLocaleString()}
                            </span>
                            
                            {cmd.payload && Object.keys(cmd.payload).length > 0 && (
                              <div className="mt-3 pt-3 border-t-2 border-gray-100">
                                <p className="text-gray-700 text-xs font-bold mb-2 flex items-center gap-1">
                                  <i className="fas fa-code text-blue-600"></i>
                                  Parameters:
                                </p>
                                <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 shadow-inner">
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

                {/* Device Acknowledgments Section - RIGHT SIDE */}
                <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-md border border-green-100 p-6">
                  <h5 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow">
                      <i className="fas fa-check-circle text-white text-sm"></i>
                    </div>
                    Device Acknowledgments
                    <span className="ml-auto text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-semibold">Last 5</span>
                  </h5>
                  
                  {configAcknowledgments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check-circle text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-sm font-medium">No acknowledgments received yet</p>
                      <p className="text-xs text-gray-400 mt-1">Device responses will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {configAcknowledgments.map((ack) => (
                        <div 
                          key={ack.id} 
                          className="bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <i className="fas fa-check text-green-600 font-bold"></i>
                              </div>
                              <span className="text-gray-800 font-bold">{ack.rawBody}</span>
                            </div>
                          </div>
                          <span className="text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                            <i className="fas fa-clock mr-1"></i>
                            {new Date(ack.deviceTimestamp).toLocaleString()}
                          </span>
                          
                          <div className="mt-3 pt-3 border-t-2 border-gray-100">
                            <p className="text-gray-600 text-xs flex items-center gap-2">
                              <i className="fas fa-tag text-green-600"></i>
                              <span className="font-bold">Topic:</span> 
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{ack.topic}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
