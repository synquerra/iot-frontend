module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Enhanced color system
      colors: {
        // Maintain existing colors for backward compatibility
        bg: '#071021',
        card: '#0f1b2a',
        muted: '#9aa7b2',
        accent: '#5eead4',
        primary: '#7c3aed',
        
        // Enhanced semantic colors
        surface: {
          primary: '#0f1b2a',    // Main card background
          secondary: '#1a2332',   // Elevated surfaces
          tertiary: '#243142',    // Highest elevation
          background: '#071021',  // Main background
        },
        text: {
          primary: '#f8fafc',     // Primary text
          secondary: '#cbd5e1',   // Secondary text
          tertiary: '#64748b',    // Muted text
          muted: '#9aa7b2',       // Existing muted color
          inverse: '#0f172a',     // Text on light backgrounds
        },
        border: {
          primary: '#334155',     // Default borders
          secondary: '#475569',   // Hover borders
          accent: '#5eead4',      // Focus/active borders
          muted: '#1e293b',       // Subtle borders
        },
        status: {
          success: '#10b981',     // Success states
          warning: '#f59e0b',     // Warning states
          error: '#ef4444',       // Error states
          info: '#3b82f6',        // Info states
        },
        interactive: {
          primary: '#7c3aed',     // Primary buttons
          primaryHover: '#6d28d9', // Primary hover state
          secondary: '#1a2332',   // Secondary buttons
          secondaryHover: '#243142', // Secondary hover state
          accent: '#5eead4',      // Accent elements
          accentHover: '#4ade80', // Accent hover state
        },
      },
      
      // Enhanced typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      // Enhanced spacing and sizing
      borderRadius: {
        xl: '12px', // Maintain existing
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
      },
      
      // Enhanced shadows for elevation
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      
      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Animation utilities
      animation: {
        'fade-in': 'fade-in 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Transition durations
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
        'slower': '500ms',
      },
      
      // Transition timing functions
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
