/**
 * Token Refresh Integration Tests
 * 
 * Integration tests that verify token refresh preserves user context
 * and filter configuration across the authentication flow.
 * 
 * Validates: Requirement 5.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { UserContextProvider, useUserContext } from '../contexts/UserContext';
import { refreshAccessToken } from './auth';

describe('Token Refresh Integration - User Context Preservation', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to render hook with provider
  const renderWithProvider = () => {
    return renderHook(() => useUserContext(), {
      wrapper: ({ children }) => (
        <UserContextProvider>{children}</UserContextProvider>
      ),
    });
  };

  it('preserves PARENTS user filter config during token refresh', async () => {
    const { result } = renderWithProvider();

    // Setup: Login as PARENTS user
    const parentsContext = {
      uniqueId: 'parent-123',
      userType: 'PARENTS',
      imeis: ['123456789012345', '987654321098765'],
      email: 'parent@example.com',
      tokens: {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      },
    };

    act(() => {
      result.current.setUserContext(parentsContext);
    });

    // Store tokens in localStorage (simulating login)
    localStorage.setItem('accessToken', 'old-access-token');
    localStorage.setItem('refreshToken', 'old-refresh-token');

    // Verify initial state
    expect(result.current.userType).toBe('PARENTS');
    expect(result.current.imeis).toEqual(['123456789012345', '987654321098765']);
    expect(result.current.tokens.accessToken).toBe('old-access-token');

    // Mock successful token refresh
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          tokens: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        },
      }),
    });

    // Execute: Refresh tokens
    const newTokens = await refreshAccessToken();

    // Update context with new tokens (preserving user data)
    act(() => {
      result.current.updateTokens(newTokens);
    });

    // Verify: Tokens updated
    expect(result.current.tokens.accessToken).toBe('new-access-token');
    expect(result.current.tokens.refreshToken).toBe('new-refresh-token');

    // Verify: Filter config preserved
    expect(result.current.userType).toBe('PARENTS');
    expect(result.current.imeis).toEqual(['123456789012345', '987654321098765']);
    expect(result.current.uniqueId).toBe('parent-123');
    expect(result.current.email).toBe('parent@example.com');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isParent()).toBe(true);
  });

  it('preserves ADMIN user status during token refresh', async () => {
    const { result } = renderWithProvider();

    // Setup: Login as ADMIN user
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

    localStorage.setItem('accessToken', 'admin-old-token');
    localStorage.setItem('refreshToken', 'admin-old-refresh');

    // Mock token refresh
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          tokens: {
            accessToken: 'admin-new-token',
            refreshToken: 'admin-new-refresh',
          },
        },
      }),
    });

    // Refresh tokens
    const newTokens = await refreshAccessToken();

    act(() => {
      result.current.updateTokens(newTokens);
    });

    // Verify: ADMIN status preserved
    expect(result.current.userType).toBe('ADMIN');
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isParent()).toBe(false);
    expect(result.current.tokens.accessToken).toBe('admin-new-token');
  });

  it('handles multiple token refreshes while preserving context', async () => {
    const { result } = renderWithProvider();

    // Setup: Login as PARENTS user with multiple IMEIs
    const userContext = {
      uniqueId: 'user-789',
      userType: 'PARENTS',
      imeis: ['111111111111111', '222222222222222', '333333333333333'],
      email: 'user@example.com',
      tokens: {
        accessToken: 'token-1',
        refreshToken: 'refresh-1',
      },
    };

    act(() => {
      result.current.setUserContext(userContext);
    });

    // First refresh
    localStorage.setItem('refreshToken', 'refresh-1');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          tokens: {
            accessToken: 'token-2',
            refreshToken: 'refresh-2',
          },
        },
      }),
    });

    const tokens2 = await refreshAccessToken();
    act(() => {
      result.current.updateTokens(tokens2);
    });

    expect(result.current.tokens.accessToken).toBe('token-2');
    expect(result.current.imeis).toEqual(['111111111111111', '222222222222222', '333333333333333']);

    // Second refresh
    localStorage.setItem('refreshToken', 'refresh-2');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          tokens: {
            accessToken: 'token-3',
            refreshToken: 'refresh-3',
          },
        },
      }),
    });

    const tokens3 = await refreshAccessToken();
    act(() => {
      result.current.updateTokens(tokens3);
    });

    // Verify: Context still preserved after multiple refreshes
    expect(result.current.tokens.accessToken).toBe('token-3');
    expect(result.current.userType).toBe('PARENTS');
    expect(result.current.imeis).toEqual(['111111111111111', '222222222222222', '333333333333333']);
    expect(result.current.uniqueId).toBe('user-789');
  });

  it('maintains authentication state during token refresh', async () => {
    const { result } = renderWithProvider();

    const userContext = {
      uniqueId: 'user-999',
      userType: 'PARENTS',
      imeis: ['444444444444444'],
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

    // Refresh tokens
    localStorage.setItem('refreshToken', 'old-refresh');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          tokens: {
            accessToken: 'new-token',
            refreshToken: 'new-refresh',
          },
        },
      }),
    });

    const newTokens = await refreshAccessToken();
    act(() => {
      result.current.updateTokens(newTokens);
    });

    // Authentication should remain true throughout
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('does not affect user context when token refresh fails', async () => {
    const { result } = renderWithProvider();

    // Setup user context
    const userContext = {
      uniqueId: 'user-fail',
      userType: 'PARENTS',
      imeis: ['555555555555555'],
      email: 'user@example.com',
      tokens: {
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
      },
    };

    act(() => {
      result.current.setUserContext(userContext);
    });

    // Mock failed refresh
    localStorage.setItem('refreshToken', 'valid-refresh');
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        status: 'error',
        message: 'Token expired',
      }),
    });

    // Attempt refresh (should fail)
    try {
      await refreshAccessToken();
    } catch (error) {
      // Expected to fail
    }

    // Verify: User context unchanged (no updateTokens called)
    expect(result.current.userType).toBe('PARENTS');
    expect(result.current.imeis).toEqual(['555555555555555']);
    expect(result.current.tokens.accessToken).toBe('valid-token');
    expect(result.current.uniqueId).toBe('user-fail');
  });
});
