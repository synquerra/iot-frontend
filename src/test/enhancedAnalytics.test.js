// src/test/enhancedAnalytics.test.js

import { EnhancedAnalyticsAPI } from '../utils/enhancedAnalytics.js';
import { ResponseValidator } from '../utils/responseValidator.js';
import { PaginationManager } from '../utils/paginationManager.js';

/**
 * Basic integration tests for the Enhanced Analytics API
 * These tests verify that the truncation fix is working correctly
 */

describe('Enhanced Analytics API', () => {
  let api;

  beforeEach(() => {
    api = new EnhancedAnalyticsAPI({
      maxRetries: 2,
      fallbackPageSize: 100,
      validation: {
        maxResponseSize: 1024 * 1024, // 1MB for testing
        minExpectedSize: 10
      },
      pagination: {
        defaultPageSize: 50,
        maxPages: 5
      }
    });
  });

  describe('Response Validation', () => {
    test('should detect truncated JSON responses', () => {
      const validator = new ResponseValidator();
      
      // Test truncated JSON object
      const truncatedJson = '{"data": [{"id": 1, "name": "test"';
      const result = validator.validateResponse(truncatedJson);
      
      expect(result.isValid).toBe(false);
      expect(result.isTruncated).toBe(true);
      expect(result.errors).toContain(expect.stringMatching(/truncated/i));
    });

    test('should validate complete JSON responses', () => {
      const validator = new ResponseValidator();
      
      const completeJson = '{"data": [{"id": 1, "name": "test"}]}';
      const result = validator.validateResponse(completeJson);
      
      expect(result.isValid).toBe(true);
      expect(result.isTruncated).toBe(false);
    });

    test('should detect suspicious response endings', () => {
      const validator = new ResponseValidator();
      
      const suspiciousEndings = [
        '{"data": [{"id": 1,',  // Ends with comma
        '{"data": [{"id":',     // Ends with colon
        '{"data": [{"id": "',   // Ends with quote
        '{"data": [{',          // Ends with opening brace
        '{"data": ['             // Ends with opening bracket
      ];

      suspiciousEndings.forEach(ending => {
        const result = validator.validateResponse(ending);
        expect(result.isTruncated).toBe(true);
      });
    });
  });

  describe('Pagination Manager', () => {
    test('should handle paginated queries correctly', async () => {
      const manager = new PaginationManager({
        defaultPageSize: 10,
        maxPages: 3
      });

      // Mock query function that returns different data per page
      const mockQuery = jest.fn()
        .mockResolvedValueOnce([{id: 1}, {id: 2}])  // Page 1: 2 items
        .mockResolvedValueOnce([{id: 3}, {id: 4}])  // Page 2: 2 items  
        .mockResolvedValueOnce([{id: 5}]);          // Page 3: 1 item (less than page size, stops)

      const results = await manager.fetchPaginated(mockQuery, {
        pageSize: 10,
        maxPages: 5
      });

      expect(results).toHaveLength(5);
      expect(results[0].id).toBe(1);
      expect(results[4].id).toBe(5);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    test('should handle retry with backoff on failures', async () => {
      const manager = new PaginationManager();
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const result = await manager.retryWithBackoff(mockFn, 3);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Enhanced Analytics API Integration', () => {
    test('should create API instance with correct configuration', () => {
      expect(api.validator).toBeInstanceOf(ResponseValidator);
      expect(api.paginationManager).toBeInstanceOf(PaginationManager);
      expect(api.maxRetries).toBe(2);
      expect(api.fallbackPageSize).toBe(100);
    });

    test('should perform health check', async () => {
      // Mock the analytics functions to avoid actual API calls
      jest.mock('../utils/analytics.js', () => ({
        getAnalyticsCount: jest.fn().mockResolvedValue(100),
        getAnalyticsPaginated: jest.fn().mockResolvedValue([{id: 1}, {id: 2}])
      }));

      const health = await api.healthCheck();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('tests');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });
  });

  describe('Error Handling', () => {
    test('should handle truncation errors gracefully', () => {
      const validator = new ResponseValidator();
      
      // Simulate a truncated response that would cause JSON parse error
      const truncatedResponse = '{"data": [{"id": 1, "name": "test", "value":';
      
      const result = validator.validateResponse(truncatedResponse);
      
      expect(result.isValid).toBe(false);
      expect(result.isTruncated).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should provide meaningful error messages', () => {
      const validator = new ResponseValidator();
      
      const invalidResponse = null;
      const result = validator.validateResponse(invalidResponse);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Response is null or undefined');
    });
  });
});

// Export for manual testing
export { EnhancedAnalyticsAPI, ResponseValidator, PaginationManager };