import React from 'react';
import { 
  GradientCard, 
  GradientKpiCard, 
  GradientChartCard, 
  GradientHeroCard 
} from './components/GradientCard.jsx';
import { Button } from './components/Button.jsx';
import { Card } from './components/Card.jsx';
import { 
  interactivePresets, 
  createInteractiveProps,
  glassmorphismPresets,
  createGlassmorphism 
} from './index.js';

/**
 * Interactive States and Glassmorphism Demo Component
 * Showcases the new enhanced visual design system features
 */
export const InteractiveDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <GradientHeroCard colorScheme="rainbow">
          <h1 className="text-4xl font-bold text-white mb-4">
            Enhanced Visual Design System
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Featuring glassmorphism effects, interactive states, and modern animations
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="ghost" size="lg" className="text-white border-white/30">
              Explore Components
            </Button>
            <Button variant="primary" size="lg" colorScheme="teal">
              Get Started
            </Button>
          </div>
        </GradientHeroCard>

        {/* Gradient Cards Showcase */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Gradient Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* KPI Cards */}
            <GradientKpiCard
              title="Total Users"
              value="12,345"
              subtitle="+12% from last month"
              colorScheme="primary"
              trend="↗ +12%"
            />
            
            <GradientKpiCard
              title="Revenue"
              value="$45,678"
              subtitle="Monthly recurring"
              colorScheme="success"
              trend="↗ +8%"
            />
            
            <GradientKpiCard
              title="Active Sessions"
              value="1,234"
              subtitle="Currently online"
              colorScheme="info"
              trend="→ Stable"
            />
            
            {/* Chart Card */}
            <GradientChartCard 
              title="Performance Metrics" 
              colorScheme="secondary"
              className="md:col-span-2 lg:col-span-3"
            >
              <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center">
                <p className="text-white/70">Chart placeholder</p>
              </div>
            </GradientChartCard>
          </div>
        </section>

        {/* Interactive Buttons */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Interactive Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="primary" colorScheme="violet">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success" colorScheme="green">Success</Button>
            <Button variant="warning" colorScheme="amber">Warning</Button>
            <Button variant="danger" colorScheme="red">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            
            <Button variant="gradient" colorScheme="violet">Gradient</Button>
            <Button variant="gradient" colorScheme="blue">Blue</Button>
            <Button variant="gradient" colorScheme="teal">Teal</Button>
            <Button variant="gradient" colorScheme="green">Green</Button>
            <Button variant="gradient" colorScheme="amber">Amber</Button>
            <Button variant="gradient" colorScheme="pink">Pink</Button>
          </div>
        </section>

        {/* Glassmorphism Cards */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Glassmorphism Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <GradientCard variant="default" colorScheme="primary" glassmorphism={true}>
              <h3 className="text-lg font-semibold text-white mb-2">Default Glass</h3>
              <p className="text-white/70">
                Subtle glassmorphism effect with backdrop blur and transparency.
              </p>
            </GradientCard>
            
            <GradientCard variant="filled" colorScheme="ocean" animated={true}>
              <h3 className="text-lg font-semibold text-white mb-2">Animated Glass</h3>
              <p className="text-white/70">
                Enhanced with hover animations and gradient borders.
              </p>
            </GradientCard>
            
            <GradientCard variant="ghost" colorScheme="aurora" glassmorphism={true}>
              <h3 className="text-lg font-semibold text-white mb-2">Ghost Glass</h3>
              <p className="text-white/70">
                Transparent background with glass effects.
              </p>
            </GradientCard>
          </div>
        </section>

        {/* Interactive Cards */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card variant="glass" hover={true} colorScheme="violet" className="p-6">
              <Card.Header>
                <Card.Title className="text-white">Hover Effects</Card.Title>
                <Card.Description className="text-white/70">
                  Cards with enhanced hover interactions
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <p className="text-white/80">
                  This card demonstrates smooth hover transitions with scale, 
                  shadow, and glassmorphism effects.
                </p>
              </Card.Content>
            </Card>
            
            <Card variant="colorful" hover={true} colorScheme="teal" className="p-6">
              <Card.Header>
                <Card.Title className="text-white">Focus States</Card.Title>
                <Card.Description className="text-white/70">
                  Keyboard navigation support
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <p className="text-white/80">
                  Try tabbing through the interface to see enhanced focus rings 
                  and keyboard navigation.
                </p>
              </Card.Content>
            </Card>
          </div>
        </section>

        {/* Color Schemes */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Color Schemes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'primary', 'secondary', 'success', 'warning', 'error', 'info',
              'rainbow', 'sunset', 'ocean', 'forest', 'aurora', 'cosmic'
            ].map((scheme) => (
              <GradientCard 
                key={scheme} 
                colorScheme={scheme} 
                variant="filled" 
                size="sm"
                animated={true}
                className="text-center"
              >
                <p className="text-white font-medium capitalize">{scheme}</p>
              </GradientCard>
            ))}
          </div>
        </section>

        {/* Animation Showcase */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Hover Animations</h3>
              <div className="space-y-2">
                <div className="p-4 bg-white/10 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                  Scale on Hover
                </div>
                <div className="p-4 bg-white/10 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  Lift on Hover
                </div>
                <div className="p-4 bg-white/10 rounded-lg hover:backdrop-blur-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
                  Blur on Hover
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Loading States</h3>
              <div className="space-y-2">
                <div className="p-4 bg-white/10 rounded-lg animate-pulse">
                  Pulse Animation
                </div>
                <div className="p-4 bg-white/10 rounded-lg animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent">
                  Shimmer Effect
                </div>
                <div className="p-4 bg-white/10 rounded-lg animate-glass-float">
                  Float Animation
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Focus States</h3>
              <div className="space-y-2">
                <button className="w-full p-4 bg-white/10 rounded-lg focus:ring-2 focus:ring-violet-500/50 focus:outline-none transition-all duration-300">
                  Focus Ring
                </button>
                <button className="w-full p-4 bg-white/10 rounded-lg focus:ring-4 focus:ring-white focus:outline-none transition-all duration-300">
                  High Contrast Focus
                </button>
                <button className="w-full p-4 bg-white/10 rounded-lg focus:ring-1 focus:ring-white/20 focus:outline-none transition-all duration-300">
                  Subtle Focus
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InteractiveDemo;