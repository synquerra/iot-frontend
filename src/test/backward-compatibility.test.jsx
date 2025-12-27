/**
 * Backward Compatibility Tests
 * Validates: Requirements 8.2
 * 
 * This test suite ensures that all enhanced components maintain existing 
 * functionality and API compatibility while adding new visual improvements.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Import all pages to test
import Dashboard from '../pages/Dashboard'
import Devices from '../pages/Devices'
import Analytics from '../pages/Analytics'
import Login from '../pages/Login'
import Settings from '../pages/Settings'
import Alerts from '../pages/Alerts'
import Configuration from '../pages/Configuration'

// Import enhanced components
import { Button } from '../design-system/components/Button'
import { Card } from '../design-system/components/Card'
import { Input } from '../design-system/components/Input'
import { Table } from '../design-system/components/Table'

// Mock external dependencies
vi.mock('../utils/auth', () => ({
  authenticateUser: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
  logoutUser: vi.fn(),
}))

vi.mock('../utils/analytics', () => ({
  getAnalyticsCount: vi.fn().mockResolvedValue(100),
  getAnalyticsPaginated: vi.fn().mockResolvedValue([
    { imei: '123456789', speed: 45, latitude: 40.7128, longitude: -74.0060, type: 'GPS' }
  ]),
  getAllAnalytics: vi.fn().mockResolvedValue([
    { imei: '123456789', speed: 45, latitude: 40.7128, longitude: -74.0060 }
  ]),
  getAnalyticsByImei: vi.fn().mockResolvedValue([
    { latitude: 40.7128, longitude: -74.0060, timestamp: '2024-01-01T00:00:00Z' }
  ]),
}))

vi.mock('../utils/device', () => ({
  listDevices: vi.fn().mockResolvedValue({
    devices: [
      { topic: 'device1', imei: '123456789', interval: 30, geoid: 'US', createdAt: '2024-01-01' }
    ]
  }),
}))

// Mock Leaflet components to avoid DOM issues in tests
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ fitBounds: vi.fn() }),
}))

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Backward Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'test@example.com'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
  })

  /**
   * Property 10: Backward Compatibility
   * For any enhanced component, the implementation should maintain existing 
   * functionality and API compatibility while adding new visual improvements.
   */

  describe('Page Rendering Compatibility', () => {
    test('Dashboard page renders without errors and maintains core functionality', async () => {
      renderWithRouter(<Dashboard />)
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument()
      })
      
      // Check that core dashboard elements are present
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText(/Live analytics dashboard/)).toBeInTheDocument()
      expect(screen.getByText('Total Analytics')).toBeInTheDocument()
      expect(screen.getByText('Total Devices')).toBeInTheDocument()
      expect(screen.getByText('Recent Data')).toBeInTheDocument()
      
      // Check that enhanced components are working
      expect(screen.getByText('Device Location Map')).toBeInTheDocument()
      expect(screen.getByText('Speed Distribution')).toBeInTheDocument()
      expect(screen.getByText('Latest Analytics')).toBeInTheDocument()
    })

    test('Devices page renders without errors and maintains table functionality', async () => {
      renderWithRouter(<Devices />)
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument()
      })
      
      // Check that core devices elements are present
      expect(screen.getByText('Devices')).toBeInTheDocument()
      expect(screen.getByText('Manage and monitor your connected devices')).toBeInTheDocument()
      
      // Check that table headers are present
      expect(screen.getByText('Topic')).toBeInTheDocument()
      expect(screen.getByText('IMEI')).toBeInTheDocument()
      expect(screen.getByText('Interval')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    test('Analytics page renders without errors', async () => {
      renderWithRouter(<Analytics />)
      
      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      })
    })

    test('Login page renders without errors and maintains form functionality', () => {
      renderWithRouter(<Login />)
      
      // Check that core login elements are present
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your Synquerra account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    test('Settings page renders without errors', () => {
      renderWithRouter(<Settings />)
      // Check for actual content that exists in the Settings page
      expect(screen.getByText('Account Settings')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
    })

    test('Alerts page renders without errors', () => {
      renderWithRouter(<Alerts />)
      // Check for actual content that exists in the Alerts page
      expect(screen.getByText('Alerts & Notifications')).toBeInTheDocument()
    })

    test('Configuration page renders without errors', () => {
      renderWithRouter(<Configuration />)
      // Check for actual content that exists in the Configuration page
      expect(screen.getByText('Data Configuration')).toBeInTheDocument()
    })
  })

  describe('Enhanced Component API Compatibility', () => {
    test('Button component maintains backward compatibility with existing props', () => {
      // Test individual button variants to avoid DOM conflicts
      const variants = ['primary', 'secondary', 'ghost', 'danger']
      const sizes = ['sm', 'md', 'lg']
      
      variants.forEach(variant => {
        sizes.forEach(size => {
          const { container, unmount } = render(
            <Button 
              variant={variant}
              size={size}
              onClick={() => {}}
            >
              Test Button
            </Button>
          )
          
          const button = container.querySelector('button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent('Test Button')
          expect(button).not.toBeDisabled()
          
          unmount()
        })
      })
    })

    test('Card component maintains backward compatibility with existing structure', () => {
      const { container } = render(
        <Card variant="default" padding="md">
          <Card.Header>
            <Card.Title>Test Title</Card.Title>
            <Card.Description>Test Description</Card.Description>
          </Card.Header>
          <Card.Content>Test Content</Card.Content>
          <Card.Footer>Test Footer</Card.Footer>
        </Card>
      )
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })

    test('Input component maintains backward compatibility with form functionality', () => {
      const handleChange = vi.fn()
      
      render(
        <Input
          variant="default"
          size="md"
          label="Test Input Label"
          placeholder="Test Placeholder"
          onChange={handleChange}
        />
      )
      
      const input = screen.getByLabelText('Test Input Label')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Test Placeholder')
      
      // Test that onChange still works
      fireEvent.change(input, { target: { value: 'test value' } })
      expect(handleChange).toHaveBeenCalled()
    })

    test('Table component maintains backward compatibility with data display', () => {
      const testData = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
      ]
      
      const testColumns = [
        { key: 'name', header: 'Name' },
        { key: 'value', header: 'Value' },
      ]
      
      render(
        <Table
          variant="default"
          size="md"
          data={testData}
          columns={testColumns}
        />
      )
      
      // Check that table headers are rendered
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()
      
      // Check that data is rendered
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })
  })

  describe('Form Interaction Compatibility', () => {
    test('Login form maintains existing submission behavior', async () => {
      renderWithRouter(<Login />)
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Test form interaction
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(emailInput.value).toBe('test@example.com')
      expect(passwordInput.value).toBe('password123')
      
      // Test form submission
      fireEvent.click(submitButton)
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
      })
    })

    test('Form validation maintains existing error handling', async () => {
      renderWithRouter(<Login />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Submit empty form
      fireEvent.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
    })
  })

  describe('Data Loading Compatibility', () => {
    test('Dashboard data loading maintains existing async behavior', async () => {
      renderWithRouter(<Dashboard />)
      
      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
      
      // Should load data and hide loading
      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
      })
    })

    test('Devices data loading maintains existing table population', async () => {
      renderWithRouter(<Devices />)
      
      // Should show loading initially
      expect(screen.getByText('Loading devices...')).toBeInTheDocument()
      
      // Should load data and populate table
      await waitFor(() => {
        expect(screen.queryByText('Loading devices...')).not.toBeInTheDocument()
        expect(screen.getByText('device1')).toBeInTheDocument()
        expect(screen.getByText('123456789')).toBeInTheDocument()
      })
    })
  })

  describe('Component Integration Compatibility', () => {
    test('Enhanced components work together without conflicts', () => {
      render(
        <Card variant="default">
          <Card.Header>
            <Card.Title>Integration Test</Card.Title>
          </Card.Header>
          <Card.Content>
            <Input label="Test Input" placeholder="Enter text" />
            <Button variant="primary">Submit</Button>
          </Card.Content>
        </Card>
      )
      
      expect(screen.getByText('Integration Test')).toBeInTheDocument()
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    test('Table and Card components work together', () => {
      const testData = [{ id: 1, name: 'Test', value: 100 }]
      const testColumns = [
        { key: 'name', header: 'Name' },
        { key: 'value', header: 'Value' },
      ]
      
      render(
        <Card variant="default">
          <Card.Header>
            <Card.Title>Data Table</Card.Title>
          </Card.Header>
          <Card.Content>
            <Table data={testData} columns={testColumns} />
          </Card.Content>
        </Card>
      )
      
      expect(screen.getByText('Data Table')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })
})