/**
 * Property-Based Tests for Enhanced Color Token System
 * Feature: colorful-ui-redesign, Property 1: Comprehensive Color System Structure
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  baseColors,
  spectrumColors,
  gradients,
  semanticColors,
  colorTokens,
  tailwindColors,
  getColorIntensity,
  getColorScale,
  getGradient,
  getChartColors,
  getChartGradients
} from './colors.js'

describe('Enhanced Color System Properties', () => {
  /**
   * Property 1: Comprehensive Color System Structure
   * For any color system configuration, it should contain at least 8 primary colors,
   * semantic color mappings for all status types (success, warning, error, info),
   * and gradient definitions for backgrounds and accents
   */
  
  test('Property 1.1: Spectrum colors completeness - should have at least 8 primary spectrum colors', () => {
    const spectrumColorNames = Object.keys(spectrumColors)
    expect(spectrumColorNames.length).toBeGreaterThanOrEqual(8)
    
    // Test that we have the expected spectrum colors
    const expectedColors = ['violet', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'amber', 'orange', 'red', 'pink', 'purple']
    expectedColors.forEach(colorName => {
      expect(spectrumColorNames).toContain(colorName)
    })
  })

  test('Property 1.2: Spectrum color structure consistency - each spectrum color should have complete scale and intensity variants', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spectrumColors)),
        (colorName) => {
          const color = spectrumColors[colorName]
          expect(color).toBeDefined()
          expect(typeof color).toBe('object')
          
          // Should have complete scale from 50 to 950
          const expectedScales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
          expectedScales.forEach(scale => {
            expect(color[scale]).toBeDefined()
            expect(typeof color[scale]).toBe('string')
            expect(color[scale]).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          })
          
          // Should have intensity variants
          expect(color.subtle).toBeDefined()
          expect(color.vibrant).toBeDefined()
          expect(color.subtle).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          expect(color.vibrant).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.3: Semantic status colors completeness - should have all required status types', () => {
    const statusColors = semanticColors.status
    expect(statusColors).toBeDefined()
    
    // Should have all required status types
    const requiredStatusTypes = ['success', 'warning', 'error', 'info']
    requiredStatusTypes.forEach(statusType => {
      expect(statusColors[statusType]).toBeDefined()
      expect(statusColors[statusType]).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      
      // Should also have subtle variants
      const subtleKey = `${statusType}Subtle`
      expect(statusColors[subtleKey]).toBeDefined()
      expect(statusColors[subtleKey]).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    })
  })

  test('Property 1.4: Gradient definitions completeness - should have comprehensive gradient combinations', () => {
    expect(gradients).toBeDefined()
    expect(typeof gradients).toBe('object')
    
    // Should have at least 10 gradient definitions
    const gradientNames = Object.keys(gradients)
    expect(gradientNames.length).toBeGreaterThanOrEqual(10)
    
    // Should have essential gradients
    const essentialGradients = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'rainbow', 'sunset', 'ocean', 'forest']
    essentialGradients.forEach(gradientName => {
      expect(gradientNames).toContain(gradientName)
      expect(gradients[gradientName]).toMatch(/^linear-gradient\(/)
    })
  })

  test('Property 1.5: Chart color palette diversity - should have at least 12 distinct colors for data visualization', () => {
    const chartColors = semanticColors.chart
    expect(chartColors).toBeDefined()
    
    // Should have main palette with at least 12 colors
    expect(chartColors.palette).toBeDefined()
    expect(Array.isArray(chartColors.palette)).toBe(true)
    expect(chartColors.palette.length).toBeGreaterThanOrEqual(12)
    
    // Should have subtle palette with same length
    expect(chartColors.paletteSubtle).toBeDefined()
    expect(Array.isArray(chartColors.paletteSubtle)).toBe(true)
    expect(chartColors.paletteSubtle.length).toBe(chartColors.palette.length)
    
    // Should have gradient fills
    expect(chartColors.gradientFills).toBeDefined()
    expect(Array.isArray(chartColors.gradientFills)).toBe(true)
    expect(chartColors.gradientFills.length).toBeGreaterThanOrEqual(6)
    
    // All colors should be valid hex colors
    chartColors.palette.forEach(color => {
      expect(color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    })
    
    chartColors.paletteSubtle.forEach(color => {
      expect(color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    })
    
    // All gradient fills should be valid CSS gradients
    chartColors.gradientFills.forEach(gradient => {
      expect(gradient).toMatch(/^linear-gradient\(/)
    })
  })

  /**
   * Property 2: Color Intensity Variants
   * For any color in the system, both vibrant and subtle variants should exist
   * with appropriate saturation levels for different UI contexts
   */
  
  test('Property 2.1: Color intensity helper functions - should return correct intensity variants', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spectrumColors)),
        fc.constantFrom('subtle', 'vibrant'),
        (colorName, intensity) => {
          const colorValue = getColorIntensity(colorName, intensity)
          expect(colorValue).toBeDefined()
          expect(colorValue).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          
          // Should match the expected intensity variant
          const expectedValue = spectrumColors[colorName][intensity]
          expect(colorValue).toBe(expectedValue)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2.2: Color scale helper functions - should return correct scale values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spectrumColors)),
        fc.constantFrom(50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950),
        (colorName, scale) => {
          const colorValue = getColorScale(colorName, scale)
          expect(colorValue).toBeDefined()
          expect(colorValue).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          
          // Should match the expected scale value
          const expectedValue = spectrumColors[colorName][scale]
          expect(colorValue).toBe(expectedValue)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2.3: Gradient helper functions - should return valid gradient definitions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(gradients)),
        (gradientName) => {
          const gradientValue = getGradient(gradientName)
          expect(gradientValue).toBeDefined()
          expect(gradientValue).toMatch(/^linear-gradient\(/)
          
          // Should match the expected gradient
          const expectedValue = gradients[gradientName]
          expect(gradientValue).toBe(expectedValue)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2.4: Chart color helper functions - should return appropriate color arrays', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 15 }),
        fc.constantFrom('subtle', 'vibrant'),
        (count, intensity) => {
          const colors = getChartColors(count, intensity)
          expect(Array.isArray(colors)).toBe(true)
          expect(colors.length).toBe(Math.min(count, 12)) // Limited by available palette
          
          // All colors should be valid hex colors
          colors.forEach(color => {
            expect(color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2.5: Chart gradient helper functions - should return appropriate gradient arrays', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (count) => {
          const gradients = getChartGradients(count)
          expect(Array.isArray(gradients)).toBe(true)
          expect(gradients.length).toBe(Math.min(count, 6)) // Limited by available gradients
          
          // All gradients should be valid CSS gradients
          gradients.forEach(gradient => {
            expect(gradient).toMatch(/^linear-gradient\(/)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2.6: Tailwind color integration - all spectrum colors should be available in Tailwind config', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spectrumColors)),
        (colorName) => {
          // Should be present in tailwind colors
          expect(tailwindColors[colorName]).toBeDefined()
          expect(tailwindColors[colorName]).toEqual(spectrumColors[colorName])
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2.7: Backward compatibility - existing colors should remain unchanged', () => {
    // Base colors should still be available
    expect(tailwindColors.bg).toBe(baseColors.bg)
    expect(tailwindColors.card).toBe(baseColors.card)
    expect(tailwindColors.muted).toBe(baseColors.muted)
    expect(tailwindColors.accent).toBe(baseColors.accent)
    expect(tailwindColors.primary).toBe(baseColors.primary)
    
    // Semantic colors should be available
    expect(tailwindColors.surface).toEqual(semanticColors.surface)
    expect(tailwindColors.text).toEqual(semanticColors.text)
    expect(tailwindColors.border).toEqual(semanticColors.border)
    expect(tailwindColors.status).toEqual(semanticColors.status)
    expect(tailwindColors.interactive).toEqual(semanticColors.interactive)
  })

  test('Property 2.8: Color token structure completeness - colorTokens should include all color categories', () => {
    expect(colorTokens).toBeDefined()
    expect(typeof colorTokens).toBe('object')
    
    // Should include base colors
    Object.keys(baseColors).forEach(colorKey => {
      expect(colorTokens[colorKey]).toBe(baseColors[colorKey])
    })
    
    // Should include spectrum colors
    expect(colorTokens.spectrum).toEqual(spectrumColors)
    
    // Should include gradients
    expect(colorTokens.gradients).toEqual(gradients)
    
    // Should include semantic colors
    expect(colorTokens.semantic).toEqual(semanticColors)
  })

  test('Property 2.9: Invalid color handling - helper functions should handle invalid inputs gracefully', () => {
    // Invalid color names should return null
    expect(getColorIntensity('invalidColor')).toBeNull()
    expect(getColorScale('invalidColor')).toBeNull()
    
    // Invalid gradient names should return primary gradient
    expect(getGradient('invalidGradient')).toBe(gradients.primary)
    
    // Edge cases for chart colors
    expect(getChartColors(0)).toEqual([])
    expect(getChartGradients(0)).toEqual([])
  })
})