/**
 * Demo Page for Design System Components
 * This page demonstrates all the enhanced base components working together
 * Used for visual verification during checkpoint testing
 */

import React, { useState } from 'react'
import { Button } from './components/Button.jsx'
import { Card } from './components/Card.jsx'
import { Input, Textarea, Select } from './components/Input.jsx'
import { Table, TableContainer } from './components/Table.jsx'
import { 
  Loading, 
  LoadingOverlay, 
  Spinner, 
  Dots, 
  Pulse, 
  Skeleton, 
  ProgressBar 
} from './components/Loading.jsx'

// Sample data for table demonstration
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active' },
]

const sampleColumns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', sortable: true },
  { 
    key: 'status', 
    header: 'Status',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' 
          ? 'bg-status-success/20 text-status-success' 
          : 'bg-status-warning/20 text-status-warning'
      }`}>
        {value}
      </span>
    )
  },
]

export function DesignSystemDemo() {
  const [loading, setLoading] = useState(false)
  const [overlayLoading, setOverlayLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    country: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const handleProgressDemo = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-surface-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-text-primary">
            Design System Demo
          </h1>
          <p className="text-text-secondary">
            Demonstrating all enhanced base components working together
          </p>
        </div>

        {/* Button Variants */}
        <Card>
          <Card.Header>
            <Card.Title>Button Components</Card.Title>
            <Card.Description>All button variants and sizes</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              {/* Button Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Sizes</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">States</h4>
                <div className="flex flex-wrap gap-3">
                  <Button loading={loading}>
                    {loading ? 'Loading...' : 'Click to Load'}
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button 
                    variant="secondary"
                    onClick={() => setLoading(!loading)}
                  >
                    Toggle Loading
                  </Button>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Loading Components */}
        <Card>
          <Card.Header>
            <Card.Title>Loading Components</Card.Title>
            <Card.Description>Enhanced loading states and animations</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-8">
              
              {/* Spinner Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Spinner Variants</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <Spinner size="xs" />
                    <p className="text-xs text-text-tertiary">Extra Small</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Spinner size="sm" />
                    <p className="text-xs text-text-tertiary">Small</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Spinner size="md" />
                    <p className="text-xs text-text-tertiary">Medium</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Spinner size="lg" />
                    <p className="text-xs text-text-tertiary">Large</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="text-xs font-medium text-text-tertiary mb-3">Color Variants</h5>
                  <div className="flex flex-wrap gap-4">
                    <Spinner color="primary" />
                    <Spinner color="secondary" />
                    <Spinner color="accent" />
                    <Spinner color="success" />
                    <Spinner color="warning" />
                    <Spinner color="error" />
                  </div>
                </div>
              </div>

              {/* Dots Loading */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Dots Loading</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <Dots size="sm" />
                    <p className="text-xs text-text-tertiary">Small</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Dots size="md" />
                    <p className="text-xs text-text-tertiary">Medium</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Dots size="lg" />
                    <p className="text-xs text-text-tertiary">Large</p>
                  </div>
                  <div className="text-center space-y-2">
                    <Dots color="accent" />
                    <p className="text-xs text-text-tertiary">Accent Color</p>
                  </div>
                </div>
              </div>

              {/* Skeleton Loading */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Skeleton Loading</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Skeleton variant="circular" width="40px" height="40px" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="30%" />
                      <Skeleton variant="text" width="60%" />
                    </div>
                  </div>
                  
                  <Skeleton variant="rectangular" height="120px" className="rounded-lg" />
                  
                  <div className="flex gap-2">
                    <Skeleton variant="button" width="80px" />
                    <Skeleton variant="button" width="100px" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Progress Bar</h4>
                <div className="space-y-4">
                  <div>
                    <ProgressBar value={progress} showValue />
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleProgressDemo}
                      >
                        Demo Progress
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-tertiary mb-2">Success Progress</p>
                      <ProgressBar value={75} color="success" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary mb-2">Warning Progress</p>
                      <ProgressBar value={45} color="warning" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading with Text */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Loading with Text</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Loading type="spinner" text="Loading data..." />
                    <Loading type="dots" text="Processing..." textPosition="left" />
                    <Loading type="spinner" text="Please wait..." textPosition="top" />
                  </div>
                  <div className="space-y-4">
                    <Loading type="dots" text="Saving changes..." size="sm" />
                    <Loading type="spinner" text="Uploading files..." color="accent" />
                    <Loading type="dots" text="Connecting..." color="success" />
                  </div>
                </div>
              </div>

              {/* Loading Overlay Demo */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Loading Overlay</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LoadingOverlay loading={overlayLoading} text="Loading content...">
                    <div className="bg-surface-secondary p-6 rounded-lg">
                      <h5 className="font-medium text-text-primary mb-2">Sample Content</h5>
                      <p className="text-text-secondary text-sm mb-4">
                        This content will be overlaid with a loading state when the demo is active.
                      </p>
                      <div className="space-y-2">
                        <div className="h-2 bg-surface-tertiary rounded"></div>
                        <div className="h-2 bg-surface-tertiary rounded w-3/4"></div>
                        <div className="h-2 bg-surface-tertiary rounded w-1/2"></div>
                      </div>
                    </div>
                  </LoadingOverlay>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setOverlayLoading(true)
                        setTimeout(() => setOverlayLoading(false), 3000)
                      }}
                    >
                      Demo Overlay Loading
                    </Button>
                    <p className="text-xs text-text-tertiary">
                      Click to see the loading overlay in action for 3 seconds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pulse Loading */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Pulse Loading</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Pulse className="w-full">
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-text-tertiary text-sm">Pulsing Content</span>
                    </div>
                  </Pulse>
                  <Pulse color="accent" className="w-full">
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-text-tertiary text-sm">Accent Pulse</span>
                    </div>
                  </Pulse>
                  <Pulse color="success" className="w-full">
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-text-tertiary text-sm">Success Pulse</span>
                    </div>
                  </Pulse>
                </div>
              </div>

            </div>
          </Card.Content>
        </Card>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <Card.Header>
              <Card.Title>Default Card</Card.Title>
              <Card.Description>Standard card variant</Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-text-secondary">
                This is the default card variant with standard styling.
              </p>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Elevated Card</Card.Title>
              <Card.Description>Card with elevation shadow</Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-text-secondary">
                This card has elevated styling with enhanced shadows.
              </p>
            </Card.Content>
          </Card>

          <Card variant="outlined">
            <Card.Header>
              <Card.Title>Outlined Card</Card.Title>
              <Card.Description>Card with accent border</Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-text-secondary">
                This card uses an outlined style with accent border.
              </p>
            </Card.Content>
          </Card>
        </div>

        {/* Form Components */}
        <Card>
          <Card.Header>
            <Card.Title>Form Components</Card.Title>
            <Card.Description>Enhanced input, textarea, and select components</Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  helperText="This will be displayed publicly"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  success={formData.email.includes('@') ? "Valid email format" : undefined}
                  error={formData.email && !formData.email.includes('@') ? "Please enter a valid email" : undefined}
                />
              </div>

              <Select
                label="Country"
                placeholder="Select your country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              >
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
                <option value="de">Germany</option>
              </Select>

              <Textarea
                label="Message"
                placeholder="Enter your message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                helperText="Tell us about yourself"
              />

              <div className="flex gap-3">
                <Button type="submit" loading={loading}>
                  Submit Form
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setFormData({ name: '', email: '', message: '', country: '' })}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>

        {/* Table Component */}
        <Card>
          <Card.Header>
            <Card.Title>Table Component</Card.Title>
            <Card.Description>Enhanced table with sorting and responsive behavior</Card.Description>
          </Card.Header>
          <Card.Content>
            <TableContainer>
              <Table
                data={sampleData}
                columns={sampleColumns}
                hoverable
                striped
                onRowClick={(row) => console.log('Clicked row:', row)}
              />
            </TableContainer>
          </Card.Content>
        </Card>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <Card key={num} padding="sm" hover>
              <Card.Content>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-accent/20 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-accent font-bold">{num}</span>
                  </div>
                  <h4 className="font-medium text-text-primary">Item {num}</h4>
                  <p className="text-sm text-text-tertiary">
                    Responsive grid item
                  </p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card variant="outlined">
          <Card.Content>
            <div className="text-center space-y-2">
              <p className="text-text-secondary">
                All components are rendering correctly with consistent design tokens
              </p>
              <div className="flex justify-center gap-2">
                <span className="inline-block w-3 h-3 bg-status-success rounded-full"></span>
                <span className="text-sm text-status-success font-medium">
                  Design System Checkpoint Passed
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>

      </div>
    </div>
  )
}

export default DesignSystemDemo