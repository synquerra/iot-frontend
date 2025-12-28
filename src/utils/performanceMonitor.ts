/**
 * Performance monitoring utilities for dashboard components
 * Requirements: 8.3, 8.4
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { PerformanceMetrics } from '../types/dashboard';

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitor(
  componentName: string,
  threshold: number = 16 // 16ms for 60fps
): {
  metrics: PerformanceMetrics;
  isOverThreshold: boolean;
  recordRender: () => void;
} {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 1,
    reRenderCount: 0,
  });

  const recordRender = useCallback(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  }, []);

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    setMetrics(prev => ({
      ...prev,
      renderTime,
      reRenderCount: renderCount.current,
    }));

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development' && renderTime > threshold) {
      console.warn(
        `Performance Warning: ${componentName} took ${renderTime.toFixed(2)}ms to render (threshold: ${threshold}ms)`
      );
    }
  });

  const isOverThreshold = metrics.renderTime > threshold;

  return {
    metrics,
    isOverThreshold,
    recordRender,
  };
}

/**
 * Memory usage monitoring hook
 */
export function useMemoryMonitor(): {
  memoryUsage: number | null;
  isHighMemoryUsage: boolean;
} {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        if (memory) {
          setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
        }
      };

      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const isHighMemoryUsage = memoryUsage !== null && memoryUsage > 100; // 100MB threshold

  return {
    memoryUsage,
    isHighMemoryUsage,
  };
}

/**
 * Component render tracking utility
 */
export class RenderTracker {
  private static instance: RenderTracker;
  private renderCounts: Map<string, number> = new Map();
  private renderTimes: Map<string, number[]> = new Map();

  static getInstance(): RenderTracker {
    if (!RenderTracker.instance) {
      RenderTracker.instance = new RenderTracker();
    }
    return RenderTracker.instance;
  }

  trackRender(componentName: string, renderTime: number): void {
    // Update render count
    const currentCount = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, currentCount + 1);

    // Track render times (keep last 10 renders)
    const times = this.renderTimes.get(componentName) || [];
    times.push(renderTime);
    if (times.length > 10) {
      times.shift();
    }
    this.renderTimes.set(componentName, times);
  }

  getMetrics(componentName: string): {
    renderCount: number;
    averageRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
  } {
    const renderCount = this.renderCounts.get(componentName) || 0;
    const times = this.renderTimes.get(componentName) || [];

    if (times.length === 0) {
      return {
        renderCount,
        averageRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: 0,
      };
    }

    const averageRenderTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxRenderTime = Math.max(...times);
    const minRenderTime = Math.min(...times);

    return {
      renderCount,
      averageRenderTime,
      maxRenderTime,
      minRenderTime,
    };
  }

  getAllMetrics(): Record<string, ReturnType<RenderTracker['getMetrics']>> {
    const allMetrics: Record<string, ReturnType<RenderTracker['getMetrics']>> = {};
    
    for (const componentName of this.renderCounts.keys()) {
      allMetrics[componentName] = this.getMetrics(componentName);
    }

    return allMetrics;
  }

  reset(): void {
    this.renderCounts.clear();
    this.renderTimes.clear();
  }
}

/**
 * Performance profiler for measuring component lifecycle
 */
export function createPerformanceProfiler(componentName: string) {
  const tracker = RenderTracker.getInstance();
  let startTime: number;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      tracker.trackRender(componentName, renderTime);
      return renderTime;
    },
    getMetrics: () => tracker.getMetrics(componentName),
  };
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}