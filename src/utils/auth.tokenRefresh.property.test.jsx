/**
 * Property-Based Tests for Token Refresh Preservation
 * 
 * Feature: user-based-device-filtering
 * Property 9: Token Refresh Preservation
 * Validates: Requirements 5.3
 * 
 * Tests that token refresh operations preserve user context (userType and IMEIs)
 * and don't clear the device filter configuration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import { UserContextProvider, useUserContext } from '../contexts/UserContext.jsx';
import { refreshAccessToken } from './auth.js';

/**
 * Wrapper component for testing hooks
 */
function wrapper({ children }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}

describe('Token Refresh Preservation - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 9: Token Refresh Preservation
   * For any token refresh operation, the user's filter configuration (userType and IMEIs)
   * should remain unchanged before and after the refresh.
   * 
   * Feature: user-based-device-filtering, Property 9: Token Refresh Preservation
   * Validates: Requirements 5.3
   */
  it('should preserve user context (userType and IMEIs) during token refresh', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user context
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          imeis: fc.array(
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join('')),
            { minLength: 0, maxLength: 5 }
          ),
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        // Generate new tokens (simulating refresh response)
        fc.record({
          accessToken: fc.string({ minLength: 10, maxLength: 50 }),
          refreshToken: fc.string({ minLength: 10, maxLength: 50 })
        }),
        async (userContext, newTokens) => {
          // Render the hook with the provider
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Set initial user context (simulating login)
          act(() => {
            result.current.setUserContext(userContext);
          });
          
          // Store initial state for comparison
          const initialUserType = result.current.userType;
          const initialIMEIs = [...result.current.imeis];
          const initialUniqueId = result.current.uniqueId;
          const initialEmail = result.current.email;
          const initialIsAuthenticated = result.current.isAuthenticated;
          
          // Verify initial state is set correctly
          expect(initialUserType).toBe(userContext.userType);
          expect(initialIMEIs).toEqual(userContext.imeis);
          expect(initialUniqueId).toBe(userContext.uniqueId);
          expect(initialEmail).toBe(userContext.email);
          expect(initialIsAuthenticated).toBe(true);
          
          // Setup localStorage with tokens for refresh
          localStorage.setItem('accessToken', userContext.tokens.accessToken);
          localStorage.setItem('refreshToken', userContext.tokens.refreshToken);
          
          // Mock successful token refresh response
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              status: 'success',
              data: {
                tokens: {
                  accessToken: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken,
                },
              },
            }),
          });
          
          // Perform token refresh
          await act(async () => {
            const refreshedTokens = await refreshAccessToken();
            
            // Update tokens in context using updateTokens method
            result.current.updateTokens(refreshedTokens);
          });
          
          // Verify user context is preserved after token refresh
          expect(result.current.userType).toBe(initialUserType);
          expect(result.current.imeis).toEqual(initialIMEIs);
          expect(result.current.uniqueId).toBe(initialUniqueId);
          expect(result.current.email).toBe(initialEmail);
          expect(result.current.isAuthenticated).toBe(initialIsAuthenticated);
          
          // Verify tokens were updated
          expect(result.current.tokens.accessToken).toBe(newTokens.accessToken);
          expect(result.current.tokens.refreshToken).toBe(newTokens.refreshToken);
          
          // Verify tokens are different from original
          expect(result.current.tokens.accessToken).not.toBe(userContext.tokens.accessToken);
          expect(result.current.tokens.refreshToken).not.toBe(userContext.tokens.refreshToken);
          
          // Verify localStorage was updated with new tokens
          expect(localStorage.getItem('accessToken')).toBe(newTokens.accessToken);
          expect(localStorage.getItem('refreshToken')).toBe(newTokens.refreshToken);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Multiple token refreshes preserve context
   * Verifies that multiple consecutive token refreshes maintain user context integrity.
   */
  it('should preserve user context across multiple token refreshes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate user context
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          imeis: fc.array(
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join('')),
            { minLength: 1, maxLength: 3 }
          ),
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        // Generate array of new token sets (simulating multiple refreshes)
        fc.array(
          fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (userContext, tokenRefreshes) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Set initial user context
          act(() => {
            result.current.setUserContext(userContext);
          });
          
          // Store initial filter configuration
          const initialUserType = result.current.userType;
          const initialIMEIs = [...result.current.imeis];
          const initialUniqueId = result.current.uniqueId;
          const initialEmail = result.current.email;
          
          // Setup initial tokens in localStorage
          localStorage.setItem('accessToken', userContext.tokens.accessToken);
          localStorage.setItem('refreshToken', userContext.tokens.refreshToken);
          
          // Perform multiple token refreshes
          for (const newTokens of tokenRefreshes) {
            // Mock successful refresh response
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                status: 'success',
                data: {
                  tokens: {
                    accessToken: newTokens.accessToken,
                    refreshToken: newTokens.refreshToken,
                  },
                },
              }),
            });
            
            // Perform refresh
            await act(async () => {
              const refreshedTokens = await refreshAccessToken();
              result.current.updateTokens(refreshedTokens);
            });
            
            // Verify context is still preserved after each refresh
            expect(result.current.userType).toBe(initialUserType);
            expect(result.current.imeis).toEqual(initialIMEIs);
            expect(result.current.uniqueId).toBe(initialUniqueId);
            expect(result.current.email).toBe(initialEmail);
            expect(result.current.isAuthenticated).toBe(true);
            
            // Verify tokens were updated
            expect(result.current.tokens.accessToken).toBe(newTokens.accessToken);
            expect(result.current.tokens.refreshToken).toBe(newTokens.refreshToken);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Token refresh with empty IMEI arrays
   * Verifies that token refresh preserves empty IMEI arrays correctly.
   */
  it('should preserve empty IMEI arrays during token refresh', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate user context with empty IMEIs
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          imeis: fc.constant([]), // Empty IMEI array
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        // Generate new tokens
        fc.record({
          accessToken: fc.string({ minLength: 10, maxLength: 50 }),
          refreshToken: fc.string({ minLength: 10, maxLength: 50 })
        }),
        async (userContext, newTokens) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Set initial user context with empty IMEIs
          act(() => {
            result.current.setUserContext(userContext);
          });
          
          expect(result.current.imeis).toEqual([]);
          
          // Setup tokens for refresh
          localStorage.setItem('accessToken', userContext.tokens.accessToken);
          localStorage.setItem('refreshToken', userContext.tokens.refreshToken);
          
          // Mock successful refresh
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              status: 'success',
              data: {
                tokens: {
                  accessToken: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken,
                },
              },
            }),
          });
          
          // Perform refresh
          await act(async () => {
            const refreshedTokens = await refreshAccessToken();
            result.current.updateTokens(refreshedTokens);
          });
          
          // Verify empty IMEI array is preserved
          expect(result.current.imeis).toEqual([]);
          expect(result.current.userType).toBe(userContext.userType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Token refresh preserves PARENTS vs ADMIN distinction
   * Verifies that token refresh maintains the critical userType distinction.
   */
  it('should preserve PARENTS vs ADMIN user type distinction during token refresh', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate user context with specific user type
        fc.constantFrom('PARENTS', 'ADMIN'),
        fc.array(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
            .map(arr => arr.join('')),
          { minLength: 0, maxLength: 3 }
        ),
        fc.record({
          accessToken: fc.string({ minLength: 10, maxLength: 50 }),
          refreshToken: fc.string({ minLength: 10, maxLength: 50 })
        }),
        fc.record({
          accessToken: fc.string({ minLength: 10, maxLength: 50 }),
          refreshToken: fc.string({ minLength: 10, maxLength: 50 })
        }),
        async (userType, imeis, originalTokens, newTokens) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Create user context
          const userContext = {
            uniqueId: 'test-user-id',
            userType,
            email: 'test@example.com',
            imeis,
            tokens: originalTokens
          };
          
          // Set initial context
          act(() => {
            result.current.setUserContext(userContext);
          });
          
          // Verify initial user type
          const isInitiallyAdmin = result.current.isAdmin();
          const isInitiallyParent = result.current.isParent();
          
          expect(isInitiallyAdmin).toBe(userType === 'ADMIN');
          expect(isInitiallyParent).toBe(userType === 'PARENTS');
          
          // Setup tokens for refresh
          localStorage.setItem('accessToken', originalTokens.accessToken);
          localStorage.setItem('refreshToken', originalTokens.refreshToken);
          
          // Mock successful refresh
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              status: 'success',
              data: {
                tokens: {
                  accessToken: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken,
                },
              },
            }),
          });
          
          // Perform refresh
          await act(async () => {
            const refreshedTokens = await refreshAccessToken();
            result.current.updateTokens(refreshedTokens);
          });
          
          // Verify user type distinction is preserved
          expect(result.current.isAdmin()).toBe(isInitiallyAdmin);
          expect(result.current.isParent()).toBe(isInitiallyParent);
          expect(result.current.userType).toBe(userType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Failed token refresh doesn't corrupt user context
   * Verifies that when token refresh fails, the user context remains intact.
   */
  it('should maintain user context even when token refresh fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate user context
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          imeis: fc.array(
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join('')),
            { minLength: 0, maxLength: 3 }
          ),
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        async (userContext) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Set initial user context
          act(() => {
            result.current.setUserContext(userContext);
          });
          
          // Store initial state
          const initialUserType = result.current.userType;
          const initialIMEIs = [...result.current.imeis];
          const initialUniqueId = result.current.uniqueId;
          const initialEmail = result.current.email;
          
          // Setup tokens for refresh
          localStorage.setItem('accessToken', userContext.tokens.accessToken);
          localStorage.setItem('refreshToken', userContext.tokens.refreshToken);
          
          // Mock failed refresh response
          global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({
              status: 'error',
              message: 'Invalid refresh token',
            }),
          });
          
          // Attempt refresh (should fail)
          try {
            await act(async () => {
              await refreshAccessToken();
            });
          } catch (error) {
            // Expected to throw
          }
          
          // Verify user context is still intact after failed refresh
          expect(result.current.userType).toBe(initialUserType);
          expect(result.current.imeis).toEqual(initialIMEIs);
          expect(result.current.uniqueId).toBe(initialUniqueId);
          expect(result.current.email).toBe(initialEmail);
        }
      ),
      { numRuns: 100 }
    );
  });
});
