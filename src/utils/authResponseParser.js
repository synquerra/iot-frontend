/**
 * Auth Response Parser Utility
 * 
 * Parses and validates authentication responses from the signin API.
 * Extracts user type and IMEI assignments for device filtering.
 * Provides persistent storage with encryption for user context.
 */

// Storage keys
const STORAGE_KEY = 'user_context';
const STORAGE_VERSION = '1.0';
const CONTEXT_EXPIRY_HOURS = 24;

// Simple encryption key derivation (in production, use more secure methods)
const ENCRYPTION_KEY = 'user-context-encryption-key-v1';

/**
 * Validates an IMEI string format
 * @param {string} imei - The IMEI string to validate
 * @returns {boolean} - True if IMEI is valid (15 numeric digits), false otherwise
 */
export function validateIMEI(imei) {
  if (typeof imei !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmed = imei.trim();

  // Check if exactly 15 characters
  if (trimmed.length !== 15) {
    return false;
  }

  // Check if all characters are numeric
  return /^\d{15}$/.test(trimmed);
}

/**
 * Parses a comma-separated IMEI string into an array of individual IMEIs
 * @param {string} imeiString - Comma-separated IMEI values or single IMEI
 * @returns {string[]} - Array of trimmed IMEI strings
 */
export function parseIMEIString(imeiString) {
  if (typeof imeiString !== 'string') {
    return [];
  }

  // Handle empty string
  if (imeiString.trim() === '') {
    return [];
  }

  // Split by comma and trim each IMEI
  const imeis = imeiString
    .split(',')
    .map(imei => imei.trim())
    .filter(imei => imei.length > 0);

  return imeis;
}

/**
 * Parses the authentication response and extracts user context
 * @param {Object} response - The authentication response from signin API
 * @returns {Object} - Parsed user context with validated IMEIs
 */
export function parseAuthResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid auth response: response must be an object');
  }

  // Extract required fields
  const {
    uniqueId,
    userType,
    imei,
    email,
    tokens,
    lastLoginAt,
  } = response;

  // Validate required fields
  if (!uniqueId) {
    throw new Error('Invalid auth response: missing uniqueId');
  }

  if (!userType) {
    throw new Error('Invalid auth response: missing userType');
  }

  if (userType !== 'PARENTS' && userType !== 'ADMIN') {
    throw new Error(`Invalid auth response: userType must be "PARENTS" or "ADMIN", got "${userType}"`);
  }

  if (!email) {
    throw new Error('Invalid auth response: missing email');
  }

  if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
    throw new Error('Invalid auth response: missing or invalid tokens');
  }

  // Parse IMEI string
  const imeiString = imei || '';
  const parsedIMEIs = parseIMEIString(imeiString);

  // Validate each IMEI and filter out invalid ones
  const validIMEIs = [];
  const invalidIMEIs = [];

  parsedIMEIs.forEach(imeiValue => {
    if (validateIMEI(imeiValue)) {
      validIMEIs.push(imeiValue);
    } else {
      invalidIMEIs.push(imeiValue);
    }
  });

  // Log warnings for invalid IMEIs
  if (invalidIMEIs.length > 0) {
    console.warn(
      `Auth response contained ${invalidIMEIs.length} invalid IMEI(s):`,
      invalidIMEIs,
      '- These will be excluded from filtering'
    );
  }

  // For PARENTS users with no valid IMEIs, log a warning
  if (userType === 'PARENTS' && validIMEIs.length === 0) {
    console.warn(
      'PARENTS user has no valid IMEIs assigned - user will see no devices'
    );
  }

  // Return structured user context
  return {
    uniqueId,
    userType,
    imeis: validIMEIs,
    email,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    lastLoginAt: lastLoginAt || new Date().toISOString(),
  };
}

/**
 * Simple XOR-based encryption for localStorage data
 * Note: This is basic obfuscation. For production, consider Web Crypto API.
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} - Base64 encoded encrypted text
 */
