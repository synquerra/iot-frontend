/**
 * Enhanced color tokens extending existing Tailwind config
 * Maintains existing colors while adding semantic color system
 */

// Base colors from existing config
export const baseColors = {
  bg: '#071021',
  card: '#0f1b2a', 
  muted: '#9aa7b2',
  accent: '#5eead4',
  primary: '#7c3aed',
};

// Enhanced semantic color system
export const semanticColors = {
  surface: {
    primary: '#0f1b2a',    // Main card background (existing card color)
    secondary: '#1a2332',   // Elevated surfaces
    tertiary: '#243142',    // Highest elevation
    background: '#071021',  // Main background (existing bg color)
  },
  text: {
    primary: '#f8fafc',     // Primary text
    secondary: '#cbd5e1',   // Secondary text
    tertiary: '#64748b',    // Muted text (darker than existing muted)
    muted: '#9aa7b2',       // Existing muted color
    inverse: '#0f172a',     // Text on light backgrounds
  },
  border: {
    primary: '#334155',     // Default borders
    secondary: '#475569',   // Hover borders
    accent: '#5eead4',      // Focus/active borders (existing accent)
    muted: '#1e293b',       // Subtle borders
  },
  status: {
    success: '#10b981',     // Success states
    warning: '#f59e0b',     // Warning states
    error: '#ef4444',       // Error states
    info: '#3b82f6',        // Info states
  },
  interactive: {
    primary: '#7c3aed',     // Primary buttons (existing primary)
    primaryHover: '#6d28d9', // Primary hover state
    secondary: '#1a2332',   // Secondary buttons
    secondaryHover: '#243142', // Secondary hover state
    accent: '#5eead4',      // Accent elements (existing accent)
    accentHover: '#4ade80', // Accent hover state
  }
};

// Combined color system for Tailwind config extension
export const colorTokens = {
  ...baseColors,
  ...semanticColors,
};

// Tailwind-compatible color configuration
export const tailwindColors = {
  // Maintain existing colors for backward compatibility
  bg: baseColors.bg,
  card: baseColors.card,
  muted: baseColors.muted,
  accent: baseColors.accent,
  primary: baseColors.primary,
  
  // Add new semantic colors
  surface: semanticColors.surface,
  text: semanticColors.text,
  border: semanticColors.border,
  status: semanticColors.status,
  interactive: semanticColors.interactive,
};