/**
 * Property-Based Tests for User Context Operations
 * 
 * Feature: user-based-device-filtering
 * Validates: Requirements 5.1
 * 
 * Tests universal properties for user context state management.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { UserContextProvider, useUserContext } from './UserContext.jsx';

/**
 * Wrapper component for testing hooks
 */
const wrapper = ({ children }) => (
  <UserContextProvider>{children}</UserContextProvider>
);

describe('User Context - Property-Based Tests', () => {
  /**
   * Property 8: Login State Update
   * For any successful login event, the user context should be updated to reflect
   * the new user's type and IMEIs, and the previous user's context should be completely replaced.
   * 
   * Feature: user-based-device-filtering, Property 8: Login State Update
   * Validates: Requirements 5.1
   */
  it('should completely replace previous user context on login', () => {
    fc.assert(
      fc.property(
        // Generate two different user contexts (simulating two login events)
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
        (firstUserContext, secondUserContext) => {
          // Render the hook with the provider
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Initially, user should not be authenticated
          expect(result.current.isAuthenticated).toBe(false);
          expect(result.current.userType).toBe(null);
          expect(result.current.imeis).toEqual([]);
          expect(result.current.uniqueId).toBe(null);
          expect(result.current.email).toBe(null);
          
          // First login - set first user context
          act(() => {
            result.current.setUserContext(firstUserContext);
          });
          
          // Verify first user context is set correctly
          expect(result.current.isAuthenticated).toBe(true);
          expect(result.current.userType).toBe(firstUserContext.userType);
          expect(result.current.imeis).toEqual(firstUserContext.imeis);
          expect(result.current.uniqueId).toBe(firstUserContext.uniqueId);
          expect(result.current.email).toBe(firstUserContext.email);
          expect(result.current.tokens.accessToken).toBe(firstUserContext.tokens.accessToken);
          expect(result.current.tokens.refreshToken).toBe(firstUserContext.tokens.refreshToken);
          
          // Second login - set second user context (should completely replace first)
          act(() => {
            result.current.setUserContext(secondUserContext);
          });
          
          // Verify second user context completely replaced the first
          expect(result.current.isAuthenticated).toBe(true);
          expect(result.current.userType).toBe(secondUserContext.userType);
          expect(result.current.imeis).toEqual(secondUserContext.imeis);
          expect(result.current.uniqueId).toBe(secondUserContext.uniqueId);
          expect(result.current.email).toBe(secondUserContext.email);
          expect(result.current.tokens.accessToken).toBe(secondUserContext.tokens.accessToken);
          expect(result.current.tokens.refreshToken).toBe(secondUserContext.tokens.refreshToken);
          
          // Verify NO traces of first user context remain
          expect(result.current.uniqueId).not.toBe(firstUserContext.uniqueId);
          expect(result.current.email).not.toBe(firstUserContext.email);
          expect(result.current.tokens.accessToken).not.toBe(firstUserContext.tokens.accessToken);
          expect(result.current.tokens.refreshToken).not.toBe(firstUserContext.tokens.refreshToken);
          
          // If user types are different, verify the change
          if (firstUserContext.userType !== secondUserContext.userType) {
            expect(result.current.userType).not.toBe(firstUserContext.userType);
          }
          
          // If IMEIs are different, verify the change
          if (JSON.stringify(firstUserContext.imeis) !== JSON.stringify(secondUserContext.imeis)) {
            expect(result.current.imeis).not.toEqual(firstUserContext.imeis);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Login state update with empty IMEI arrays
   * Verifies that empty IMEI arrays are handled correctly during login state updates.
   */
  it('should handle login state updates with empty IMEI arrays', () => {
    fc.assert(
      fc.property(
        // Generate user context with non-empty IMEIs
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          imeis: fc.array(
            fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 15, maxLength: 15 })
              .map(arr => arr.join('')),
            { minLength: 1, maxLength: 5 }
          ),
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        // Generate user context with empty IMEIs
        fc.record({
          uniqueId: fc.string({ minLength: 1, maxLength: 20 }),
          userType: fc.constantFrom('PARENTS', 'ADMIN'),
          email: fc.emailAddress(),
          imeis: fc.constant([]),
          tokens: fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 50 }),
            refreshToken: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        (firstUserContext, secondUserContext) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // First login with non-empty IMEIs
          act(() => {
            result.current.setUserContext(firstUserContext);
          });
          
          expect(result.current.imeis.length).toBeGreaterThan(0);
          
          // Second login with empty IMEIs should replace the first
          act(() => {
            result.current.setUserContext(secondUserContext);
          });
          
          // Verify empty IMEI array is set correctly
          expect(result.current.imeis).toEqual([]);
          expect(result.current.imeis.length).toBe(0);
          
          // Verify other fields are updated
          expect(result.current.uniqueId).toBe(secondUserContext.uniqueId);
          expect(result.current.email).toBe(secondUserContext.email);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Login state update preserves authentication status
   * Verifies that isAuthenticated remains true after login state updates.
   */
  it('should maintain authenticated status across login state updates', () => {
    fc.assert(
      fc.property(
        fc.array(
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
          { minLength: 1, maxLength: 5 }
        ),
        (userContexts) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Apply each login sequentially
          userContexts.forEach((userContext) => {
            act(() => {
              result.current.setUserContext(userContext);
            });
            
            // After each login, user should be authenticated
            expect(result.current.isAuthenticated).toBe(true);
            
            // Context should match the current user
            expect(result.current.userType).toBe(userContext.userType);
            expect(result.current.uniqueId).toBe(userContext.uniqueId);
            expect(result.current.email).toBe(userContext.email);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Login followed by logout clears all state
   * Verifies that logout completely clears the user context after login.
   */
  it('should clear all state after logout following login', () => {
    fc.assert(
      fc.property(
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
        (userContext) => {
          const { result } = renderHook(() => useUserContext(), { wrapper });
          
          // Login
          act(() => {
            result.current.setUserContext(userContext);
          });
          
          expect(result.current.isAuthenticated).toBe(true);
          
          // Logout
          act(() => {
            result.current.clearUserContext();
          });
          
          // Verify all state is cleared
          expect(result.current.isAuthenticated).toBe(false);
          expect(result.current.userType).toBe(null);
          expect(result.current.imeis).toEqual([]);
          expect(result.current.uniqueId).toBe(null);
          expect(result.current.email).toBe(null);
          expect(result.current.tokens.accessToken).toBe(null);
          expect(result.current.tokens.refreshToken).toBe(null);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
