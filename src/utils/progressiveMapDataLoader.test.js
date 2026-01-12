/**
 * Unit tests for Progressive Map Data Loader
 * 
 * Tests chunked data fetching, progress callbacks, and data sampling
 * Requirements: 2.1, 2.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ProgressiveMapDataLoader,
  loadLocationDataProgressive,
  streamLocationDataChunks,
} from './progressiveMapDataLoader.js';

describe('ProgressiveMapDataLoader', () => {
  let loader;
  let mockFetchFunction;
  let mockProgressCallback;

  beforeEach(() => {
    loader = new ProgressiveMapDataLoader();
    mockProgressCallback = vi.fn();
    mockFetchFunction = vi.fn();
  });

  describe('Chunked Data Fetching (Requirement 2.1)', () => {
    it('should load data in chunks of 100 points by default', async () => {
      // Create test data with 250 points
      const testData = Array.from({ length: 250 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date(Date.now() - i * 60000).toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const chunkCallback = vi.fn();
      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          onChunk: chunkCallback,
          chunkSize: 100,
          enableSampling: false,
        }
      );

      // Should have called chunk callback 3 times (100, 100, 50)
      expect(chunkCallback).toHaveBeenCalledTimes(3);
      expect(chunkCallback.mock.calls[0][0]).toHaveLength(100); // First chunk
      expect(chunkCallback.mock.calls[1][0]).toHaveLength(100); // Second chunk
      expect(chunkCallback.mock.calls[2][0]).toHaveLength(50);  // Third chunk

      expect(result.data).toHaveLength(250);
      expect(result.metadata.chunksLoaded).toBe(3);
    });

    it('should support custom chunk sizes', async () => {
      const testData = Array.from({ length: 150 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const chunkCallback = vi.fn();
      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          onChunk: chunkCallback,
          chunkSize: 50,
          enableSampling: false,
        }
      );

      // Should have 3 chunks of 50 points each
      expect(chunkCallback).toHaveBeenCalledTimes(3);
      expect(result.metadata.chunksLoaded).toBe(3);
    });

    it('should handle data smaller than chunk size', async () => {
      const testData = Array.from({ length: 25 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          chunkSize: 100,
          enableSampling: false,
        }
      );

      expect(result.data).toHaveLength(25);
      expect(result.metadata.chunksLoaded).toBe(1);
    });
  });

  describe('Progress Callback Support (Requirement 2.3)', () => {
    it('should report progress during loading', async () => {
      const testData = Array.from({ length: 200 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          onProgress: mockProgressCallback,
          chunkSize: 100,
          enableSampling: false,
        }
      );

      // Should have called progress callback multiple times
      expect(mockProgressCallback.mock.calls.length).toBeGreaterThan(0);

      // Check initial progress call
      const firstCall = mockProgressCallback.mock.calls[0][0];
      expect(firstCall).toHaveProperty('status');
      expect(firstCall).toHaveProperty('progress');
      expect(firstCall).toHaveProperty('message');

      // Check final progress call
      const lastCall = mockProgressCallback.mock.calls[mockProgressCallback.mock.calls.length - 1][0];
      expect(lastCall.status).toBe('complete');
      expect(lastCall.progress).toBe(100);
      expect(lastCall.totalPoints).toBe(200);
    });

    it('should report progress with correct percentages', async () => {
      const testData = Array.from({ length: 300 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          onProgress: mockProgressCallback,
          chunkSize: 100,
          enableSampling: false,
        }
      );

      // Find loading progress calls (exclude initial and complete)
      const loadingCalls = mockProgressCallback.mock.calls
        .map(call => call[0])
        .filter(progress => progress.status === 'loading' && progress.progress > 0);

      // Should have progress values between 0 and 100
      loadingCalls.forEach(progress => {
        expect(progress.progress).toBeGreaterThanOrEqual(0);
        expect(progress.progress).toBeLessThanOrEqual(100);
      });
    });

    it('should report error state on fetch failure', async () => {
      mockFetchFunction.mockRejectedValue(new Error('Network error'));

      await expect(
        loader.loadLocationDataProgressive(
          mockFetchFunction,
          'test-imei',
          {
            onProgress: mockProgressCallback,
          }
        )
      ).rejects.toThrow();

      // Should have called progress with error status
      const errorCall = mockProgressCallback.mock.calls.find(
        call => call[0].status === 'error'
      );
      expect(errorCall).toBeDefined();
      expect(errorCall[0]).toHaveProperty('error');
    });
  });

  describe('Data Sampling (Requirement 2.2)', () => {
    it('should sample data when dataset exceeds threshold', async () => {
      // Create large dataset (600 points, above 500 threshold)
      const testData = Array.from({ length: 600 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          enableSampling: true,
        }
      );

      // Should have sampled the data
      expect(result.metadata.sampled).toBe(true);
      expect(result.data.length).toBeLessThan(testData.length);
      expect(result.metadata.originalPoints).toBe(600);
    });

    it('should preserve start and end points when sampling', async () => {
      const testData = Array.from({ length: 600 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
        index: i,
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          enableSampling: true,
        }
      );

      // First and last points should be preserved
      expect(result.data[0].index).toBe(0);
      expect(result.data[result.data.length - 1].index).toBe(599);
    });

    it('should not sample data below threshold', async () => {
      const testData = Array.from({ length: 200 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          enableSampling: true,
        }
      );

      // Should not have sampled (below 500 threshold)
      expect(result.metadata.sampled).toBe(false);
      expect(result.data.length).toBe(200);
    });

    it('should allow disabling sampling', async () => {
      const testData = Array.from({ length: 600 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          enableSampling: false,
        }
      );

      // Should not have sampled even though above threshold
      expect(result.metadata.sampled).toBe(false);
      expect(result.data.length).toBe(600);
    });
  });

  describe('Error Handling', () => {
    it('should retry on fetch failure', async () => {
      mockFetchFunction
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([{ lat: 40.7128, lng: -74.0060, time: new Date().toISOString() }]);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei'
      );

      // Should have retried and succeeded
      expect(mockFetchFunction).toHaveBeenCalledTimes(3);
      expect(result.data).toHaveLength(1);
    });

    it('should throw after max retry attempts', async () => {
      mockFetchFunction.mockRejectedValue(new Error('Network error'));

      await expect(
        loader.loadLocationDataProgressive(
          mockFetchFunction,
          'test-imei'
        )
      ).rejects.toThrow('Failed to fetch data after 3 attempts');

      expect(mockFetchFunction).toHaveBeenCalledTimes(3);
    });

    it('should handle empty data gracefully', async () => {
      mockFetchFunction.mockResolvedValue([]);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          onProgress: mockProgressCallback,
        }
      );

      expect(result.data).toHaveLength(0);
      expect(result.metadata.totalPoints).toBe(0);

      // Should report completion
      const lastCall = mockProgressCallback.mock.calls[mockProgressCallback.mock.calls.length - 1][0];
      expect(lastCall.status).toBe('complete');
    });

    it('should handle null/undefined data', async () => {
      mockFetchFunction.mockResolvedValue(null);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei'
      );

      expect(result.data).toHaveLength(0);
    });
  });

  describe('Metadata', () => {
    it('should return comprehensive metadata', async () => {
      const testData = Array.from({ length: 150 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      mockFetchFunction.mockResolvedValue(testData);

      const result = await loader.loadLocationDataProgressive(
        mockFetchFunction,
        'test-imei',
        {
          enableSampling: false,
        }
      );

      expect(result.metadata).toHaveProperty('totalPoints');
      expect(result.metadata).toHaveProperty('originalPoints');
      expect(result.metadata).toHaveProperty('chunksLoaded');
      expect(result.metadata).toHaveProperty('loadTime');
      expect(result.metadata).toHaveProperty('sampled');
      expect(result.metadata).toHaveProperty('samplingRatio');

      expect(result.metadata.totalPoints).toBe(150);
      expect(result.metadata.loadTime).toBeGreaterThan(0);
    });
  });
});

describe('Convenience Functions', () => {
  describe('loadLocationDataProgressive', () => {
    it('should work as a standalone function', async () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      const mockFetch = vi.fn().mockResolvedValue(testData);

      const result = await loadLocationDataProgressive(
        mockFetch,
        'test-imei',
        {
          enableSampling: false,
        }
      );

      expect(result.data).toHaveLength(100);
      expect(result.metadata.totalPoints).toBe(100);
    });
  });

  describe('streamLocationDataChunks', () => {
    it('should yield chunks progressively', async () => {
      const testData = Array.from({ length: 250 }, (_, i) => ({
        lat: 40.7128 + i * 0.001,
        lng: -74.0060 + i * 0.001,
        time: new Date().toISOString(),
      }));

      const mockFetch = vi.fn().mockResolvedValue(testData);

      const chunks = [];
      for await (const { chunk, progress } of streamLocationDataChunks(
        mockFetch,
        'test-imei',
        {
          chunkSize: 100,
          enableSampling: false,
        }
      )) {
        chunks.push(chunk);
        expect(progress).toHaveProperty('status');
        expect(progress).toHaveProperty('progress');
      }

      // Should have 3 chunks (100, 100, 50)
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toHaveLength(100);
      expect(chunks[1]).toHaveLength(100);
      expect(chunks[2]).toHaveLength(50);
    });

    it('should handle errors in streaming', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const results = [];
      for await (const result of streamLocationDataChunks(
        mockFetch,
        'test-imei'
      )) {
        results.push(result);
      }

      // Should yield error result
      expect(results).toHaveLength(1);
      expect(results[0].progress.status).toBe('error');
      expect(results[0].chunk).toHaveLength(0);
    });
  });
});
