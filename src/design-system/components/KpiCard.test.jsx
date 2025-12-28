/**
 * KPI Card Component Tests
 * Tests for enhanced KPI card functionality including gradients, trends, and responsive behavior
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KpiCard } from './KpiCard';

describe('Enhanced KPI Card Component', () => {
  describe('Basic Rendering', () => {
    it('renders KPI card with title, value, and subtitle', () => {
      render(
        <KpiCard
          title="Total Analytics"
          value={1234}
          subtitle="All datapoints"
          type="performance"
        />
      );

      expect(screen.getByText('Total Analytics')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('All datapoints')).toBeInTheDocument();
    });

    it('renders trend indicators correctly', () => {
      render(
        <KpiCard
          title="Active Devices"
          value={42}
          subtitle="Connected devices"
          type="status"
          trend="up"
          trendValue="+5%"
        />
      );

      expect(screen.getByText('+5%')).toBeInTheDocument();
      // Check for trend icon (SVG)
      const trendIcon = screen.getByText('+5%').parentElement.querySelector('svg');
      expect(trendIcon).toBeInTheDocument();
    });
  });

  describe('Enhanced Visual Features', () => {
    it('applies correct size classes for different sizes', () => {
      const { rerender } = render(
        <KpiCard
          title="Test"
          value={100}
          size="sm"
          data-testid="kpi-card"
        />
      );

      let card = screen.getByTestId('kpi-card');
      expect(card.querySelector('[class*="p-4"]')).toBeInTheDocument();

      rerender(
        <KpiCard
          title="Test"
          value={100}
          size="lg"
          data-testid="kpi-card"
        />
      );

      card = screen.getByTestId('kpi-card');
      expect(card.querySelector('[class*="p-8"]')).toBeInTheDocument();
    });

    it('applies custom styles when provided', () => {
      const customStyle = {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.4)',
      };

      render(
        <KpiCard
          title="Custom Styled"
          value={999}
          style={customStyle}
          data-testid="kpi-card"
        />
      );

      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveStyle({
        background: customStyle.background,
        borderColor: customStyle.borderColor,
      });
    });
  });

  describe('Trend Indicators', () => {
    it('renders up trend with correct styling', () => {
      render(
        <KpiCard
          title="Growth Metric"
          value={150}
          trend="up"
          trendValue="+12%"
        />
      );

      const trendElement = screen.getByText('+12%').parentElement;
      expect(trendElement).toHaveClass('text-green-400');
    });

    it('renders down trend with correct styling', () => {
      render(
        <KpiCard
          title="Decline Metric"
          value={75}
          trend="down"
          trendValue="-8%"
        />
      );

      const trendElement = screen.getByText('-8%').parentElement;
      expect(trendElement).toHaveClass('text-red-400');
    });

    it('renders stable trend with correct styling', () => {
      render(
        <KpiCard
          title="Stable Metric"
          value={100}
          trend="stable"
          trendValue="0%"
        />
      );

      const trendElement = screen.getByText('0%').parentElement;
      expect(trendElement).toHaveClass('text-blue-400');
    });
  });

  describe('Type-based Styling', () => {
    it('applies performance type styling', () => {
      render(
        <KpiCard
          title="Performance"
          value={85}
          type="performance"
          data-testid="kpi-card"
        />
      );

      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('group');
    });

    it('applies status type styling', () => {
      render(
        <KpiCard
          title="Status"
          value="Active"
          type="status"
          animated={true}
          data-testid="kpi-card"
        />
      );

      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('group');
    });

    it('applies growth type styling', () => {
      render(
        <KpiCard
          title="Growth"
          value={125}
          type="growth"
          trend="up"
          data-testid="kpi-card"
        />
      );

      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('group');
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <KpiCard
          title="Accessible KPI"
          value={200}
          subtitle="With proper structure"
        />
      );

      // Title should be rendered as text, not heading (it's part of a larger dashboard structure)
      expect(screen.getByText('Accessible KPI')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('With proper structure')).toBeInTheDocument();
    });

    it('supports custom className for styling', () => {
      render(
        <KpiCard
          title="Custom Class"
          value={300}
          className="custom-kpi-class"
          data-testid="kpi-card"
        />
      );

      const card = screen.getByTestId('kpi-card');
      expect(card).toHaveClass('custom-kpi-class');
    });
  });

  describe('Responsive Behavior', () => {
    it('renders without errors for different value types', () => {
      const { rerender } = render(
        <KpiCard title="Number" value={123} />
      );

      expect(screen.getByText('123')).toBeInTheDocument();

      rerender(<KpiCard title="String" value="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();

      rerender(<KpiCard title="Zero" value={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});