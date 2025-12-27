/**
 * Spacing tokens for consistent layout and component spacing
 * Defines spacing scale, component-specific spacing, and layout utilities
 */

// Base spacing scale (extends Tailwind's default scale)
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
};

// Semantic spacing for components
export const componentSpacing = {
  // Button spacing
  button: {
    paddingX: {
      sm: spacing[3],    // 12px
      md: spacing[4],    // 16px
      lg: spacing[6],    // 24px
    },
    paddingY: {
      sm: spacing[1.5],  // 6px
      md: spacing[2.5],  // 10px
      lg: spacing[3],    // 12px
    },
    gap: spacing[2],     // 8px (for icon + text)
  },
  
  // Card spacing
  card: {
    padding: {
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
    gap: spacing[4],     // 16px (between card elements)
    margin: spacing[4],  // 16px (between cards)
  },
  
  // Form spacing
  form: {
    fieldGap: spacing[4],     // 16px (between form fields)
    labelGap: spacing[1.5],   // 6px (between label and input)
    groupGap: spacing[6],     // 24px (between form groups)
    padding: {
      input: spacing[3],      // 12px (input padding)
      select: spacing[3],     // 12px (select padding)
    },
  },
  
  // Layout spacing
  layout: {
    sectionGap: spacing[8],   // 32px (between page sections)
    containerPadding: {
      mobile: spacing[4],     // 16px
      tablet: spacing[6],     // 24px
      desktop: spacing[8],    // 32px
    },
    gridGap: {
      sm: spacing[4],         // 16px
      md: spacing[6],         // 24px
      lg: spacing[8],         // 32px
    },
  },
  
  // Navigation spacing
  navigation: {
    itemPadding: {
      x: spacing[3],          // 12px
      y: spacing[2.5],        // 10px
    },
    itemGap: spacing[1],      // 4px (between nav items)
    sectionGap: spacing[6],   // 24px (between nav sections)
  },
  
  // Table spacing
  table: {
    cellPadding: {
      x: spacing[3],          // 12px
      y: spacing[3],          // 12px
    },
    headerPadding: {
      x: spacing[3],          // 12px
      y: spacing[4],          // 16px
    },
    rowGap: spacing[0],       // 0px (handled by borders)
  },
};

// Border radius tokens
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px (existing from config)
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// Shadow tokens for elevation
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Tailwind-compatible spacing configuration
export const tailwindSpacing = {
  spacing,
  borderRadius: {
    ...borderRadius,
    xl: '12px', // Maintain existing config
  },
  boxShadow,
};