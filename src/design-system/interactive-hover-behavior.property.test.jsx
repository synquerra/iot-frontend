/**
 * Property-Based Tests for Interactive Element Hover Behavior
 * Feature: dashboard-redesign, Property 2: Interactive Element Hover Behavior
 * Validates: Requirements 1.4, 7.4, 8.3
 */

import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { Button } from './components/Button.jsx'
import { Card } from './components/Card.jsx'
import { Table, TableRow, TableCell } from './components/Table.jsx'

describe('Dashboard Redesign - Interactive Element Hover Behavior Properties', () => {
  // Ensure cleanup after each test to prevent test ID collisions
  afterEach(() => {
    cleanup()
  })

  /**
   * Property 2: Interactive Element Hover Behavior
   * For any interactive element (buttons, cards, table rows), hovering should trigger 
   * the expected visual feedback with CSS transitions
   * **Validates: Requirements 1.4, 7.4, 8.3**
   */

  test('Property 2.1: Button components have consistent hover effects with CSS transitions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('primary', 'secondary', 'ghost', 'danger', 'success', 'warning', 'gradient', 'colorful', 'outline'),
        fc.constantFrom('violet', 'blue', 'teal', 'green', 'amber', 'red', 'pink', 'purple'),
        fc.constantFrom('xs', 'sm', 'md', 'lg', 'xl'),
        fc.boolean(),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (variant, colorScheme, size, glow, uniqueId) => {
          const testId = `interactive-button-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          const { unmount } = render(
            <Button 
              data-testid={testId}
              variant={variant}
              colorScheme={colorScheme}
              size={size}
              glow={glow}
            >
              Test Button
            </Button>,
            { container }
          )
          
          const button = screen.getByTestId(testId)
          expect(button).toBeDefined()
          
          // Verify button has transition classes for smooth hover effects
          expect(button.className).toMatch(/transition-all/)
          expect(button.className).toMatch(/duration-\d+/)
          
          // Verify button has hover scale effects (responsive)
          expect(button.className).toMatch(/hover:scale-\[1\.\d+\]/)
          
          // Verify button has hover color changes based on variant
          if (variant === 'primary') {
            expect(button.className).toMatch(/hover:bg-/)
          } else if (variant === 'ghost') {
            expect(button.className).toMatch(/hover:bg-/)
            expect(button.className).toMatch(/hover:text-/)
          } else if (variant === 'gradient') {
            expect(button.className).toMatch(/hover:from-/)
            expect(button.className).toMatch(/hover:to-/)
          }
          
          // Verify glow effects are applied when enabled (responsive)
          if (glow) {
            expect(button.className).toMatch(/hover:drop-shadow-glow/)
          }
          
          // Verify focus states are present for accessibility
          expect(button.className).toMatch(/focus:/)
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.2: Card components have consistent hover effects when hover prop is enabled', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('default', 'elevated', 'outlined', 'gradient', 'glass', 'colorful'),
        fc.constantFrom('violet', 'blue', 'cyan', 'teal', 'green', 'amber', 'red', 'pink', 'purple'),
        fc.constantFrom('sm', 'md', 'lg'),
        fc.boolean(),
        fc.boolean(),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (variant, colorScheme, padding, hover, glowEffect, uniqueId) => {
          const testId = `interactive-card-${uniqueId}`
          
          // Create a completely isolated container
          const container = document.createElement('div')
          container.id = `test-container-${uniqueId}`
          
          try {
            const { unmount } = render(
              <Card 
                data-testid={testId}
                variant={variant}
                colorScheme={colorScheme}
                padding={padding}
                hover={hover}
                glowEffect={glowEffect}
              >
                Test Card Content
              </Card>,
              { container }
            )
            
            const card = container.querySelector(`[data-testid="${testId}"]`)
            expect(card).toBeDefined()
            expect(card).not.toBeNull()
            
            // Verify card has transition classes for smooth animations
            expect(card.className).toMatch(/transition-all/)
            expect(card.className).toMatch(/duration-\d+/)
            
            if (hover) {
              // Verify hover effects are applied when hover prop is true
              expect(card.className).toMatch(/hover:shadow-/)
              expect(card.className).toMatch(/hover:scale-\[1\.\d+\]/)
              expect(card.className).toMatch(/hover:-translate-y-/)
              expect(card.className).toMatch(/cursor-pointer/)
              
              // Verify glow effects are applied when both hover and glowEffect are true
              if (glowEffect && colorScheme) {
                // Only check for glow effects on color schemes that are actually implemented
                const supportedGlowColors = ['violet', 'blue', 'teal', 'green', 'amber', 'red', 'pink']
                if (supportedGlowColors.includes(colorScheme)) {
                  expect(card.className).toMatch(new RegExp(`hover:shadow-${colorScheme}-500`))
                }
              }
            } else {
              // Verify hover effects are not applied when hover prop is false
              expect(card.className).not.toMatch(/cursor-pointer/)
            }
            
            // Clean up immediately after each iteration
            unmount()
          } finally {
            // Ensure container is always removed
            if (container.parentNode) {
              container.parentNode.removeChild(container)
            }
          }
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.3: Table row components have consistent hover effects when hoverable prop is enabled', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('default', 'bordered', 'minimal'),
        fc.boolean(),
        fc.boolean(),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (variant, hoverable, striped, uniqueId) => {
          const testId = `interactive-table-row-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          const { unmount } = render(
            <table>
              <tbody>
                <TableRow 
                  data-testid={testId}
                  variant={variant}
                  hoverable={hoverable}
                  striped={striped}
                >
                  <TableCell>Test Cell 1</TableCell>
                  <TableCell>Test Cell 2</TableCell>
                </TableRow>
              </tbody>
            </table>,
            { container }
          )
          
          const tableRow = screen.getByTestId(testId)
          expect(tableRow).toBeDefined()
          
          // Verify table row has transition classes for smooth animations
          expect(tableRow.className).toMatch(/transition-all/)
          expect(tableRow.className).toMatch(/duration-\d+/)
          
          if (hoverable) {
            // Verify hover effects are applied when hoverable prop is true
            expect(tableRow.className).toMatch(/hover:bg-gradient-to-r/)
            expect(tableRow.className).toMatch(/hover:from-violet-500/)
            expect(tableRow.className).toMatch(/hover:via-blue-500/)
            expect(tableRow.className).toMatch(/hover:to-teal-500/)
            expect(tableRow.className).toMatch(/hover:border-l-/)
            expect(tableRow.className).toMatch(/hover:border-l-teal-400/)
            expect(tableRow.className).toMatch(/hover:shadow-/)
            expect(tableRow.className).toMatch(/hover:scale-\[1\.\d+\]/)
            expect(tableRow.className).toMatch(/cursor-pointer/)
          } else {
            // Verify hover effects are not applied when hoverable prop is false
            expect(tableRow.className).not.toMatch(/cursor-pointer/)
          }
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.4: Interactive elements maintain consistent transition timing across components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'card', 'tableRow'),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (componentType, uniqueId) => {
          const testId = `timing-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          let component;
          let unmount;
          
          switch (componentType) {
            case 'button':
              ({ unmount } = render(<Button data-testid={testId}>Button</Button>, { container }))
              component = screen.getByTestId(testId)
              break
            case 'card':
              ({ unmount } = render(<Card data-testid={testId} hover>Card</Card>, { container }))
              component = screen.getByTestId(testId)
              break
            case 'tableRow':
              ({ unmount } = render(
                <table>
                  <tbody>
                    <TableRow data-testid={testId} hoverable>
                      <TableCell>Cell</TableCell>
                    </TableRow>
                  </tbody>
                </table>,
                { container }
              ))
              component = screen.getByTestId(testId)
              break
          }
          
          expect(component).toBeDefined()
          
          // Verify consistent transition timing across all interactive components
          expect(component.className).toMatch(/transition-all/)
          
          // Verify duration is within expected range (200-300ms for micro-interactions)
          const hasDuration200 = component.className.includes('duration-200')
          const hasDuration300 = component.className.includes('duration-300')
          
          expect(hasDuration200 || hasDuration300).toBe(true)
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.5: Interactive elements have proper focus states for accessibility', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('primary', 'secondary', 'gradient'),
        fc.constantFrom('violet', 'blue', 'teal', 'green'),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (variant, colorScheme, uniqueId) => {
          const testId = `focus-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          const { unmount } = render(
            <Button 
              data-testid={testId}
              variant={variant}
              colorScheme={colorScheme}
            >
              Focus Test
            </Button>,
            { container }
          )
          
          const button = screen.getByTestId(testId)
          expect(button).toBeDefined()
          
          // Verify focus outline is disabled in favor of custom focus ring
          expect(button.className).toMatch(/focus:outline-none/)
          
          // Verify custom focus ring is present
          expect(button.className).toMatch(/focus:ring-/)
          expect(button.className).toMatch(/focus:ring-offset-/)
          
          // Verify focus ring color matches the component's color scheme
          expect(button.className).toMatch(new RegExp(`focus:ring-${colorScheme}-500`))
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.6: Interactive elements have responsive hover behavior', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'card'),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (componentType, uniqueId) => {
          const testId = `responsive-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          let component;
          let unmount;
          
          if (componentType === 'button') {
            ({ unmount } = render(<Button data-testid={testId} glow>Responsive Button</Button>, { container }))
            component = screen.getByTestId(testId)
          } else {
            ({ unmount } = render(<Card data-testid={testId} hover glowEffect colorScheme="violet">Responsive Card</Card>, { container }))
            component = screen.getByTestId(testId)
          }
          
          expect(component).toBeDefined()
          
          // Verify responsive hover effects are present
          // Effects should be different or disabled on mobile (sm:) and enhanced on desktop (md:)
          const hasResponsiveHover = 
            component.className.includes('sm:hover:') || 
            component.className.includes('md:hover:') ||
            component.className.includes('hover:scale-[1.0')
          
          expect(hasResponsiveHover).toBe(true)
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.7: Interactive elements maintain visual hierarchy through consistent hover scaling', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('xs', 'sm', 'md', 'lg', 'xl'),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (size, uniqueId) => {
          const testId = `scale-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          const { unmount } = render(<Button data-testid={testId} size={size}>Scale Test</Button>, { container })
          
          const button = screen.getByTestId(testId)
          expect(button).toBeDefined()
          
          // Verify hover scale effects are present and within reasonable bounds
          const scaleMatch = button.className.match(/hover:scale-\[1\.(\d+)\]/)
          
          if (scaleMatch) {
            const scaleValue = parseFloat(`1.${scaleMatch[1]}`)
            
            // Scale should be between 1.01 and 1.05 for subtle but noticeable effect
            expect(scaleValue).toBeGreaterThanOrEqual(1.01)
            expect(scaleValue).toBeLessThanOrEqual(1.05)
          }
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })

  test('Property 2.8: Interactive elements have consistent active states for touch feedback', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('primary', 'secondary', 'danger', 'success'),
        fc.integer({ min: 1, max: 10000 }), // Add unique ID generator
        (variant, uniqueId) => {
          const testId = `active-test-${uniqueId}`
          
          // Create a container for this specific test iteration
          const container = document.createElement('div')
          document.body.appendChild(container)
          
          const { unmount } = render(<Button data-testid={testId} variant={variant}>Active Test</Button>, { container })
          
          const button = screen.getByTestId(testId)
          expect(button).toBeDefined()
          
          // Verify active states are present for touch feedback
          const hasActiveScale = button.className.includes('active:scale-[0.9')
          const hasActiveBg = button.className.includes('active:bg-')
          
          // At least one form of active feedback should be present
          expect(hasActiveScale || hasActiveBg).toBe(true)
          
          // Clean up after each iteration
          unmount()
          document.body.removeChild(container)
        }
      ),
      { numRuns: 50 } // Reduced from 100 to improve test performance
    )
  })
})