import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { UserContextProvider, useUserContext } from '../contexts/UserContext';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Get actual environment variable (will use the real one from .env)
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000';

// Helper component to access and display UserContext state
const UserContextDisplay = () => {
  const context = useUserContext();
  return (
    <div data-testid="user-context">
      <div data-testid="is-authenticated">{String(context.isAuthenticated)}</div>
      <div data-testid="user-type">{context.userType || 'null'}</div>
      <div data-testid="imeis">{JSON.stringify(context.imeis)}</div>
      <div data-testid="email">{context.email || 'null'}</div>
      <div data-testid="unique-id">{context.uniqueId || 'null'}</div>
    </div>
  );
};

// Helper function to render Login with full context
const renderLoginWithContext = () => {
  return render(
    <BrowserRouter>
      <UserContextProvider>
        <Login />
        <UserContextDisplay />
      </UserContextProvider>
    </BrowserRouter>
  );
};

describe('Login Integration Test - Complete Flow', () => {
  let fetchSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.matchMedia for accessibility utilities
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    if (fetchSpy) {
      fetchSpy.mockRestore();
    }
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Complete login → parse → store → persist flow', () => {
    it('should complete full flow for PARENTS user with single IMEI', async () => {
      // Mock successful API response
      const mockApiResponse = {
        status: 'success',
        data: {
          uniqueId: 'parent123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          imei: '123456789012345',
          userType: 'PARENTS',
          mobile: '+1234567890',
          tokens: {
            accessToken: 'mock-access-token-parents',
            refreshToken: 'mock-refresh-token-parents',
          },
          lastLoginAt: '2024-01-15T10:00:00Z',
          message: 'Login successful',
        },
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          `${API_BASE_URL}/auth/signin-query`,
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          })
        );
      });

      // Verify tokens stored in localStorage
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token-parents');
        expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token-parents');
        expect(localStorage.getItem('userEmail')).toBe('john@example.com');
      });

      // Verify user context was updated
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('PARENTS');
        expect(screen.getByTestId('imeis')).toHaveTextContent('["123456789012345"]');
        expect(screen.getByTestId('email')).toHaveTextContent('john@example.com');
        expect(screen.getByTestId('unique-id')).toHaveTextContent('parent123');
      });

      // Verify user context was persisted to localStorage
      await waitFor(() => {
        const persistedData = localStorage.getItem('user_context');
        expect(persistedData).not.toBeNull();
        expect(persistedData).toBeTruthy();
      });

      // Verify navigation to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should complete full flow for PARENTS user with multiple IMEIs', async () => {
      // Mock successful API response with multiple IMEIs
      const mockApiResponse = {
        status: 'success',
        data: {
          uniqueId: 'parent456',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          imei: '123456789012345,999999999999999,111111111111111',
          userType: 'PARENTS',
          mobile: '+1234567890',
          tokens: {
            accessToken: 'mock-access-token-multi',
            refreshToken: 'mock-refresh-token-multi',
          },
          lastLoginAt: '2024-01-15T10:00:00Z',
          message: 'Login successful',
        },
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });

      // Verify user context has all three IMEIs
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('PARENTS');
        const imeisText = screen.getByTestId('imeis').textContent;
        const imeis = JSON.parse(imeisText);
        expect(imeis).toHaveLength(3);
        expect(imeis).toContain('123456789012345');
        expect(imeis).toContain('999999999999999');
        expect(imeis).toContain('111111111111111');
      });

      // Verify persistence
      await waitFor(() => {
        const persistedData = localStorage.getItem('user_context');
        expect(persistedData).not.toBeNull();
      });

      // Verify navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should complete full flow for ADMIN user', async () => {
      // Mock successful API response for ADMIN
      const mockApiResponse = {
        status: 'success',
        data: {
          uniqueId: 'admin789',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          imei: '', // ADMIN users may have empty IMEI
          userType: 'ADMIN',
          mobile: '+1234567890',
          tokens: {
            accessToken: 'mock-access-token-admin',
            refreshToken: 'mock-refresh-token-admin',
          },
          lastLoginAt: '2024-01-15T10:00:00Z',
          message: 'Login successful',
        },
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'adminpass' } });
      fireEvent.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });

      // Verify user context for ADMIN
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('ADMIN');
        expect(screen.getByTestId('imeis')).toHaveTextContent('[]'); // Empty array for ADMIN
        expect(screen.getByTestId('email')).toHaveTextContent('admin@example.com');
        expect(screen.getByTestId('unique-id')).toHaveTextContent('admin789');
      });

      // Verify tokens stored
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token-admin');
        expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token-admin');
      });

      // Verify persistence
      await waitFor(() => {
        const persistedData = localStorage.getItem('user_context');
        expect(persistedData).not.toBeNull();
      });

      // Verify navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle PARENTS user with invalid IMEIs by filtering them out', async () => {
      // Mock API response with mix of valid and invalid IMEIs
      const mockApiResponse = {
        status: 'success',
        data: {
          uniqueId: 'parent999',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          imei: '123456789012345,invalid,999999999999999,12345', // Mix of valid and invalid
          userType: 'PARENTS',
          mobile: '+1234567890',
          tokens: {
            accessToken: 'mock-access-token-mixed',
            refreshToken: 'mock-refresh-token-mixed',
          },
          lastLoginAt: '2024-01-15T10:00:00Z',
          message: 'Login successful',
        },
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });

      // Verify only valid IMEIs are stored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        const imeisText = screen.getByTestId('imeis').textContent;
        const imeis = JSON.parse(imeisText);
        expect(imeis).toHaveLength(2); // Only 2 valid IMEIs
        expect(imeis).toContain('123456789012345');
        expect(imeis).toContain('999999999999999');
        expect(imeis).not.toContain('invalid');
        expect(imeis).not.toContain('12345');
      });

      // Verify navigation still occurs
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle PARENTS user with no valid IMEIs', async () => {
      // Mock API response with no valid IMEIs
      const mockApiResponse = {
        status: 'success',
        data: {
          uniqueId: 'parent000',
          firstName: 'Empty',
          lastName: 'User',
          email: 'empty@example.com',
          imei: '', // No IMEIs
          userType: 'PARENTS',
          mobile: '+1234567890',
          tokens: {
            accessToken: 'mock-access-token-empty',
            refreshToken: 'mock-refresh-token-empty',
          },
          lastLoginAt: '2024-01-15T10:00:00Z',
          message: 'Login successful',
        },
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'empty@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });

      // Verify empty IMEI array
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('PARENTS');
        expect(screen.getByTestId('imeis')).toHaveTextContent('[]');
      });

      // Verify navigation still occurs
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle authentication failure gracefully', async () => {
      // Mock failed API response
      const mockApiResponse = {
        status: 'error',
        error_description: 'Invalid credentials',
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Verify user context was NOT updated
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-type')).toHaveTextContent('null');

      // Verify no tokens stored
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Verify user context was NOT updated
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle persistence failure gracefully', async () => {
      // Mock successful API response
      const mockApiResponse = {
        status: 'success',
        data: {
          uniqueId: 'user123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          imei: '123456789012345',
          userType: 'PARENTS',
          mobile: '+1234567890',
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
          lastLoginAt: '2024-01-15T10:00:00Z',
          message: 'Login successful',
        },
      };

      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      // Mock localStorage to fail
      const originalSetItem = Storage.prototype.setItem;
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
        if (key === 'user_context') {
          throw new Error('QuotaExceededError');
        }
        // Allow other keys to work (tokens, etc.)
        return originalSetItem.call(localStorage, key, value);
      });

      renderLoginWithContext();

      // Fill in login form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalled();
      });

      // Verify user context was still updated (persistence failure doesn't block login)
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('PARENTS');
      });

      // Verify tokens were still stored (they use different mechanism)
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      });

      // Verify navigation still occurred
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      setItemSpy.mockRestore();
    });
  });
});
