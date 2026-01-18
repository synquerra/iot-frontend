import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadUserContext, clearPersistedContext } from '../utils/authResponseParser';
import { isTokenExpired } from '../utils/auth';

/**
 * User Context State Interface
 * @typedef {Object} UserContextState
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {"PARENTS"|"ADMIN"|null} userType - User type for filtering
 * @property {string[]} imeis - Array of assigned IMEIs
 * @property {string|null} uniqueId - User's unique identifier
 * @property {string|null} email - User's email address
 * @property {string|null} firstName - User's first name
 * @property {string|null} middleName - User's middle name
 * @property {string|null} lastName - User's last name
 * @property {string|null} mobile - User's mobile number
 * @property {Object} tokens - Authentication tokens
 * @property {string|null} tokens.accessToken - Access token
 * @property {string|null} tokens.refreshToken - Refresh token
 */

/**
 * Initial state for user context
 */
const initialState = {
  isAuthenticated: false,
  userType: null,
  imeis: [],
  uniqueId: null,
  email: null,
  firstName: null,
  middleName: null,
  lastName: null,
  mobile: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

// Create the context
const UserContext = createContext(undefined);

/**
 * UserContext Provider Component
 * Manages user authentication state and device filtering configuration
 * Restores user context from persistent storage on mount
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserContextProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [isRestoring, setIsRestoring] = useState(true);

  /**
   * Set user context with parsed authentication data
   * @param {Object} context - Parsed user context from auth response
   * @param {string} context.uniqueId - User's unique identifier
   * @param {"PARENTS"|"ADMIN"} context.userType - User type
   * @param {string[]} context.imeis - Array of validated IMEIs
   * @param {string} context.email - User's email
   * @param {string} context.firstName - User's first name
   * @param {string} context.middleName - User's middle name
   * @param {string} context.lastName - User's last name
   * @param {string} context.mobile - User's mobile number
   * @param {Object} context.tokens - Authentication tokens
   * @param {string} context.tokens.accessToken - Access token
   * @param {string} context.tokens.refreshToken - Refresh token
   */
  const setUserContext = useCallback((context) => {
    setState({
      isAuthenticated: true,
      userType: context.userType,
      imeis: context.imeis || [],
      uniqueId: context.uniqueId,
      email: context.email,
      firstName: context.firstName || null,
      middleName: context.middleName || null,
      lastName: context.lastName || null,
      mobile: context.mobile || null,
      tokens: {
        accessToken: context.tokens.accessToken,
        refreshToken: context.tokens.refreshToken,
      },
    });
  }, []);

  /**
   * Update tokens without clearing user context
   * Used during token refresh to maintain filter configuration
   * @param {Object} tokens - New authentication tokens
   * @param {string} tokens.accessToken - New access token
   * @param {string} tokens.refreshToken - New refresh token
   */
  const updateTokens = useCallback((tokens) => {
    setState(prevState => ({
      ...prevState,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    }));
  }, []);

  /**
   * Clear user context (on logout or auth failure)
   * Resets all state to initial values
   */
  const clearUserContext = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Get current user context state
   * @returns {UserContextState} Current user context
   */
  const getUserContext = useCallback(() => {
    return state;
  }, [state]);

  /**
   * Check if current user is an ADMIN
   * @returns {boolean} True if user type is ADMIN
   */
  const isAdmin = useCallback(() => {
    return state.userType === 'ADMIN';
  }, [state.userType]);

  /**
   * Check if current user is a PARENTS user
   * @returns {boolean} True if user type is PARENTS
   */
  const isParent = useCallback(() => {
    return state.userType === 'PARENTS';
  }, [state.userType]);

  /**
   * Restore user context from persistent storage on mount
   * Validates tokens and handles expired/invalid data gracefully
   */
  useEffect(() => {
    const restoreUserContext = () => {
      try {
        console.log('Attempting to restore user context from storage...');
        
        // Load persisted user context
        const persistedContext = loadUserContext();
        
        if (!persistedContext) {
          console.log('No valid persisted context found');
          setIsRestoring(false);
          return;
        }

        // Retrieve tokens from localStorage (stored separately)
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // Validate tokens exist
        if (!accessToken || !refreshToken) {
          console.warn('Tokens not found in localStorage, clearing persisted context');
          clearPersistedContext();
          setIsRestoring(false);
          return;
        }

        // Validate access token is not expired
        if (isTokenExpired(accessToken)) {
          console.warn('Access token expired, clearing persisted context');
          clearPersistedContext();
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userEmail');
          setIsRestoring(false);
          return;
        }

        // Restore complete user context with tokens
        const restoredContext = {
          ...persistedContext,
          tokens: {
            accessToken,
            refreshToken,
          },
        };

        // Apply restored context
        setState({
          isAuthenticated: true,
          userType: restoredContext.userType,
          imeis: restoredContext.imeis || [],
          uniqueId: restoredContext.uniqueId,
          email: restoredContext.email,
          firstName: restoredContext.firstName || null,
          middleName: restoredContext.middleName || null,
          lastName: restoredContext.lastName || null,
          mobile: restoredContext.mobile || null,
          tokens: {
            accessToken: restoredContext.tokens.accessToken,
            refreshToken: restoredContext.tokens.refreshToken,
          },
        });

        console.log('User context restored successfully:', {
          userType: restoredContext.userType,
          imeiCount: restoredContext.imeis?.length || 0,
          email: restoredContext.email,
        });
      } catch (error) {
        console.error('Error restoring user context:', error);
        // Clear any corrupted data
        clearPersistedContext();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
      } finally {
        setIsRestoring(false);
      }
    };

    restoreUserContext();
  }, []); // Run once on mount

  const value = {
    // State
    ...state,
    isRestoring,
    // Actions
    setUserContext,
    updateTokens,
    clearUserContext,
    getUserContext,
    // Helper methods
    isAdmin,
    isParent,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to access user context
 * @returns {UserContextState & Object} User context state and actions
 * @throws {Error} If used outside of UserContextProvider
 */
export const useUserContext = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  
  return context;
};

export default UserContext;
