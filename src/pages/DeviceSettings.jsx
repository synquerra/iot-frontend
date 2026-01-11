import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { sendDeviceCommand } from "../utils/deviceCommandAPI";
import { ContactInput } from "../components/ContactInput";
import { Notification } from "../components/Notification";

/**
 * Validates contact phone number fields
 * @param {Object} contacts - Contact state object with phonenum1, phonenum2, controlroomnum
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
function validateContacts(contacts) {
  const errors = {};
  
  if (!contacts.phonenum1 || contacts.phonenum1.trim() === '') {
    errors.phonenum1 = 'Primary contact is required';
  }
  
  if (!contacts.phonenum2 || contacts.phonenum2.trim() === '') {
    errors.phonenum2 = 'Secondary contact is required';
  }
  
  if (!contacts.controlroomnum || contacts.controlroomnum.trim() === '') {
    errors.controlroomnum = 'Control room contact is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export default function DeviceSettings() {
  const { imei: routeImei } = useParams();
  const navigate = useNavigate();
  
  // Use route IMEI or default for testing
  const imei = routeImei || "862942074957887";

  // Contact state management
  const [contacts, setContacts] = useState({
    phonenum1: '',
    phonenum2: '',
    controlroomnum: ''
  });

  const [contactErrors, setContactErrors] = useState({
    phonenum1: '',
    phonenum2: '',
    controlroomnum: ''
  });

  const [notification, setNotification] = useState({
    type: '', // 'success' | 'error' | ''
    message: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handles saving contact settings to the device
   * Validates contacts, calls device command API, and manages UI state
   */
  const handleSaveContacts = async () => {
    // Step 1: Validate inputs
    const { isValid, errors } = validateContacts(contacts);
    
    if (!isValid) {
      setContactErrors(errors);
      setNotification({
        type: 'error',
        message: 'Please fill in all required contact fields'
      });
      return;
    }
    
    // Clear previous errors
    setContactErrors({
      phonenum1: '',
      phonenum2: '',
      controlroomnum: ''
    });
    
    // Step 2: Set loading state
    setIsSaving(true);
    setNotification({ type: '', message: '' });
    
    try {
      // Step 3: Call device command API
      await sendDeviceCommand(imei, 'SET_CONTACTS', {
        phonenum1: contacts.phonenum1.trim(),
        phonenum2: contacts.phonenum2.trim(),
        controlroomnum: contacts.controlroomnum.trim()
      });
      
      // Step 4: Handle success
      setNotification({
        type: 'success',
        message: `Contact settings saved successfully for device ${imei}`
      });
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);
      
    } catch (error) {
      // Step 5: Handle errors
      let errorMessage = 'Failed to save contact settings';
      
      if (error.code === 'VALIDATION_ERROR') {
        errorMessage = `Validation error: ${error.message}`;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error: Unable to reach the device. Please check your connection and try again.';
      } else if (error.code === 'API_ERROR') {
        errorMessage = `API error (${error.details?.statusCode || 'unknown'}): ${error.message}`;
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      // Step 6: Clear loading state
      setIsSaving(false);
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
                  Contact Settings
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                Emergency Contacts
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed mb-3">
                Configure emergency contact numbers for device
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

      {/* Emergency Contacts Section */}
      <Card variant="glass" colorScheme="blue" padding="lg">
        <Card.Content>
          <h3 className="text-blue-300 text-lg font-semibold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact Numbers
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ContactInput
                label="Primary Contact"
                value={contacts.phonenum1}
                onChange={(e) => setContacts({ ...contacts, phonenum1: e.target.value })}
                error={contactErrors.phonenum1}
                disabled={isSaving}
                placeholder="Enter primary contact number"
              />
              <ContactInput
                label="Secondary Contact"
                value={contacts.phonenum2}
                onChange={(e) => setContacts({ ...contacts, phonenum2: e.target.value })}
                error={contactErrors.phonenum2}
                disabled={isSaving}
                placeholder="Enter secondary contact number"
              />
              <ContactInput
                label="Control Room Contact"
                value={contacts.controlroomnum}
                onChange={(e) => setContacts({ ...contacts, controlroomnum: e.target.value })}
                error={contactErrors.controlroomnum}
                disabled={isSaving}
                placeholder="Enter control room number"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                colorScheme="slate"
                size="md"
                onClick={() => navigate(`/devices/${imei}`)}
                className="min-w-[150px]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
              <Button
                variant="glass"
                colorScheme="green"
                size="md"
                onClick={handleSaveContacts}
                disabled={isSaving}
                className="min-w-[180px]"
              >
                {isSaving ? (
                  <Loading type="spinner" size="sm" color="white" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Contacts
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
