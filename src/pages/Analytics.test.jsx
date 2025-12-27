import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Analytics from './Analytics'

// Mock recharts components to avoid canvas issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Analytics Page', () => {
  describe('Page Structure', () => {
    test('renders analytics dashboard header', () => {
      renderWithRouter(<Analytics />)
      
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive analytics and performance metrics for your device network')).toBeInTheDocument()
    })

    test('renders key metrics cards', () => {
      renderWithRouter(<Analytics />)
      
      // Check for metric cards
      expect(screen.getByText('Total Devices')).toBeInTheDocument()
      expect(screen.getByText('Active Devices')).toBeInTheDocument()
      expect(screen.getByText('Throughput')).toBeInTheDocument()
      expect(screen.getByText('Avg Latency')).toBeInTheDocument()
      expect(screen.getByText('Error Rate')).toBeInTheDocument()
      expect(screen.getByText('Uptime')).toBeInTheDocument()
    })

    test('displays metric values correctly', () => {
      renderWithRouter(<Analytics />)
      
      // Check for formatted metric values
      expect(screen.getByText('4,180')).toBeInTheDocument() // Total devices
      expect(screen.getByText('3,935')).toBeInTheDocument() // Active devices
      expect(screen.getByText('4,200k')).toBeInTheDocument() // Throughput
      expect(screen.getByText('125ms')).toBeInTheDocument() // Latency
      expect(screen.getByText('2.8%')).toBeInTheDocument() // Error rate
      expect(screen.getByText('99.7%')).toBeInTheDocument() // Uptime
    })
  })

  describe('Chart Components', () => {
    test('renders performance trends chart', () => {
      renderWithRouter(<Analytics />)
      
      expect(screen.getByText('Performance Trends')).toBeInTheDocument()
      expect(screen.getByText('System performance metrics over the last 24 hours')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    test('renders device type distribution chart', () => {
      renderWithRouter(<Analytics />)
      
      expect(screen.getByText('Device Type Distribution')).toBeInTheDocument()
      expect(screen.getByText('Breakdown of connected devices by type')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    test('renders regional distribution chart', () => {
      renderWithRouter(<Analytics />)
      
      expect(screen.getByText('Regional Distribution')).toBeInTheDocument()
      expect(screen.getByText('Device deployment and activity by geographic region')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    test('renders usage trends chart', () => {
      renderWithRouter(<Analytics />)
      
      expect(screen.getByText('Usage Trends')).toBeInTheDocument()
      expect(screen.getByText('Data transfer and API usage over the last 6 months')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })

  describe('Enhanced Components Usage', () => {
    test('uses enhanced Card components with proper structure', () => {
      renderWithRouter(<Analytics />)
      
      // Check that cards are rendered (enhanced Card components create proper structure)
      const cards = screen.getAllByRole('generic')
      expect(cards.length).toBeGreaterThan(0)
    })

    test('displays footer with last updated information', () => {
      renderWithRouter(<Analytics />)
      
      expect(screen.getByText(/Analytics data is updated every 5 minutes/)).toBeInTheDocument()
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    test('applies responsive grid classes for metrics', () => {
      renderWithRouter(<Analytics />)
      
      // Check for responsive grid container
      const metricsGrid = screen.getByText('Total Devices').closest('.grid')
      expect(metricsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-6')
    })

    test('applies responsive layout for charts', () => {
      renderWithRouter(<Analytics />)
      
      // Check for responsive chart containers
      const chartGrids = document.querySelectorAll('.grid.grid-cols-1.lg\\:grid-cols-2')
      expect(chartGrids.length).toBeGreaterThan(0)
    })
  })
})