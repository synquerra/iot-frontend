import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../../design-system/components";
import { cn } from "../../design-system/utils/cn";
import { sendDeviceCommand } from "../../utils/deviceCommandAPI";
import { validateParams } from "../../utils/deviceCommandValidation";
import { Notification } from "../../components/Notification";
import { useUserContext } from "../../contexts/UserContext";
import { useDeviceFilter } from "../../hooks/useDeviceFilter";
import { listDevicesFiltered } from "../../utils/deviceFiltered";
import CommandHistory from "../../components/CommandHistory";

export default function DeviceSettingsConfig() {
  const navigate = useNavigate();
  const { isAdmin } = useUserContext();
  const { filterDevices } = useDeviceFilter();
  
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState("");
  const imei = selectedImei;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [notification, setNotification] = useState({
    type: '',
    message: ''
  });

  const [settings, setSettings] = useState({
    NormalSendingInterval: '',
    SOSSendingInterval: '',
    NormalScanningInterval: '',
    AirplaneInterval: '',
    TemperatureLimit: '',
    SpeedLimit: '',
    LowbatLimit: ''
  });

  const [commandLoading, setCommandLoading] = useState(false);
  const [paramErrors, setParamErrors] = useState({});

  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      try {
        const result = await listDevicesFiltered();
        const devicesList = result.full || result.devices || [];
        setDevices(devicesList);
        
        if (!isAdmin() && devicesList.length === 1) {
          setSelectedImei(devicesList[0].imei);
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };
    
    fetchDevices();
  }, [isAdmin]);

  const filteredDevices = useMemo(() => {
    return filterDevices(devices);
  }, [devices, filterDevices]);

  const shouldShowDeviceFilter = useMemo(() => {
    if (isAdmin()) {
      return true;
    }
    return filteredDevices.length >= 2;
  }, [isAdmin, filteredDevices.length]);

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    setParamErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateParameter = (paramName, value) => {
    if (!value || value.trim() === '') {
      return '';
    }
    
    const params = { [paramName]: value };
    const result = validateParams('DEVICE_SETTINGS', params);
    
    if (!result.valid) {
      return result.error;
    }
    
    return '';
  };

  const handleParameterBlur = (paramName) => {
    const value = settings[paramName];
    const error = validateParameter(paramName, value);
    
    setParamErrors(prev => ({
      ...prev,
      [paramName]: error
    }));
  };

  const handleSubmit = async () => {
    if (!imei || imei.trim() === '') {
      setNotification({
        type: 'error',
        message: 'IMEI is required. Please select a device'
      });
      return;
    }

    const nonEmptyParams = Object.entries(settings)
      .filter(([_, value]) => value && value.trim() !== '');
    
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

    const commandParams = Object.entries(settings)
      .filter(([_, value]) => value && value.trim() !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    if (Object.keys(commandParams).length === 0) {
      setNotification({
        type: 'error',
        message: 'Please provide at least one setting parameter'
      });
      return;
    }

    setCommandLoading(true);
    setNotification({ type: '', message: '' });

    try {
      await sendDeviceCommand(imei, 'DEVICE_SETTINGS', commandParams);

      setNotification({
        type: 'success',
        message: 'Device settings updated successfully'
      });

      setSettings({
        NormalSendingInterval: '',
        SOSSendingInterval: '',
        NormalScanningInterval: '',
        AirplaneInterval: '',
        TemperatureLimit: '',
        SpeedLimit: '',
        LowbatLimit: ''
      });

      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);

      // Trigger auto-refresh after 2 seconds
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 2000);

    } catch (error) {
      let errorMessage = 'Failed to update settings';

      if (error.code === 'VALIDATION_ERROR') {
        errorMessage = `Validation Error: ${error.message}`;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network Error: Please check your connection';
      } else if (error.code === 'API_ERROR') {
        errorMessage = `API Error: ${error.message}`;
      }

      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setCommandLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
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
                  <span>Back</span>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  Device Settings
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Device Settings Configuration
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                Configure device operational parameters
              </p>
              
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
                    style={{ minWidth: '250px' }}
                  >
                    <option value="">Select a device...</option>
                    {filteredDevices.map((device) => (
                      <option key={device.imei} value={device.imei}>
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
              </div>
              <div className="w-px h-16 bg-gray-300"></div>
              <div className="text-right">
                <div className="text-gray-500 text-sm">Device Status</div>
                <div className="text-green-600 text-xl font-bold">
                  {imei ? "Online" : "Not Selected"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-4 rounded-t-lg">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-cog text-white"></i>
            </div>
            Device Settings Parameters
          </h3>
          <p className="text-purple-100 text-xs sm:text-sm mt-1">Configure operational parameters</p>
        </div>

        <div className="p-4 sm:p-6">
          {notification.message && (
            <div className="mb-6">
              <Notification
                type={notification.type}
                message={notification.message}
                onDismiss={() => setNotification({ type: '', message: '' })}
              />
            </div>
          )}

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200 mb-6">
            <h4 className="text-gray-800 font-bold text-base flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-info text-white text-xs"></i>
              </div>
              Configuration Parameters
              <span className="ml-auto text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Optional</span>
            </h4>
            <p className="text-gray-600 text-xs ml-10">All parameters are optional. Provide only the settings you want to update.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="normalSendingInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-clock text-blue-600"></i>
                Normal Sending Interval
              </label>
              <input
                id="normalSendingInterval"
                type="text"
                value={settings.NormalSendingInterval}
                onChange={(e) => handleSettingChange('NormalSendingInterval', e.target.value)}
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
                style={{ color: '#1f2937', backgroundColor: 'white' }}
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

            <div className="space-y-2">
              <label htmlFor="sosSendingInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
                SOS Sending Interval
              </label>
              <input
                id="sosSendingInterval"
                type="text"
                value={settings.SOSSendingInterval}
                onChange={(e) => handleSettingChange('SOSSendingInterval', e.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="normalScanningInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-satellite-dish text-green-600"></i>
                Normal Scanning Interval
              </label>
              <input
                id="normalScanningInterval"
                type="text"
                value={settings.NormalScanningInterval}
                onChange={(e) => handleSettingChange('NormalScanningInterval', e.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="airplaneInterval" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-plane text-indigo-600"></i>
                Airplane Interval
              </label>
              <input
                id="airplaneInterval"
                type="text"
                value={settings.AirplaneInterval}
                onChange={(e) => handleSettingChange('AirplaneInterval', e.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="temperatureLimit" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-thermometer-half text-orange-600"></i>
                Temperature Limit
              </label>
              <input
                id="temperatureLimit"
                type="text"
                value={settings.TemperatureLimit}
                onChange={(e) => handleSettingChange('TemperatureLimit', e.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="speedLimit" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-tachometer-alt text-purple-600"></i>
                Speed Limit
              </label>
              <input
                id="speedLimit"
                type="text"
                value={settings.SpeedLimit}
                onChange={(e) => handleSettingChange('SpeedLimit', e.target.value)}
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

            <div className="space-y-2">
              <label htmlFor="lowbatLimit" className="text-gray-800 font-bold text-sm flex items-center gap-2">
                <i className="fas fa-battery-quarter text-yellow-600"></i>
                Low Battery Limit
              </label>
              <input
                id="lowbatLimit"
                type="text"
                value={settings.LowbatLimit}
                onChange={(e) => handleSettingChange('LowbatLimit', e.target.value)}
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

          <div className="flex justify-end pt-6 border-t-2 border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={commandLoading || Object.values(paramErrors).some(error => error !== '')}
              className={cn(
                "px-8 py-3 rounded-lg font-bold transition-all duration-200 min-w-[200px]",
                "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg",
                "hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transform hover:-translate-y-0.5",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:transform-none disabled:shadow-none",
                "flex items-center justify-center gap-2 text-base"
              )}
            >
              {commandLoading ? (
                <>
                  <Loading type="spinner" size="sm" color="white" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Update Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="DEVICE_SETTINGS" triggerRefresh={refreshTrigger} />
      </div>
    </div>
  );
}