function encryptData(text, key) {
  try {
    const textBytes = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(key);
    
    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to base64
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts XOR-encrypted data
 * @param {string} encryptedText - Base64 encoded encrypted text
 * @param {string} key - Encryption key
 * @returns {string} - Decrypted text
 */
function decryptData(encryptedText, key) {
  try {
    // Decode from base64
    const encryptedBytes = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const keyBytes = new TextEncoder().encode(key);
    
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Checks if storage is available (localStorage or sessionStorage)
 * @param {Storage} storage - Storage object to test
 * @returns {boolean} - True if storage is available
 */
function isStorageAvailable(storage) {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the appropriate storage mechanism (localStorage with fallback to sessionStorage)
 * @returns {Storage|null} - Storage object or null if none available
 */
function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try localStorage first
  if (isStorageAvailable(window.localStorage)) {
    return window.localStorage;
  }

  // Fallback to sessionStorage
  if (isStorageAvailable(window.sessionStorage)) {
    console.warn('localStorage unavailable, falling back to sessionStorage');
    return window.sessionStorage;
  }

  console.error('No storage mechanism available');
  return null;
}

/**
 * Validates user context data structure
 * @param {Object} context - User context to validate
 * @returns {boolean} - True if valid
 */
function validateUserContext(context) {
  if (!context || typeof context !== 'object') {
    return false;
  }

  // Check required fields
  if (!context.uniqueId || typeof context.uniqueId !== 'string') {
    return false;
  }

  if (!context.userType || (context.userType !== 'PARENTS' && context.userType !== 'ADMIN')) {
    return false;
  }

  if (!Array.isArray(context.imeis)) {
    return false;
  }

  if (!context.email || typeof context.email !== 'string') {
    return false;
  }

  if (!context.tokens || !context.tokens.accessToken || !context.tokens.refreshToken) {
    return false;
  }

  return true;
}

/**
 * Persists user context to storage with encryption
 * @param {Object} userContext - Parsed user context from parseAuthResponse
 * @returns {boolean} - True if successfully persisted, false otherwise
 */
export function persistUserContext(userContext) {
  try {
    // Validate input
    if (!validateUserContext(userContext)) {
      console.error('Invalid user context: cannot persist');
      return false;
    }

    const storage = getStorage();
    if (!storage) {
      console.error('Storage unavailable: cannot persist user context');
      return false;
    }

    // Create persisted data structure
    const now = Date.now();
    const expiresAt = now + (CONTEXT_EXPIRY_HOURS * 60 * 60 * 1000);

    const persistedData = {
      version: STORAGE_VERSION,
      encrypted: true,
      data: {
        uniqueId: userContext.uniqueId,
        userType: userContext.userType,
        imeis: userContext.imeis,
        email: userContext.email,
        // Note: tokens are stored separately in existing localStorage keys
        // We don't duplicate them here for security
      },
      timestamp: now,
      expiresAt: expiresAt,
    };

    // Serialize and encrypt
    const jsonString = JSON.stringify(persistedData);
    const encrypted = encryptData(jsonString, ENCRYPTION_KEY);

    // Store encrypted data
    storage.setItem(STORAGE_KEY, encrypted);

    console.log('User context persisted successfully');
    return true;
  } catch (error) {
    console.error('Failed to persist user context:', error);
    return false;
  }
}

/**
 * Loads user context from storage and validates it
 * @returns {Object|null} - Restored user context or null if unavailable/invalid
 */
export function loadUserContext() {
  try {
    const storage = getStorage();
    if (!storage) {
      console.warn('Storage unavailable: cannot load user context');
      return null;
    }

    // Retrieve encrypted data
    const encrypted = storage.getItem(STORAGE_KEY);
    if (!encrypted) {
      console.log('No persisted user context found');
      return null;
    }

    // Decrypt and parse
    const decrypted = decryptData(encrypted, ENCRYPTION_KEY);
    const persistedData = JSON.parse(decrypted);

    // Validate structure
    if (!persistedData || typeof persistedData !== 'object') {
      console.error('Invalid persisted data structure');
      clearPersistedContext();
      return null;
    }

    // Check version
    if (persistedData.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch: expected ${STORAGE_VERSION}, got ${persistedData.version}`);
      clearPersistedContext();
      return null;
    }

    // Check expiration
    const now = Date.now();
    if (persistedData.expiresAt && now > persistedData.expiresAt) {
      console.warn('Persisted user context has expired');
      clearPersistedContext();
      return null;
    }

    // Validate data
    const { data } = persistedData;
    if (!data || typeof data !== 'object') {
      console.error('Invalid persisted data content');
      clearPersistedContext();
      return null;
    }

    // Validate required fields
    if (!data.uniqueId || !data.userType || !Array.isArray(data.imeis) || !data.email) {
      console.error('Missing required fields in persisted data');
      clearPersistedContext();
      return null;
    }

    // Validate userType
    if (data.userType !== 'PARENTS' && data.userType !== 'ADMIN') {
      console.error('Invalid userType in persisted data');
      clearPersistedContext();
      return null;
    }

    // Return restored context (without tokens - those are managed separately)
    console.log('User context loaded successfully');
    return {
      uniqueId: data.uniqueId,
      userType: data.userType,
      imeis: data.imeis,
      email: data.email,
      // Tokens should be retrieved from existing localStorage keys
      tokens: null, // Caller should populate this
    };
  } catch (error) {
    console.error('Failed to load user context:', error);
    // Clear corrupted data
    clearPersistedContext();
    return null;
  }
}

/**
 * Clears persisted user context from storage
 * @returns {boolean} - True if successfully cleared
 */
export function clearPersistedContext() {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }

    storage.removeItem(STORAGE_KEY);
    console.log('Persisted user context cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear persisted context:', error);
    return false;
  }
}
