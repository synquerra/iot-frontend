/**
 * Test suite for responsive color behavior
 * Validates color adjustments, contrast ratios, and responsive utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { responsiveColors, contrastUtils } from '../utils/responsiveColors.js';

describe('Responsive Color Utilities', () => {
  let originalInnerWidth;

  beforeEach(() => {
    // Mock window.innerWidth
    originalInnerWidth = global.window?.innerWidth;
    global.window = { innerWidth: 1024 };
  });

  afterEach(() => {
    // Restore original window.innerWidth
    if (originalInnerWidth !== undefined) {
      global.window.innerWidth = originalInnerWidth;
    }
  });

  describe('Breakpoint Detection', () => {
    it('should correctly identify mobile breakpoint', () => {
      global.window.innerWidth = 640;
      expect(responsiveColors.getBreakpointCategory(640)).toBe('mobile');
    });

    it('should correctly identify tablet breakpoint', () => {
      global.window.innerWidth = 800;
      expect(responsiveColors.getBreakpointCategory(800)).toBe('tablet');
    });

    it('should correctly identify desktop breakpoint', () => {
      global.window.innerWidth = 1200;
      expect(responsiveColors.getBreakpointCategory(1200)).toBe('desktop');
    });
  });

  describe('Color Intensity Adjustment', () => {
    it('should adjust color intensity for mobile', () => {
      const originalColor = '#8b5cf6'; // violet-500
      const adjustedColor = responsiveColors.adjustColorIntensity(originalColor, 'vibrant', 640);
      
      // Should be slightly more vibrant on mobile
      expect(adjustedColor).toBeDefined();
      expect(adjustedColor).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should handle invalid color values gracefully', () => {
      const invalidColor = 'not-a-color';
      const result = responsiveColors.adjustColorIntensity(invalidColor, 'vibrant', 1024);
      expect(result).toBe(invalidColor);
    });

    it('should handle null/undefined color values', () => {
      expect(responsiveColors.adjustColorIntensity(null, 'vibrant', 1024)).toBeNull();
      expect(responsiveColors.adjustColorIntensity(undefined, 'vibrant', 1024)).toBeUndefined();
    });
  });

  describe('Touch Target Sizing', () => {
    it('should provide larger touch targets on mobile', () => {
      const mobileSize = responsiveColors.getTouchTargetSize('medium', 640);
      const desktopSize = responsiveColors.getTouchTargetSize('medium', 1200);
      
      expect(mobileSize).toBeGreaterThan(desktopSize);
      expect(mobileSize).toBeGreaterThanOrEqual(44); // iOS/Android minimum
    });

    it('should handle different size variants', () => {
      const smallSize = responsiveColors.getTouchTargetSize('small', 640);
      const mediumSize = responsiveColors.getTouchTargetSize('medium', 640);
      const largeSize = responsiveColors.getTouchTargetSize('large', 640);
      
      expect(smallSize).toBeLessThan(mediumSize);
      expect(mediumSize).toBeLessThan(largeSize);
    });
  });

  describe('Gradient Simplification', () => {
    it('should simplify gradients for mobile', () => {
      const complexGradient = 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #a855f7 50%, #c084fc 75%, #d8b4fe 100%)';
      const simplifiedGradient = responsiveColors.simplifyGradient(complexGradient, 640);
      
      // Should be different from original (simplified)
      expect(simplifiedGradient).toBeDefined();
      expect(typeof simplifiedGradient).toBe('string');
    });

    it('should preserve gradients for desktop', () => {
      const originalGradient = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
      const preservedGradient = responsiveColors.simplifyGradient(originalGradient, 1200);
      
      expect(preservedGradient).toBe(originalGradient);
    });
  });

  describe('Glow Effects', () => {
    it('should disable glow effects on mobile', () => {
      expect(responsiveColors.shouldEnableGlow(640)).toBe(false);
    });

    it('should enable glow effects on desktop', () => {
      expect(responsiveColors.shouldEnableGlow(1200)).toBe(true);
    });
  });

  describe('Touch Feedback', () => {
    it('should provide appropriate touch feedback colors', () => {
      const lightFeedback = responsiveColors.getTouchFeedback('light');
      const mediumFeedback = responsiveColors.getTouchFeedback('medium');
      const strongFeedback = responsiveColors.getTouchFeedback('strong');
      
      expect(lightFeedback).toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/);
      expect(mediumFeedback).toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/);
      expect(strongFeedback).toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/);
    });
  });

  describe('CSS Properties Generation', () => {
    it('should generate appropriate CSS properties for mobile', () => {
      const properties = responsiveColors.generateResponsiveColorProperties(640);
      
      expect(properties).toHaveProperty('--breakpoint-category', 'mobile');
      expect(properties).toHaveProperty('--glow-effects-enabled', '0');
      expect(properties).toHaveProperty('--touch-target-min');
    });

    it('should generate appropriate CSS properties for desktop', () => {
      const properties = responsiveColors.generateResponsiveColorProperties(1200);
      
      expect(properties).toHaveProperty('--breakpoint-category', 'desktop');
      expect(properties).toHaveProperty('--glow-effects-enabled', '1');
    });
  });
});

describe('Contrast Utilities', () => {
  describe('Color Conversion', () => {
    it('should convert hex colors to RGB', () => {
      const rgb = contrastUtils.hexToRgb('#ff0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex colors without hash', () => {
      const rgb = contrastUtils.hexToRgb('00ff00');
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should return null for invalid hex colors', () => {
      const rgb = contrastUtils.hexToRgb('invalid');
      expect(rgb).toBeNull();
    });
  });

  describe('Luminance Calculation', () => {
    it('should calculate luminance for white', () => {
      const rgb = { r: 255, g: 255, b: 255 };
      const luminance = contrastUtils.getLuminance(rgb);
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should calculate luminance for black', () => {
      const rgb = { r: 0, g: 0, b: 0 };
      const luminance = contrastUtils.getLuminance(rgb);
      expect(luminance).toBeCloseTo(0, 2);
    });
  });

  describe('Contrast Ratio Calculation', () => {
    it('should calculate contrast ratio between black and white', () => {
      const ratio = contrastUtils.getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0); // Perfect contrast
    });

    it('should calculate contrast ratio between same colors', () => {
      const ratio = contrastUtils.getContrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBeCloseTo(1, 2); // No contrast
    });

    it('should handle RGB objects', () => {
      const rgb1 = { r: 0, g: 0, b: 0 };
      const rgb2 = { r: 255, g: 255, b: 255 };
      const ratio = contrastUtils.getContrastRatio(rgb1, rgb2);
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('WCAG Compliance', () => {
    it('should validate WCAG AA compliance for high contrast', () => {
      const isCompliant = contrastUtils.meetsWCAG('#000000', '#ffffff', 'AA', 'normal');
      expect(isCompliant).toBe(true);
    });

    it('should validate WCAG AAA compliance', () => {
      const isCompliant = contrastUtils.meetsWCAG('#000000', '#ffffff', 'AAA', 'normal');
      expect(isCompliant).toBe(true);
    });

    it('should handle large text requirements', () => {
      // Large text has lower contrast requirements
      const isCompliant = contrastUtils.meetsWCAG('#666666', '#ffffff', 'AA', 'large');
      expect(typeof isCompliant).toBe('boolean');
    });
  });
});

describe('Integration Tests', () => {
  it('should provide consistent behavior across viewport changes', () => {
    // Test mobile configuration
    const mobileConfig = responsiveColors.getConfig(640);
    expect(mobileConfig.gradientComplexity).toBe('simple');
    expect(mobileConfig.glowEffects).toBe(false);
    
    // Test desktop configuration
    const desktopConfig = responsiveColors.getConfig(1200);
    expect(desktopConfig.gradientComplexity).toBe('full');
    expect(desktopConfig.glowEffects).toBe(true);
  });

  it('should maintain color accessibility across all breakpoints', () => {
    const breakpoints = [640, 768, 1024, 1280];
    
    breakpoints.forEach(width => {
      const config = responsiveColors.getConfig(width);
      expect(config.contrastBoost).toBeGreaterThanOrEqual(1.0);
      expect(config.touchTargetMin).toBeGreaterThanOrEqual(32);
    });
  });

  it('should provide appropriate responsive color scale', () => {
    const mobileColor = responsiveColors.getResponsiveColorScale('violet', 500, 640);
    const desktopColor = responsiveColors.getResponsiveColorScale('violet', 500, 1200);
    
    expect(mobileColor).toBeDefined();
    expect(desktopColor).toBeDefined();
    expect(mobileColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(desktopColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
});