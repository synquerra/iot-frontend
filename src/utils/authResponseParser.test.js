import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateIMEI, 
  parseIMEIString, 
  parseAuthResponse,
  persistUserContext,
  loadUserContext,
  clearPersistedContext
} from './authResponseParser';

describe('authResponseParser', () => {
  describe('validateIMEI', () => {
    it('should return true for valid 15-digit IMEI', () => {
      expect(validateIMEI('123456789012345')).toBe(true);
      expect(validateIMEI('999999999999999')).toBe(true);
    });

    it('should return false for non-15-digit strings', () => {
      expect(validateIMEI('12345')).toBe(false);
      expect(validateIMEI('12345678901234567')).toBe(false);
    });

    it('should return false for non-numeric strings', () => {
      expect(validateIMEI('12345678901234A')).toBe(false);
      expect(validateIMEI('abc123456789012')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(validateIMEI(123456789012345)).toBe(false);
      expect(validateIMEI(null)).toBe(false);
      expect(validateIMEI(undefined)).toBe(false);
    });

    it('should handle whitespace by trimming', () => {
      expect(validateIMEI('  123456789012345  ')).toBe(true);
      expect(validateIMEI(' 123456789012345')).toBe(true);
    });
  });

  describe('parseIMEIString', () => {
    it('should parse single IMEI', () => {
      expect(parseIMEIString('123456789012345')).toEqual(['123456789012345']);
    });

    it('should parse comma-separated IMEIs', () => {
      expect(parseIMEIString('123456789012345,999999999999999')).toEqual([
        '123456789012345',
        '999999999999999',
      ]);
    });

    it('should trim whitespace from IMEIs', () => {
      expect(parseIMEIString('  123456789012345  ,  999999999999999  ')).toEqual([
        '123456789012345',
        '999999999999999',
      ]);
    });

    it('should handle empty string', () => {
      expect(parseIMEIString('')).toEqual([]);
      expect(parseIMEIString('   ')).toEqual([]);
    });

    it('should filter out empty values', () => {
      expect(parseIMEIString('123456789012345,,999999999999999')).toEqual([
        '123456789012345',
        '999999999999999',
      ]);
    });

    it('should return empty array for non-string input', () => {
      expect(parseIMEIString(null)).toEqual([]);
      expect(parseIMEIString(undefined)).toEqual([]);
    });
  });

  describe('parseAuthResponse', () => {
    const validResponse = {
      uniqueId: 'user123',
      userType: 'PARENTS',
      imei: '123456789012345',
      email: 'test@example.com',
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      lastLoginAt: '2024-01-01T00:00:00Z',
    };

    it('should parse valid auth response', () => {
      const result = parseAuthResponse(validResponse);
      
      expect(result).toEqual({
        uniqueId: 'user123',
        userType: 'PARENTS',
        imeis: ['123456789012345'],
        email: 'test@example.com',
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        lastLoginAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should parse comma-separated IMEIs', () => {
      const response = {
        ...validResponse,
        imei: '123456789012345,999999999999999',
      };
      
      const result = parseAuthResponse(response);
      expect(result.imeis).toEqual(['123456789012345', '999999999999999']);
    });

    it('should filter out invalid IMEIs', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const response = {
        ...validResponse,
        imei: '123456789012345,invalid,999999999999999',
      };
      
      const result = parseAuthResponse(response);
      expect(result.imeis).toEqual(['123456789012345', '999999999999999']);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle ADMIN user type', () => {
      const response = {
        ...validResponse,
        userType: 'ADMIN',
      };
      
      const result = parseAuthResponse(response);
      expect(result.userType).toBe('ADMIN');
    });

    it('should handle empty IMEI for PARENTS user', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const response = {
        ...validResponse,
        imei: '',
      };
      
      const result = parseAuthResponse(response);
      expect(result.imeis).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('PARENTS user has no valid IMEIs')
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should throw error for missing uniqueId', () => {
      const response = { ...validResponse };
      delete response.uniqueId;
      
      expect(() => parseAuthResponse(response)).toThrow('missing uniqueId');
    });

    it('should throw error for missing userType', () => {
      const response = { ...validResponse };
      delete response.userType;
      
      expect(() => parseAuthResponse(response)).toThrow('missing userType');
    });

    it('should throw error for invalid userType', () => {
      const response = {
        ...validResponse,
        userType: 'INVALID',
      };
      
      expect(() => parseAuthResponse(response)).toThrow('userType must be "PARENTS" or "ADMIN"');
    });

    it('should throw error for missing email', () => {
      const response = { ...validResponse };
      delete response.email;
      
      expect(() => parseAuthResponse(response)).toThrow('missing email');
    });

    it('should throw error for missing tokens', () => {
      const response = { ...validResponse };
      delete response.tokens;
      
      expect(() => parseAuthResponse(response)).toThrow('missing or invalid tokens');
    });

    it('should handle missing lastLoginAt with default', () => {
      const response = { ...validResponse };
      delete response.lastLoginAt;
      
      const result = parseAuthResponse(response);
      expect(result.lastLoginAt).toBeDefined();
      expect(typeof result.lastLoginAt).toBe('string');
    });
  });

  describe('Edge Cases - Task 1.2', () => {
    const validResponse = {
      uniqueId: 'user123',
      userType: 'PARENTS',
      imei: '123456789012345',
      email: 'test@example.com',
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      lastLoginAt: '2024-01-01T00:00:00Z',
    };

    describe('Empty IMEI string handling', () => {
      it('should handle empty IMEI string for PARENTS user', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: '',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('PARENTS');
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle missing IMEI field for PARENTS user', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
        };
        delete response.imei;
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle empty IMEI string for ADMIN user without warning', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          userType: 'ADMIN',
          imei: '',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('ADMIN');
        // Should not warn about ADMIN having no IMEIs (they don't need them)
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle missing IMEI field for ADMIN user without warning', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          userType: 'ADMIN',
        };
        delete response.imei;
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('ADMIN');
        // Should not warn about ADMIN having no IMEIs (they don't need them)
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle null IMEI field for ADMIN user without warning', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          userType: 'ADMIN',
          imei: null,
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('ADMIN');
        // Should not warn about ADMIN having no IMEIs (they don't need them)
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle undefined IMEI field for ADMIN user without warning', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          userType: 'ADMIN',
          imei: undefined,
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('ADMIN');
        // Should not warn about ADMIN having no IMEIs (they don't need them)
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });
    });

    describe('Whitespace in IMEI strings', () => {
      it('should handle IMEI string with only whitespace', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: '   ',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle IMEI string with tabs and newlines', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: '\t\n  \t',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        
        consoleWarnSpy.mockRestore();
      });

      it('should trim whitespace around valid IMEIs', () => {
        const response = {
          ...validResponse,
          imei: '  123456789012345  ,  999999999999999  ',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual(['123456789012345', '999999999999999']);
      });

      it('should handle mixed whitespace and commas', () => {
        const response = {
          ...validResponse,
          imei: '  , , 123456789012345 , , 999999999999999 , ,  ',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual(['123456789012345', '999999999999999']);
      });

      it('should reject IMEIs with internal whitespace', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: '123 456 789 012 345',
        };
        
        const result = parseAuthResponse(response);
        // Internal whitespace makes it invalid (not 15 digits after trim)
        expect(result.imeis).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('invalid IMEI(s)'),
          expect.any(Array),
          expect.any(String)
        );
        
        consoleWarnSpy.mockRestore();
      });
    });

    describe('All-invalid IMEIs scenario', () => {
      it('should handle all invalid IMEIs for PARENTS user', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: 'invalid1,invalid2,12345,abc123456789012',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('PARENTS');
        
        // Should warn about invalid IMEIs
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('invalid IMEI'),
          expect.any(Array),
          expect.any(String)
        );
        
        // Should also warn about PARENTS user having no valid IMEIs
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle all invalid IMEIs for ADMIN user', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          userType: 'ADMIN',
          imei: 'invalid1,invalid2,12345',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual([]);
        expect(result.userType).toBe('ADMIN');
        
        // Should warn about invalid IMEIs
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('invalid IMEI'),
          expect.any(Array),
          expect.any(String)
        );
        
        // Should NOT warn about ADMIN having no valid IMEIs
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('PARENTS user has no valid IMEIs')
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle mix of valid and invalid IMEIs', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: 'invalid1,123456789012345,invalid2,999999999999999,12345',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual(['123456789012345', '999999999999999']);
        
        // Should warn about the 3 invalid IMEIs
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('3 invalid IMEI'),
          ['invalid1', 'invalid2', '12345'],
          expect.any(String)
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle IMEIs with wrong length', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: '1234567890123,12345678901234567,123456789012345',
        };
        
        const result = parseAuthResponse(response);
        // Only the 15-digit one should be valid
        expect(result.imeis).toEqual(['123456789012345']);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('2 invalid IMEI'),
          ['1234567890123', '12345678901234567'],
          expect.any(String)
        );
        
        consoleWarnSpy.mockRestore();
      });

      it('should handle IMEIs with non-numeric characters', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const response = {
          ...validResponse,
          imei: '12345678901234A,123456789012345,ABCDEFGHIJKLMNO',
        };
        
        const result = parseAuthResponse(response);
        expect(result.imeis).toEqual(['123456789012345']);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('2 invalid IMEI'),
          ['12345678901234A', 'ABCDEFGHIJKLMNO'],
          expect.any(String)
        );
        
        consoleWarnSpy.mockRestore();
      });
    });
  });

  describe('Storage Error Handling - Task 3.2', () => {
    const validUserContext = {
      uniqueId: 'user123',
      userType: 'PARENTS',
      imeis: ['123456789012345', '999999999999999'],
      email: 'test@example.com',
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    };

    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
      sessionStorage.clear();
    });

    afterEach(() => {
      // Clean up after each test
      localStorage.clear();
      sessionStorage.clear();
    });

    describe('Corrupted data handling', () => {
      it('should handle corrupted JSON data in localStorage', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Store corrupted data directly
        localStorage.setItem('user_context', 'corrupted-not-valid-base64!!!');
        
        const result = loadUserContext();
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load user context'),
          expect.any(Error)
        );
        
        // Should clear corrupted data
        expect(localStorage.getItem('user_context')).toBeNull();
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle invalid JSON after decryption', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Store data that decrypts but isn't valid JSON
        // Using btoa to create base64 that will decrypt to invalid JSON
        const invalidData = btoa('not valid json {{{');
        localStorage.setItem('user_context', invalidData);
        
        const result = loadUserContext();
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        // Should clear corrupted data
        expect(localStorage.getItem('user_context')).toBeNull();
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle missing required fields in persisted data', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // First persist valid data
        persistUserContext(validUserContext);
        
        // Then corrupt it by manually setting incomplete data
        const corruptedData = {
          version: '1.0',
          encrypted: true,
          data: {
            uniqueId: 'user123',
            // Missing userType, imeis, email
          },
          timestamp: Date.now(),
          expiresAt: Date.now() + 86400000,
        };
        
        // Manually encrypt and store corrupted data
        const jsonString = JSON.stringify(corruptedData);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        const result = loadUserContext();
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing required fields')
        );
        
        // Should clear corrupted data
        expect(localStorage.getItem('user_context')).toBeNull();
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle invalid userType in persisted data', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Create data with invalid userType
        const invalidData = {
          version: '1.0',
          encrypted: true,
          data: {
            uniqueId: 'user123',
            userType: 'INVALID_TYPE',
            imeis: ['123456789012345'],
            email: 'test@example.com',
          },
          timestamp: Date.now(),
          expiresAt: Date.now() + 86400000,
        };
        
        // Manually encrypt and store
        const jsonString = JSON.stringify(invalidData);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        const result = loadUserContext();
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid userType')
        );
        
        // Should clear corrupted data
        expect(localStorage.getItem('user_context')).toBeNull();
        
        consoleErrorSpy.mockRestore();
      });

      it('should handle version mismatch in persisted data', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Create data with wrong version
        const wrongVersionData = {
          version: '2.0', // Wrong version
          encrypted: true,
          data: {
            uniqueId: 'user123',
            userType: 'PARENTS',
            imeis: ['123456789012345'],
            email: 'test@example.com',
          },
          timestamp: Date.now(),
          expiresAt: Date.now() + 86400000,
        };
        
        // Manually encrypt and store
        const jsonString = JSON.stringify(wrongVersionData);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        const result = loadUserContext();
        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Storage version mismatch')
        );
        
        // Should clear incompatible data
        expect(localStorage.getItem('user_context')).toBeNull();
        
        consoleWarnSpy.mockRestore();
      });
    });

    describe('localStorage unavailable scenario', () => {
      it('should handle localStorage being unavailable during persist', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Mock localStorage to throw error
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = vi.fn(() => {
          throw new Error('QuotaExceededError');
        });
        
        const result = persistUserContext(validUserContext);
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        // Restore original
        Storage.prototype.setItem = originalSetItem;
        consoleErrorSpy.mockRestore();
      });

      it('should handle localStorage being unavailable during load', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Mock localStorage to throw error on getItem
        const originalGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = vi.fn(() => {
          throw new Error('SecurityError');
        });
        
        const result = loadUserContext();
        expect(result).toBeNull();
        
        // Restore original
        Storage.prototype.getItem = originalGetItem;
        consoleWarnSpy.mockRestore();
      });

      it('should return false when clearing context with unavailable storage', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Mock localStorage to throw error on removeItem
        const originalRemoveItem = Storage.prototype.removeItem;
        const originalSetItem = Storage.prototype.setItem;
        const originalGetItem = Storage.prototype.getItem;
        
        Storage.prototype.removeItem = vi.fn(() => {
          throw new Error('SecurityError');
        });
        
        const result = clearPersistedContext();
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        // Restore originals
        Storage.prototype.removeItem = originalRemoveItem;
        Storage.prototype.setItem = originalSetItem;
        Storage.prototype.getItem = originalGetItem;
        consoleErrorSpy.mockRestore();
      });

      it('should handle storage test failure gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        // Save original storage
        const originalStorage = window.localStorage;
        
        // Create a mock storage that throws on all operations
        const mockStorage = {
          setItem: vi.fn(() => { throw new Error('Storage unavailable'); }),
          getItem: vi.fn(() => { throw new Error('Storage unavailable'); }),
          removeItem: vi.fn(() => { throw new Error('Storage unavailable'); }),
          clear: vi.fn(),
          key: vi.fn(),
          length: 0,
        };
        
        // Replace both localStorage and sessionStorage
        Object.defineProperty(window, 'localStorage', {
          value: mockStorage,
          writable: true,
          configurable: true,
        });
        
        Object.defineProperty(window, 'sessionStorage', {
          value: mockStorage,
          writable: true,
          configurable: true,
        });
        
        const result = persistUserContext(validUserContext);
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('No storage mechanism available')
        );
        
        // Restore original storage
        Object.defineProperty(window, 'localStorage', {
          value: originalStorage,
          writable: true,
          configurable: true,
        });
        
        Object.defineProperty(window, 'sessionStorage', {
          value: sessionStorage,
          writable: true,
          configurable: true,
        });
        
        consoleErrorSpy.mockRestore();
      });
    });

    describe('Expired data handling', () => {
      it('should reject expired user context', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Create expired data
        const expiredData = {
          version: '1.0',
          encrypted: true,
          data: {
            uniqueId: 'user123',
            userType: 'PARENTS',
            imeis: ['123456789012345'],
            email: 'test@example.com',
          },
          timestamp: Date.now() - 86400000 * 2, // 2 days ago
          expiresAt: Date.now() - 86400000, // Expired 1 day ago
        };
        
        // Manually encrypt and store
        const jsonString = JSON.stringify(expiredData);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        const result = loadUserContext();
        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('expired')
        );
        
        // Should clear expired data
        expect(localStorage.getItem('user_context')).toBeNull();
        
        consoleWarnSpy.mockRestore();
      });

      it('should accept non-expired user context', () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        
        // Create non-expired data
        const validData = {
          version: '1.0',
          encrypted: true,
          data: {
            uniqueId: 'user123',
            userType: 'PARENTS',
            imeis: ['123456789012345'],
            email: 'test@example.com',
          },
          timestamp: Date.now(),
          expiresAt: Date.now() + 86400000, // Expires in 1 day
        };
        
        // Manually encrypt and store
        const jsonString = JSON.stringify(validData);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        const result = loadUserContext();
        expect(result).not.toBeNull();
        expect(result.uniqueId).toBe('user123');
        expect(result.userType).toBe('PARENTS');
        expect(result.imeis).toEqual(['123456789012345']);
        expect(result.email).toBe('test@example.com');
        
        consoleLogSpy.mockRestore();
      });

      it('should handle missing expiresAt field gracefully', () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        
        // Create data without expiresAt
        const dataWithoutExpiry = {
          version: '1.0',
          encrypted: true,
          data: {
            uniqueId: 'user123',
            userType: 'ADMIN',
            imeis: [],
            email: 'admin@example.com',
          },
          timestamp: Date.now(),
          // No expiresAt field
        };
        
        // Manually encrypt and store
        const jsonString = JSON.stringify(dataWithoutExpiry);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        // Should still load successfully (no expiry check if field missing)
        const result = loadUserContext();
        expect(result).not.toBeNull();
        expect(result.uniqueId).toBe('user123');
        expect(result.userType).toBe('ADMIN');
        
        consoleLogSpy.mockRestore();
      });

      it('should handle edge case of expiry exactly at current time', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const now = Date.now();
        
        // Create data that expires 1ms in the past to ensure it's expired
        const edgeCaseData = {
          version: '1.0',
          encrypted: true,
          data: {
            uniqueId: 'user123',
            userType: 'PARENTS',
            imeis: ['123456789012345'],
            email: 'test@example.com',
          },
          timestamp: now - 1000,
          expiresAt: now - 1, // Expired 1ms ago
        };
        
        // Manually encrypt and store
        const jsonString = JSON.stringify(edgeCaseData);
        const textBytes = new TextEncoder().encode(jsonString);
        const keyBytes = new TextEncoder().encode('user-context-encryption-key-v1');
        const encrypted = new Uint8Array(textBytes.length);
        for (let i = 0; i < textBytes.length; i++) {
          encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
        localStorage.setItem('user_context', encryptedBase64);
        
        const result = loadUserContext();
        // Should be rejected since it's expired
        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('expired')
        );
        
        consoleWarnSpy.mockRestore();
      });
    });

    describe('Integration - persist and load with error scenarios', () => {
      it('should successfully persist and load valid user context', () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        
        const persistResult = persistUserContext(validUserContext);
        expect(persistResult).toBe(true);
        
        const loadResult = loadUserContext();
        expect(loadResult).not.toBeNull();
        expect(loadResult.uniqueId).toBe(validUserContext.uniqueId);
        expect(loadResult.userType).toBe(validUserContext.userType);
        expect(loadResult.imeis).toEqual(validUserContext.imeis);
        expect(loadResult.email).toBe(validUserContext.email);
        expect(loadResult.tokens).toBeNull(); // Tokens not persisted
        
        consoleLogSpy.mockRestore();
      });

      it('should return false when persisting invalid user context', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        const invalidContext = {
          uniqueId: 'user123',
          // Missing required fields
        };
        
        const result = persistUserContext(invalidContext);
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid user context')
        );
        
        consoleErrorSpy.mockRestore();
      });

      it('should clear persisted context successfully', () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        
        // First persist
        persistUserContext(validUserContext);
        expect(localStorage.getItem('user_context')).not.toBeNull();
        
        // Then clear
        const clearResult = clearPersistedContext();
        expect(clearResult).toBe(true);
        expect(localStorage.getItem('user_context')).toBeNull();
        
        // Loading should return null
        const loadResult = loadUserContext();
        expect(loadResult).toBeNull();
        
        consoleLogSpy.mockRestore();
      });
    });
  });
});
