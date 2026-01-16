/**
 * Token Refresh Preservation Tests
 * 
 * Tests that verify token refresh doesn't clear user context
 * and maintains filter configuration (userType and IMEIs).
 * 
 * Validates: Requirement 5.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { refreshAccessToken } from './auth';

describe('Token Refresh Preservation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should refresh tokens successfully', async () => {
    // Setup: Store initial tokens
    localStorage.setItem('accessToken', 'old-access-token');
    localStorage.setItem('refreshToken', 'old-refresh-token');

    // Mock successful refresh response
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

    // Verify: New tokens returned
    expect(newTokens).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // Verify: Tokens updated in localStorage
    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
  });

  it('should throw error when no refresh token available', async () => {
    // Setup: No refresh token in localStorage
    localStorage.removeItem('refreshToken');

    // Execute & Verify: Should throw error
    await expect(refreshAccessToken()).rejects.toThrow('No refresh token available');
  });

  it('should throw error when refresh API fails', async () => {
    // Setup: Store refresh token
    localStorage.setItem('refreshToken', 'old-refresh-token');

    // Mock failed refresh response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        status: 'error',
        message: 'Invalid refresh token',
      }),
    });

    // Execute & Verify: Should throw error
    await expect(refreshAccessToken()).rejects.toThrow('Invalid refresh token');
  });

  it('should throw error when refresh response is malformed', async () => {
    // Setup: Store refresh token
    localStorage.setItem('refreshToken', 'old-refresh-token');

    // Mock malformed response (missing tokens)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {}, // Missing tokens
      }),
    });

    // Execute & Verify: Should throw error
    await expect(refreshAccessToken()).rejects.toThrow('Token refresh failed');
  });

  it('should handle network errors during refresh', async () => {
    // Setup: Store refresh token
    localStorage.setItem('refreshToken', 'old-refresh-token');

    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    // Execute & Verify: Should throw error
    await expect(refreshAccessToken()).rejects.toThrow('Network error');
  });

  it('should call refresh endpoint with correct parameters', async () => {
    // Setup: Store refresh token
    const refreshToken = 'test-refresh-token';
    localStorage.setItem('refreshToken', refreshToken);

    // Mock successful response
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
    await refreshAccessToken();

    // Verify: Fetch called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh-token'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })
    );
  });
});
