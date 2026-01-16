import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { UserContextProvider, useUserContext } from './UserContext.jsx';

describe('UserContext - State Management', () => {
  // Helper to render hook with provider
  const renderWithProvider = () => {
    return renderHook(() => useUserContext(), {
      wrapper: ({ children }) => (
        <UserContextProvider>{children}</UserContextProvider>
      ),
    });
  };

  describe('Context Initialization', () => {
    it('initializes with default unauthenticated state', () => {
      const { result } = renderWithProvider();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userType).toBe(null);
      expect(result.current.imeis).toEqual([]);
      expect(result.current.uniqueId).toBe(null);
      expect(result.current.email).toBe(null);
      expect(result.current.tokens.accessToken).toBe(null);
      expect(result.current.tokens.refreshToken).toBe(null);
    });

    it('provides all required action methods', () => {
      const { result } = renderWithProvider();

      expect(typeof result.current.setUserContext).toBe('function');
      expect(typeof result.current.clearUserContext).toBe('function');
      expect(typeof result.current.getUserContext).toBe('function');
      expect(typeof result.current.isAdmin).toBe('function');
      expect(typeof result.current.isParent).toBe('function');
    });

    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useUserContext());
      }).toThrow('useUserContext must be used within a UserContextProvider');

      console.error = originalError;
    });
  });

  describe('Context Updates', () => {
    it('updates context with ADMIN user data', () => {
      const { result } = renderWithProvider();

      const adminContext = {
        uniqueId: 'admin-123',
        userType: 'ADMIN',
        imeis: ['123456789012345', '987654321098765'],
        email: 'admin@example.com',
        tokens: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
        },
      };

      act(() => {
        result.current.setUserContext(adminContext);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.userType).toBe('ADMIN');
      expect(result.current.imeis).toEqual(['123456789012345', '987654321098765']);
      expect(result.current.uniqueId).toBe('admin-123');
      expect(result.current.email).toBe('admin@example.com');
      expect(result.current.tokens.accessToken).toBe('access-token-123');
      expect(result.current.tokens.refreshToken).toBe('refresh-token-456');
    });

    it('updates context with PARENTS user data', () => {
      const { result } = renderWithProvider();

      const parentsContext = {
        uniqueId: 'parent-456',
        userType: 'PARENTS',
        imeis: ['111111111111111'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'parent-access-token',
          refreshToken: 'parent-refresh-token',
        },
      };

      act(() => {
        result.current.setUserContext(parentsContext);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.userType).toBe('PARENTS');
      expect(result.current.imeis).toEqual(['111111111111111']);
      expect(result.current.uniqueId).toBe('parent-456');
      expect(result.current.email).toBe('parent@example.com');
    });

    it('handles empty IMEI array', () => {
      const { result } = renderWithProvider();

      const contextWithNoIMEIs = {
        uniqueId: 'user-789',
        userType: 'PARENTS',
        imeis: [],
        email: 'user@example.com',
        tokens: {
          accessToken: 'token-1',
          refreshToken: 'token-2',
        },
      };

      act(() => {
        result.current.setUserContext(contextWithNoIMEIs);
      });

      expect(result.current.imeis).toEqual([]);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('handles missing imeis field by defaulting to empty array', () => {
      const { result } = renderWithProvider();

      const contextWithoutIMEIs = {
        uniqueId: 'user-999',
        userType: 'ADMIN',
        email: 'admin@example.com',
        tokens: {
          accessToken: 'token-a',
          refreshToken: 'token-b',
        },
      };

      act(() => {
        result.current.setUserContext(contextWithoutIMEIs);
      });

      expect(result.current.imeis).toEqual([]);
    });

    it('replaces previous context on subsequent updates', () => {
      const { result } = renderWithProvider();

      // Set first user
      const firstUser = {
        uniqueId: 'user-1',
        userType: 'PARENTS',
        imeis: ['111111111111111'],
        email: 'user1@example.com',
        tokens: {
          accessToken: 'token-1',
          refreshToken: 'refresh-1',
        },
      };

      act(() => {
        result.current.setUserContext(firstUser);
      });

      expect(result.current.uniqueId).toBe('user-1');
      expect(result.current.userType).toBe('PARENTS');

      // Set second user - should completely replace
      const secondUser = {
        uniqueId: 'user-2',
        userType: 'ADMIN',
        imeis: ['222222222222222'],
        email: 'user2@example.com',
        tokens: {
          accessToken: 'token-2',
          refreshToken: 'refresh-2',
        },
      };

      act(() => {
        result.current.setUserContext(secondUser);
      });

      expect(result.current.uniqueId).toBe('user-2');
      expect(result.current.userType).toBe('ADMIN');
      expect(result.current.imeis).toEqual(['222222222222222']);
      expect(result.current.email).toBe('user2@example.com');
    });

    it('getUserContext returns current state', () => {
      const { result } = renderWithProvider();

      const userContext = {
        uniqueId: 'test-user',
        userType: 'ADMIN',
        imeis: ['123456789012345'],
        email: 'test@example.com',
        tokens: {
          accessToken: 'access',
          refreshToken: 'refresh',
        },
      };

      act(() => {
        result.current.setUserContext(userContext);
      });

      const retrievedContext = result.current.getUserContext();

      expect(retrievedContext.isAuthenticated).toBe(true);
      expect(retrievedContext.userType).toBe('ADMIN');
      expect(retrievedContext.uniqueId).toBe('test-user');
      expect(retrievedContext.email).toBe('test@example.com');
    });
  });

  describe('Context Clearing', () => {
    it('clears context back to initial state', () => {
      const { result } = renderWithProvider();

      // First set a user context
      const userContext = {
        uniqueId: 'user-123',
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        email: 'user@example.com',
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      act(() => {
        result.current.setUserContext(userContext);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Now clear the context
      act(() => {
        result.current.clearUserContext();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.userType).toBe(null);
      expect(result.current.imeis).toEqual([]);
      expect(result.current.uniqueId).toBe(null);
      expect(result.current.email).toBe(null);
      expect(result.current.tokens.accessToken).toBe(null);
      expect(result.current.tokens.refreshToken).toBe(null);
    });

    it('can set context again after clearing', () => {
      const { result } = renderWithProvider();

      // Set, clear, then set again
      const firstContext = {
        uniqueId: 'user-1',
        userType: 'ADMIN',
        imeis: ['111111111111111'],
        email: 'user1@example.com',
        tokens: {
          accessToken: 'token-1',
          refreshToken: 'refresh-1',
        },
      };

      act(() => {
        result.current.setUserContext(firstContext);
      });

      act(() => {
        result.current.clearUserContext();
      });

      const secondContext = {
        uniqueId: 'user-2',
        userType: 'PARENTS',
        imeis: ['222222222222222'],
        email: 'user2@example.com',
        tokens: {
          accessToken: 'token-2',
          refreshToken: 'refresh-2',
        },
      };

      act(() => {
        result.current.setUserContext(secondContext);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.uniqueId).toBe('user-2');
      expect(result.current.userType).toBe('PARENTS');
    });
  });

  describe('Helper Methods', () => {
    it('isAdmin returns true for ADMIN user', () => {
      const { result } = renderWithProvider();

      const adminContext = {
        uniqueId: 'admin-1',
        userType: 'ADMIN',
        imeis: [],
        email: 'admin@example.com',
        tokens: {
          accessToken: 'token',
          refreshToken: 'refresh',
        },
      };

      act(() => {
        result.current.setUserContext(adminContext);
      });

      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.isParent()).toBe(false);
    });

    it('isParent returns true for PARENTS user', () => {
      const { result } = renderWithProvider();

      const parentsContext = {
        uniqueId: 'parent-1',
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'token',
          refreshToken: 'refresh',
        },
      };

      act(() => {
        result.current.setUserContext(parentsContext);
      });

      expect(result.current.isParent()).toBe(true);
      expect(result.current.isAdmin()).toBe(false);
    });

    it('isAdmin and isParent return false when not authenticated', () => {
      const { result } = renderWithProvider();

      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isParent()).toBe(false);
    });

    it('isAdmin and isParent return false after clearing context', () => {
      const { result } = renderWithProvider();

      const userContext = {
        uniqueId: 'user-1',
        userType: 'ADMIN',
        imeis: [],
        email: 'user@example.com',
        tokens: {
          accessToken: 'token',
          refreshToken: 'refresh',
        },
      };

      act(() => {
        result.current.setUserContext(userContext);
      });

      expect(result.current.isAdmin()).toBe(true);

      act(() => {
        result.current.clearUserContext();
      });

      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isParent()).toBe(false);
    });
  });

  describe('Token Refresh Preservation (Requirement 5.3)', () => {
    it('updateTokens preserves user context while updating tokens', () => {
      const { result } = renderWithProvider();

      // Set initial user context
      const initialContext = {
        uniqueId: 'user-123',
        userType: 'PARENTS',
        imeis: ['123456789012345', '987654321098765'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'old-access-token',
          refreshToken: 'old-refresh-token',
        },
      };

      act(() => {
        result.current.setUserContext(initialContext);
      });

      // Verify initial state
      expect(result.current.tokens.accessToken).toBe('old-access-token');
      expect(result.current.tokens.refreshToken).toBe('old-refresh-token');
      expect(result.current.userType).toBe('PARENTS');
      expect(result.current.imeis).toEqual(['123456789012345', '987654321098765']);

      // Update tokens (simulating token refresh)
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      act(() => {
        result.current.updateTokens(newTokens);
      });

      // Verify tokens updated
      expect(result.current.tokens.accessToken).toBe('new-access-token');
      expect(result.current.tokens.refreshToken).toBe('new-refresh-token');

      // Verify user context preserved
      expect(result.current.userType).toBe('PARENTS');
      expect(result.current.imeis).toEqual(['123456789012345', '987654321098765']);
      expect(result.current.uniqueId).toBe('user-123');
      expect(result.current.email).toBe('parent@example.com');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('updateTokens preserves ADMIN user filter config', () => {
      const { result } = renderWithProvider();

      // Set ADMIN user context
      const adminContext = {
        uniqueId: 'admin-456',
        userType: 'ADMIN',
        imeis: [],
        email: 'admin@example.com',
        tokens: {
          accessToken: 'admin-old-token',
          refreshToken: 'admin-old-refresh',
        },
      };

      act(() => {
        result.current.setUserContext(adminContext);
      });

      // Update tokens
      const newTokens = {
        accessToken: 'admin-new-token',
        refreshToken: 'admin-new-refresh',
      };

      act(() => {
        result.current.updateTokens(newTokens);
      });

      // Verify ADMIN status preserved
      expect(result.current.userType).toBe('ADMIN');
      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.isParent()).toBe(false);
      expect(result.current.tokens.accessToken).toBe('admin-new-token');
    });

    it('updateTokens can be called multiple times', () => {
      const { result } = renderWithProvider();

      // Set initial context
      const initialContext = {
        uniqueId: 'user-789',
        userType: 'PARENTS',
        imeis: ['111111111111111'],
        email: 'user@example.com',
        tokens: {
          accessToken: 'token-1',
          refreshToken: 'refresh-1',
        },
      };

      act(() => {
        result.current.setUserContext(initialContext);
      });

      // First token update
      act(() => {
        result.current.updateTokens({
          accessToken: 'token-2',
          refreshToken: 'refresh-2',
        });
      });

      expect(result.current.tokens.accessToken).toBe('token-2');
      expect(result.current.imeis).toEqual(['111111111111111']);

      // Second token update
      act(() => {
        result.current.updateTokens({
          accessToken: 'token-3',
          refreshToken: 'refresh-3',
        });
      });

      expect(result.current.tokens.accessToken).toBe('token-3');
      expect(result.current.tokens.refreshToken).toBe('refresh-3');
      expect(result.current.userType).toBe('PARENTS');
      expect(result.current.imeis).toEqual(['111111111111111']);
    });

    it('updateTokens maintains authentication state', () => {
      const { result } = renderWithProvider();

      // Set user context
      const userContext = {
        uniqueId: 'user-999',
        userType: 'PARENTS',
        imeis: ['222222222222222'],
        email: 'user@example.com',
        tokens: {
          accessToken: 'old-token',
          refreshToken: 'old-refresh',
        },
      };

      act(() => {
        result.current.setUserContext(userContext);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Update tokens
      act(() => {
        result.current.updateTokens({
          accessToken: 'new-token',
          refreshToken: 'new-refresh',
        });
      });

      // Authentication state should remain true
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('updateTokens preserves multiple IMEIs for PARENTS user', () => {
      const { result } = renderWithProvider();

      // Set PARENTS user with multiple IMEIs
      const parentsContext = {
        uniqueId: 'parent-multi',
        userType: 'PARENTS',
        imeis: ['111111111111111', '222222222222222', '333333333333333'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'old-token',
          refreshToken: 'old-refresh',
        },
      };

      act(() => {
        result.current.setUserContext(parentsContext);
      });

      // Update tokens
      act(() => {
        result.current.updateTokens({
          accessToken: 'new-token',
          refreshToken: 'new-refresh',
        });
      });

      // Verify all IMEIs preserved
      expect(result.current.imeis).toEqual([
        '111111111111111',
        '222222222222222',
        '333333333333333',
      ]);
      expect(result.current.tokens.accessToken).toBe('new-token');
    });
  });
});
