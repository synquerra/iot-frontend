import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../../design-system/components";
import { cn } from "../../design-system/utils/cn";
import { sendDeviceCommand } from "../../utils/deviceCommandAPI";
import { Notification } from "../../components/Notification";
import { useUserContext } from "../../contexts/UserContext";
import { useDeviceFilter } from "../../hooks/useDeviceFilter";
import { listDevicesFiltered } from "../../utils/deviceFiltered";

export default function SimpleCommandPage({ 
  commandType, 
  title, 
  description, 
  badgeColor = "blue",
  headerColor = "blue",
  icon = "fa-terminal",
  infoText,
  buttonText,
  buttonIcon = "fa-bolt",
  successMessage,
  onImeiChange,
  onCommandSuccess
}) {
  const navigate = useNavigate();
  const { isAdmin } = useUserContext();
  const { filterDevices } = useDeviceFilter();
  
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState("");
  const imei = selectedImei;

  const [notification, setNotification] = useState({
    type: '',
    message: ''
  });

  const [commandLoading, setCommandLoading] = useState(false);

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

  // Notify parent component about IMEI changes
  useEffect(() => {
    if (onImeiChange) {
      onImeiChange(imei);
    }
  }, [imei, onImeiChange]);

  const handleSubmit = async () => {
    if (!imei || imei.trim() === '') {
      setNotification({
        type: 'error',
        message: 'IMEI is required. Please select a device'
      });
      return;
    }

    setCommandLoading(true);
    setNotification({ type: '', message: '' });

    try {
      await sendDeviceCommand(imei, commandType, {});

      setNotification({
        type: 'success',
        message: successMessage || 'Command sent successfully'
      });

      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);

      // Notify parent component about successful command
      if (onCommandSuccess) {
        onCommandSuccess();
      }

    } catch (error) {
      let errorMessage = 'Failed to send command';

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

  const colorClasses = {
    blue: {
      badge: "bg-blue-100 text-blue-700",
      header: "from-blue-600 to-blue-700",
      headerText: "text-blue-100",
      info: "from-blue-50 to-indigo-50 border-blue-200",
      infoBg: "bg-blue-600",
      button: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
    },
    green: {
      badge: "bg-green-100 text-green-700",
      header: "from-green-600 to-green-700",
      headerText: "text-green-100",
      info: "from-green-50 to-emerald-50 border-green-200",
      infoBg: "bg-green-600",
      button: "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
    },
    red: {
      badge: "bg-red-100 text-red-700",
      header: "from-red-600 to-red-700",
      headerText: "text-red-100",
      info: "from-red-50 to-orange-50 border-red-200",
      infoBg: "bg-red-600",
      button: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
    },
    purple: {
      badge: "bg-purple-100 text-purple-700",
      header: "from-purple-600 to-purple-700",
      headerText: "text-purple-100",
      info: "from-purple-50 to-indigo-50 border-purple-200",
      infoBg: "bg-purple-600",
      button: "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
    },
    orange: {
      badge: "bg-orange-100 text-orange-700",
      header: "from-orange-600 to-orange-700",
      headerText: "text-orange-100",
      info: "from-orange-50 to-amber-50 border-orange-200",
      infoBg: "bg-orange-600",
      button: "from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
    }
  };

  const colors = colorClasses[headerColor] || colorClasses.blue;

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
                <span className={`px-3 py-1 ${colors.badge} rounded text-xs font-medium`}>
                  {title}
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                {description}
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
        <div className={`bg-gradient-to-r ${colors.header} px-4 sm:px-6 py-4 rounded-t-lg`}>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className={`fas ${icon} text-white`}></i>
            </div>
            {title}
          </h3>
          <p className={`${colors.headerText} text-xs sm:text-sm mt-1`}>{description}</p>
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

          <div className={`bg-gradient-to-r ${colors.info} p-6 rounded-lg border mb-6`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${colors.infoBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className="fas fa-info text-white text-xl"></i>
              </div>
              <div>
                <h4 className="text-gray-800 font-bold text-base mb-2">About This Command</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {infoText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t-2 border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={commandLoading || !imei}
              className={cn(
                "px-8 py-3 rounded-lg font-bold transition-all duration-200 min-w-[200px]",
                `bg-gradient-to-r ${colors.button} text-white shadow-lg`,
                "hover:shadow-xl transform hover:-translate-y-0.5",
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
                  <i className={`fas ${buttonIcon}`}></i>
                  {buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
