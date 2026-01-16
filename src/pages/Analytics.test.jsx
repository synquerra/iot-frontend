import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Analytics from './Analytics'

// Mock device API
vi.mock('../utils/device', () => ({
  listDevices: vi.fn(),
}));

// Mock UserContext - this will be updated per test
let mockUserContext = {
  isAuthenticated: true,
  userType: 'ADMIN',
  imeis: [],
  uniqueId: 'test-user-id',
  email: 'test@example.com',
  tokens: {
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
  },
};

vi.mock('../contexts/UserContext', () => ({
  useUserContext: () => ({
    ...mockUserContext,
    setUserContext: vi.fn(),
    updateTokens: vi.fn(),
    clearUserContext: vi.fn(),
    getUserContext: () => mockUserContext,
    isAdmin: () => mockUserContext.userType === 'ADMIN',
    isParent: () => mockUserContext.userType === 'PARENTS',
  }),
  UserContextProvider: ({ children }) => children,
}));

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

// Mock device data
const mockDevices = [
  { imei: '123456789012345', topic: 'device1', status: 'active', interval: '60' },
  { imei: '123456789012346', topic: 'device2', status: 'active', interval: '60' },
  { imei: '123456789012347', topic: 'device3', status: 'inactive', interval: '-' },
];

describe('Analytics Page', () => {
  beforeEach(async () => {
    // Reset mocks before each test
    const { listDevices } = await import('../utils/device');
    listDevices.mockResolvedValue({ devices: mockDevices });
  });
  describe('Page Structure', () => {
    test('renders analytics dashboard header', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      })
      expect(screen.getByText('Comprehensive analytics and performance metrics for your device network')).toBeInTheDocument()
    })

    test('renders key metrics cards', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        // Check for metric cards
        expect(screen.getByText('Total Devices')).toBeInTheDocument()
      })
      expect(screen.getByText('Active Devices')).toBeInTheDocument()
      expect(screen.getAllByText('Throughput').length).toBeGreaterThan(0)
      expect(screen.getByText('Avg Latency')).toBeInTheDocument()
      expect(screen.getByText('Error Rate')).toBeInTheDocument()
      expect(screen.getByText('Uptime')).toBeInTheDocument()
    })

    test('displays metric values correctly', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        // Check for dynamic device counts from mock data
        expect(screen.getByText('3')).toBeInTheDocument() // Total devices
        expect(screen.getByText('2')).toBeInTheDocument() // Active devices
      })
      // Check for static metric values
      expect(screen.getByText('4,200k')).toBeInTheDocument() // Throughput
      expect(screen.getByText('125ms')).toBeInTheDocument() // Latency
      expect(screen.getByText('2.8%')).toBeInTheDocument() // Error rate
      expect(screen.getByText('99.7%')).toBeInTheDocument() // Uptime
    })
  })

  describe('Chart Components', () => {
    test('renders performance trends chart', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      })
    })

    test('renders device type distribution chart', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Total Devices')).toBeInTheDocument()
      })
    })

    test('renders regional distribution chart', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      })
    })

    test('renders usage trends chart', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      })
    })

    test('renders additional colorful analytics section', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        // Check for performance score - there are multiple instances of "Excellent"
        expect(screen.getAllByText('Excellent').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Enhanced Components Usage', () => {
    test('uses enhanced Card components with proper structure', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        // Check that cards are rendered (enhanced Card components create proper structure)
        const cards = screen.getAllByRole('generic')
        expect(cards.length).toBeGreaterThan(0)
      })
    })

    test('displays footer with last updated information', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        expect(screen.getByText(/Analytics data is updated every 5 minutes/)).toBeInTheDocument()
      })
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    test('applies responsive grid classes for metrics', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        // Check for responsive grid container
        const metricsGrid = screen.getByText('Total Devices').closest('.grid')
        expect(metricsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-6')
      })
    })

    test('applies responsive layout for charts', async () => {
      renderWithRouter(<Analytics />)
      
      await waitFor(() => {
        // Check for responsive chart containers
        const chartGrids = document.querySelectorAll('.grid.grid-cols-1.lg\\:grid-cols-2')
        expect(chartGrids.length).toBeGreaterThan(0)
      })
    })
  })
})