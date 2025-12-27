/**
 * Checkpoint Test: Base Components Verification
 * 
 * This test file verifies that:
 * 1. All base components render correctly
 * 2. Design system tokens are properly applied
 * 3. Responsive behavior works across different screen sizes
 * 4. Components maintain consistency with design system
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Button } from './components/Button.jsx'
import { Card } from './components/Card.jsx'
import { Input, Textarea, Select } from './components/Input.jsx'
import { Table, TableBody, TableRow, TableCell, TableHeader, TableHeaderCell } from './components/Table.jsx'

// Mock data for testing
const mockTableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
]

const mockTableColumns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
]

describe('Checkpoint: Base Components Rendering', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Button Component Rendering', () => {
    test('renders all button variants correctly', () => {
      const variants = ['primary', 'secondary', 'ghost', 'danger']
      
      variants.forEach(variant => {
        const { unmount } = render(<Button variant={variant}>{variant} Button</Button>)
        const button = screen.getByRole('button', { name: new RegExp(variant, 'i') })
        
        expect(button).toBeInTheDocument()
        expect(button).toBeVisible()
        
        // Verify variant-specific classes are applied
        switch (variant) {
          case 'primary':
            expect(button).toHaveClass('bg-violet-600')
            break
          case 'secondary':
            expect(button).toHaveClass('bg-slate-800')
            break
          case 'ghost':
            expect(button).toHaveClass('text-slate-300')
            break
          case 'danger':
            expect(button).toHaveClass('bg-red-600')
            break
        }
        
        unmount()
      })
    })

    test('renders all button sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg']
      
      sizes.forEach(size => {
        const { unmount } = render(<Button size={size}>{size} Button</Button>)
        const button = screen.getByRole('button', { name: new RegExp(size, 'i') })
        
        expect(button).toBeInTheDocument()
        expect(button).toBeVisible()
        
        // Verify size-specific classes are applied
        switch (size) {
          case 'sm':
            expect(button).toHaveClass('h-8')
            break
          case 'md':
            expect(button).toHaveClass('h-10')
            break
          case 'lg':
            expect(button).toHaveClass('h-12')
            break
        }
        
        unmount()
      })
    })

    test('renders button states correctly', () => {
      // Test loading state
      const { unmount: unmountLoading } = render(<Button loading>Loading Button</Button>)
      const loadingButton = screen.getByRole('button')
      expect(loadingButton).toBeDisabled()
      expect(loadingButton.querySelector('svg')).toBeInTheDocument() // spinner
      unmountLoading()

      // Test disabled state
      const { unmount: unmountDisabled } = render(<Button disabled>Disabled Button</Button>)
      const disabledButton = screen.getByRole('button')
      expect(disabledButton).toBeDisabled()
      expect(disabledButton).toHaveClass('disabled:opacity-50')
      unmountDisabled()
    })
  })

  describe('Card Component Rendering', () => {
    test('renders all card variants correctly', () => {
      const variants = ['default', 'elevated', 'outlined']
      
      variants.forEach(variant => {
        const { unmount } = render(
          <Card variant={variant} data-testid={`card-${variant}`}>
            <Card.Header>
              <Card.Title>{variant} Card</Card.Title>
            </Card.Header>
            <Card.Content>Content for {variant} card</Card.Content>
          </Card>
        )
        
        const card = screen.getByTestId(`card-${variant}`)
        expect(card).toBeInTheDocument()
        expect(card).toBeVisible()
        
        // Verify content is rendered
        expect(screen.getByText(`${variant} Card`)).toBeInTheDocument()
        expect(screen.getByText(`Content for ${variant} card`)).toBeInTheDocument()
        
        unmount()
      })
    })

    test('renders card with all sections', () => {
      render(
        <Card>
          <Card.Header>
            <Card.Title>Test Card</Card.Title>
            <Card.Description>Test Description</Card.Description>
            <Card.Actions>
              <Button size="sm">Action</Button>
            </Card.Actions>
          </Card.Header>
          <Card.Content>Card content goes here</Card.Content>
          <Card.Footer>Card footer</Card.Footer>
        </Card>
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Card footer')).toBeInTheDocument()
    })

    test('renders card with different padding sizes', () => {
      const sizes = ['sm', 'md', 'lg']
      
      sizes.forEach(size => {
        const { unmount } = render(
          <Card padding={size} data-testid={`card-${size}`}>
            <Card.Content>{size} padding card</Card.Content>
          </Card>
        )
        
        const card = screen.getByTestId(`card-${size}`)
        expect(card).toBeInTheDocument()
        
        // Verify padding classes are applied
        switch (size) {
          case 'sm':
            expect(card).toHaveClass('p-4')
            break
          case 'md':
            expect(card).toHaveClass('p-6')
            break
          case 'lg':
            expect(card).toHaveClass('p-8')
            break
        }
        
        unmount()
      })
    })
  })

  describe('Input Component Rendering', () => {
    test('renders all input variants correctly', () => {
      const variants = ['default', 'error', 'success']
      
      variants.forEach(variant => {
        const props = variant === 'default' 
          ? { placeholder: `${variant} input` }
          : { 
              placeholder: `${variant} input`,
              [variant]: `${variant} message`
            }
        
        const { unmount } = render(<Input {...props} />)
        
        const input = screen.getByPlaceholderText(`${variant} input`)
        expect(input).toBeInTheDocument()
        expect(input).toBeVisible()
        
        // Verify variant-specific classes are applied
        switch (variant) {
          case 'error':
            expect(input).toHaveClass('border-status-error')
            expect(screen.getByText('error message')).toBeInTheDocument()
            break
          case 'success':
            expect(input).toHaveClass('border-status-success')
            expect(screen.getByText('success message')).toBeInTheDocument()
            break
          default:
            expect(input).toHaveClass('border-border-primary')
            break
        }
        
        unmount()
      })
    })

    test('renders input with label and helper text', () => {
      render(
        <Input 
          label="Email Address" 
          helperText="Enter your email address"
          placeholder="email@example.com"
        />
      )
      
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument()
    })

    test('renders input with icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>
      const RightIcon = () => <span data-testid="right-icon">R</span>
      
      render(
        <Input 
          leftIcon={<LeftIcon />}
          rightIcon={<RightIcon />}
          placeholder="Input with icons"
        />
      )
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      
      const input = screen.getByPlaceholderText('Input with icons')
      expect(input).toHaveClass('pl-10', 'pr-10')
    })

    test('renders textarea correctly', () => {
      render(
        <Textarea 
          label="Message"
          placeholder="Enter your message"
          rows={5}
        />
      )
      
      const textarea = screen.getByPlaceholderText('Enter your message')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
      expect(textarea).toHaveAttribute('rows', '5')
      expect(screen.getByText('Message')).toBeInTheDocument()
    })

    test('renders select correctly', () => {
      render(
        <Select label="Country" placeholder="Select country">
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="uk">United Kingdom</option>
        </Select>
      )
      
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByText('Select country')).toBeInTheDocument()
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('Canada')).toBeInTheDocument()
      expect(screen.getByText('United Kingdom')).toBeInTheDocument()
    })
  })

  describe('Table Component Rendering', () => {
    test('renders table with manual structure', () => {
      render(
        <Table data-testid="manual-table">
          <TableHeader>
            <tr>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      
      const table = screen.getByTestId('manual-table')
      expect(table).toBeInTheDocument()
      expect(table.tagName).toBe('TABLE')
      
      // Verify headers
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      
      // Verify data
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })

    test('renders table with automatic data rendering', () => {
      render(
        <Table 
          data={mockTableData}
          columns={mockTableColumns}
          data-testid="auto-table"
        />
      )
      
      const table = screen.getByTestId('auto-table')
      expect(table).toBeInTheDocument()
      
      // Verify headers
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      
      // Verify data
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })

    test('renders table variants correctly', () => {
      const variants = ['default', 'bordered', 'minimal']
      
      variants.forEach(variant => {
        const { unmount } = render(
          <Table variant={variant} data-testid={`table-${variant}`}>
            <TableBody>
              <TableRow>
                <TableCell>{variant} table</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )
        
        const table = screen.getByTestId(`table-${variant}`)
        expect(table).toBeInTheDocument()
        expect(screen.getByText(`${variant} table`)).toBeInTheDocument()
        
        // Verify variant-specific classes
        switch (variant) {
          case 'bordered':
            expect(table).toHaveClass('bg-surface-primary')
            break
          case 'minimal':
            expect(table).toHaveClass('bg-transparent')
            break
          default:
            expect(table).toHaveClass('bg-surface-primary')
            break
        }
        
        unmount()
      })
    })

    test('renders table with loading state', () => {
      render(
        <Table 
          data={mockTableData}
          columns={mockTableColumns}
          loading={true}
          loadingRows={3}
          data-testid="loading-table"
        />
      )
      
      const table = screen.getByTestId('loading-table')
      expect(table).toBeInTheDocument()
      
      // Should show skeleton loading
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    test('renders table with empty state', () => {
      render(
        <Table 
          data={[]}
          columns={mockTableColumns}
          emptyMessage="No data available"
          data-testid="empty-table"
        />
      )
      
      const table = screen.getByTestId('empty-table')
      expect(table).toBeInTheDocument()
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })
})

describe('Checkpoint: Design System Token Application', () => {
  test('components use consistent color tokens', () => {
    render(
      <div>
        <Button variant="primary" data-testid="primary-button">Primary</Button>
        <Button variant="secondary" data-testid="secondary-button">Secondary</Button>
        <Card variant="default" data-testid="default-card">
          <Card.Content>Card content</Card.Content>
        </Card>
        <Input placeholder="test input" data-testid="test-input" />
      </div>
    )
    
    // Verify buttons use design system colors
    const primaryButton = screen.getByTestId('primary-button')
    expect(primaryButton).toHaveClass('bg-violet-600') // matches primary color
    
    const secondaryButton = screen.getByTestId('secondary-button')
    expect(secondaryButton).toHaveClass('bg-slate-800') // matches surface-secondary
    
    // Verify card uses design system colors
    const card = screen.getByTestId('default-card')
    expect(card).toHaveClass('bg-surface-primary') // uses semantic color token
    
    // Verify input uses design system colors
    const input = screen.getByTestId('test-input')
    expect(input).toHaveClass('bg-surface-primary') // uses semantic color token
    expect(input).toHaveClass('border-border-primary') // uses semantic border color
  })

  test('components use consistent typography tokens', () => {
    render(
      <div>
        <Card>
          <Card.Header>
            <Card.Title data-testid="card-title">Card Title</Card.Title>
            <Card.Description data-testid="card-description">Card description</Card.Description>
          </Card.Header>
        </Card>
        <Button data-testid="button-text">Button Text</Button>
        <Input label="Input Label" data-testid="input-label" />
      </div>
    )
    
    // Verify typography classes are applied
    const cardTitle = screen.getByTestId('card-title')
    expect(cardTitle).toHaveClass('text-lg', 'font-semibold') // matches typography scale
    
    const cardDescription = screen.getByTestId('card-description')
    expect(cardDescription).toHaveClass('text-sm', 'text-text-secondary') // matches typography scale
    
    const button = screen.getByTestId('button-text')
    expect(button).toHaveClass('font-medium') // matches button typography
    
    const inputLabel = screen.getByText('Input Label')
    expect(inputLabel).toHaveClass('font-medium') // matches label typography
  })

  test('components use consistent spacing tokens', () => {
    render(
      <div>
        <Button size="sm" data-testid="small-button">Small</Button>
        <Button size="md" data-testid="medium-button">Medium</Button>
        <Button size="lg" data-testid="large-button">Large</Button>
        <Card padding="sm" data-testid="small-card">
          <Card.Content>Small padding</Card.Content>
        </Card>
        <Card padding="lg" data-testid="large-card">
          <Card.Content>Large padding</Card.Content>
        </Card>
      </div>
    )
    
    // Verify button spacing
    const smallButton = screen.getByTestId('small-button')
    expect(smallButton).toHaveClass('h-8', 'px-3') // matches spacing tokens
    
    const mediumButton = screen.getByTestId('medium-button')
    expect(mediumButton).toHaveClass('h-10', 'px-4') // matches spacing tokens
    
    const largeButton = screen.getByTestId('large-button')
    expect(largeButton).toHaveClass('h-12', 'px-6') // matches spacing tokens
    
    // Verify card spacing
    const smallCard = screen.getByTestId('small-card')
    expect(smallCard).toHaveClass('p-4') // matches spacing tokens
    
    const largeCard = screen.getByTestId('large-card')
    expect(largeCard).toHaveClass('p-8') // matches spacing tokens
  })

  test('components use consistent border radius tokens', () => {
    render(
      <div>
        <Button data-testid="button">Button</Button>
        <Card data-testid="card">
          <Card.Content>Card</Card.Content>
        </Card>
        <Input placeholder="input" data-testid="input" />
      </div>
    )
    
    // Verify border radius classes
    const button = screen.getByTestId('button')
    expect(button).toHaveClass('rounded-md') // consistent border radius
    
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-xl') // consistent border radius
    
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('rounded-md') // consistent border radius
  })
})

describe('Checkpoint: Responsive Behavior', () => {
  // Mock window.matchMedia for responsive testing
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    })
  })

  test('table has responsive wrapper', () => {
    render(
      <Table 
        data={mockTableData}
        columns={mockTableColumns}
        responsive={true}
        data-testid="responsive-table"
      />
    )
    
    const tableWrapper = screen.getByTestId('responsive-table').parentElement
    expect(tableWrapper).toHaveClass('overflow-x-auto')
  })

  test('components maintain structure at different sizes', () => {
    // Test that components render consistently regardless of size props
    const sizes = ['sm', 'md', 'lg']
    
    sizes.forEach(size => {
      const { unmount } = render(
        <div data-testid={`size-${size}`}>
          <Button size={size}>Button {size}</Button>
          <Input size={size} placeholder={`Input ${size}`} />
          <Table size={size} data-testid={`table-${size}`}>
            <TableBody>
              <TableRow>
                <TableCell>Cell {size}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )
      
      const container = screen.getByTestId(`size-${size}`)
      expect(container).toBeInTheDocument()
      
      // Verify all components render at this size
      expect(screen.getByText(`Button ${size}`)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(`Input ${size}`)).toBeInTheDocument()
      expect(screen.getByText(`Cell ${size}`)).toBeInTheDocument()
      
      unmount()
    })
  })

  test('card layout adapts to content', () => {
    render(
      <div>
        <Card data-testid="simple-card">
          <Card.Content>Simple content</Card.Content>
        </Card>
        <Card data-testid="complex-card">
          <Card.Header>
            <Card.Title>Complex Card</Card.Title>
            <Card.Description>With multiple sections</Card.Description>
            <Card.Actions>
              <Button size="sm">Action 1</Button>
              <Button size="sm" variant="secondary">Action 2</Button>
            </Card.Actions>
          </Card.Header>
          <Card.Content>
            <p>This is the main content area with more text to test layout adaptation.</p>
            <p>Multiple paragraphs to ensure proper spacing.</p>
          </Card.Content>
          <Card.Footer>
            <Button variant="ghost">Cancel</Button>
            <Button>Save</Button>
          </Card.Footer>
        </Card>
      </div>
    )
    
    const simpleCard = screen.getByTestId('simple-card')
    const complexCard = screen.getByTestId('complex-card')
    
    expect(simpleCard).toBeInTheDocument()
    expect(complexCard).toBeInTheDocument()
    
    // Verify complex card has all sections
    expect(screen.getByText('Complex Card')).toBeInTheDocument()
    expect(screen.getByText('With multiple sections')).toBeInTheDocument()
    expect(screen.getByText('Action 1')).toBeInTheDocument()
    expect(screen.getByText('Action 2')).toBeInTheDocument()
    expect(screen.getByText('This is the main content area with more text to test layout adaptation.')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  test('form components stack properly', () => {
    render(
      <div data-testid="form-container">
        <Input label="First Name" placeholder="Enter first name" />
        <Input label="Last Name" placeholder="Enter last name" />
        <Textarea label="Message" placeholder="Enter your message" />
        <Select label="Country" placeholder="Select country">
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </Select>
        <div>
          <Button>Submit</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </div>
    )
    
    const formContainer = screen.getByTestId('form-container')
    expect(formContainer).toBeInTheDocument()
    
    // Verify all form elements are present
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter first name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})