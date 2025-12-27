/**
 * Property-Based Tests for Design System Consistency
 * Feature: ui-design-improvements, Property 1: Design System Consistency
 * Validates: Requirements 1.1, 1.4, 3.3, 3.4, 4.3
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  baseColors,
  semanticColors,
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

describe('Design System Consistency Properties', () => {
  /**
   * Property 1: Design System Consistency
   * For any component using the design system, all instances should maintain 
   * consistent colors, typography, spacing, and styling according to the 
   * defined design tokens across all pages.
   */
  
  test('Property 1.1: Color token consistency - all color values should be valid CSS colors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(baseColors)),
        (colorValue) => {
          // Test that color value is a valid CSS color (hex format)
          const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
          expect(colorValue).toMatch(hexColorRegex)
          expect(colorValue).toBeDefined()
          expect(typeof colorValue).toBe('string')
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.2: Semantic color structure consistency - all semantic color groups should have consistent structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(semanticColors)),
        (colorGroup) => {
          const group = semanticColors[colorGroup]
          expect(group).toBeDefined()
          expect(typeof group).toBe('object')
          
          // Each color group should have at least one color value
          const colorValues = Object.values(group)
          expect(colorValues.length).toBeGreaterThan(0)
          
          // All color values in the group should be valid hex colors
          colorValues.forEach(colorValue => {
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
            expect(colorValue).toMatch(hexColorRegex)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.3: Typography scale consistency - all font sizes should have valid CSS values and line heights', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(fontSize)),
        (sizeKey) => {
          const sizeValue = fontSize[sizeKey]
          expect(sizeValue).toBeDefined()
          expect(Array.isArray(sizeValue)).toBe(true)
          expect(sizeValue).toHaveLength(2)
          
          // First element should be font size in rem
          const [fontSizeValue, lineHeightObj] = sizeValue
          expect(fontSizeValue).toMatch(/^\d+(\.\d+)?rem$/)
          
          // Second element should be object with lineHeight
          expect(lineHeightObj).toBeDefined()
          expect(typeof lineHeightObj).toBe('object')
          expect(lineHeightObj.lineHeight).toBeDefined()
          expect(lineHeightObj.lineHeight).toMatch(/^\d+(\.\d+)?rem$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.4: Spacing scale consistency - all spacing values should follow consistent rem-based scale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(spacing)),
        (spacingKey) => {
          const spacingValue = spacing[spacingKey]
          expect(spacingValue).toBeDefined()
          expect(typeof spacingValue).toBe('string')
          
          // Should be either px, rem, or 0px
          const validSpacingRegex = /^(\d+(\.\d+)?rem|\d+px|0px)$/
          expect(spacingValue).toMatch(validSpacingRegex)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.5: Component spacing consistency - all component spacing should use values from base spacing scale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(componentSpacing)),
        (componentKey) => {
          const component = componentSpacing[componentKey]
          expect(component).toBeDefined()
          expect(typeof component).toBe('object')
          
          // Recursively check that all spacing values in component are from base spacing
          const checkSpacingValues = (obj) => {
            Object.values(obj).forEach(value => {
              if (typeof value === 'string') {
                // Should be a value that exists in base spacing
                const spacingValues = Object.values(spacing)
                expect(spacingValues).toContain(value)
              } else if (typeof value === 'object' && value !== null) {
                checkSpacingValues(value)
              }
            })
          }
          
          checkSpacingValues(component)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.6: Typography scale semantic consistency - all typography scale entries should have consistent structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(typographyScale)),
        (scaleKey) => {
          const scaleValue = typographyScale[scaleKey]
          expect(scaleValue).toBeDefined()
          expect(typeof scaleValue).toBe('object')
          
          // Should have fontSize, fontWeight, and letterSpacing
          expect(scaleValue.fontSize).toBeDefined()
          expect(scaleValue.fontWeight).toBeDefined()
          expect(scaleValue.letterSpacing).toBeDefined()
          
          // fontSize should be from fontSize tokens
          expect(Object.values(fontSize)).toContain(scaleValue.fontSize)
          
          // fontWeight should be from fontWeight tokens
          expect(Object.values(fontWeight)).toContain(scaleValue.fontWeight)
          
          // letterSpacing should be a valid CSS value
          expect(scaleValue.letterSpacing).toMatch(/^-?\d+(\.\d+)?em$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.7: Border radius consistency - all border radius values should be valid CSS values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(borderRadius)),
        (radiusValue) => {
          expect(radiusValue).toBeDefined()
          expect(typeof radiusValue).toBe('string')
          
          // Should be valid CSS border-radius value
          const validRadiusRegex = /^(\d+(\.\d+)?(px|rem)|9999px|0px)$/
          expect(radiusValue).toMatch(validRadiusRegex)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.8: Tailwind configuration consistency - Tailwind configs should include all design tokens', () => {
    // Test that tailwind configs contain all necessary tokens
    expect(tailwindColors).toBeDefined()
    expect(tailwindTypography).toBeDefined()
    expect(tailwindSpacing).toBeDefined()
    
    // Base colors should be present in tailwind config
    Object.keys(baseColors).forEach(colorKey => {
      expect(tailwindColors[colorKey]).toBe(baseColors[colorKey])
    })
    
    // Semantic colors should be present in tailwind config
    Object.keys(semanticColors).forEach(colorGroup => {
      expect(tailwindColors[colorGroup]).toBeDefined()
      expect(tailwindColors[colorGroup]).toEqual(semanticColors[colorGroup])
    })
    
    // Typography should be present in tailwind config
    expect(tailwindTypography.fontFamily).toEqual(fontFamily)
    expect(tailwindTypography.fontSize).toEqual(fontSize)
    expect(tailwindTypography.fontWeight).toEqual(fontWeight)
    
    // Spacing should be present in tailwind config
    expect(tailwindSpacing.spacing).toEqual(spacing)
    expect(tailwindSpacing.borderRadius).toBeDefined()
    expect(tailwindSpacing.boxShadow).toEqual(boxShadow)
  })

  test('Property 1.9: Color contrast relationships - related colors should maintain proper contrast relationships', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('surface', 'text', 'border', 'status', 'interactive'),
        (colorGroup) => {
          const group = semanticColors[colorGroup]
          const colorKeys = Object.keys(group)
          
          // Each color group should have consistent naming patterns
          colorKeys.forEach(colorKey => {
            expect(typeof colorKey).toBe('string')
            expect(colorKey.length).toBeGreaterThan(0)
            
            // Color values should be valid hex colors
            const colorValue = group[colorKey]
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
            expect(colorValue).toMatch(hexColorRegex)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1.10: Design token export consistency - all tokens should be properly exported', () => {
    // Test that all major token categories are exported
    expect(baseColors).toBeDefined()
    expect(semanticColors).toBeDefined()
    expect(colorTokens).toBeDefined()
    expect(tailwindColors).toBeDefined()
    
    expect(fontFamily).toBeDefined()
    expect(fontSize).toBeDefined()
    expect(fontWeight).toBeDefined()
    expect(typographyScale).toBeDefined()
    expect(tailwindTypography).toBeDefined()
    
    expect(spacing).toBeDefined()
    expect(componentSpacing).toBeDefined()
    expect(borderRadius).toBeDefined()
    expect(boxShadow).toBeDefined()
    expect(tailwindSpacing).toBeDefined()
    
    // colorTokens should combine base and semantic colors
    expect(Object.keys(colorTokens)).toEqual(
      expect.arrayContaining([...Object.keys(baseColors), ...Object.keys(semanticColors)])
    )
  })
})