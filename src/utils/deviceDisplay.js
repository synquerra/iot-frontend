// src/utils/deviceDisplay.js

/**
 * Mask IMEI by showing only last 4 digits
 * Example: 862942074957887 -> ***********7887
 */
export function maskImei(imei) {
  if (!imei || typeof imei !== 'string') {
    return '***';
  }
  
  const lastFour = imei.slice(-4);
  const masked = '*'.repeat(Math.max(0, imei.length - 4));
  return masked + lastFour;
}

/**
 * Get display name for a device
 * Shows studentName if available, otherwise shows masked IMEI
 * @param {Object} device - Device object with studentName and imei properties
 * @returns {string} Display name
 */
export function getDeviceDisplayName(device) {
  if (!device) {
    return 'Unknown Device';
  }
  
  // If studentName is available and not empty, use it
  if (device.studentName && device.studentName.trim()) {
    return device.studentName;
  }
  
  // Fallback to masked IMEI
  return maskImei(device.imei);
}

/**
 * Get display name with masked IMEI in parentheses
 * Example: "Abhinay Kumar (***7887)"
 * @param {Object} device - Device object with studentName and imei properties
 * @returns {string} Display name with masked IMEI
 */
export function getDeviceDisplayNameWithMaskedImei(device) {
  if (!device) {
    return 'Unknown Device';
  }
  
  const maskedImei = maskImei(device.imei);
  
  // If studentName is available, show both
  if (device.studentName && device.studentName.trim()) {
    return `${device.studentName} (${maskedImei})`;
  }
  
  // Otherwise just show masked IMEI
  return maskedImei;
}
