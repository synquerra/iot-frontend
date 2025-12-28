/**
 * Integration tests for enhanced component infrastructure
 * Tests the enhanced KPI cards, responsive grid, and performance monitoring
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedKpiCard } from './EnhancedKpiCard';
import { ResponsiveGrid, DashboardKpiGrid } from './ResponsiveGrid';
import { dashboardPerformanceMonitor } from '../utils/dashboardPerformance';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));
window.IntersectionObserver = mockIntersectionObserver;

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10, // 10MB
      totalJSHeapSize: 1024 * 1024 * 50, // 50MB
      jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
    }
  },
  writable: true
});

// Mock canvas for device capabilities detection
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  canvas: {},
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

describe('Enhanced Component Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EnhancedKpiCard', () => {
    it('renders basic KPI card with title and value', () => {
      render(
        <EnhancedKpiCard
          title="Total Users"
          value={1234}
          subtitle="Active users"
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active users')).toBeInTheDocument();
    });

    it('displays loading state correctly', () => {
      render(
        <EnhancedKpiCard
          title="Total Users"
          value={1234}
          loading={true}
        />
      );

      // Should show loading skeleton instead of content
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });

    it('shows trend indicators when provided', () => {
      render(
        <EnhancedKpiCard
          title="Revenue"
          value={50000}
          trend="up"
          trendValue="+12%"
        />
      );

      expect(screen.getByText('+12%')).toBeInTheDocument();
    });

    it('handles numeric value animation', async () => {
      const { rerender } = render(
        <EnhancedKpiCard
          title="Counter"
          value={0}
          countAnimation={true}
        />
      );

      // Update value to trigger animation
      rerender(
        <EnhancedKpiCard
          title="Counter"
          value={100}
          countAnimation={true}
        />
      );

      // Animation should be triggered (we can't easily test the actual animation)
      expect(screen.getByText('Counter')).toBeInTheDocument();
    });

    it('renders sparkline when data is provided', () => {
      const { container } = render(
        <EnhancedKpiCard
          title="Trend"
          value={100}
          showSparkline={true}
          sparklineData={[10, 20, 15, 25, 30]}
        />
      );

      // The component should render successfully with sparkline props
      expect(container.querySelector('[class*="transform"]')).toBeInTheDocument();
      expect(screen.getByText('Trend')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('ResponsiveGrid', () => {
    it('renders grid with default columns', () => {
      render(
        <ResponsiveGrid data-testid="grid">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid');
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('applies responsive column classes', () => {
      render(
        <ResponsiveGrid 
          columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
          data-testid="responsive-grid"
        >
          <div>Item</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('responsive-grid');
      expect(grid).toHaveClass('grid');
      // Note: Testing exact responsive classes is difficult in jsdom
      // but we can verify the grid class is applied
    });

    it('applies gap classes correctly', () => {
      render(
        <ResponsiveGrid gap="lg" data-testid="gap-grid">
          <div>Item</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('gap-grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('DashboardKpiGrid', () => {
    it('renders specialized dashboard KPI grid', () => {
      render(
        <DashboardKpiGrid data-testid="kpi-grid">
          <EnhancedKpiCard title="KPI 1" value={100} />
          <EnhancedKpiCard title="KPI 2" value={200} />
        </DashboardKpiGrid>
      );

      const grid = screen.getByTestId('kpi-grid');
      expect(grid).toHaveClass('grid');
      expect(screen.getByText('KPI 1')).toBeInTheDocument();
      expect(screen.getByText('KPI 2')).toBeInTheDocument();
    });
  });

  describe('Dashboard Performance Monitoring', () => {
    it('measures KPI card performance', async () => {
      const result = await dashboardPerformanceMonitor.measureKpiCardPerformance(2);
      
      expect(result).toHaveProperty('totalTime');
      expect(result).toHaveProperty('averageCardRenderTime');
      expect(result).toHaveProperty('cardResults');
      expect(result).toHaveProperty('performance');
      expect(result.cardResults).toHaveLength(2);
      expect(typeof result.totalTime).toBe('number');
      expect(typeof result.averageCardRenderTime).toBe('number');
    });

    it('measures grid layout performance', async () => {
      const result = await dashboardPerformanceMonitor.measureGridLayoutPerformance(6);
      
      expect(result).toHaveProperty('totalTime');
      expect(result).toHaveProperty('itemCount');
      expect(result).toHaveProperty('performance');
      expect(result.itemCount).toBe(6);
      expect(typeof result.totalTime).toBe('number');
    });

    it('measures animation performance', async () => {
      const result = await dashboardPerformanceMonitor.measureAnimationPerformance('hover', 100);
      
      expect(result).toHaveProperty('animationType');
      expect(result).toHaveProperty('frameRate');
      expect(result).toHaveProperty('performance');
      expect(result.animationType).toBe('hover');
      expect(typeof result.frameRate).toBe('number');
    });

    it('runs comprehensive dashboard performance audit', async () => {
      const result = await dashboardPerformanceMonitor.runDashboardPerformanceAudit();
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('deviceCapabilities');
      expect(result).toHaveProperty('tests');
      expect(result).toHaveProperty('overallPerformance');
      expect(result.tests).toHaveProperty('kpiCards');
      expect(result.tests).toHaveProperty('gridLayout');
      expect(result.tests).toHaveProperty('hoverAnimations');
    });
  });

  describe('Integration Tests', () => {
    it('renders complete dashboard infrastructure together', () => {
      render(
        <DashboardKpiGrid>
          <EnhancedKpiCard
            title="Total Revenue"
            value={125000}
            subtitle="This month"
            trend="up"
            trendValue="+15%"
            type="performance"
            colorScheme="green"
          />
          <EnhancedKpiCard
            title="Active Users"
            value={8432}
            subtitle="Online now"
            trend="stable"
            type="status"
            colorScheme="blue"
          />
          <EnhancedKpiCard
            title="Conversion Rate"
            value={3.2}
            subtitle="Percentage"
            trend="down"
            trendValue="-2%"
            type="performance"
            colorScheme="amber"
          />
          <EnhancedKpiCard
            title="Server Load"
            value={67}
            subtitle="CPU usage"
            trend="up"
            trendValue="+5%"
            type="status"
            colorScheme="red"
          />
        </DashboardKpiGrid>
      );

      // Verify all KPI cards are rendered
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Server Load')).toBeInTheDocument();

      // Verify trend values are displayed
      expect(screen.getByText('+15%')).toBeInTheDocument();
      expect(screen.getByText('-2%')).toBeInTheDocument();
      expect(screen.getByText('+5%')).toBeInTheDocument();
    });

    it('handles responsive behavior correctly', () => {
      render(
        <ResponsiveGrid
          columns={{ xs: 1, sm: 2, md: 3 }}
          gap="md"
          data-testid="responsive-dashboard"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <EnhancedKpiCard
              key={i}
              title={`Metric ${i + 1}`}
              value={Math.floor(Math.random() * 1000)}
              animated={true}
            />
          ))}
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('responsive-dashboard');
      expect(grid).toHaveClass('grid');
      
      // Verify all items are rendered
      for (let i = 1; i <= 6; i++) {
        expect(screen.getByText(`Metric ${i}`)).toBeInTheDocument();
      }
    });
  });
});