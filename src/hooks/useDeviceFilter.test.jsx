import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeviceFilter } from './useDeviceFilter';
import { UserContextProvider, useUserContext } from '../contexts/UserContext';
import React from 'react';

/**
 * Basic unit tests for useDeviceFilter hook
 * Tests core filtering logic for ADMIN and PARENTS users
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1
 */

// Helper to render hook with UserContext
const renderWithContext = (contextValue) => {
  const InnerWrapper = ({ children }) => {
    const { setUserContext } = useUserContext();
    
    // Set the context value if provided
    React.useEffect(() => {
      if (contextValue && contextValue.isAuthenticated) {
        setUserContext({
          uniqueId: contextValue.uniqueId || 'test-user',
          userType: contextValue.userType,
          imeis: contextValue.imeis,
          email: contextValue.email || 'test@example.com',
          tokens: {
            accessToken: 'test-token',
            refreshToken: 'test-refresh',
          },
        });
      }
    }, [setUserContext]);
    
    return <>{children}</>;
  };
  
  const Wrapper = ({ children }) => (
    <UserContextProvider>
      <InnerWrapper>{children}</InnerWrapper>
    </UserContextProvider>
  );
  
  return renderHook(() => useDeviceFilter(), { wrapper: Wrapper });
};

describe('useDeviceFilter', () => {
  const mockDevices = [
    { topic: 'device1', imei: '123456789012345' },
    { topic: 'device2', imei: '987654321098765' },
    { topic: 'device3', imei: '111111111111111' },
  ];

  describe('filterDevices', () => {
    it('should return empty array when devices is not an array', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
      });

      expect(result.current.filterDevices(null)).toEqual([]);
      expect(result.current.filterDevices(undefined)).toEqual([]);
      expect(result.current.filterDevices('not an array')).toEqual([]);
    });

    it('should return empty array when not authenticated', () => {
      const { result } = renderWithContext({
        isAuthenticated: false,
        userType: null,
        imeis: [],
      });

      expect(result.current.filterDevices(mockDevices)).toEqual([]);
    });
  });

  describe('getFilterConfig', () => {
    it('should return current filter configuration', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
      });

      const config = result.current.getFilterConfig();
      expect(config).toHaveProperty('userType');
      expect(config).toHaveProperty('allowedIMEIs');
    });
  });

  describe('shouldFilterDevices', () => {
    it('should return true for authenticated PARENTS user', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
      });

      expect(result.current.shouldFilterDevices()).toBe(true);
    });

    it('should return false for ADMIN user', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
      });

      expect(result.current.shouldFilterDevices()).toBe(false);
    });

    it('should return false when not authenticated', () => {
      const { result } = renderWithContext({
        isAuthenticated: false,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
      });

      expect(result.current.shouldFilterDevices()).toBe(false);
    });
  });

  describe('Edge Cases - Requirements 2.3, 2.4', () => {
    it('should return empty array for PARENTS user with no IMEIs', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: [],
      });

      const filtered = result.current.filterDevices(mockDevices);
      expect(filtered).toEqual([]);
      expect(filtered.length).toBe(0);
    });

    it('should return empty array for PARENTS user with null IMEIs', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: null,
      });

      const filtered = result.current.filterDevices(mockDevices);
      expect(filtered).toEqual([]);
    });

    it('should return empty array when device list is empty', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['123456789012345'],
      });

      const filtered = result.current.filterDevices([]);
      expect(filtered).toEqual([]);
      expect(filtered.length).toBe(0);
    });

    it('should return empty array for ADMIN user when device list is empty', () => {
      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'ADMIN',
        imeis: [],
      });

      const filtered = result.current.filterDevices([]);
      expect(filtered).toEqual([]);
    });

    it('should perform case-insensitive IMEI matching - lowercase device IMEI', () => {
      const devicesWithMixedCase = [
        { topic: 'device1', imei: '123456789012345' },
        { topic: 'device2', imei: 'abc456789012345' },
      ];

      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['ABC456789012345'], // Uppercase in user context
      });

      const filtered = result.current.filterDevices(devicesWithMixedCase);
      expect(filtered.length).toBe(1);
      expect(filtered[0].topic).toBe('device2');
      expect(filtered[0].imei).toBe('abc456789012345');
    });

    it('should perform case-insensitive IMEI matching - uppercase device IMEI', () => {
      const devicesWithMixedCase = [
        { topic: 'device1', imei: '123456789012345' },
        { topic: 'device2', imei: 'XYZ456789012345' },
      ];

      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['xyz456789012345'], // Lowercase in user context
      });

      const filtered = result.current.filterDevices(devicesWithMixedCase);
      expect(filtered.length).toBe(1);
      expect(filtered[0].topic).toBe('device2');
      expect(filtered[0].imei).toBe('XYZ456789012345');
    });

    it('should perform case-insensitive IMEI matching - mixed case both sides', () => {
      const devicesWithMixedCase = [
        { topic: 'device1', imei: 'AbC123456789012' },
        { topic: 'device2', imei: 'XyZ987654321098' },
      ];

      const { result } = renderWithContext({
        isAuthenticated: true,
        userType: 'PARENTS',
        imeis: ['aBc123456789012', 'xYz987654321098'], // Different case in user context
      });

      const filtered = result.current.filterDevices(devicesWithMixedCase);
      expect(filtered.length).toBe(2);
      expect(filtered[0].topic).toBe('device1');
      expect(filtered[1].topic).toBe('device2');
    });
  });
});
