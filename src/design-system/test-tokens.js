/**
 * Simple test to verify design system tokens are working
 * This file can be removed after verification
 */

import { 
  baseColors, 
  semanticColors, 
  fontFamily, 
  spacing, 
  duration, 
  breakpoints 
} from './index.js';

// Test that all tokens are properly exported
console.log('Design System Test:');
console.log('Base Colors:', baseColors);
console.log('Semantic Colors:', semanticColors.surface);
console.log('Font Family:', fontFamily.sans);
console.log('Spacing:', spacing[4]);
console.log('Animation Duration:', duration.normal);
console.log('Breakpoints:', breakpoints.md);

export const testTokens = () => {
  return {
    colorsWork: !!baseColors.bg,
    typographyWorks: !!fontFamily.sans,
    spacingWorks: !!spacing[4],
    animationsWork: !!duration.normal,
    responsiveWorks: !!breakpoints.md,
  };
};