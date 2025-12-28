/**
 * Property-Based Tests for Dashboard Redesign Design System Consistency
 * Feature: dashboard-redesign, Property 1: Design System Consistency
 * Validates: Requirements 1.1
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  baseColors,
  semanticColors,
  spectrumColors,
  colorTokens,
  tailwindColors
} from './tokens/colors.js'
import {
  fontFamily,
  fontSize,
  fontWeight,
  typographyScale,
  tailwindTypography
} from './tokens/typography.js'
import {
  spacing,
  componentSpacing,
  borderRadius,
  boxShadow,
  tailwindSpacing
} from './tokens/spacing.js'

describe('Dashboard Redesign - Design System Consistency Properties', () => {
  /**
   * Property 1: Design System Consistency
   * For any dashboard component, all spacing, typography, and color values 
   * should come from the centralized design system tokens
   * **Validates: Requirements 1.1**
   */
  
  test('Property 1.1: Dashboard components use consistent spacing from design tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(componentSpacing)),
        (componentType) => {
          const component = componentSpacing[componentType]
          expect(component).toBeDefined()
          expect(typeof component).toBe('object')
          
          // Recursively validate that all spacing values come from base spacing tokens
          const validateSpacingConsistency = (obj, path = '') => {
            Object.entries(obj).forEach(([key, value]) => {
              const currentPath = path ? `${path}.${key}` : key
              
              if (typeof value === 'string') {
                // String values should exist in base spacing scale
                const spacingValues = Object.values(spacing)
                expect(spacingValues).toContain(value)
              } else if (typeof value === 'object' && value !== null) {
                // Recursively check nested objects
                validateSpacingConsistency(value, currentPath)
              }
            })
          }
          
          validateSpacingConsistency(component, componentType)
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property 1.2: Dashboard components use consistent typography from design tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(typographyScale)),
        (typographyType) => {
          const typography = typographyScale[typographyType]
          expect(typography).toBeDefined()
          expect(typeof typography).toBe('object')
          
          // Validate typography structure consistency
          expect(typography).toHaveProperty('fontSize')
          expect(typography).toHaveProperty('fontWeight')
          expect(typography).toHaveProperty('letterSpacing')
          
          // fontSize should be from the fontSize tokens
          const fontSizeValues = Object.values(fontSize)
          expect(fontSizeValues).toContain(typography.fontSize)
          
          // fontWeight should be from the fontWeight tokens
          const fontWeightValues = Object.values(fontWeight)
          expect(fontWeightValues).toContain(typography.fontWeight)
          
          // letterSpacing should be a valid CSS em value
          expect(typography.letterSpacing).toMatch(/^-?\d+(\.\d+)?em$/)
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property 1.3: Dashboard components use consistent color schemes from design tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(semanticColors)),
        (colorCategory) => {
          const colorGroup = semanticColors[colorCategory]
          expect(colorGroup).toBeDefined()
          expect(typeof colorGroup).toBe('object')
          
          // Validate color consistency based on category
          Object.entries(colorGroup).forEach(([colorName, colorValue]) => {
            if (Array.isArray(colorValue)) {
              // Handle chart palette arrays
              colorValue.forEach((color, index) => {
                if (typeof color === 'string' && color.startsWith('linear-gradient')) {
                  // Handle gradient values in arrays - use more flexible pattern for nested parentheses
                  expect(color).toMatch(/^linear-gradient\(.+\)$/)
                  expect(color).toMatch(/(rgba?\([^)]+\)|#[A-Fa-f0-9]{3,6}|\d+%)/)
                } else {
                  // Handle hex color values in arrays
                  expect(color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
                }
              })
            } else if (typeof colorValue === 'string') {
              // Handle individual color values
              if (colorValue.startsWith('linear-gradient')) {
                // Gradient values should be valid CSS gradients with proper syntax - use flexible pattern
                expect(colorValue).toMatch(/^linear-gradient\(.+\)$/)
                // Additional validation: should contain percentage or color values
                expect(colorValue).toMatch(/(rgba?\([^)]+\)|#[A-Fa-f0-9]{3,6}|\d+%)/)
              } else {
                // Regular color values should be valid hex colors
                expect(colorValue).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
              }
            }
          })
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property 1.4: Dashboard spectrum colors maintain consistent structure and naming', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spectrumColors)),
        (colorName) => {
          const colorScale = spectrumColors[colorName]
          expect(colorScale).toBeDefined()
          expect(typeof colorScale).toBe('object')
          
          // Each spectrum color should have required intensity levels
          const requiredLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
          requiredLevels.forEach(level => {
            expect(colorScale).toHaveProperty(level.toString())
            expect(colorScale[level]).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          })
          
          // Should have semantic variants
          expect(colorScale).toHaveProperty('subtle')
          expect(colorScale).toHaveProperty('vibrant')
          expect(colorScale.subtle).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          expect(colorScale.vibrant).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          
          // Subtle should be 400 level, vibrant should be 500 level
          expect(colorScale.subtle).toBe(colorScale[400])
          expect(colorScale.vibrant).toBe(colorScale[500])
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property 1.5: Dashboard design tokens are properly exported and accessible', () => {
    // Validate that all required design tokens are exported
    expect(baseColors).toBeDefined()
    expect(semanticColors).toBeDefined()
    expect(spectrumColors).toBeDefined()
    expect(colorTokens).toBeDefined()
    expect(tailwindColors).toBeDefined()
    
    expect(fontFamily).toBeDefined()
    expect(fontSize).toBeDefined()
    expect(fontWeight).toBeDefined()
    expect(typographyScale).toBeDefined()
    
    expect(spacing).toBeDefined()
    expect(componentSpacing).toBeDefined()
    expect(borderRadius).toBeDefined()
    expect(boxShadow).toBeDefined()
    
    // Validate colorTokens structure includes all required categories
    expect(colorTokens).toHaveProperty('spectrum')
    expect(colorTokens).toHaveProperty('gradients')
    expect(colorTokens).toHaveProperty('semantic')
    
    // Validate that base colors are preserved for backward compatibility
    Object.keys(baseColors).forEach(colorKey => {
      expect(colorTokens[colorKey]).toBe(baseColors[colorKey])
    })
  })

  test('Property 1.6: Dashboard component spacing follows hierarchical consistency', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('card', 'button', 'form', 'layout'),
        (componentType) => {
          const component = componentSpacing[componentType]
          expect(component).toBeDefined()
          
          // Validate that component spacing follows logical hierarchy
          if (component.padding && typeof component.padding === 'object') {
            const paddingSizes = Object.keys(component.padding)
            if (paddingSizes.includes('sm') && paddingSizes.includes('md') && paddingSizes.includes('lg')) {
              // Convert spacing values to numbers for comparison
              const getSpacingNumber = (spacingValue) => {
                const match = spacingValue.match(/^(\d+(\.\d+)?)/)
                return match ? parseFloat(match[1]) : 0
              }
              
              const smValue = getSpacingNumber(component.padding.sm)
              const mdValue = getSpacingNumber(component.padding.md)
              const lgValue = getSpacingNumber(component.padding.lg)
              
              // Sizes should follow logical progression: sm < md < lg
              expect(smValue).toBeLessThan(mdValue)
              expect(mdValue).toBeLessThan(lgValue)
            }
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property 1.7: Dashboard border radius values maintain consistent scale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(borderRadius)),
        (radiusKey) => {
          const radiusValue = borderRadius[radiusKey]
          expect(radiusValue).toBeDefined()
          expect(typeof radiusValue).toBe('string')
          
          // Validate border radius format
          if (radiusValue === '0px' || radiusValue === '9999px') {
            // Special cases are valid
            expect(['0px', '9999px']).toContain(radiusValue)
          } else {
            // Regular values should be in rem or px
            expect(radiusValue).toMatch(/^\d+(\.\d+)?(px|rem)$/)
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property 1.8: Dashboard semantic colors provide complete coverage for UI states', () => {
    // Validate that semantic colors cover all necessary UI states
    const requiredColorCategories = ['surface', 'text', 'border', 'status', 'interactive', 'chart']
    
    requiredColorCategories.forEach(category => {
      expect(semanticColors).toHaveProperty(category)
      expect(typeof semanticColors[category]).toBe('object')
    })
    
    // Status colors should include all standard states
    const requiredStatusStates = ['success', 'warning', 'error', 'info']
    requiredStatusStates.forEach(state => {
      expect(semanticColors.status).toHaveProperty(state)
      expect(semanticColors.status).toHaveProperty(`${state}Subtle`)
    })
    
    // Interactive colors should include primary, secondary, and accent
    const requiredInteractiveStates = ['primary', 'primaryHover', 'secondary', 'secondaryHover', 'accent', 'accentHover']
    requiredInteractiveStates.forEach(state => {
      expect(semanticColors.interactive).toHaveProperty(state)
    })
    
    // Chart colors should provide sufficient palette
    expect(semanticColors.chart.palette).toBeDefined()
    expect(Array.isArray(semanticColors.chart.palette)).toBe(true)
    expect(semanticColors.chart.palette.length).toBeGreaterThanOrEqual(12)
    
    expect(semanticColors.chart.paletteSubtle).toBeDefined()
    expect(Array.isArray(semanticColors.chart.paletteSubtle)).toBe(true)
    expect(semanticColors.chart.paletteSubtle.length).toBeGreaterThanOrEqual(12)
  })

  test('Property 1.9: Dashboard font family configuration supports required typefaces', () => {
    // Validate font family configuration
    expect(fontFamily).toHaveProperty('sans')
    expect(fontFamily).toHaveProperty('mono')
    
    expect(Array.isArray(fontFamily.sans)).toBe(true)
    expect(Array.isArray(fontFamily.mono)).toBe(true)
    
    // Sans font should include Inter as primary
    expect(fontFamily.sans[0]).toBe('Inter')
    
    // Mono font should include JetBrains Mono as primary
    expect(fontFamily.mono[0]).toBe('JetBrains Mono')
    
    // Should include system fallbacks
    expect(fontFamily.sans).toContain('system-ui')
    expect(fontFamily.mono).toContain('monospace')
  })

  test('Property 1.10: Dashboard Tailwind configuration maintains design token consistency', () => {
    // Validate that Tailwind configuration properly exports all design tokens
    
    // Colors should be properly mapped
    Object.keys(baseColors).forEach(colorKey => {
      expect(tailwindColors).toHaveProperty(colorKey)
      expect(tailwindColors[colorKey]).toBe(baseColors[colorKey])
    })
    
    // Spectrum colors should be included
    Object.keys(spectrumColors).forEach(colorName => {
      expect(tailwindColors).toHaveProperty(colorName)
      expect(tailwindColors[colorName]).toEqual(spectrumColors[colorName])
    })
    
    // Semantic colors should be included
    Object.keys(semanticColors).forEach(categoryName => {
      expect(tailwindColors).toHaveProperty(categoryName)
      expect(tailwindColors[categoryName]).toEqual(semanticColors[categoryName])
    })
    
    // Typography should be properly mapped
    expect(tailwindTypography.fontFamily).toEqual(fontFamily)
    expect(tailwindTypography.fontSize).toEqual(fontSize)
    expect(tailwindTypography.fontWeight).toEqual(fontWeight)
    
    // Spacing should be properly mapped
    expect(tailwindSpacing.spacing).toEqual(spacing)
    expect(tailwindSpacing.borderRadius).toBeDefined()
    expect(tailwindSpacing.boxShadow).toEqual(boxShadow)
  })
})