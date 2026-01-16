import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserContextProvider, useUserContext } from './contexts/UserContext';
import { persistUserContext, clearPersistedContext } from './utils/authResponseParser';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock all page components to simplify testing
vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}));

vi.mock('./pages/Devices', () => ({
  default: () => <div data-testid="devices-page">Devices</div>,
}));

vi.mock('./pages/Analytics', () => ({
  default: () => <div data-testid="analytics-page">Analytics</div>,
}));

vi.mock('./pages/Alerts', () => ({
  default: () => <div data-testid="alerts-page">Alerts</div>,
}));

vi.mock('./pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings</div>,
}));

vi.mock('./pages/Login', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));

vi.mock('./pages/Signup', () => ({
  default: () => <div data-testid="signup-page">Signup</div>,
}));

vi.mock('./pages/Telemetry', () => ({
  default: () => <div data-testid="telemetry-page">Telemetry</div>,
}));

vi.mock('./pages/Configuration', () => ({
  default: () => <div data-testid="configuration-page">Configuration</div>,
}));

vi.mock('./pages/DeviceSettings', () => ({
  default: () => <div data-testid="device-settings-page">Device Settings</div>,
}));

vi.mock('./pages/Geofence', () => ({
  default: () => <div data-testid="geofence-page">Geofence</div>,
}));

vi.mock('./pages/DeviceDetails', () => ({
  default: () => <div data-testid="device-details-page">Device Details</div>,
}));

vi.mock('./layouts/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

// Mock ProtectedRoute to allow testing without authentication logic
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }) => <div data-testid="protected-route">{children}</div>,
}));

// Helper component to access and display UserContext state
const UserContextDisplay = () => {
  const context = useUserContext();
  return (
    <div data-testid="user-context-display">
      <div data-testid="is-authenticated">{String(context.isAuthenticated)}</div>
      <div data-testid="user-type">{context.userType || 'null'}</div>
      <div data-testid="imeis">{JSON.stringify(context.imeis)}</div>
      <div data-testid="email">{context.email || 'null'}</div>
      <div data-testid="unique-id">{context.uniqueId || 'null'}</div>
      <div data-testid="is-restoring">{String(context.isRestoring)}</div>
    </div>
  );
};

// Helper function to render App with UserContext
const renderAppWithContext = () => {
  return render(
    <UserContextProvider>
      <App />
      <UserContextDisplay />
    </UserContextProvider>
  );
};

