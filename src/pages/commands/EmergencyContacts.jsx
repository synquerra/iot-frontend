import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../../design-system/components";
import { cn } from "../../design-system/utils/cn";
import { sendDeviceCommand } from "../../utils/deviceCommandAPI";
import { ContactInput } from "../../components/ContactInput";
import { Notification } from "../../components/Notification";
import { useUserContext } from "../../contexts/UserContext";
import { useDeviceFilter } from "../../hooks/useDeviceFilter";
import { listDevicesFiltered } from "../../utils/deviceFiltered";
import CommandHistory from "../../components/CommandHistory";
import { getDeviceDisplayNameWithMaskedImei } from "../../utils/deviceDisplay";

export default function EmergencyContacts() {
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

  const [contacts, setContacts] = useState({
    phonenum1: '',
    phonenum2: '',
    controlroomnum: ''
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

  const handleContactChange = (field, value) => {
    setContacts(prev => ({
      ...prev,
      [field]: value
    }));
    
    setParamErrors(prev => ({
      ...prev,
      [field]: ''
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

    const { phonenum1, phonenum2, controlroomnum } = contacts;
    
    if (!phonenum1 || !phonenum2 || !controlroomnum) {
      setNotification({
        type: 'error',
        message: 'All three contacts are required'
      });
      return;
    }

    setCommandLoading(true);
    setNotification({ type: '', message: '' });

    try {
      await sendDeviceCommand(imei, 'SET_CONTACTS', contacts);

      setNotification({
        type: 'success',
        message: 'Emergency contacts updated successfully'
      });

      setContacts({
        phonenum1: '',
        phonenum2: '',
        controlroomnum: ''
      });

      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);

      // Trigger auto-refresh after 2 seconds
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 2000);

    } catch (error) {
      let errorMessage = 'Failed to update contacts';

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
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Emergency Contacts
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Emergency Contacts
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                Configure emergency contact numbers for the device
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
                        {getDeviceDisplayName(device)}
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 rounded-t-lg">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-phone text-white"></i>
            </div>
            Emergency Contacts Configuration
          </h3>
          <p className="text-green-100 text-xs sm:text-sm mt-1">Set up emergency contact numbers</p>
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

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-6">
            <h4 className="text-gray-800 font-bold text-base flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-info text-white text-xs"></i>
              </div>
              Contact Information
              <span className="ml-auto text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-semibold">All Required</span>
            </h4>
            <p className="text-gray-600 text-xs ml-10">All three contact numbers are mandatory for emergency situations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <ContactInput
              label="Primary Contact"
              value={contacts.phonenum1}
              onChange={(e) => handleContactChange('phonenum1', e.target.value)}
              error={paramErrors.phonenum1}
              disabled={commandLoading}
              placeholder="e.g., +1234567890"
            />
            
            <ContactInput
              label="Secondary Contact"
              value={contacts.phonenum2}
              onChange={(e) => handleContactChange('phonenum2', e.target.value)}
              error={paramErrors.phonenum2}
              disabled={commandLoading}
              placeholder="e.g., +1234567890"
            />
            
            <ContactInput
              label="Control Room Contact"
              value={contacts.controlroomnum}
              onChange={(e) => handleContactChange('controlroomnum', e.target.value)}
              error={paramErrors.controlroomnum}
              disabled={commandLoading}
              placeholder="e.g., +1234567890"
            />
          </div>

          <div className="flex justify-end pt-6 border-t-2 border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={commandLoading}
              className={cn(
                "px-8 py-3 rounded-lg font-bold transition-all duration-200 min-w-[200px]",
                "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg",
                "hover:from-green-700 hover:to-green-800 hover:shadow-xl transform hover:-translate-y-0.5",
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
                  Update Contacts
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 pb-6">
        <CommandHistory imei={imei} commandType="SET_CONTACTS" triggerRefresh={refreshTrigger} />
      </div>
    </div>
  );
}
