/**
 * Performance Monitor Component
 * Real-time performance monitoring for colorful UI components
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card.jsx';
import { Button } from './Button.jsx';
import { usePerformanceOptimization, useMemoryMonitoring } from '../hooks/usePerformanceOptimization.js';
import { performanceMonitor, performanceTester } from '../utils/performance.js';

// Performance metrics display component
const MetricCard = ({ title, value, unit, status, description }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'amber';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Card variant="colorful" colorScheme={getStatusColor(status)} padding="sm">
      <Card.Header>
        <Card.Title className="text-sm font-medium">{title}</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-text-secondary mt-1">{description}</p>
        )}
      </Card.Content>
    </Card>
  );
};

// Real-time performance dashboard
export const PerformanceMonitor = ({ 
  componentName = 'ColorfulUI',
  enableRealTimeMonitoring = true,
  monitoringInterval = 2000,
  showMemoryUsage = true,
  showFrameRate = true,
  showRenderMetrics = true,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    frameRate: null,
    renderTime: null,
    memoryUsage: null,
    paintMetrics: null,
  });
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  const monitorRef = useRef(null);
  const intervalRef = useRef(null);

  const { 
    deviceCapabilities, 
    optimizedConfig, 
    performanceMetrics,
    measurePerformance 
  } = usePerformanceOptimization(componentName);

  const { memoryMetrics, isMemoryConstrained } = useMemoryMonitoring(componentName, {
    monitoringInterval,
    enableMonitoring: enableRealTimeMonitoring && showMemoryUsage,
  });

  // Real-time monitoring
  useEffect(() => {
    if (!enableRealTimeMonitoring || !isVisible) return;

    const updateMetrics = async () => {
      try {
        // Measure frame rate
        if (showFrameRate) {
          const frameRate = await performanceMonitor.measureFrameRate(1000);
          setPerformanceData(prev => ({ ...prev, frameRate }));
        }

        // Measure paint metrics
        if (showRenderMetrics) {
          const paintMetrics = await performanceMonitor.measurePaintMetrics();
          setPerformanceData(prev => ({ ...prev, paintMetrics }));
        }

        // Update memory usage from hook
        if (showMemoryUsage && memoryMetrics) {
          setPerformanceData(prev => ({ 
            ...prev, 
            memoryUsage: {
              used: Math.round(memoryMetrics.usedJSHeapSize / 1024 / 1024),
              total: Math.round(memoryMetrics.totalJSHeapSize / 1024 / 1024),
              limit: Math.round(memoryMetrics.jsHeapSizeLimit / 1024 / 1024),
              percentage: Math.round((memoryMetrics.usedJSHeapSize / memoryMetrics.jsHeapSizeLimit) * 100),
            }
          }));
        }
      } catch (error) {
        console.warn('[Performance Monitor] Error updating metrics:', error);
      }
    };

    // Initial update
    updateMetrics();

    // Set up interval
    intervalRef.current = setInterval(updateMetrics, monitoringInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableRealTimeMonitoring, isVisible, monitoringInterval, showFrameRate, showRenderMetrics, showMemoryUsage, memoryMetrics]);

  // Run performance tests
  const runPerformanceTests = async () => {
    setIsRunningTests(true);
    
    try {
      const results = await performanceTester.runPerformanceTestSuite([
        { name: 'ColorfulCard' },
        { name: 'ColorfulButton' },
        { name: 'ColorfulChart' },
      ]);
      
      setTestResults(results);
    } catch (error) {
      console.error('[Performance Monitor] Test suite failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Get status for metrics
  const getFrameRateStatus = (fps) => {
    if (!fps) return 'info';
    if (fps >= 55) return 'good';
    if (fps >= 30) return 'warning';
    return 'error';
  };

  const getMemoryStatus = (percentage) => {
    if (!percentage) return 'info';
    if (percentage < 60) return 'good';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  const getRenderTimeStatus = (time) => {
    if (!time) return 'info';
    if (time < 8) return 'good';
    if (time < 16) return 'warning';
    return 'error';
  };

  // Toggle visibility
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="gradient"
          colorScheme="violet"
          size="sm"
          onClick={() => setIsVisible(true)}
        >
          📊 Performance
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto ${className}`}>
      <Card variant="glass" padding="md">
        <Card.Header>
          <Card.Title className="flex items-center justify-between">
            <span>Performance Monitor</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </Card.Title>
          <Card.Description>
            Real-time performance metrics for {componentName}
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <div className="space-y-4">
            {/* Device Info */}
            {deviceCapabilities && (
              <div className="text-xs text-text-secondary">
                <div>Device: {deviceCapabilities.type}</div>
                <div>Memory: {deviceCapabilities.memoryLimit}</div>
                <div>Connection: {deviceCapabilities.connectionSpeed}</div>
              </div>
            )}

            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {showFrameRate && (
                <MetricCard
                  title="Frame Rate"
                  value={performanceData.frameRate || '--'}
                  unit="fps"
                  status={getFrameRateStatus(performanceData.frameRate)}
                  description="Target: 60fps"
                />
              )}

              {showMemoryUsage && performanceData.memoryUsage && (
                <MetricCard
                  title="Memory"
                  value={performanceData.memoryUsage.percentage || '--'}
                  unit="%"
                  status={getMemoryStatus(performanceData.memoryUsage.percentage)}
                  description={`${performanceData.memoryUsage.used}MB / ${performanceData.memoryUsage.limit}MB`}
                />
              )}

              {showRenderMetrics && performanceData.paintMetrics?.firstContentfulPaint && (
                <MetricCard
                  title="First Paint"
                  value={Math.round(performanceData.paintMetrics.firstContentfulPaint)}
                  unit="ms"
                  status={getRenderTimeStatus(performanceData.paintMetrics.firstContentfulPaint)}
                  description="First Contentful Paint"
                />
              )}

              {performanceMetrics?.metrics?.frameRate && (
                <MetricCard
                  title="Avg FPS"
                  value={performanceMetrics.metrics.frameRate}
                  unit="fps"
                  status={getFrameRateStatus(performanceMetrics.metrics.frameRate)}
                  description="Average frame rate"
                />
              )}
            </div>

            {/* Optimization Status */}
            {optimizedConfig && (
              <div className="text-xs space-y-1">
                <div className="font-medium text-text-primary">Optimizations:</div>
                <div className="text-text-secondary">
                  <div>Gradients: {optimizedConfig.enableGradients ? '✅' : '❌'}</div>
                  <div>Animations: {optimizedConfig.enableAnimations ? '✅' : '❌'}</div>
                  <div>Glow Effects: {optimizedConfig.enableGlowEffects ? '✅' : '❌'}</div>
                  <div>Max Colors: {optimizedConfig.maxColors}</div>
                </div>
              </div>
            )}

            {/* Memory Warning */}
            {isMemoryConstrained && (
              <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                ⚠️ High memory usage detected. Consider reducing visual complexity.
              </div>
            )}

            {/* Test Results */}
            {testResults && (
              <div className="text-xs space-y-2">
                <div className="font-medium text-text-primary">Test Results:</div>
                {Object.entries(testResults.tests).map(([component, result]) => (
                  <div key={component} className="text-text-secondary">
                    <div className="font-medium">{component}:</div>
                    {result.error ? (
                      <div className="text-red-400">❌ {result.error}</div>
                    ) : (
                      <div className="ml-2">
                        <div>Frame Rate: {result.metrics?.frameRate || 'N/A'}fps</div>
                        <div>Status: {result.performance?.isGoodFrameRate ? '✅' : '❌'}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                colorScheme="blue"
                size="xs"
                onClick={runPerformanceTests}
                loading={isRunningTests}
                disabled={isRunningTests}
              >
                Run Tests
              </Button>
              
              <Button
                variant="outline"
                colorScheme="teal"
                size="xs"
                onClick={measurePerformance}
              >
                Measure
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Performance warning component for development
export const PerformanceWarning = ({ 
  threshold = 16, 
  component, 
  renderTime,
  onDismiss 
}) => {
  if (!component || !renderTime || renderTime < threshold) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card variant="colorful" colorScheme="red" padding="sm">
        <Card.Header>
          <Card.Title className="text-sm flex items-center justify-between">
            <span>⚠️ Performance Warning</span>
            {onDismiss && (
              <Button variant="ghost" size="xs" onClick={onDismiss}>
                ✕
              </Button>
            )}
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-sm">
            <div className="font-medium">{component}</div>
            <div className="text-text-secondary">
              Render time: {renderTime.toFixed(2)}ms
            </div>
            <div className="text-text-secondary">
              Exceeds {threshold}ms budget for 60fps
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// HOC for automatic performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const [renderTime, setRenderTime] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    
    const { measureRenderTime } = usePerformanceOptimization(componentName);

    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        const { renderTime: time } = measureRenderTime(() => {
          // This is just for measurement, actual render happens below
          return 'measured';
        });
        
        setRenderTime(time);
        
        if (time > 16) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }
      }
    }, [measureRenderTime]);

    return (
      <>
        <WrappedComponent ref={ref} {...props} />
        {process.env.NODE_ENV === 'development' && (
          <PerformanceWarning
            component={componentName}
            renderTime={renderTime}
            onDismiss={() => setShowWarning(false)}
          />
        )}
      </>
    );
  });
};

export default PerformanceMonitor;