describe('App Integration Test - Context Restoration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.matchMedia
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
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Context restoration on app load', () => {
    it('should restore PARENTS user context from localStorage on page refresh', async () => {
      // Setup: Persist a PARENTS user context
      const userContext = {
        uniqueId: 'parent123',
        userType: 'PARENTS',
        imeis: ['123456789012345', '999999999999999'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      // Persist user context
      persistUserContext(userContext);

      // Create a valid JWT token (not expired)
      const validPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        userId: 'parent123',
      };
      const base64Payload = btoa(JSON.stringify(validPayload));
      const validToken = `header.${base64Payload}.signature`;

      // Store tokens separately (as the app does)
      localStorage.setItem('accessToken', validToken);
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('userEmail', 'parent@example.com');

      // Render app (simulating page refresh)
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('PARENTS');
        expect(screen.getByTestId('imeis')).toHaveTextContent('["123456789012345","999999999999999"]');
        expect(screen.getByTestId('email')).toHaveTextContent('parent@example.com');
        expect(screen.getByTestId('unique-id')).toHaveTextContent('parent123');
      });

      // Verify console log indicates successful restoration
      expect(console.log).toHaveBeenCalledWith(
        'User context restored successfully:',
        expect.objectContaining({
          userType: 'PARENTS',
          imeiCount: 2,
          email: 'parent@example.com',
        })
      );
    });

    it('should restore ADMIN user context from localStorage on page refresh', async () => {
      // Setup: Persist an ADMIN user context
      const userContext = {
        uniqueId: 'admin456',
        userType: 'ADMIN',
        imeis: [],
        email: 'admin@example.com',
        tokens: {
          accessToken: 'mock-admin-token',
          refreshToken: 'mock-admin-refresh',
        },
      };

      // Persist user context
      persistUserContext(userContext);

      // Create a valid JWT token (not expired)
      const validPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        userId: 'admin456',
      };
      const base64Payload = btoa(JSON.stringify(validPayload));
      const validToken = `header.${base64Payload}.signature`;

      // Store tokens separately
      localStorage.setItem('accessToken', validToken);
      localStorage.setItem('refreshToken', 'mock-admin-refresh');
      localStorage.setItem('userEmail', 'admin@example.com');

      // Render app (simulating page refresh)
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('ADMIN');
        expect(screen.getByTestId('imeis')).toHaveTextContent('[]');
        expect(screen.getByTestId('email')).toHaveTextContent('admin@example.com');
        expect(screen.getByTestId('unique-id')).toHaveTextContent('admin456');
      });

      // Verify console log indicates successful restoration
      expect(console.log).toHaveBeenCalledWith(
        'User context restored successfully:',
        expect.objectContaining({
          userType: 'ADMIN',
          imeiCount: 0,
          email: 'admin@example.com',
        })
      );
    });

    it('should not restore context when no persisted data exists', async () => {
      // No persisted data in localStorage
      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context remains unauthenticated
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
        expect(screen.getByTestId('imeis')).toHaveTextContent('[]');
        expect(screen.getByTestId('email')).toHaveTextContent('null');
        expect(screen.getByTestId('unique-id')).toHaveTextContent('null');
      });

      // Verify console log indicates no persisted context
      expect(console.log).toHaveBeenCalledWith('No valid persisted context found');
    });

    it('should not restore context when tokens are missing', async () => {
      // Setup: Persist user context but don't store tokens
      const userContext = {
        uniqueId: 'parent789',
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      };

      // Persist user context
      persistUserContext(userContext);

      // Don't store tokens in localStorage (simulating missing tokens)

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify console warning about missing tokens
      expect(console.warn).toHaveBeenCalledWith(
        'Tokens not found in localStorage, clearing persisted context'
      );

      // Verify persisted context was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should not restore context when access token is expired', async () => {
      // Setup: Persist user context with expired token
      const userContext = {
        uniqueId: 'parent999',
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'expired-token',
          refreshToken: 'mock-refresh',
        },
      };

      // Persist user context
      persistUserContext(userContext);

      // Create an expired JWT token (expired in the past)
      // JWT format: header.payload.signature
      const expiredPayload = {
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        userId: 'parent999',
      };
      const base64Payload = btoa(JSON.stringify(expiredPayload));
      const expiredToken = `header.${base64Payload}.signature`;

      localStorage.setItem('accessToken', expiredToken);
      localStorage.setItem('refreshToken', 'mock-refresh');
      localStorage.setItem('userEmail', 'parent@example.com');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify console warning about expired token
      expect(console.warn).toHaveBeenCalledWith(
        'Access token expired, clearing persisted context'
      );

      // Verify persisted context and tokens were cleared
      expect(localStorage.getItem('user_context')).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userEmail')).toBeNull();
    });
  });

  describe('Corrupted data handling', () => {
    it('should handle corrupted encrypted data gracefully', async () => {
      // Setup: Store corrupted encrypted data
      localStorage.setItem('user_context', 'corrupted-invalid-base64-data!!!');
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load user context:',
        expect.any(Error)
      );

      // Verify corrupted data was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should handle corrupted JSON data gracefully', async () => {
      // Setup: Store valid base64 but invalid JSON
      const invalidJson = btoa('not valid json {{{');
      localStorage.setItem('user_context', invalidJson);
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load user context:',
        expect.any(Error)
      );

      // Verify corrupted data was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should handle invalid data structure gracefully', async () => {
      // Setup: Store valid encrypted JSON but with invalid structure
      const invalidData = {
        version: '1.0',
        encrypted: true,
        data: {
          // Missing required fields
          uniqueId: 'user123',
          // userType missing
          // imeis missing
          // email missing
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 86400000,
      };

      // Encrypt and store
      const jsonString = JSON.stringify(invalidData);
      const textBytes = new TextEncoder().encode(jsonString);
      const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
      const encrypted = new Uint8Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      const encryptedBase64 = btoa(String.fromCharCode(...encrypted));

      localStorage.setItem('user_context', encryptedBase64);
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Missing required fields in persisted data'
      );

      // Verify corrupted data was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should handle invalid userType gracefully', async () => {
      // Setup: Store valid structure but with invalid userType
      const invalidData = {
        version: '1.0',
        encrypted: true,
        data: {
          uniqueId: 'user123',
          userType: 'INVALID_TYPE', // Invalid userType
          imeis: ['123456789012345'],
          email: 'user@example.com',
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 86400000,
      };

      // Encrypt and store
      const jsonString = JSON.stringify(invalidData);
      const textBytes = new TextEncoder().encode(jsonString);
      const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
      const encrypted = new Uint8Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      const encryptedBase64 = btoa(String.fromCharCode(...encrypted));

      localStorage.setItem('user_context', encryptedBase64);
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Invalid userType in persisted data'
      );

      // Verify corrupted data was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should handle version mismatch gracefully', async () => {
      // Setup: Store data with wrong version
      const oldVersionData = {
        version: '0.9', // Old version
        encrypted: true,
        data: {
          uniqueId: 'user123',
          userType: 'PARENTS',
          imeis: ['123456789012345'],
          email: 'user@example.com',
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 86400000,
      };

      // Encrypt and store
      const jsonString = JSON.stringify(oldVersionData);
      const textBytes = new TextEncoder().encode(jsonString);
      const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
      const encrypted = new Uint8Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      const encryptedBase64 = btoa(String.fromCharCode(...encrypted));

      localStorage.setItem('user_context', encryptedBase64);
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify warning was logged
      expect(console.warn).toHaveBeenCalledWith(
        'Storage version mismatch: expected 1.0, got 0.9'
      );

      // Verify old data was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should handle expired persisted data gracefully', async () => {
      // Setup: Store expired data
      const expiredData = {
        version: '1.0',
        encrypted: true,
        data: {
          uniqueId: 'user123',
          userType: 'PARENTS',
          imeis: ['123456789012345'],
          email: 'user@example.com',
        },
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        expiresAt: Date.now() - 3600000, // Expired 1 hour ago
      };

      // Encrypt and store
      const jsonString = JSON.stringify(expiredData);
      const textBytes = new TextEncoder().encode(jsonString);
      const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
      const encrypted = new Uint8Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      const encryptedBase64 = btoa(String.fromCharCode(...encrypted));

      localStorage.setItem('user_context', encryptedBase64);
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify warning was logged
      expect(console.warn).toHaveBeenCalledWith(
        'Persisted user context has expired'
      );

      // Verify expired data was cleared
      expect(localStorage.getItem('user_context')).toBeNull();
    });

    it('should handle localStorage unavailable by falling back gracefully', async () => {
      // Mock localStorage.getItem to throw errors
      const originalGetItem = Storage.prototype.getItem;
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was NOT restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-type')).toHaveTextContent('null');
      });

      // Verify error was logged (the error happens during loadUserContext)
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load user context:',
        expect.any(Error)
      );

      // Restore original implementation
      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('Context restoration with valid tokens', () => {
    it('should restore context only when both persisted data and valid tokens exist', async () => {
      // Setup: Persist user context
      const userContext = {
        uniqueId: 'parent123',
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        email: 'parent@example.com',
        tokens: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      };

      persistUserContext(userContext);

      // Create a valid JWT token (not expired)
      const validPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        userId: 'parent123',
      };
      const base64Payload = btoa(JSON.stringify(validPayload));
      const validToken = `header.${base64Payload}.signature`;

      localStorage.setItem('accessToken', validToken);
      localStorage.setItem('refreshToken', 'mock-refresh');
      localStorage.setItem('userEmail', 'parent@example.com');

      // Render app
      renderAppWithContext();

      // Wait for restoration to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-restoring')).toHaveTextContent('false');
      });

      // Verify user context was restored
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-type')).toHaveTextContent('PARENTS');
        expect(screen.getByTestId('imeis')).toHaveTextContent('["123456789012345"]');
        expect(screen.getByTestId('email')).toHaveTextContent('parent@example.com');
        expect(screen.getByTestId('unique-id')).toHaveTextContent('parent123');
      });

      // Verify console log indicates successful restoration
      expect(console.log).toHaveBeenCalledWith(
        'User context restored successfully:',
        expect.objectContaining({
          userType: 'PARENTS',
          imeiCount: 1,
          email: 'parent@example.com',
        })
      );
    });
  });
});
