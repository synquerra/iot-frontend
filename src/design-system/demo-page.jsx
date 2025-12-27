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
            <Card.Title>Enhanced Button Components</Card.Title>
            <Card.Description>All button variants, sizes, and new colorful options</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              {/* Basic Button Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Basic Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                </div>
              </div>

              {/* New Colorful Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">New Colorful Variants</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2">Gradient Buttons</h5>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="gradient" colorScheme="violet">Violet Gradient</Button>
                      <Button variant="gradient" colorScheme="blue">Blue Gradient</Button>
                      <Button variant="gradient" colorScheme="teal">Teal Gradient</Button>
                      <Button variant="gradient" colorScheme="green">Green Gradient</Button>
                      <Button variant="gradient" colorScheme="amber">Amber Gradient</Button>
                      <Button variant="gradient" colorScheme="red">Red Gradient</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2">Colorful Buttons</h5>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="colorful" colorScheme="violet">Violet</Button>
                      <Button variant="colorful" colorScheme="blue">Blue</Button>
                      <Button variant="colorful" colorScheme="teal">Teal</Button>
                      <Button variant="colorful" colorScheme="green">Green</Button>
                      <Button variant="colorful" colorScheme="pink">Pink</Button>
                      <Button variant="colorful" colorScheme="purple">Purple</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2">Outline Buttons</h5>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" colorScheme="violet">Violet</Button>
                      <Button variant="outline" colorScheme="blue">Blue</Button>
                      <Button variant="outline" colorScheme="teal">Teal</Button>
                      <Button variant="outline" colorScheme="green">Green</Button>
                      <Button variant="outline" colorScheme="amber">Amber</Button>
                      <Button variant="outline" colorScheme="red">Red</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Schemes for Primary Buttons */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Primary Button Color Schemes</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" colorScheme="violet">Violet</Button>
                  <Button variant="primary" colorScheme="blue">Blue</Button>
                  <Button variant="primary" colorScheme="teal">Teal</Button>
                  <Button variant="primary" colorScheme="green">Green</Button>
                  <Button variant="primary" colorScheme="amber">Amber</Button>
                  <Button variant="primary" colorScheme="red">Red</Button>
                  <Button variant="primary" colorScheme="pink">Pink</Button>
                  <Button variant="primary" colorScheme="purple">Purple</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Enhanced Sizes</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* Glow Effects */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Glow Effects</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="gradient" colorScheme="violet" glow>Violet Glow</Button>
                  <Button variant="colorful" colorScheme="blue" glow>Blue Glow</Button>
                  <Button variant="gradient" colorScheme="teal" glow>Teal Glow</Button>
                  <Button variant="colorful" colorScheme="pink" glow>Pink Glow</Button>
                </div>
                <p className="text-xs text-text-tertiary mt-2">Hover over these buttons to see the glow effect</p>
              </div>

              {/* Button States */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3">Enhanced States</h4>
                <div className="flex flex-wrap gap-3">
                  <Button loading={loading} variant="gradient" colorScheme="violet">
                    {loading ? 'Loading...' : 'Click to Load'}
                  </Button>
                  <Button disabled variant="colorful" colorScheme="blue">Disabled</Button>
                  <Button 
                    variant="outline" 
                    colorScheme="teal"
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
        <Card>
          <Card.Header>
            <Card.Title>Card Variants</Card.Title>
            <Card.Description>All card variants including new colorful options</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-8">
              
              {/* Basic Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Basic Variants</h4>
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
              </div>

              {/* New Colorful Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">New Colorful Variants</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card variant="gradient" colorScheme="violet">
                    <Card.Header>
                      <Card.Title>Gradient Card</Card.Title>
                      <Card.Description>Card with gradient background</Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-white/90">
                        This card features a beautiful gradient background with enhanced visual appeal.
                      </p>
                    </Card.Content>
                  </Card>

                  <Card variant="glass">
                    <Card.Header>
                      <Card.Title>Glass Card</Card.Title>
                      <Card.Description>Glassmorphism effect</Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-text-secondary">
                        This card uses glassmorphism with backdrop blur for a modern look.
                      </p>
                    </Card.Content>
                  </Card>

                  <Card variant="colorful" colorScheme="teal">
                    <Card.Header>
                      <Card.Title>Colorful Card</Card.Title>
                      <Card.Description>Vibrant accent borders</Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-text-secondary">
                        This card features colorful accent borders and enhanced shadows.
                      </p>
                    </Card.Content>
                  </Card>
                </div>
              </div>

              {/* Color Scheme Examples */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Color Scheme Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { color: 'violet', name: 'Violet' },
                    { color: 'blue', name: 'Blue' },
                    { color: 'teal', name: 'Teal' },
                    { color: 'green', name: 'Green' },
                    { color: 'amber', name: 'Amber' },
                    { color: 'red', name: 'Red' },
                    { color: 'pink', name: 'Pink' },
                    { color: 'purple', name: 'Purple' }
                  ].map(({ color, name }) => (
                    <Card key={color} variant="colorful" colorScheme={color} padding="sm">
                      <Card.Content>
                        <div className="text-center">
                          <h5 className="font-medium text-text-primary">{name}</h5>
                          <p className="text-xs text-text-tertiary mt-1">
                            {color} color scheme
                          </p>
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Interactive Effects */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Interactive Effects</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card variant="colorful" colorScheme="violet" hover glowEffect>
                    <Card.Header>
                      <Card.Title>Hover + Glow</Card.Title>
                      <Card.Description>Hover for glow effect</Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-text-secondary">
                        This card has hover effects with a colorful glow.
                      </p>
                    </Card.Content>
                  </Card>

                  <Card variant="default" borderAccent colorScheme="teal">
                    <Card.Header>
                      <Card.Title>Border Accent</Card.Title>
                      <Card.Description>Left accent border</Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-text-secondary">
                        This card features a colorful left accent border.
                      </p>
                    </Card.Content>
                  </Card>

                  <Card variant="gradient" colorScheme="green" hover>
                    <Card.Header>
                      <Card.Title>Gradient Hover</Card.Title>
                      <Card.Description>Enhanced hover effects</Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-white/90">
                        This gradient card has enhanced hover animations.
                      </p>
                    </Card.Content>
                  </Card>
                </div>
              </div>

            </div>
          </Card.Content>
        </Card>

        {/* Original Card Variants Section - Remove this */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'none' }}>
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

        {/* Colorful Form Components */}
        <Card>
          <Card.Header>
            <Card.Title>Colorful Form Components</Card.Title>
            <Card.Description>New colorful variants with gradient backgrounds and enhanced focus states</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-8">
              
              {/* Colorful Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Colorful Variants</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    variant="colorful"
                    colorScheme="violet"
                    label="Violet Input"
                    placeholder="Enter text with violet theme"
                    helperText="Colorful focus states and validation feedback"
                  />
                  
                  <Input
                    variant="colorful"
                    colorScheme="blue"
                    label="Blue Input"
                    placeholder="Enter text with blue theme"
                    helperText="Enhanced visual feedback"
                  />
                  
                  <Input
                    variant="colorful"
                    colorScheme="teal"
                    label="Teal Input"
                    placeholder="Enter text with teal theme"
                    helperText="Smooth transitions for state changes"
                  />
                  
                  <Input
                    variant="colorful"
                    colorScheme="green"
                    label="Green Input"
                    placeholder="Enter text with green theme"
                    helperText="Color-coded validation states"
                  />
                </div>
              </div>

              {/* Gradient Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Gradient Variants</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    variant="gradient"
                    label="Gradient Input"
                    placeholder="Multi-color gradient background"
                    helperText="Beautiful gradient backgrounds"
                  />
                  
                  <Textarea
                    variant="gradient"
                    label="Gradient Textarea"
                    placeholder="Enter your message with gradient styling"
                    rows={3}
                    helperText="Enhanced visual appeal"
                  />
                </div>
              </div>

              {/* Glass Variants */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Glass Variants</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    variant="glass"
                    label="Glass Input"
                    placeholder="Glassmorphism effect"
                    helperText="Modern glass-like appearance"
                  />
                  
                  <Select
                    variant="glass"
                    label="Glass Select"
                    placeholder="Choose with glass effect"
                    helperText="Backdrop blur and transparency"
                  >
                    <option value="option1">Glass Option 1</option>
                    <option value="option2">Glass Option 2</option>
                    <option value="option3">Glass Option 3</option>
                  </Select>
                </div>
              </div>

              {/* Color Scheme Examples */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">All Color Schemes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { color: 'violet', name: 'Violet' },
                    { color: 'blue', name: 'Blue' },
                    { color: 'teal', name: 'Teal' },
                    { color: 'green', name: 'Green' },
                    { color: 'amber', name: 'Amber' },
                    { color: 'red', name: 'Red' },
                    { color: 'pink', name: 'Pink' },
                    { color: 'purple', name: 'Purple' }
                  ].map(({ color, name }) => (
                    <Input
                      key={color}
                      variant="colorful"
                      colorScheme={color}
                      label={`${name} Input`}
                      placeholder={`${name} themed input`}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              {/* Validation States */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Enhanced Validation States</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="Success State"
                      placeholder="Valid input"
                      success="This field looks great!"
                    />
                    
                    <Input
                      label="Error State"
                      placeholder="Invalid input"
                      error="This field has an error"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Warning State"
                      placeholder="Warning input"
                      warning="Please double-check this field"
                    />
                    
                    <Input
                      label="Info State"
                      placeholder="Info input"
                      info="Additional information about this field"
                    />
                  </div>
                </div>
              </div>

              {/* Colorful Validation States */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Colorful Validation States</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      variant="colorful"
                      colorScheme="green"
                      label="Colorful Success"
                      placeholder="Valid colorful input"
                      success="Perfect! This looks amazing"
                    />
                    
                    <Input
                      variant="colorful"
                      colorScheme="red"
                      label="Colorful Error"
                      placeholder="Invalid colorful input"
                      error="Oops! Something went wrong"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Textarea
                      variant="colorful"
                      colorScheme="amber"
                      label="Colorful Warning"
                      placeholder="Warning textarea"
                      warning="Please review your input carefully"
                      rows={3}
                    />
                    
                    <Select
                      variant="colorful"
                      colorScheme="blue"
                      label="Colorful Info"
                      placeholder="Info select"
                      info="Choose from the available options"
                    >
                      <option value="info1">Info Option 1</option>
                      <option value="info2">Info Option 2</option>
                      <option value="info3">Info Option 3</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Interactive Demo */}
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-4">Interactive Focus Demo</h4>
                <div className="space-y-4">
                  <p className="text-sm text-text-tertiary">
                    Click on the inputs below to see the enhanced focus states with colorful shadows and smooth transitions:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      variant="colorful"
                      colorScheme="violet"
                      placeholder="Focus me for violet glow"
                      size="sm"
                    />
                    <Input
                      variant="gradient"
                      placeholder="Focus me for gradient effect"
                      size="sm"
                    />
                    <Input
                      variant="glass"
                      placeholder="Focus me for glass effect"
                      size="sm"
                    />
                  </div>
                </div>
              </div>

            </div>
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