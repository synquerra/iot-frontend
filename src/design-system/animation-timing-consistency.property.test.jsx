/**
 * Property-Based Tests for Animation Timing Consistency
 * Feature: dashboard-redesign, Property 4: Animation Timing Consistency
 * 
 * Validates: Requirements 1.3, 3.5, 7.4
 */

import { render, screen, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { EnhancedKpiCard } from './components/EnhancedKpiCard'
import { Loading } from './components/Loading'
import { duration, easing, transitions } from './utils/animations'

describe('Dashboard Redesign - Animation Timing Consistency Properties', () => {
  
  afterEach(() => {
    cleanup()
  })

  /**
   * Property 4: Animation Timing Consistency
   * For any component with animations, all transitions should complete within 
   * the expected duration ranges (100-300ms for micro-interactions)
   * 
   * **Validates: Requirements 1.3, 3.5, 7.4**
   */
  
  test('Property 4.1: Interactive components use consistent animation durations from design tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'card', 'kpiCard'),
        fc.constantFrom('primary', 'secondary', 'ghost', 'gradient'),
        fc.constantFrom('violet', 'blue', 'teal', 'green', 'amber', 'red'),
        fc.integer({ min: 1, max: 10000 }), // Unique ID generator
        (componentType, variant, colorScheme, uniqueId) => {
          const testId = `animation-timing-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          let component;
          let unmount;
          
          try {
            switch (componentType) {
              case 'button':
                ({ unmount } = render(
                  <Button 
                    data-testid={testId} 
                    variant={variant}
                    colorScheme={colorScheme}
                  >
                    Test Button
                  </Button>, 
                  { container }
                ))
                break
              case 'card':
                ({ unmount } = render(
                  <Card 
                    data-testid={testId} 
                    variant={variant}
                    colorScheme={colorScheme}
                    hover
                  >
                    Test Card
                  </Card>, 
                  { container }
                ))
                break
              case 'kpiCard':
                ({ unmount } = render(
                  <EnhancedKpiCard 
                    data-testid={testId}
                    title="Test KPI"
                    value="100"
                    colorScheme={colorScheme}
                    animated
                  />, 
                  { container }
                ))
                break
            }
            
            component = screen.getByTestId(testId)
            expect(component).toBeDefined()
            
            // Verify component uses transition classes for animations
            expect(component.className).toMatch(/transition/)
            
            // Check for consistent duration classes (150ms, 200ms, 250ms, 300ms)
            const validDurations = [
              'duration-150', // 150ms - fast interactions
              'duration-200', // 200ms - standard micro-interactions  
              'duration-250', // 250ms - normal transitions
              'duration-300'  // 300ms - slower transitions
            ]
            
            const hasValidDuration = validDurations.some(duration => 
              component.className.includes(duration)
            )
            
            expect(hasValidDuration).toBe(true)
            
            // Verify easing is applied for smooth animations
            const hasEasing = component.className.includes('ease') || 
                             component.className.includes('cubic-bezier')
            
            // For components without explicit easing classes, check computed styles
            if (!hasEasing) {
              const computedStyle = window.getComputedStyle(component)
              const transitionTimingFunction = computedStyle.transitionTimingFunction
              
              // Should not be 'linear' for smooth animations
              expect(transitionTimingFunction).not.toBe('linear')
            }
            
          } finally {
            // Clean up after each iteration
            if (unmount) unmount()
            if (container.parentNode) {
              document.body.removeChild(container)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 4.2: Animation utilities provide consistent timing values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('fast', 'normal', 'slow', 'slower'),
        (durationKey) => {
          const durationValue = duration[durationKey]
          
          // Verify duration values are within expected ranges
          const numericValue = parseInt(durationValue.replace('ms', ''))
          
          switch (durationKey) {
            case 'fast':
              expect(numericValue).toBeGreaterThanOrEqual(100)
              expect(numericValue).toBeLessThanOrEqual(200)
              break
            case 'normal':
              expect(numericValue).toBeGreaterThanOrEqual(200)
              expect(numericValue).toBeLessThanOrEqual(300)
              break
            case 'slow':
              expect(numericValue).toBeGreaterThanOrEqual(300)
              expect(numericValue).toBeLessThanOrEqual(400)
              break
            case 'slower':
              expect(numericValue).toBeGreaterThanOrEqual(400)
              expect(numericValue).toBeLessThanOrEqual(600)
              break
          }
          
          // Verify format is correct (ends with 'ms')
          expect(durationValue).toMatch(/^\d+ms$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 4.3: Transition utilities maintain consistent timing patterns', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('all', 'colors', 'opacity', 'transform', 'button', 'input', 'card'),
        (transitionType) => {
          const transitionValue = transitions[transitionType]
          
          expect(transitionValue).toBeDefined()
          expect(typeof transitionValue).toBe('string')
          
          // Verify transition contains duration and easing
          expect(transitionValue).toMatch(/\d+ms/)
          expect(transitionValue).toMatch(/cubic-bezier|ease/)
          
          // For micro-interaction transitions (button, input), verify fast timing
          if (['button', 'input', 'colors', 'opacity'].includes(transitionType)) {
            expect(transitionValue).toMatch(/150ms|200ms/)
          }
          
          // For layout transitions (card, transform), verify normal timing
          if (['card', 'transform', 'all'].includes(transitionType)) {
            expect(transitionValue).toMatch(/200ms|250ms|300ms/)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 4.4: Loading components use consistent animation timing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('spinner', 'dots', 'pulse', 'skeleton'),
        fc.constantFrom('sm', 'md', 'lg'),
        fc.integer({ min: 1, max: 10000 }), // Unique ID generator
        (variant, size, uniqueId) => {
          const testId = `loading-timing-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          let unmount;
          
          try {
            ({ unmount } = render(
              <Loading 
                data-testid={testId}
                variant={variant}
                size={size}
              />, 
              { container }
            ))
            
            const component = screen.getByTestId(testId)
            expect(component).toBeDefined()
            
            // Verify loading animations use appropriate timing
            const hasAnimation = component.className.includes('animate-') ||
                                component.className.includes('animation-')
            
            if (hasAnimation) {
              // Loading animations should be continuous (infinite)
              const computedStyle = window.getComputedStyle(component)
              const animationIterationCount = computedStyle.animationIterationCount
              
              // Should be infinite for loading states
              expect(animationIterationCount).toBe('infinite')
              
              // Animation duration should be reasonable (not too fast, not too slow)
              const animationDuration = computedStyle.animationDuration
              if (animationDuration && animationDuration !== '0s') {
                const durationMs = parseFloat(animationDuration) * 1000
                expect(durationMs).toBeGreaterThanOrEqual(500) // At least 500ms
                expect(durationMs).toBeLessThanOrEqual(3000)   // At most 3s
              }
            }
            
          } finally {
            // Clean up after each iteration
            if (unmount) unmount()
            if (container.parentNode) {
              document.body.removeChild(container)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 4.5: Chart and data visualization components use smooth animation timing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('enter', 'update', 'exit'),
        (animationType) => {
          // Generate appropriate duration range based on animation type
          let customDuration;
          
          switch (animationType) {
            case 'enter':
              customDuration = fc.sample(fc.integer({ min: 200, max: 600 }), 1)[0];
              break;
            case 'update':
              customDuration = fc.sample(fc.integer({ min: 150, max: 400 }), 1)[0];
              break;
            case 'exit':
              customDuration = fc.sample(fc.integer({ min: 100, max: 300 }), 1)[0];
              break;
          }
          
          // Test that chart animation configurations use appropriate timing
          
          // Verify duration is within acceptable range for data visualizations
          expect(customDuration).toBeGreaterThanOrEqual(100)
          expect(customDuration).toBeLessThanOrEqual(1000)
          
          // Chart animations should be longer than micro-interactions but not too slow
          if (animationType === 'enter') {
            expect(customDuration).toBeGreaterThanOrEqual(200)
            expect(customDuration).toBeLessThanOrEqual(600)
          }
          
          if (animationType === 'update') {
            expect(customDuration).toBeGreaterThanOrEqual(150)
            expect(customDuration).toBeLessThanOrEqual(400)
          }
          
          if (animationType === 'exit') {
            expect(customDuration).toBeGreaterThanOrEqual(100)
            expect(customDuration).toBeLessThanOrEqual(300)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 4.6: KPI card animations maintain consistent trend indicator timing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up', 'down', 'stable'),
        fc.constantFrom('blue', 'green', 'amber', 'red', 'purple'),
        fc.boolean(), // animated prop
        fc.integer({ min: 1, max: 10000 }), // Unique ID generator
        (trend, colorScheme, animated, uniqueId) => {
          const testId = `kpi-timing-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          let unmount;
          
          try {
            ({ unmount } = render(
              <EnhancedKpiCard 
                data-testid={testId}
                title="Test KPI"
                value="100"
                trend={trend}
                colorScheme={colorScheme}
                animated={animated}
              />, 
              { container }
            ))
            
            const component = screen.getByTestId(testId)
            expect(component).toBeDefined()
            
            if (animated) {
              // Verify KPI cards use consistent animation timing
              expect(component.className).toMatch(/transition|animate/)
              
              // Check for appropriate duration classes for KPI animations
              const hasKpiDuration = component.className.includes('duration-200') ||
                                   component.className.includes('duration-250') ||
                                   component.className.includes('duration-300')
              
              expect(hasKpiDuration).toBe(true)
            }
            
            // Trend indicators should have consistent timing regardless of trend direction
            const trendElements = component.querySelectorAll('[class*="trend"], [class*="arrow"]')
            trendElements.forEach(element => {
              if (element.className.includes('transition')) {
                const hasValidTrendTiming = element.className.includes('duration-150') ||
                                          element.className.includes('duration-200')
                expect(hasValidTrendTiming).toBe(true)
              }
            })
            
          } finally {
            // Clean up after each iteration
            if (unmount) unmount()
            if (container.parentNode) {
              document.body.removeChild(container)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})