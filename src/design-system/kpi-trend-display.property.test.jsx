/**
 * Property-Based Tests for KPI Trend Display
 * Feature: dashboard-redesign, Property 17: KPI Trend Display
 * Validates: Requirements 7.2
 */

import React from 'react'
import { describe, test, expect, beforeAll, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './components/KpiCard'
import { EnhancedKpiCard } from './components/EnhancedKpiCard'

// Mock IntersectionObserver for test environment
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn().mockImplementation((element) => {
      // Immediately trigger the callback to simulate intersection
      callback([{ isIntersecting: true, target: element }])
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

describe('Dashboard Redesign - KPI Trend Display Properties', () => {
  // Custom generators for better test data
  const nonEmptyString = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)
  const trendValueString = fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0)
  const titleString = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
  
  /**
   * Property 17: KPI Trend Display
   * For any KPI with trend data, trend indicators should be displayed with 
   * appropriate directional arrows and color coding
   * **Validates: Requirements 7.2**
   */
  
  test('Property 17.1: KPI trend indicators display correct directional arrows', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up', 'down', 'stable'),
        trendValueString,
        fc.oneof(
          fc.integer({ min: 0, max: 1000 }),
          nonEmptyString
        ),
        titleString,
        (trend, trendValue, value, title) => {
          const { container } = render(
            <KpiCard
              title={title}
              value={value}
              trend={trend}
              trendValue={trendValue}
            />
          )

          // Check that trend indicator is present
          const trendElement = container.querySelector('[class*="flex items-center space-x-1"]')
          expect(trendElement).toBeTruthy()

          // Check for SVG arrow based on trend direction
          const svgElement = trendElement?.querySelector('svg')
          expect(svgElement).toBeTruthy()

          // Verify correct arrow direction based on trend
          const pathElement = svgElement?.querySelector('path')
          expect(pathElement).toBeTruthy()
          
          const pathData = pathElement?.getAttribute('d')
          expect(pathData).toBeTruthy()

          // Validate arrow direction matches trend
          if (trend === 'up') {
            // Up arrow should have upward path (contains "17l9.2-9.2" pattern)
            expect(pathData).toMatch(/17l.*-.*M17.*V7H7/)
          } else if (trend === 'down') {
            // Down arrow should have downward path (contains "7l-9.2 9.2" pattern)
            expect(pathData).toMatch(/7l.*9\.2.*M7.*v10h10/)
          } else if (trend === 'stable') {
            // Stable should have horizontal line (contains "12H4" pattern)
            expect(pathData).toMatch(/20.*12H4/)
          }

          // Verify trend value is displayed when provided
          if (trendValue && trendValue.trim()) {
            expect(trendElement.textContent).toContain(trendValue)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 17.2: KPI trend indicators use correct color coding', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up', 'down', 'stable'),
        trendValueString,
        fc.oneof(
          fc.integer({ min: 0, max: 1000 }),
          nonEmptyString
        ),
        titleString,
        (trend, trendValue, value, title) => {
          const { container } = render(
            <KpiCard
              title={title}
              value={value}
              trend={trend}
              trendValue={trendValue}
            />
          )

          // Find trend indicator element
          const trendElement = container.querySelector('[class*="flex items-center space-x-1"]')
          expect(trendElement).toBeTruthy()

          // Verify correct color class based on trend
          const classList = trendElement?.className || ''
          
          if (trend === 'up') {
            expect(classList).toContain('text-green-400')
          } else if (trend === 'down') {
            expect(classList).toContain('text-red-400')
          } else if (trend === 'stable') {
            expect(classList).toContain('text-blue-400')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 17.3: Enhanced KPI cards preserve trend display functionality', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up', 'down', 'stable'),
        trendValueString,
        fc.oneof(
          fc.integer({ min: 0, max: 1000 }),
          nonEmptyString
        ),
        titleString,
        fc.constantFrom('performance', 'growth', 'status'),
        (trend, trendValue, value, title, type) => {
          const { container } = render(
            <EnhancedKpiCard
              title={title}
              value={value}
              trend={trend}
              trendValue={trendValue}
              type={type}
            />
          )

          // Enhanced KPI should contain the base KPI card with trend functionality
          const trendElement = container.querySelector('[class*="flex items-center space-x-1"]')
          expect(trendElement).toBeTruthy()

          // Verify trend value is displayed
          if (trendValue && trendValue.trim()) {
            expect(trendElement.textContent).toContain(trendValue)
          }

          // Verify SVG icon is present
          const svgElement = trendElement?.querySelector('svg')
          expect(svgElement).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 17.4: KPI components handle missing trend data gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: 0, max: 1000 }),
          nonEmptyString
        ),
        titleString,
        (value, title) => {
          const { container } = render(
            <KpiCard
              title={title}
              value={value}
              // No trend prop provided
            />
          )

          // Should not display trend indicator when trend is not provided
          const trendElement = container.querySelector('[class*="flex items-center space-x-1"]')
          expect(trendElement).toBeFalsy()

          // Should still display title and value
          expect(container.textContent).toContain(title)
          expect(container.textContent).toContain(value.toString())
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 17.5: KPI trend indicators maintain consistent structure across all trend types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('up', 'down', 'stable'),
        trendValueString,
        fc.oneof(
          fc.integer({ min: 0, max: 1000 }),
          nonEmptyString
        ),
        titleString,
        (trend, trendValue, value, title) => {
          const { container } = render(
            <KpiCard
              title={title}
              value={value}
              trend={trend}
              trendValue={trendValue}
            />
          )

          // Find trend container
          const trendElement = container.querySelector('[class*="flex items-center space-x-1"]')
          expect(trendElement).toBeTruthy()

          // Should always have consistent structure: flex container with items-center and space-x-1
          expect(trendElement.className).toContain('flex')
          expect(trendElement.className).toContain('items-center')
          expect(trendElement.className).toContain('space-x-1')

          // Should contain exactly one SVG element
          const svgElements = trendElement.querySelectorAll('svg')
          expect(svgElements).toHaveLength(1)

          // SVG should have consistent dimensions
          const svg = svgElements[0]
          expect(svg.getAttribute('class')).toContain('w-4 h-4')

          // Should have proper SVG attributes
          expect(svg.getAttribute('fill')).toBe('none')
          expect(svg.getAttribute('stroke')).toBe('currentColor')
          expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')

          // Path should have consistent stroke properties
          const path = svg.querySelector('path')
          expect(path).toBeTruthy()
          expect(path.getAttribute('stroke-linecap')).toBe('round')
          expect(path.getAttribute('stroke-linejoin')).toBe('round')
          expect(path.getAttribute('stroke-width')).toBe('2')
        }
      ),
      { numRuns: 100 }
    )
  })
})