// src/test/api-cache.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiCache, cacheUtils } from '../hooks/useApiCache';

describe('API Cache Hook', () => {
  beforeEach(() => {
    cacheUtils.clearAll();
    vi.clearAllMocks();
  });

  it('should cache API responses', async () => {
    const mockApiFn = vi.fn(() => Promise.resolve('test-data'));
    
    const { result } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.data).toBe('test-data');
    });

    expect(mockApiFn).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const { result: result2 } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    await waitFor(() => {
      expect(result2.current.data).toBe('test-data');
    });

    // Should not call API again due to caching
    expect(mockApiFn).toHaveBeenCalledTimes(1);
  });

  it('should handle loading states', async () => {
    const mockApiFn = vi.fn(() => new Promise(resolve => 
      setTimeout(() => resolve('test-data'), 100)
    ));
    
    const { result } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    // Should start in loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('test-data');
  });

  it('should handle errors', async () => {
    const mockApiFn = vi.fn(() => Promise.reject(new Error('API Error')));
    
    const { result } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });

    expect(result.current.error.message).toBe('API Error');
    expect(result.current.data).toBe(null);
  });

  it('should refresh data when requested', async () => {
    const mockApiFn = vi.fn()
      .mockResolvedValueOnce('initial-data')
      .mockResolvedValueOnce('refreshed-data');
    
    const { result } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.data).toBe('initial-data');
    });

    expect(mockApiFn).toHaveBeenCalledTimes(1);

    // Refresh data
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.data).toBe('refreshed-data');
    });

    expect(mockApiFn).toHaveBeenCalledTimes(2);
  });

  it('should invalidate cache', async () => {
    const mockApiFn = vi.fn(() => Promise.resolve('test-data'));
    
    const { result } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.data).toBe('test-data');
    });

    // Invalidate cache
    result.current.invalidate();

    // New hook should fetch again
    const { result: result2 } = renderHook(() => 
      useApiCache(mockApiFn, [], { ttl: 1000 })
    );

    await waitFor(() => {
      expect(result2.current.data).toBe('test-data');
    });

    // Should have called API twice due to invalidation
    expect(mockApiFn).toHaveBeenCalledTimes(2);
  });
});